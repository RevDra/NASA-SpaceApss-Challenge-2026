# Pipeline Lọc Nhiễu Khoa Học 3 Tầng cho SPHEREx (`backend/`)

## 1. Phạm vi & Trách nhiệm
Mô-đun này đảm nhận việc hiệu chỉnh khoa học và loại bỏ giả ảnh (nhiễu phần cứng, tia vũ trụ, bụi nền) cho các khung cắt **FITS Level-2 của SPHEREx từ NASA/IPAC IRSA** (`spherex_dr1`, `spherex_qr3`) trước khi hiển thị lên giao diện Blink Viewer (`viewer/`).

## 2. Các file cốt lõi
* `backend/fits_pipeline.py`: Lõi xử lý file FITS, lọc nhiễu 3 tầng, căn chỉnh hệ tọa độ thiên văn (WCS) và đối chiếu danh mục sao Gaia DR3.
* `backend/main.py`: Server FastAPI độc lập cung cấp các API trả về ảnh đã xử lý và metadata.
* `backend/pre_cache.py`: Công cụ tải và lưu cache trước hàng loạt cho các tọa độ mục tiêu đã biết.

## 3. Logic lọc nhiễu 3 tầng (`process_single_fits`)
Từ đường dẫn (URI) cắt ảnh của IRSA, hàm `process_single_fits(cutout_uri)` tải file FITS đa lớp thông qua `astropy.utils.data.download_file(..., cache=True)` và thực hiện tuần tự 3 bước:

1. **Trừ nền bụi hoàng đạo (`ZODI-Clean`):**
   Lấy ảnh gốc trừ trực tiếp lớp nền bụi hoàng đạo có sẵn của SPHEREx:
   $$\text{zodi\_cleaned} = \text{IMAGE} - \text{ZODI}$$

2. **Che và vá 18 cờ nhiễu phần cứng & tia vũ trụ:**
   Tự động ánh xạ vị trí các bit từ từ khóa `MSKN0`..`MSKN31` trong header của lớp `FLAGS` đối chiếu với 18 cờ lỗi nghiêm trọng (`TRANSIENT`, `OVERFLOW`, `SUR_ERROR`, `NONFUNC`, `MISSING_DATA`, `HOT`, `COLD`, `NONLINEAR`, `PERSIST`, `OUTLIER`, `CROSSTALK`, `GHOST`, `GHOST_FPA`, `GHOST_EXT`, `STREAK`, `BLOOM`, `SNOWBALL`, `HALO`), kết hợp loại bỏ các pixel có phương sai (`VARIANCE`) không hợp lệ hoặc $\le 0$. Các pixel lỗi sau đó được vá mượt bằng bộ lọc trung vị cục bộ $3 \times 3$ (`visual_data`) để hình ảnh ổn định khi nháy khung hình (blinking) mà không làm méo tâm của các nguồn sáng lân cận.

3. **Lớp Khoa học / Tính SNR:**
   Tính tỷ số tín hiệu trên nhiễu cho từng pixel hợp lệ (trả về `snr_map`, `max_snr`, `bad_ratio`):
   $$\text{SNR} = \frac{\text{zodi\_cleaned}}{\sqrt{\text{VARIANCE}}}$$

## 4. Quy ước tích hợp với giao diện Viewer (`viewer/spherex_live.py`)
File `viewer/spherex_live.py` móc nối trực tiếp vào `backend/fits_pipeline.py` để toàn bộ giao diện web chạy gọn trên một server duy nhất (`python viewer/serve.py`). **Lưu ý không phá vỡ 4 quy ước sau khi chỉnh sửa:**

* **Cơ chế Hook dự phòng (`HAS_DENOISE`):** `spherex_live.py` thêm đường dẫn `../backend` vào `sys.path` và nạp hàm `process_single_fits`. Nếu chạy trên máy của thành viên khác chưa cài thư viện khoa học (`astropy`, `scipy`), hệ thống tự động lùi về chế độ đọc luồng `IMAGE` thô mà không làm sập ứng dụng.
* **Trường dữ liệu bắt buộc phải trả về:** Hàm `process_single_fits()` **bắt buộc** phải trả về `"header"` (`hdul["IMAGE"].header`) đi kèm với `"visual_data"`. `spherex_live.py` sẽ truyền thẳng bộ `(proc["header"], proc["visual_data"].astype("float32").ravel())` vào `TanSipWcs` / `resample()` để căn xoay tọa độ.
* **Cô lập bộ nhớ đệm (Cache):** Khóa cache trong `viewer/spherex_live.py` dùng tiền tố `clean_` (`clean_{ra}_{dec}_{fov}_{detector}_{per_visit}`) trong `viewer/spherex_cache/` để không lấy nhầm các file cache ảnh thô cũ.
* **Bản vá chứng chỉ SSL:** `viewer/spherex_live.py` gắn ngữ cảnh HTTPS mặc định của Python vào `certifi.where()` để truy vấn IRSA không bị chặn lỗi `SSL: CERTIFICATE_VERIFY_FAILED` trên môi trường Python cài qua `uv` ở Windows.

## 5. Hướng dẫn chạy & kiểm tra nhanh
* **Tọa độ mục tiêu đã xác nhận có dữ liệu SPHEREx:** `RA = 133.786245`, `Dec = -7.244372`, kênh `D6` ($4.42\text{--}5.00\ \mu\text{m}$).
* **Khởi chạy Viewer đã tích hợp (từ thư mục gốc của repo với `.venv` đang bật):**
  ```powershell
  python viewer/serve.py
  ```