"""
Live SPHEREx data for the viewer, fetched from NASA/IPAC IRSA (standard library only).

Pipeline for one request (ra, dec, field of view, detector D1-D6):
  1. SIA v2 query on IRSA for every SPHEREx Level-2 exposure covering the position
     (collections spherex_dr1 + spherex_qr3), filtered to the chosen detector.
  2. Exposures are grouped into visits (SPHEREx sees a given spot for ~1-2 weeks
     every ~6 months) and a few exposures per visit are picked, evenly spread in time.
  3. A small cutout of each exposure is downloaded from IRSA's cutout service. Only the
     IMAGE extension is read; the stream is closed before the large PSF table.
  4. Each cutout is resampled with its own TAN-SIP WCS onto one common grid
     (north up, east left, 6.15"/px, centred on the target) so frames can be blinked.
  5. The local background (median) is subtracted and the frames are returned as
     base64 float32 arrays in MJy/sr.

Results are cached in memory and on disk (spherex_cache/) so a demo also works offline
for positions that were loaded once.
"""
from __future__ import annotations

import array
import base64
import csv
import hashlib
import io
import json
import math
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# --- Hook pipeline lọc nhiễu 3 tầng (ZODI + 18 flags) ---
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
try:
    from fits_pipeline import process_single_fits # type: ignore
    HAS_DENOISE = True
except Exception:
    HAS_DENOISE = False
    
    
import ssl
try:
    import certifi
    ssl._create_default_https_context = lambda: ssl.create_default_context(cafile=certifi.where())
except Exception:
    ssl._create_default_https_context = ssl._create_unverified_context
    
    
SIA_URL = "https://irsa.ipac.caltech.edu/SIA"
COLLECTIONS = ("spherex_dr1", "spherex_qr3")
DETECTORS = {
    "D1": (0.75, 1.11), "D2": (1.11, 1.64), "D3": (1.64, 2.42),
    "D4": (2.42, 3.82), "D5": (3.82, 4.42), "D6": (4.42, 5.00),
}
PIXEL_SCALE = 6.15          # arcsec per SPHEREx pixel
VISIT_GAP_DAYS = 45.0       # exposures closer than this belong to the same visit (one SPHEREx pass)
USER_AGENT = "spherex-planet-x-viewer/1.0 (python urllib)"
D2R = math.pi / 180.0

_memory: dict[str, dict] = {}


class LiveError(Exception):
    """A problem worth showing to the user (bad input, archive unreachable, no coverage)."""


