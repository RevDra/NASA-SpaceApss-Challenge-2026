#!/usr/bin/env python3
"""
Research Pipeline: Kiểm thử trọn bộ 2 nguồn dữ liệu (SPHEREx DR1 + Gaia DR3)
và bộ lọc Bụi Hoàng Đạo (ZODI) + Cờ Nhiễu (FLAGS) + SNR.
"""

import logging
from pathlib import Path
import shutil
import time

from astropy.coordinates import SkyCoord
from astropy.io import fits
import astropy.units as u
from astropy.utils.data import download_file
from astroquery.gaia import Gaia
from astroquery.ipac.irsa import Irsa
import numpy as np

logging.getLogger("astropy").setLevel(logging.ERROR)
logging.getLogger("astroquery").setLevel(logging.ERROR)

# Thư mục lưu file mẫu ngay tại research/ (không phụ thuộc vị trí mở terminal)
BASE_DIR = Path(__file__).resolve().parent

# Danh sách 18 cờ nhiễu / tia vũ trụ / giả ảnh quang học thực tế từ header SPHEREx DR1
# (Tuyệt đối KHÔNG đưa Bit 21 'SOURCE' vào đây vì đó là tín hiệu thiên thể thật)
CRITICAL_FLAGS = {
    "TRANSIENT",  # Bit 0: Tia vũ trụ / nhiễu thoáng qua
    "OVERFLOW",  # Bit 1: Bão hòa / cháy sáng
    "SUR_ERROR",  # Bit 2: Lỗi đọc tín hiệu
    "NONFUNC",  # Bit 6: Pixel chết
    "MISSING_DATA",  # Bit 9: Mất dữ liệu
    "HOT",  # Bit 10: Pixel nóng
    "COLD",  # Bit 11: Pixel lạnh / chết
    "NONLINEAR",  # Bit 15: Nhiễu phi tuyến
    "PERSIST",  # Bit 17: Lưu ảnh cũ (dễ nhầm thành vật thể biến mất)
    "OUTLIER",  # Bit 19: Điểm nhiễu dị biệt
    "CROSSTALK",  # Bit 20: Nhiễu xuyên kênh
    "GHOST",  # Bit 22: Bóng ma quang học
    "GHOST_FPA",  # Bit 23: Bóng ma mặt phẳng tiêu
    "GHOST_EXT",  # Bit 24: Bóng ma nguồn ngoài
    "STREAK",  # Bit 25: Vệt vệ tinh bay ngang
    "BLOOM",  # Bit 26: Lóa sáng tràn pixel
    "SNOWBALL",  # Bit 27: Tia vũ trụ dạng cầu tuyết (H2RG artifact)
    "HALO",  # Bit 28: Quầng sáng giả
}


def query_spherex_cutouts(
    ra_deg: float,
    dec_deg: float,
    bandpass: str = "SPHEREx-D6",
    size_deg: float = 0.05,
):
    """Nguồn 1: Tìm các khung hình SPHEREx cắt quanh tọa độ theo thứ tự thời gian."""
    coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
    print(
        f"\n[1] SPHEREx TAP Query: RA={ra_deg}°, Dec={dec_deg}° (Dải: {bandpass}, Khung: {size_deg}°)"
    )

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

    t0 = time.time()
    results = Irsa.query_tap(query)
    print(
        f"-> Tìm thấy {len(results)} khung hình theo thời gian ({time.time() - t0:.2f}s)."
    )
    return results


