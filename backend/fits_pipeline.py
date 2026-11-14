# Lõi xử lý ảnh, lọc nhiễu, căn xoay WCS & trích phổ

import hashlib
import json
from pathlib import Path
import re
import time

from astropy.coordinates import SkyCoord
from astropy.io import fits
import astropy.units as u
from astropy.utils.data import download_file
from astropy.visualization import AsinhStretch, ImageNormalize, ZScaleInterval
from astropy.wcs import WCS
from astroquery.gaia import Gaia
from astroquery.ipac.irsa import Irsa
import numpy as np
from PIL import Image
from reproject import reproject_interp
from scipy.ndimage import median_filter

CACHE_DIR = Path(__file__).resolve().parent / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# 18 cờ nhiễu / tia vũ trụ / giả ảnh quang học thật từ header SPHEREx DR1
CRITICAL_FLAGS = {
    "TRANSIENT",
    "OVERFLOW",
    "SUR_ERROR",
    "NONFUNC",
    "MISSING_DATA",
    "HOT",
    "COLD",
    "NONLINEAR",
    "PERSIST",
    "OUTLIER",
    "CROSSTALK",
    "GHOST",
    "GHOST_FPA",
    "GHOST_EXT",
    "STREAK",
    "BLOOM",
    "SNOWBALL",
    "HALO",
}


def decode_bad_pixel_mask(
    flags: np.ndarray, flags_header: fits.Header
) -> np.ndarray:
    """Giải mã 32-bit FLAGS theo đúng tên bit của NASA SPHEREx."""
    bad_mask = np.zeros_like(flags, dtype=bool)
    for key in flags_header:
        if key.startswith("MSKN"):
            bit_idx = int(key.replace("MSKN", ""))
            flag_name = str(flags_header[key]).strip().upper()
            if flag_name in CRITICAL_FLAGS:
                bad_mask |= (flags & (1 << bit_idx)) != 0
    return bad_mask


def process_single_fits(cutout_uri: str):
    """Tải 1 file FITS, trừ bụi ZODI, vá pixel lỗi cho hiển thị và tính SNR kiểm định."""
    cached_fits = download_file(cutout_uri, cache=True)
    with fits.open(cached_fits) as hdul:
        image = hdul["IMAGE"].data.astype(np.float64)
        flags = hdul["FLAGS"].data.astype(np.uint32)
        variance = hdul["VARIANCE"].data.astype(np.float64)
        zodi = hdul["ZODI"].data.astype(np.float64)
        header = hdul["IMAGE"].header
        wcs = WCS(header)

        # 1. Trừ nền bụi hoàng đạo (Zodi-Clean)
        zodi_cleaned = image - zodi

        # 2. Lọc 18 cờ nhiễu phần cứng & tia vũ trụ
        bad_mask = (
            decode_bad_pixel_mask(flags, hdul["FLAGS"].header)
            | np.isnan(zodi_cleaned)
            | np.isnan(variance)
            | (variance <= 0)
        )
        valid = ~bad_mask

        # 3. Tính bản đồ SNR kiểm định (Science Layer)
        snr_map = np.zeros_like(zodi_cleaned)
        snr_map[valid] = zodi_cleaned[valid] / np.sqrt(variance[valid])
        max_snr = float(np.max(snr_map)) if np.any(valid) else 0.0
        bad_ratio = float(np.sum(bad_mask)) / image.size

        # 4. Vá mượt các pixel lỗi bằng trung vị lân cận để xuất ảnh PNG đẹp (Visual Layer)
        filled = np.where(bad_mask, np.nanmedian(zodi_cleaned[valid]), zodi_cleaned)
        repaired = np.where(bad_mask, median_filter(filled, size=3), zodi_cleaned)

        # Lấy thông tin thời gian chụp (MJD -> ISO date)
        mjd_obs = header.get("MJD-OBS", None)
        date_obs = str(header.get("DATE-OBS", "2025-05-01"))[:10]
        exptime = float(header.get("EXPTIME", 25.0))

        return {
            "visual_data": repaired,
            "snr_map": snr_map,
            "variance": variance,
            "wcs": wcs,
            "date": date_obs,
            "mjd": mjd_obs,
            "exposure": round(exptime, 1),
            "max_snr": round(max_snr, 1),
            "bad_ratio": bad_ratio,
        }


