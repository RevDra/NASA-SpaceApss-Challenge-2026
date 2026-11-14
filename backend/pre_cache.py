# Chạy sẵn cho 5 thiên thể mẫu trước giờ Demo

from astropy.coordinates import SkyCoord
from fits_pipeline import run_full_sky_pipeline

# 5 mục tiêu bắt buộc của đề bài (tự động chọn dải sóng tối ưu cho từng vật thể)
TARGETS = [
    ("WISE 0855", 133.79513, -7.24515, "SPHEREx-D6"),  # Bắt buộc D5/D6 vì sao lùn nâu cực lạnh
    ("Barnard's Star", None, None, "SPHEREx-D2"),      # Sao bay nhanh nhất bầu trời
    ("Epsilon Indi B", None, None, "SPHEREx-D4"),      # Hệ sao lùn nâu đôi (hấp thụ CH4/H2O)
    ("RW Aurigae", None, None, "SPHEREx-D3"),          # Sao biến quang trẻ T Tauri
    ("R Draconis", None, None, "SPHEREx-D3"),          # Sao biến quang chu kỳ dài Mira
]

if __name__ == "__main__":
    for name, ra, dec, band in TARGETS:
        if ra is None:
            c = SkyCoord.from_name(name)
            ra, dec = float(c.ra.deg), float(c.dec.deg)
        print(f"=== Đang Pre-cache: {name} (RA={ra:.4f}, Dec={dec:.4f}, {band}) ===")
        res = run_full_sky_pipeline(ra, dec, bandpass=band, size_deg=0.05)
        print(f"-> Xong {len(res.get('epochs', []))} epochs | {len(res.get('gaiaStars', []))} sao Gaia.\n")