# --------------------------------------------------------------------------- helpers
def _open(url: str, timeout: float, attempts: int = 4):
    """urlopen with retries: IRSA answers 503 when it is busy, which usually clears in a second or two."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for i in range(attempts):
        try:
            return urllib.request.urlopen(req, timeout=timeout)
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or i == attempts - 1:
                raise
        except (urllib.error.URLError, TimeoutError):
            if i == attempts - 1:
                raise
        time.sleep(1.5 * (i + 1))


def mjd_to_year(mjd: float) -> float:
    return 2000.0 + (mjd - 51544.5) / 365.25


def grid_size(fov_arcsec: float) -> int:
    return max(8, min(256, round(fov_arcsec / PIXEL_SCALE)))


# --------------------------------------------------------------------------- 1. SIA query
def query_exposures(ra: float, dec: float, detector: str) -> list[dict]:
    params = [("POS", f"CIRCLE {ra} {dec} 0.0005")]
    params += [("COLLECTION", c) for c in COLLECTIONS]
    params += [("RESPONSEFORMAT", "CSV"), ("MAXREC", "5000")]
    url = SIA_URL + "?" + urllib.parse.urlencode(params)
    try:
        with _open(url, timeout=60) as r:
            text = r.read().decode("utf-8", "replace")
    except Exception as exc:  # network, HTTP error, timeout
        raise LiveError(f"IRSA SIA query failed: {exc}") from exc

    want = f"SPHEREx-{detector}"
    rows = []
    for row in csv.DictReader(io.StringIO(text)):
        if row.get("energy_bandpassname") != want or row.get("dataproduct_type") != "image":
            continue
        try:
            t_min = float(row["t_min"])
        except (KeyError, ValueError):
            continue
        rows.append({
            "url": row["access_url"], "mjd": t_min, "obsid": row.get("obs_id", ""),
            "collection": row.get("obs_collection", ""),
        })
    rows.sort(key=lambda r: r["mjd"])
    return rows


# --------------------------------------------------------------------------- 2. visits
def pick_exposures(rows: list[dict], per_visit: int) -> tuple[list[dict], int]:
    visits: list[list[dict]] = []
    for r in rows:
        if visits and r["mjd"] - visits[-1][-1]["mjd"] < VISIT_GAP_DAYS:
            visits[-1].append(r)
        else:
            visits.append([r])
    picked = []
    for v, group in enumerate(visits):
        n = len(group)
        k = min(per_visit, n)
        idx = sorted({round(i * (n - 1) / (k - 1)) for i in range(k)}) if k > 1 else [n // 2]
        for i in idx:
            picked.append({**group[i], "visit": v})
    return picked, len(visits)


# --------------------------------------------------------------------------- 3. FITS reading
def _parse_value(raw: str):
    raw = raw.strip()
    if raw.startswith("'"):
        out, i = [], 1
        while i < len(raw):
            ch = raw[i]
            if ch == "'":
                if i + 1 < len(raw) and raw[i + 1] == "'":
                    out.append("'"); i += 2; continue
                break
            out.append(ch); i += 1
        return "".join(out).rstrip()
    raw = raw.split("/", 1)[0].strip()
    if raw in ("T", "F"):
        return raw == "T"
    try:
        return int(raw)
    except ValueError:
        pass
    try:
        return float(raw.replace("D", "E"))
    except ValueError:
        return raw


def _read_exact(stream, n: int) -> bytes:
    chunks, got = [], 0
    while got < n:
        chunk = stream.read(n - got)
        if not chunk:
            raise LiveError("cutout stream ended early")
        chunks.append(chunk)
        got += len(chunk)
    return b"".join(chunks)


def _read_header(stream) -> dict:
    header: dict = {}
    while True:
        block = _read_exact(stream, 2880)
        for i in range(0, 2880, 80):
            card = block[i:i + 80].decode("ascii", "replace")
            key = card[:8].strip()
            if key == "END":
                return header
            if card[8:10] == "= ":
                header[key] = _parse_value(card[10:])


def read_image_extension(url: str, timeout: float = 90) -> tuple[dict, array.array]:
    """Return (header, float32 pixels) of the IMAGE extension, reading as little as possible."""
    with _open(url, timeout=timeout) as stream:
        for _ in range(8):
            h = _read_header(stream)
            naxis = int(h.get("NAXIS", 0))
            n = 1
            for k in range(1, naxis + 1):
                n *= int(h[f"NAXIS{k}"])
            if naxis == 0:
                n = 0
            nbytes = n * abs(int(h.get("BITPIX", 8))) // 8 + int(h.get("PCOUNT", 0))
            padded = (nbytes + 2879) // 2880 * 2880
            is_image = h.get("XTENSION") == "IMAGE" and naxis == 2 and h.get("BITPIX") == -32
            if is_image and h.get("EXTNAME", "IMAGE") == "IMAGE":
                raw = _read_exact(stream, n * 4)
                pix = array.array("f")
                pix.frombytes(raw)
                if sys.byteorder == "little":
                    pix.byteswap()                      # FITS is big-endian
                return h, pix
            if padded:
                _read_exact(stream, padded)
    raise LiveError("no IMAGE extension in cutout")


# --------------------------------------------------------------------------- 4. WCS + resampling
class TanSipWcs:
    """Sky -> pixel for a FITS TAN(-SIP) header (uses the AP/BP inverse polynomials)."""

    def __init__(self, h: dict):
        self.crpix1, self.crpix2 = float(h["CRPIX1"]), float(h["CRPIX2"])
        self.a0, self.d0 = float(h["CRVAL1"]) * D2R, float(h["CRVAL2"]) * D2R
        if "CD1_1" in h:
            m = [[h.get("CD1_1", 0.0), h.get("CD1_2", 0.0)], [h.get("CD2_1", 0.0), h.get("CD2_2", 0.0)]]
        else:
            c1, c2 = float(h.get("CDELT1", 1.0)), float(h.get("CDELT2", 1.0))
            m = [[h.get("PC1_1", 1.0) * c1, h.get("PC1_2", 0.0) * c1],
                 [h.get("PC2_1", 0.0) * c2, h.get("PC2_2", 1.0) * c2]]
        det = m[0][0] * m[1][1] - m[0][1] * m[1][0]
        if det == 0:
            raise LiveError("singular WCS matrix")
        self.inv = [[m[1][1] / det, -m[0][1] / det], [-m[1][0] / det, m[0][0] / det]]
        self.ap = self._poly(h, "AP")
        self.bp = self._poly(h, "BP")

    @staticmethod
    def _poly(h: dict, name: str) -> list[tuple[int, int, float]]:
        order = int(h.get(f"{name}_ORDER", 0))
        terms = []
        for p in range(order + 1):
            for q in range(order + 1 - p):
                c = h.get(f"{name}_{p}_{q}")
                if isinstance(c, (int, float)) and c != 0:
                    terms.append((p, q, float(c)))
        return terms

    def sky2pix(self, ra_deg: float, dec_deg: float):
        a, d = ra_deg * D2R, dec_deg * D2R
        cosc = math.sin(self.d0) * math.sin(d) + math.cos(self.d0) * math.cos(d) * math.cos(a - self.a0)
        if cosc <= 0:
            return None
        xi = math.cos(d) * math.sin(a - self.a0) / cosc / D2R
        eta = (math.cos(self.d0) * math.sin(d) - math.sin(self.d0) * math.cos(d) * math.cos(a - self.a0)) / cosc / D2R
        u = self.inv[0][0] * xi + self.inv[0][1] * eta
        v = self.inv[1][0] * xi + self.inv[1][1] * eta
        du = sum(c * u ** p * v ** q for p, q, c in self.ap)
        dv = sum(c * u ** p * v ** q for p, q, c in self.bp)
        return u + du + self.crpix1 - 1.0, v + dv + self.crpix2 - 1.0   # zero-based pixel


def _tangent_to_sky(ra0: float, dec0: float, xi_deg: float, eta_deg: float):
    xi, eta = xi_deg * D2R, eta_deg * D2R
    a0, d0 = ra0 * D2R, dec0 * D2R
    rho = math.hypot(xi, eta)
    if rho == 0:
        return ra0, dec0
    c = math.atan(rho)
    sc, cc = math.sin(c), math.cos(c)
    dec = math.asin(cc * math.sin(d0) + eta * sc * math.cos(d0) / rho)
    ra = a0 + math.atan2(xi * sc, rho * math.cos(d0) * cc - eta * math.sin(d0) * sc)
    return (ra / D2R) % 360.0, dec / D2R


def resample(h: dict, pix: array.array, ra0: float, dec0: float, N: int):
    """Bilinear resample onto an N x N grid: row 0 = north, column 0 = east (like the viewer)."""
    wcs = TanSipWcs(h)
    nx, ny = int(h["NAXIS1"]), int(h["NAXIS2"])
    out = [math.nan] * (N * N)
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
                if val == val and wt > 0:       # skip NaN neighbours
                    s += val * wt; sw += wt
            if sw > 0.25:
                out[r * N + k] = s / sw
    return out


def _finish(img: list[float]) -> tuple[list[float], float]:
    """Subtract the median background, fill gaps with 0. Returns (image, coverage fraction)."""
    good = sorted(v for v in img if v == v)
    if not good:
        return [0.0] * len(img), 0.0
    med = good[len(good) // 2]
    return [v - med if v == v else 0.0 for v in img], len(good) / len(img)


def _encode(img: list[float]) -> str:
    arr = array.array("f", img)
    if sys.byteorder != "little":
        arr.byteswap()
    return base64.b64encode(arr.tobytes()).decode("ascii")


# --------------------------------------------------------------------------- 5. public entry
def _cache_dir(root: Path) -> Path:
    d = root / "spherex_cache"
    d.mkdir(exist_ok=True)
    return d


def load_epochs(root: Path, ra: float, dec: float, fov: float, detector: str,
                per_visit: int = 6, refresh: bool = False) -> dict:
    detector = detector.upper()
    if detector not in DETECTORS:
        raise LiveError(f"unknown detector {detector!r}; use D1-D6")
    if not (0 <= ra < 360 and -90 <= dec <= 90):
        raise LiveError("RA must be 0-360 and Dec -90..90 degrees")
    fov = max(30.0, min(600.0, fov))
    per_visit = max(1, min(12, per_visit))
    N = grid_size(fov)

    key = f"clean_{ra:.5f}_{dec:+.5f}_{fov:.0f}_{detector}_{per_visit}"
    cache_file = _cache_dir(root) / (hashlib.sha1(key.encode()).hexdigest()[:16] + ".json")
    if not refresh:
        if key in _memory:
            return {**_memory[key], "source": "memory cache"}
        if cache_file.exists():
            data = json.loads(cache_file.read_text("utf-8"))
            _memory[key] = data
            return {**data, "source": "disk cache"}

    t0 = time.time()
    rows = query_exposures(ra, dec, detector)
    if not rows:
        raise LiveError(f"no SPHEREx {detector} exposures cover RA {ra:.4f}, Dec {dec:+.4f} in "
                        f"{' + '.join(COLLECTIONS)}")
    picked, n_visits = pick_exposures(rows, per_visit)

    size_deg = (fov * 1.45 + 4 * PIXEL_SCALE) / 3600.0

    def work(exp: dict):
        url = f"{exp['url']}?center={ra},{dec}&size={size_deg:.5f}"
        try:
            if HAS_DENOISE:
                proc = process_single_fits(url)
                h, pix = proc["header"], proc["visual_data"].astype("float32").ravel()
            else:
                h, pix = read_image_extension(url)
            img, cov = _finish(resample(h, pix, ra, dec, N))
        except Exception as exc:
            return {"error": f"{exp['obsid']}: {exc}"}
        if cov < 0.5:
            return {"error": f"{exp['obsid']}: target near detector edge ({cov:.0%} coverage)"}
        return {
            "t": round(mjd_to_year(exp["mjd"]), 5), "mjd": exp["mjd"], "visit": exp["visit"],
            "obsid": exp["obsid"], "collection": exp["collection"],
            "date": h.get("DATE-AVG") or h.get("DATE-OBS"), "coverage": round(cov, 3),
            "data": _encode(img),
        }

    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(work, picked))
    units = [r for r in results if "data" in r]
    errors = [r["error"] for r in results if "error" in r]
    if not units:
        raise LiveError("could not read any SPHEREx cutout: " + "; ".join(errors[:3]))

    data = {
        "ra": ra, "dec": dec, "fov": fov, "detector": detector,
        "wavelength_um": DETECTORS[detector], "N": N, "ps": PIXEL_SCALE, "unit": "MJy/sr (background subtracted)",
        "exposures_found": len(rows), "visits": n_visits, "units": units, "skipped": errors,
        "collections": list(COLLECTIONS), "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "seconds": round(time.time() - t0, 1),
    }
    _memory[key] = data
    cache_file.write_text(json.dumps(data), "utf-8")
    return {**data, "source": "IRSA"}


if __name__ == "__main__":  # quick self-test: python spherex_live.py 269.452 4.693 D2
    args = sys.argv[1:] or ["269.452", "4.693", "D2"]
    out = load_epochs(Path(__file__).resolve().parent, float(args[0]), float(args[1]), 120, args[2], refresh=True)
    print(json.dumps({k: v for k, v in out.items() if k != "units"}, indent=2))
    for u in out["units"]:
        print(u["date"], u["visit"], u["obsid"], u["coverage"])
