#!/usr/bin/env python3
"""
Real WISE / NEOWISE infrared photographs of one spot of sky, 2010 to 2024, from NASA/IPAC IRSA.

SPHEREx has only been observing since 2025, so its photographs cover about one year. WISE and its NEOWISE
reactivation imaged the whole sky twice a year from 2014 to 2024 (plus the 2010 survey), at 3.4 and 4.6 micrometres,
which is the nearest real data to SPHEREx for watching a star move over more than a decade.

Per request: ask the IRSA image service (IBE) which single-exposure frames cover the position, pick one frame per
visit (about 45 days apart), download a small cutout of each, resample it onto the same north-up, east-left grid the
viewer uses (2.75 arcsec per pixel), subtract the median background, and return the frames in the same JSON shape as
spherex_live.py so the viewer treats them alike.

    python wise_live.py 269.446 4.771 W2
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import math
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from spherex_live import (LiveError, _cache_dir, _encode, _finish, _open, _read_exact, _read_header, _tangent_to_sky, TanSipWcs, mjd_to_year, repair_masked)
import array

IBE = "https://irsa.ipac.caltech.edu/ibe"
SIA_URL = "https://irsa.ipac.caltech.edu/SIA"
TABLES = ("wise/neowiser/p1bm_frm", "wise/allsky/4band_p1bm_frm")   # NEOWISE 2014-2024, WISE cryogenic 2010
SIA_COLLECTIONS = ("neowiser", "wise_allsky")                       # the same single-exposure frames, listed through SIA v2
BANDS = {"W1": (1, 3.4), "W2": (2, 4.6)}
BAND_RANGE_M = {1: (3.2e-6, 3.6e-6), 2: (4.4e-6, 4.8e-6)}            # SIA BAND filter, metres
PIXEL_SCALE = 2.75          # arcsec per WISE pixel
VISIT_GAP_DAYS = 45.0
SEARCH_TIMEOUT = 75         # seconds per archive search request
DOWNLOAD_TIMEOUT = 30       # seconds per cutout request
DOWNLOAD_BUDGET = 120       # seconds for all cutouts of one request: later visits are skipped, never waited on forever
D2R = math.pi / 180.0
_memory: dict[str, dict] = {}


def grid_size(fov: float) -> int:
    return max(8, min(256, round(fov / PIXEL_SCALE)))


def _mjd_to_iso(mjd: float) -> str:
    return datetime.fromtimestamp((mjd - 40587.0) * 86400.0, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def _sia_frames(ra: float, dec: float, band: int, collection: str) -> list[dict]:
    """Frame list from IRSA's SIA v2 service: much faster and steadier than the IBE search for NEOWISE."""
    lo, hi = BAND_RANGE_M[band]
    query = [("POS", f"CIRCLE {ra:.6f} {dec:.6f} 0.001"), ("COLLECTION", collection), ("BAND", f"{lo} {hi}"),
             ("RESPONSEFORMAT", "CSV"), ("MAXREC", "20000")]
    with _open(SIA_URL + "?" + urllib.parse.urlencode(query), timeout=SEARCH_TIMEOUT, attempts=2) as r:
        text = r.read().decode("utf-8", "replace")
    rows = []
    for row in csv.DictReader(io.StringIO(text)):
        url = row.get("access_url") or ""
        if row.get("dataproduct_subtype") != "science" or row.get("energy_bandpassname") != f"W{band}":
            continue
        if "/ibe/data/" not in url or not url.endswith(f"-w{band}-int-1b.fits"):
            continue
        try:
            mjd = float(row["t_min"])
        except (KeyError, ValueError):
            continue
        parts = url.split("/ibe/data/", 1)[1].split("/")     # wise/neowiser/p1bm_frm/5r/42565r/159/42565r159-w2-int-1b.fits
        rows.append({"table": "/".join(parts[:3]), "path": "/".join(parts[3:]), "mjd": mjd, "date": _mjd_to_iso(mjd),
                     "qual": 10, "obsid": parts[-1].split("-w")[0]})
    return rows