def save_array_as_png(
    data: np.ndarray, out_path: Path, vmin: float, vmax: float, invert: bool = False
):
    """Kéo giãn độ sáng chuẩn WiseView (AsinhStretch) và lưu ra file PNG 256x256."""
    norm = ImageNormalize(vmin=vmin, vmax=vmax, stretch=AsinhStretch(a=0.15))
    scaled = np.clip(norm(np.nan_to_num(data, nan=vmin)), 0.0, 1.0)
    if invert:
        scaled = 1.0 - scaled
    img_uint8 = (scaled * 255).astype(np.uint8)
    # Lật trục Y (origin='lower' của thiên văn -> top-left của trình duyệt) và phóng mượt lên 256x256
    pil_img = Image.fromarray(np.flipud(img_uint8), mode="L").resize(
        (256, 256), Image.Resampling.NEAREST
    )
    pil_img.save(out_path)


def fetch_gaia_overlay(
    ra_deg: float, dec_deg: float, size_deg: float, ref_wcs: WCS, shape_hw: tuple
):
    """Kéo sao Gaia DR3 và quy đổi thẳng sang tọa độ chuẩn hóa (0..1) trên khung ảnh."""
    Gaia.MAIN_GAIA_TABLE = "gaiadr3.gaia_source"
    coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
    job = Gaia.cone_search_async(coord, radius=(size_deg * 0.75) * u.deg)
    table = job.get_results()

    h, w = shape_hw
    stars = []
    for row in table:
        s_ra = float(row["ra"])
        s_dec = float(row["dec"])
        px, py = ref_wcs.world_to_pixel(
            SkyCoord(ra=s_ra * u.deg, dec=s_dec * u.deg)
        )
        # Chỉ lấy các sao nằm lọt bên trong khung cắt
        if 0 <= px < w and 0 <= py < h:
            pmra = float(row["pmra"]) if not np.ma.is_masked(row["pmra"]) else 0.0
            pmdec = (
                float(row["pmdec"]) if not np.ma.is_masked(row["pmdec"]) else 0.0
            )
            # Tính vị trí dự phóng sau 1 năm để Frontend vẽ mũi tên vận tốc
            future_ra = s_ra + (pmra / 3600000.0) / np.cos(np.radians(s_dec))
            future_dec = s_dec + (pmdec / 3600000.0)
            f_px, f_py = ref_wcs.world_to_pixel(
                SkyCoord(ra=future_ra * u.deg, dec=future_dec * u.deg)
            )

            stars.append({
                "sourceId": str(row["source_id"]),
                "ra": round(s_ra, 6),
                "dec": round(s_dec, 6),
                "mag": round(float(row["phot_g_mean_mag"]), 2),
                "pmra": round(pmra, 2),
                "pmdec": round(pmdec, 2),
                # Tọa độ chuẩn hóa [0..1] gốc trên-trái để Canvas vẽ trực tiếp
                "nx": round(float(px) / w, 4),
                "ny": round(1.0 - (float(py) / h), 4),
                "nxNextYear": round(float(f_px) / w, 4),
                "nyNextYear": round(1.0 - (float(f_py) / h), 4),
            })
    return stars


