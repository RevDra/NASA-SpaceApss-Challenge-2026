#!/usr/bin/env python3
"""
Gaia DR3 Query Tool
Quickly inspect real Gaia DR3 catalog data and motion vectors for any sky coordinate.
NASA Space Apps Challenge 2026
"""

import sys
import argparse
import astropy.units as u
from astropy.coordinates import SkyCoord
from astroquery.gaia import Gaia
import logging

logging.getLogger('astropy').setLevel(logging.ERROR)

def query_gaia(ra: float, dec: float, radius_arcmin: float = 1.0, limit: int = 10):
    print(f"\n{'='*70}")
    print(f"🔭 QUÂN SÁT TỌA ĐỘ: RA = {ra}°, Dec = {dec}° (Bán kính tìm: {radius_arcmin}')")
    print(f"{'='*70}")
    
    radius_deg = radius_arcmin / 60.0
    query = f"""
    SELECT TOP {limit}
        source_id, ra, dec, pmra, pmdec, parallax, phot_g_mean_mag
    FROM gaiadr3.gaia_source
    WHERE 1=CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra}, {dec}, {radius_deg}))
    ORDER BY phot_g_mean_mag ASC
    """
    
    print("⏳ Đang kết nối máy chủ ESA Gaia DR3 (STScI/ESA TAP)...")
    try:
        job = Gaia.launch_job_async(query)
        res = job.get_results()
        
        if len(res) == 0:
            print(f"❌ Không tìm thấy nguồn Gaia nào trong bán kính {radius_arcmin}'.")
            print("💡 Gợi ý: Nếu đây là sao lùn nâu siêu lạnh (như WISE 0855), nó tàng hình ở dải quang học của Gaia!")
            return []
            
        print(f"✅ TÌM THẤY {len(res)} NGÔI SAO TRONG DANH MỤC GAIA DR3:\n")
        print(f"{'Source ID':<20} | {'RA (deg)':<10} | {'Dec (deg)':<10} | {'pmra (mas/y)':<13} | {'pmdec (mas/y)':<13} | {'Mag (G)':<7}")
        print("-" * 85)
        
        dt_years = 10.0 # Khoảng cách từ 2016 đến 2026
        for row in res:
            pmra = row['pmra'] if row['pmra'] is not None else 0.0
            pmdec = row['pmdec'] if row['pmdec'] is not None else 0.0
            
            # Tính độ lệch sau 10 năm
            dra_arcsec = (pmra / 1000.0) * dt_years
            ddec_arcsec = (pmdec / 1000.0) * dt_years
            
            print(f"{str(row['source_id']):<20} | {row['ra']:<10.5f} | {row['dec']:<10.5f} | {pmra:<13.2f} | {pmdec:<13.2f} | {row['phot_g_mean_mag']:<7.2f}")
            if abs(pmdec) > 100 or abs(pmra) > 100:
                print(f"   ⚡ SAO CHUYỂN ĐỘNG NHANH! Sau 10 năm dịch chuyển: ΔRA = {dra_arcsec:.2f}\", ΔDec = {ddec_arcsec:.2f}\"")
                
        return res
    except Exception as e:
        print(f"Lỗi kết nối: {e}")
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query Gaia DR3 catalog")
    parser.add_argument("ra", type=float, nargs="?", default=269.4485, help="Right Ascension in degrees")
    parser.add_argument("dec", type=float, nargs="?", default=4.7394, help="Declination in degrees")
    parser.add_argument("--radius", type=float, default=1.0, help="Search radius in arcminutes")
    args = parser.parse_args()
    
    query_gaia(args.ra, args.dec, args.radius)