def _ibe_frames(ra: float, dec: float, band: int, table: str) -> list[dict]:
    """Fallback: the IBE metadata search (it carries a frame-quality score, but can hang for minutes)."""
    url = f"{IBE}/search/{table}?POS={ra:.6f},{dec:.6f}&ct=csv&where=band={band}"
    with _open(url, timeout=SEARCH_TIMEOUT, attempts=1) as r:
        text = r.read().decode("utf-8", "replace")
    rows = []
    if not text.startswith("in_row_id"):
        return rows
    for row in csv.DictReader(io.StringIO(text)):
        try:
            q = int(float(row.get("qual_frame") or 0))
            if q < 5:                                        # 10 = best; below 5 is flagged unusable or poor
                continue
            rows.append({"table": table, "path": f"{row['scangrp']}/{row['scan_id']}/{int(row['frame_num']):03d}/{row['scan_id']}{int(row['frame_num']):03d}-w{band}-int-1b.fits",
                         "mjd": float(row["mjd_obs"]), "date": row["date_obs"], "qual": q, "obsid": f"{row['scan_id']}{int(row['frame_num']):03d}"})
        except (KeyError, ValueError):
            continue
    return rows


def query_frames(root: Path, ra: float, dec: float, band: int) -> list[dict]:
    """Every usable frame of both surveys covering the position. The two surveys are searched in parallel, each
    through SIA first and the IBE search only if SIA fails. The list is cached, so a retry after a failed or slow
    download does not search again."""
    key = f"wisefr_{ra:.5f}_{dec:+.5f}_{band}"
    cache_file = _cache_dir(root) / (hashlib.sha1(key.encode()).hexdigest()[:16] + ".json")
    if cache_file.exists():
        try:
            return json.loads(cache_file.read_text("utf-8"))
        except ValueError:
            pass

    def one(pair):
        collection, table = pair
        try:
            return _sia_frames(ra, dec, band, collection), True
        except Exception:
            pass
        try:
            return _ibe_frames(ra, dec, band, table), True
        except Exception:
            return [], False

    with ThreadPoolExecutor(max_workers=2) as pool:
        parts = list(pool.map(one, zip(SIA_COLLECTIONS, TABLES)))
    seen, rows = set(), []
    for found, _ok in parts:
        for r in found:
            if (r["table"], r["path"]) not in seen:
                seen.add((r["table"], r["path"]))
                rows.append(r)
    rows.sort(key=lambda r: r["mjd"])
    if rows and all(ok for _found, ok in parts):             # cache only complete answers
        cache_file.write_text(json.dumps(rows), "utf-8")
    return rows


def group_visits(rows: list[dict]) -> list[list[dict]]:
    visits: list[list[dict]] = []
    for r in rows:
        if visits and r["mjd"] - visits[-1][-1]["mjd"] < VISIT_GAP_DAYS:
            visits[-1].append(r)
        else:
            visits.append([r])
    return visits


def read_primary(url: str, timeout: float = DOWNLOAD_TIMEOUT):
    """Header and float32 pixels of the primary image of a WISE cutout."""
    with _open(url, timeout=timeout, attempts=3) as stream:     # IRSA answers 503 under load; it clears in seconds
        h = _read_header(stream)
        nx, ny = int(h["NAXIS1"]), int(h["NAXIS2"])
        if int(h.get("BITPIX", 0)) != -32:
            raise LiveError("unexpected pixel type in WISE cutout")
        pix = array.array("f")
        pix.frombytes(_read_exact(stream, nx * ny * 4))
        if sys.byteorder == "little":
            pix.byteswap()
        return h, pix