def run_full_sky_pipeline(
    ra_deg: float,
    dec_deg: float,
    bandpass: str = "SPHEREx-D6",
    size_deg: float = 0.05,
    max_epochs: int = 8,
):
    """Pipeline hoàn chỉnh: Cache -> Query IRSA -> Clean -> WCS Align -> Diff -> Gaia -> JSON."""
    cache_key = hashlib.md5(
        f"{ra_deg:.5f}_{dec_deg:.5f}_{bandpass}_{size_deg:.4f}".encode()
    ).hexdigest()[:12]
    target_dir = CACHE_DIR / cache_key
    manifest_file = target_dir / "response.json"

    # 1. Trả ngay lập tức (< 10ms) nếu đã có trong Cache
    if manifest_file.exists():
        return json.loads(manifest_file.read_text(encoding="utf-8"))

    target_dir.mkdir(parents=True, exist_ok=True)
    coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")

    # 2. Truy vấn metadata từ NASA IRSA SPHEREx
    query = f"""
    SELECT
        'https://irsa.ipac.caltech.edu/' || a.uri || '?center={coord.ra.deg},{coord.dec.deg}d&size={size_deg}' AS uri,
        a.uri AS raw_uri,
        p.time_bounds_lower,
        p.obs_collection
    FROM spherex.artifact a
    JOIN spherex.plane p ON a.planeid = p.planeid
    WHERE 1 = CONTAINS(POINT('ICRS', {coord.ra.deg}, {coord.dec.deg}), p.poly)
      AND p.energy_bandpassname = '{bandpass}'
    ORDER BY p.time_bounds_lower
    """
    tap_res = Irsa.query_tap(query)
    if len(tap_res) == 0:
        return {"epochs": [], "gaiaStars": [], "error": "Không tìm thấy dữ liệu SPHEREx tại tọa độ này."}

    # Gom cụm theo đợt quan sát (planId) để tránh trùng lặp các lần phơi sáng sát nhau
    seen_plans = set()
    selected_rows = []
    for row in tap_res:
        m = re.search(r"(\d{4}W\d+_\d+[A-Z]?)", str(row["raw_uri"]))
        plan_id = m.group(1) if m else str(row["time_bounds_lower"])
        if plan_id not in seen_plans:
            seen_plans.add(plan_id)
            selected_rows.append((plan_id, row))
        if len(selected_rows) >= max_epochs:
            break

    # 3. Tải và lọc nhiễu từng khung hình
    processed_frames = []
    for plan_id, row in selected_rows:
        try:
            frame = process_single_fits(str(row["uri"]))
            frame["planId"] = plan_id
            frame["collection"] = "DR1" if "dr1" in str(row["raw_uri"]).lower() else "QR3"
            processed_frames.append(frame)
        except Exception as e:
            print(f"[WARN] Bỏ qua frame {plan_id}: {e}")

    if not processed_frames:
        return {"epochs": [], "gaiaStars": [], "error": "Lỗi khi đọc file FITS từ IRSA."}

    # 4. Căn chỉnh góc xoay WCS toàn bộ chuỗi ảnh về khung hình gốc đầu tiên (Chống rung bầu trời)
    ref_wcs = processed_frames[0]["wcs"]
    ref_shape = processed_frames[0]["visual_data"].shape
    aligned_arrays = [processed_frames[0]["visual_data"]]

    for i in range(1, len(processed_frames)):
        reproj_arr, _ = reproject_interp(
            (processed_frames[i]["visual_data"], processed_frames[i]["wcs"]),
            ref_wcs,
            shape_out=ref_shape,
        )
        # Điền vùng rìa xoay bằng giá trị trung vị nền
        reproj_arr = np.nan_to_num(
            reproj_arr, nan=np.nanmedian(processed_frames[i]["visual_data"])
        )
        aligned_arrays.append(reproj_arr)

    # 5. Tính ngưỡng sáng chung (ZScale) để các frame nháy mượt, không bị chớp độ sáng giả
    vmin, vmax = ZScaleInterval().get_limits(aligned_arrays[0])
    diff_limit = (vmax - vmin) * 0.8

    epochs_payload = []
    base_frame = aligned_arrays[0]

    for i, f_info in enumerate(processed_frames):
        clean_name = f"epoch_{i}_clean.png"
        diff_name = f"epoch_{i}_diff.png"

        save_array_as_png(aligned_arrays[i], target_dir / clean_name, vmin, vmax)
        diff_arr = aligned_arrays[i] - base_frame
        save_array_as_png(
            diff_arr, target_dir / diff_name, -diff_limit, diff_limit
        )

        # Khớp đúng schema Frontend đang dùng trong js/spherex-api.js
        epochs_payload.append({
            "index": i,
            "planId": f_info["planId"],
            "date": f_info["date"],
            "dateLabel": f_info["date"],
            "collection": f_info["collection"],
            "detectors": [int(bandpass.replace("SPHEREx-D", ""))],
            "ra": ra_deg,
            "dec": dec_deg,
            "imageUrl": f"/cache/{cache_key}/{clean_name}",
            "diffImageUrl": f"/cache/{cache_key}/{diff_name}",
            "metadata": {
                "nBands": 17,
                "exposure": str(f_info["exposure"]),
                "contamination": (
                    f"FLAG: {f_info['bad_ratio']:.1%} masked"
                    if f_info["bad_ratio"] > 0.15
                    else "clean"
                ),
                "snr": str(f_info["max_snr"]),
            },
        })

    # 6. Kéo danh mục sao Gaia DR3 đã quy đổi tọa độ pixel
    gaia_stars = fetch_gaia_overlay(ra_deg, dec_deg, size_deg, ref_wcs, ref_shape)

    result = {
        "cacheKey": cache_key,
        "ra": ra_deg,
        "dec": dec_deg,
        "bandpass": bandpass,
        "sizeDeg": size_deg,
        "epochs": epochs_payload,
        "gaiaStars": gaia_stars,
    }
    manifest_file.write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return result