#!/usr/bin/env python3
"""
Research Pipeline: Pan-STARRS & WiseView Multi-Wavelength Kinematics Verification
NASA Space Apps Challenge 2026 - SPHEREx Sky Viewer
"""

import sys
import requests
from io import BytesIO
from PIL import Image
from astropy.coordinates import SkyCoord
import astropy.units as u

def get_panstarrs_cutouts(ra: float, dec: float, size: int = 240, filters: str = "grizy"):
    """
    Query STScI Pan-STARRS PS1 API for image cutouts across filters.
    """
    base_url = "https://ps1images.stsci.edu/cgi-bin/ps1filenames.py"
    params = {
        "ra": ra,
        "dec": dec,
        "size": size,
        "filters": filters,
        "type": "stack"
    }
    
    try:
        resp = requests.get(base_url, params=params, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"[ERROR] Failed to query Pan-STARRS metadata: {e}")
        return {}

    lines = resp.text.strip().split('\n')
    image_urls = {}
    for line in lines[1:]:
        parts = line.split()
        if len(parts) > 7:
            filt = parts[4]
            filename = parts[7]
            # STScI fitscut JPEG endpoint
            cutout_url = f"https://ps1images.stsci.edu/cgi-bin/fitscut.cgi?red={filename}&format=jpeg&size={size}"
            image_urls[filt] = cutout_url

    return image_urls

def get_wiseview_url(ra: float, dec: float, fov_arcmin: float = 1.5):
    """
    Generate WiseView time-series blinking URL for NEOWISE mid-IR proper motion.
    """
    fov_arcsec = fov_arcmin * 60.0
    return f"http://byw.tools/wiseview#ra={ra}&dec={dec}&size={int(fov_arcsec)}&band=3&speed=200"

def run_target_check(name: str, ra: float, dec: float):
    print(f"\n{'='*60}")
    print(f"Target: {name}")
    coord = SkyCoord(ra=ra*u.deg, dec=dec*u.deg, frame='icrs')
    print(f"Coordinates (ICRS): {coord.to_string('hmsdms')} | RA={ra}°, Dec={dec}°")
    
    wiseview_url = get_wiseview_url(ra, dec)
    print(f"WiseView Kinematics URL: {wiseview_url}")
    
    print("Querying Pan-STARRS optical cutouts (g, r, i, z, y)...")
    cutouts = get_panstarrs_cutouts(ra, dec, size=200)
    print(f"Found {len(cutouts)} available filters: {list(cutouts.keys())}")
    for filt, url in cutouts.items():
        print(f"  [{filt}] -> {url}")
        
    return cutouts

if __name__ == "__main__":
    targets = [
        ("Barnard's Star (Fastest Proper Motion)", 269.452, 4.693),
        ("WISE 0855-0714 (Coldest Brown Dwarf)", 133.795, -7.245)
    ]
    for name, ra, dec in targets:
        run_target_check(name, ra, dec)
    print(f"\n{'='*60}")
    print("[SUCCESS] Research pipeline verification finished.")