def download_and_clean_fits(cutout_uri: str, snr_threshold: float = 5.0):
    """Tải 1 file .fits mẫu, trừ nền bụi ZODI và lọc nhiễu bằng 18 bit FLAGS + SNR."""
    save_fits_path = BASE_DIR / "sample_cutout.fits"
    save_png_path = BASE_DIR / "clean_comparison.png"

    print(f"\n[2] Đang tải & xử lý file .fits...")
    cached_path = download_file(cutout_uri, cache=True)
    shutil.copy(cached_path, save_fits_path)

    with fits.open(save_fits_path) as hdul:
        image = hdul["IMAGE"].data.astype(np.float64)
        flags = hdul["FLAGS"].data.astype(np.uint32)
        variance = hdul["VARIANCE"].data.astype(np.float64)
        zodi = hdul["ZODI"].data.astype(np.float64)

        # Tạo mặt nạ loại bỏ đúng 18 cờ lỗi phần cứng / tia vũ trụ
        flags_header = hdul["FLAGS"].header
        critical_mask = np.zeros_like(flags, dtype=bool)
        for key in flags_header:
            if key.startswith("MSKN"):
                bit_idx = int(key.replace("MSKN", ""))
                flag_name = str(flags_header[key]).strip().upper()
                if flag_name in CRITICAL_FLAGS:
                    critical_mask |= (flags & (1 << bit_idx)) != 0

        # Bước 1: Trừ nền bụi hoàng đạo (Zodi-Clean)
        zodi_cleaned = image - zodi

        # Bước 2: Loại bỏ pixel dính cờ lỗi hoặc NaN
        invalid_pixels = (
            critical_mask
            | np.isnan(zodi_cleaned)
            | np.isnan(variance)
            | (variance <= 0)
        )
        valid = ~invalid_pixels

        # Bước 3: Tính tỷ lệ Tín hiệu trên Nhiễu (SNR) và lọc ngưỡng 5-sigma
        snr_map = np.zeros_like(zodi_cleaned)
        snr_map[valid] = zodi_cleaned[valid] / np.sqrt(variance[valid])
        final_clean_image = np.where(
            valid & (snr_map >= snr_threshold), zodi_cleaned, 0.0
        )

        print(f"-> Kích thước khung: {image.shape}")
        print(
            f"-> Pixel bị loại do FLAGS/NaN: {np.sum(invalid_pixels)} / {image.size}"
        )
        print(
            f"-> Pixel tín hiệu sạch (>= {snr_threshold} sigma): {np.sum(final_clean_image > 0)}"
        )

        try:
            from astropy.visualization import ZScaleInterval
            import matplotlib.pyplot as plt

            interval = ZScaleInterval()
            vmin, vmax = interval.get_limits(zodi_cleaned[valid])

            fig, axes = plt.subplots(1, 3, figsize=(15, 5))
            axes[0].imshow(
                image, origin="lower", cmap="gray", vmin=vmin, vmax=vmax
            )
            axes[0].set_title("1. Ảnh Gốc (IMAGE)\n(Dính bụi hoàng đạo)")

            axes[1].imshow(
                zodi_cleaned, origin="lower", cmap="gray", vmin=vmin, vmax=vmax
            )
            axes[1].set_title(
                "2. Đã trừ bụi (IMAGE - ZODI)\n(Nền tối, còn nhiễu)"
            )

            axes[2].imshow(
                final_clean_image,
                origin="lower",
                cmap="inferno",
                vmin=0,
                vmax=vmax,
            )
            axes[2].set_title(
                f"3. Sạch Bụi + Lọc 18 FLAGS & SNR>={snr_threshold}\n(Chỉ còn thiên thể thật)"
            )

            plt.tight_layout()
            plt.savefig(save_png_path, dpi=150)
            print(f"-> Đã lưu ảnh so sánh tại: {save_png_path}")
        except ImportError:
            pass

        return zodi_cleaned, snr_map, final_clean_image


def query_gaia_dr3(ra_deg: float, dec_deg: float, radius_deg: float = 0.05):
    """Nguồn 2: Kéo danh mục sao đã biết + vector vận tốc (pmra, pmdec) từ Gaia DR3."""
    Gaia.MAIN_GAIA_TABLE = "gaiadr3.gaia_source"
    coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")

    print(
        f"\n[3] Gaia DR3 Query: RA={ra_deg}°, Dec={dec_deg}° (Bán kính: {radius_deg}°)"
    )
    t0 = time.time()
    job = Gaia.cone_search_async(coord, radius=radius_deg * u.deg)
    table = job.get_results()
    print(
        f"-> Tìm thấy {len(table)} ngôi sao đã biết trong Gaia DR3 ({time.time() - t0:.2f}s)."
    )

    if len(table) > 0:
        cols = [
            "source_id",
            "ra",
            "dec",
            "pmra",
            "pmdec",
            "parallax",
            "phot_g_mean_mag",
        ]
        print(table[cols][:5])
    return table


if __name__ == "__main__":
    # 1. Test SPHEREx trên WISE 0855 (08h55m10.831s, -07d14m42.53s) ở dải sóng dài D6
    spherex_res = query_spherex_cutouts(
        ra_deg=133.79513,
        dec_deg=-7.24515,
        bandpass="SPHEREx-D6",
        size_deg=0.05,
    )
    if spherex_res is not None and len(spherex_res) > 0:
        download_and_clean_fits(spherex_res["uri"][0])

    # 2. Test Gaia DR3 trên WISE 0855 (sao lùn nâu quá lạnh nên Gaia DR3 KHÔNG thấy -> ứng viên mới)
    query_gaia_dr3(ra_deg=133.79513, dec_deg=-7.24515, radius_deg=0.025)

    # 3. Test Gaia DR3 trên Barnard's Star (sao bay nhanh đã biết -> trả về pmra, pmdec chuẩn xác)
    barnard = SkyCoord.from_name("Barnard's Star")
    query_gaia_dr3(
        ra_deg=barnard.ra.deg, dec_deg=barnard.dec.deg, radius_deg=0.025
    )