# SPHEREx 3-Tier Scientific Denoising Pipeline (`backend/`)

## 1. Scope & Responsibility
This module handles scientific calibration and artifact removal for **NASA/IPAC IRSA SPHEREx Level-2 FITS cutouts** (`spherex_dr1`, `spherex_qr3`) before they are rendered in the Blink Viewer (`viewer/`).

## 2. Core Files
- `backend/fits_pipeline.py`: Main FITS processing, 3-tier denoising, WCS alignment, and Gaia DR3 cross-matching logic.
- `backend/main.py`: Standalone FastAPI server exposing processed cutouts and metadata endpoints.
- `backend/pre_cache.py`: Batch pre-caching utility for known target coordinates.

## 3. 3-Tier Denoising Logic (`process_single_fits`)
Given an IRSA cutout URI, `process_single_fits(cutout_uri)` downloads the multi-extension FITS file via `astropy.utils.data.download_file(..., cache=True)` and executes:
1. **Zodiacal Dust Subtraction (`ZODI-Clean`):** Computes `zodi_cleaned = IMAGE - ZODI` using the native SPHEREx zodiacal background extension.
2. **18-Flag Hardware & Cosmic-Ray Masking:** Dynamically maps bit positions from `FLAGS` header keys (`MSKN0`..`MSKN31`) against 18 critical flags (`TRANSIENT`, `OVERFLOW`, `SUR_ERROR`, `NONFUNC`, `MISSING_DATA`, `HOT`, `COLD`, `NONLINEAR`, `PERSIST`, `OUTLIER`, `CROSSTALK`, `GHOST`, `GHOST_FPA`, `GHOST_EXT`, `STREAK`, `BLOOM`, `SNOWBALL`, `HALO`), plus invalid/non-positive `VARIANCE` pixels. Masked pixels are repaired via a 3x3 local median filter (`visual_data`) for clean visual blinking without distorting neighboring PSF cores.
3. **Science / SNR Layer:** Computes per-pixel signal-to-noise ratio `SNR = zodi_cleaned / sqrt(VARIANCE)` (`snr_map`, `max_snr`, `bad_ratio`).

## 4. Viewer Integration Contract (`viewer/spherex_live.py`)
`viewer/spherex_live.py` hooks directly into `backend/fits_pipeline.py` so the web UI runs on a single server (`python viewer/serve.py`):
- **Optional Hook (`HAS_DENOISE`):** `spherex_live.py` adds `../backend` to `sys.path` and imports `process_single_fits`. If scientific dependencies (`astropy`, `scipy`) are absent on another machine, it falls back cleanly to raw `IMAGE` HDU streaming.
- **Required Return Fields:** `process_single_fits()` **must** return `"header"` (`hdul["IMAGE"].header`) alongside `"visual_data"`. `spherex_live.py` feeds `(proc["header"], proc["visual_data"].astype("float32").ravel())` directly into `TanSipWcs` / `resample()`.
- **Cache Isolation:** Cache keys in `viewer/spherex_live.py` use the `clean_` prefix (`clean_{ra}_{dec}_{fov}_{detector}_{per_visit}`) to avoid collisions with cached raw frames.
- **SSL Context Patch:** `viewer/spherex_live.py` binds Python's default HTTPS context to `certifi.where()` so IRSA queries succeed on Windows `uv` Python environments.

## 5. Quick Verification
- **Test Target with Confirmed SPHEREx Coverage:** `RA = 133.786245`, `Dec = -7.244372`, Band `D6` (4.42–5.00 µm).
- **Run Integrated Viewer (from repo root):**
  ```powershell
  python viewer/serve.py