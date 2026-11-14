"""
Live Gaia DR3 catalog query for the viewer, fetched from ESA/STScI TAP (standard library only).

Pipeline for one request (ra, dec, field of view in arcsec):
  1. Check disk cache in viewer/gaia_cache/ (or in-memory cache).
  2. If missing or refresh requested, issue an ADQL query to the ESA Gaia TAP service:
     https://gea.esac.esa.int/tap-server/tap/sync
  3. Extract real astrometry: source_id, ra, dec, pmra, pmdec, parallax, phot_g_mean_mag.
  4. Project position from Gaia DR3 epoch J2016.0 to SPHEREx epoch 2026.0 (dt = 10.0 yr).
  5. Cache result and return structured sources list.
"""
from __future__ import annotations

import hashlib
import json
import math
import urllib.parse
import urllib.request
from pathlib import Path

GAIA_TAP_URL = "https://gea.esac.esa.int/tap-server/tap/sync"
USER_AGENT = "spherex-planet-x-viewer/1.0 (python urllib)"
D2R = math.pi / 180.0
_memory: dict[str, list[dict]] = {}


def _cache_key(ra: float, dec: float, fov_arcsec: float) -> str:
    raw = f"{ra:.5f}_{dec:.5f}_{fov_arcsec:.1f}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def load_gaia_sources(root_dir: Path, ra: float, dec: float, fov_arcsec: float = 120.0,
                      limit: int = 150, refresh: bool = False) -> list[dict]:
    """Query real Gaia DR3 sources within the FOV with epoch shifting to 2026."""
    key = _cache_key(ra, dec, fov_arcsec)
    
    # 1. Check memory cache
    if not refresh and key in _memory:
        return _memory[key]

    # 2. Check disk cache
    cache_dir = root_dir / "gaia_cache"
    cache_dir.mkdir(exist_ok=True)
    cache_file = cache_dir / f"{key}.json"

    if not refresh and cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                _memory[key] = data
                return data
        except Exception:
            pass

    # 3. Query ESA Gaia TAP
    # Radius in degrees, adding 20% margin around FOV
    radius_deg = (fov_arcsec / 3600.0) * 0.6
    radius_deg = max(0.005, min(radius_deg, 0.5)) # Safety bounds

    query = f"""
    SELECT TOP {limit}
        source_id, ra, dec, pmra, pmdec, parallax, phot_g_mean_mag
    FROM gaiadr3.gaia_source
    WHERE 1=CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra:.6f}, {dec:.6f}, {radius_deg:.6f}))
    ORDER BY phot_g_mean_mag ASC
    """

    data_payload = urllib.parse.urlencode({
        "REQUEST": "doQuery",
        "LANG": "ADQL",
        "FORMAT": "json",
        "QUERY": query
    }).encode("utf-8")

    req = urllib.request.Request(GAIA_TAP_URL, data=data_payload, headers={"User-Agent": USER_AGENT})

    sources = []
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            tap_res = json.loads(resp.read().decode("utf-8"))
            rows = tap_res.get("data", [])
            dt_years = 2026.0 - 2016.0 # Gaia epoch 2016 -> SPHEREx epoch 2026

            for row in rows:
                sid, s_ra, s_dec, pmra, pmdec, parallax, mag = row
                pmra_val = float(pmra) if pmra is not None else 0.0
                pmdec_val = float(pmdec) if pmdec is not None else 0.0
                parallax_val = float(parallax) if parallax is not None else None
                mag_val = float(mag) if mag is not None else None

                # Compute position at epoch 2026.0
                cos_dec = math.cos(s_dec * D2R)
                cos_dec = cos_dec if abs(cos_dec) > 1e-6 else 1.0
                ra_2026 = s_ra + (pmra_val * dt_years) / (cos_dec * 3600000.0)
                dec_2026 = s_dec + (pmdec_val * dt_years) / 3600000.0

                sources.append({
                    "source_id": str(sid),
                    "ra": round(s_ra, 6),
                    "dec": round(s_dec, 6),
                    "pmra": round(pmra_val, 2),
                    "pmdec": round(pmdec_val, 2),
                    "parallax": round(parallax_val, 2) if parallax_val else None,
                    "mag_g": round(mag_val, 2) if mag_val else None,
                    "ra_2026": round(ra_2026, 6),
                    "dec_2026": round(dec_2026, 6),
                    "motion_arcsec_10yr": round(math.hypot(pmra_val, pmdec_val) * dt_years / 1000.0, 3)
                })
    except Exception as e:
        # Fallback to local benchmarks if offline or network error
        benchmarks_path = root_dir.parent / "data" / "benchmarks.json"
        if benchmarks_path.exists():
            try:
                with open(benchmarks_path, "r", encoding="utf-8") as bf:
                    bm = json.load(bf)
                    for item in bm.get("targets", []):
                        g = item.get("gaia_dr3", {})
                        if g.get("source_id"):
                            dist = math.hypot(item["ra"] - ra, item["dec"] - dec)
                            if dist < radius_deg * 2:
                                sources.append({
                                    "source_id": str(g.get("source_id")),
                                    "ra": item["ra"],
                                    "dec": item["dec"],
                                    "pmra": g.get("pmra", 0.0),
                                    "pmdec": g.get("pmdec", 0.0),
                                    "parallax": g.get("parallax"),
                                    "mag_g": g.get("phot_g_mean_mag"),
                                    "ra_2026": item["ra"],
                                    "dec_2026": item["dec"],
                                    "motion_arcsec_10yr": round(math.hypot(g.get("pmra", 0), g.get("pmdec", 0)) * 10 / 1000.0, 3)
                                })
            except Exception:
                pass

    # Save to disk cache
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(sources, f, indent=2)
    except Exception:
        pass

    _memory[key] = sources
    return sources