def resample(h: dict, pix, ra0: float, dec0: float, N: int):
    """Bilinear resample onto an N x N grid: row 0 = north, column 0 = east (same convention as the viewer)."""
    wcs = TanSipWcs(h)
    nx, ny = int(h["NAXIS1"]), int(h["NAXIS2"])
    out = [math.nan] * (N * N)
    bad = bytearray(N * N)
    ps = PIXEL_SCALE / 3600.0
    for r in range(N):
        eta = (N / 2 - r - 0.5) * ps
        for k in range(N):
            xi = (N / 2 - k - 0.5) * ps
            ra, dec = _tangent_to_sky(ra0, dec0, xi, eta)
            p = wcs.sky2pix(ra, dec)
            if p is None:
                continue
            x, y = p
            if x < 0 or y < 0 or x > nx - 1 or y > ny - 1:
                continue
            x0, y0 = min(int(x), nx - 2), min(int(y), ny - 2)
            fx, fy = x - x0, y - y0
            i = y0 * nx + x0
            q = (pix[i], pix[i + 1], pix[i + nx], pix[i + nx + 1])
            w = ((1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy)
            s = sw = 0.0
            for val, wt in zip(q, w):
                if val == val and wt > 0:
                    s += val * wt
                    sw += wt
            if sw > 0.25:
                out[r * N + k] = s / sw
            else:
                bad[r * N + k] = 1
    return out, bad


def load_epochs(root: Path, ra: float, dec: float, fov: float, band: str = "W2", refresh: bool = False) -> dict:
    band = band.upper()
    if band not in BANDS:
        raise LiveError(f"unknown WISE band {band!r}; use W1 or W2")
    if not (0 <= ra < 360 and -90 <= dec <= 90):
        raise LiveError("RA must be 0-360 and Dec -90..90 degrees")
    fov = max(60.0, min(700.0, fov))
    N = grid_size(fov)
    key = f"wise2_{ra:.5f}_{dec:+.5f}_{fov:.0f}_{band}"
    cache_file = _cache_dir(root) / (hashlib.sha1(key.encode()).hexdigest()[:16] + ".json")
    if not refresh:
        if key in _memory:
            return {**_memory[key], "source": "memory cache"}
        if cache_file.exists():
            data = json.loads(cache_file.read_text("utf-8"))
            _memory[key] = data
            return {**data, "source": "disk cache"}

    t0 = time.time()
    rows = query_frames(root, ra, dec, BANDS[band][0])
    if not rows:
        raise LiveError(f"no WISE/NEOWISE {band} frames found for RA {ra:.4f}, Dec {dec:+.4f} "
                        "(or the IRSA archive did not answer; try again in a moment)")
    visits = group_visits(rows)
    size_deg = (fov * 1.45 + 4 * PIXEL_SCALE) / 3600.0
    deadline = time.time() + DOWNLOAD_BUDGET

    def work(args):
        vi, group = args
        mid = sorted(group, key=lambda r: (-r["qual"], abs(r["mjd"] - group[len(group) // 2]["mjd"])))   # best quality, then nearest the middle
        errs = []
        for fr in mid[:5]:                                   # try a few frames of the visit before giving up (edges, 503s)
            if time.time() > deadline:
                errs.append(f"visit {vi}: skipped, IRSA too slow (time budget used up)")
                break
            url = f"{IBE}/data/{fr['table']}/{fr['path']}?center={ra},{dec}&size={size_deg:.5f}&gzip=false"
            try:
                h, pix = read_primary(url)
                img, bad = resample(h, pix, ra, dec, N)
                img, mask = repair_masked(img, bad, N)
                img, cov = _finish(img)
            except Exception as exc:
                errs.append(f"{fr['obsid']}: {exc}")
                continue
            if cov < 0.85:
                errs.append(f"{fr['obsid']}: near the frame edge ({cov:.0%})")
                continue
            return {"t": round(mjd_to_year(fr["mjd"]), 5), "mjd": fr["mjd"], "visit": vi, "obsid": fr["obsid"],
                    "collection": "NEOWISE" if "neowiser" in fr["table"] else "WISE", "date": fr["date"].replace(" ", "T")[:19], "coverage": round(cov, 3), "data": _encode(img), "mask": mask, "masked": sum(bad)}
        return {"error": "; ".join(errs[:2]) or f"visit {vi}: no usable frame"}

    with ThreadPoolExecutor(max_workers=4) as pool:          # 6 at once made IRSA answer 503 for a third of the cutouts
        results = list(pool.map(work, enumerate(visits)))
    units = [r for r in results if "data" in r]
    errors = [r["error"] for r in results if "error" in r]
    if not units:
        raise LiveError("could not read any WISE cutout: " + "; ".join(errors[:3]))
    data = {
        "ra": ra, "dec": dec, "fov": fov, "detector": band, "mission": "WISE/NEOWISE", "wavelength_um": [BANDS[band][1], BANDS[band][1]], "N": N, "ps": PIXEL_SCALE,
        "unit": "DN (background subtracted)", "exposures_found": len(rows), "visits": len(visits), "units": units, "skipped": errors,
        "collections": ["WISE 2010", "NEOWISE-R 2014-2024"], "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "seconds": round(time.time() - t0, 1),
    }
    _memory[key] = data
    cache_file.write_text(json.dumps(data), "utf-8")
    return {**data, "source": "IRSA"}


if __name__ == "__main__":
    a = sys.argv[1:] or ["269.446074", "4.770706", "W2"]
    d = load_epochs(Path(__file__).resolve().parent, float(a[0]), float(a[1]), 300.0, a[2])
    print(f"{len(d['units'])} frames of {d['visits']} visits, {d['seconds']} s")
    for u in d["units"]:
        print(u["date"], u["collection"], u["coverage"])
