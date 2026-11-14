#!/usr/bin/env python3
"""
Research Pipeline: SPHEREx IPAC/IRSA TAP Query Verification
NASA Space Apps Challenge 2026 - SPHEREx Sky Viewer
"""

import time
import astropy.units as u
from astropy.coordinates import SkyCoord
from astroquery.ipac.irsa import Irsa
import logging

logging.getLogger('astropy').setLevel(logging.ERROR)

def query_spherex_cutouts(ra_deg: float, dec_deg: float, bandpass: str = 'SPHEREx-D2', size_deg: float = 0.1):
    coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
    print(f"\nTarget: RA={ra_deg}°, Dec={dec_deg}° (Bandpass: {bandpass}, Cutout Size: {size_deg}°)")
    
    query = f"""
    SELECT
        'https://irsa.ipac.caltech.edu/' || a.uri || '?center={coord.ra.deg},{coord.dec.deg}d&size={size_deg}' AS uri,
        p.time_bounds_lower
    FROM spherex.artifact a
    JOIN spherex.plane p ON a.planeid = p.planeid
    WHERE 1 = CONTAINS(POINT('ICRS', {coord.ra.deg}, {coord.dec.deg}), p.poly)
            AND p.energy_bandpassname = '{bandpass}'
    ORDER BY p.time_bounds_lower
    """
    
    print("Executing TAP query to Caltech/IPAC IRSA...")
    t0 = time.time()
    try:
        results = Irsa.query_tap(query)
        elapsed = time.time() - t0
        print(f"TAP query completed in {elapsed:.2f}s.")
        print(f"Images found: {len(results)}")
        if len(results) > 0:
            print("First 3 results:")
            for i in range(min(3, len(results))):
                print(f"  [{i+1}] Time: {results['time_bounds_lower'][i]} | URI: {results['uri'][i]}")
        return results
    except Exception as e:
        print(f"[NOTE] TAP query notice / offline check: {e}")
        return None

if __name__ == "__main__":
    # Test on M101 (Pinwheel Galaxy) from documentation
    print("="*60)
    print("Testing SPHEREx IPAC TAP metadata search on M101...")
    query_spherex_cutouts(210.80227, 54.34895, bandpass='SPHEREx-D2')
    print("="*60)
