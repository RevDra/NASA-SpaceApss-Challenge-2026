# 🚀 AI Knowledge Base: NASA Space Apps 2026 – "Planet X and SPHEREx"

> **Hướng dẫn sử dụng cho Team:** Khi làm việc với AI (ChatGPT, Claude, Gemini, Cursor...), hãy đính kèm file này hoặc dán toàn bộ nội dung này vào đầu cuộc trò chuyện kèm câu lệnh:
> *"Hãy đọc kỹ tài liệu ngữ cảnh dưới đây về thử thách NASA Space Apps 2026 'Planet X and SPHEREx' và 4 nguồn tài nguyên kỹ thuật đi kèm. Xác nhận bạn đã hiểu kiến trúc dữ liệu và sẵn sàng hỗ trợ tôi thiết kế/lập trình công cụ web này."*

---

## 1. Tóm tắt Đề bài: "Planet X and SPHEREx"

### Bối cảnh khoa học
* Từ năm 2025, kính thiên văn không gian **SPHEREx** của NASA quét toàn bộ bầu trời **6 tháng/lần** trên **102 dải phổ cận hồng ngoại** (bước sóng từ $0.75\,\mu\text{m}$ đến $5.0\,\mu\text{m}$), thu về hình ảnh của hơn 1 tỷ thiên thể.
* Dải cận hồng ngoại của SPHEREx đặc biệt nhạy với các vật thể lạnh hoặc giàu phân tử như $H_2$, $H_2O$, $CO_2$, $CO$ (sao chổi, tiểu hành tinh, sao lùn nâu, hành tinh lang thang / Planet X).
* Lượng dữ liệu quá khổng lồ khiến các nhà khoa học cần một công cụ trực quan hóa công khai để cộng đồng (Citizen Scientists) cùng tham gia soi ảnh tìm vật thể mới.

### Mục tiêu cốt lõi (MVP bắt buộc)
Xây dựng một **ứng dụng web công khai (Public-facing Web Tool)** cho phép:
1. Người dùng nhập tọa độ một vùng trời: **Right Ascension (RA)** và **Declination (Dec)**.
2. Hệ thống truy xuất chuỗi ảnh của vùng trời đó qua các mốc thời gian (epochs) từ sứ mệnh **SPHEREx**.
3. Hiển thị chuỗi ảnh dưới dạng **video ngắn lặp lại (Blink / Time-lapse animation)** để mắt người dễ dàng phát hiện vật thể di chuyển (nhảy vị trí giữa các khung hình) hoặc thay đổi độ sáng.

### Các tính năng mở rộng ăn điểm (Bonus / Potential Considerations)
* **Tự động cập nhật dữ liệu mới:** Thiết kế pipeline dễ dàng đồng bộ khi NASA tung ra các bản phát hành dữ liệu SPHEREx mới.
* **Khai thác 102 dải phổ hồng ngoại:** Cộng gộp dữ liệu theo từng mảng cảm biến (SPHEREx có **6 detector arrays**) để tăng tỷ lệ tín hiệu trên nhiễu (SNR), phối màu giả (RGB), hoặc **vẽ biểu đồ quang phổ (Spectrum) trực tiếp tại điểm click chuột**.
* **Xử lý ảnh thời gian (Temporal Image Processing):** Cho phép người dùng **cộng ảnh (Coadd)** hoặc **trừ ảnh (Difference Imaging)** giữa các mốc thời gian khác nhau để làm nổi bật vật thể chuyển động và triệt tiêu các ngôi sao nền đứng yên.
* **Tùy chỉnh trường nhìn (Field of View - FOV):** Cho phép phóng to/thu nhỏ vùng cắt ảnh (FOV lớn giúp bắt kịp vật thể bay cực nhanh).
* **Phủ lớp dữ liệu đối chiếu (Multi-mission Overlay):** Chồng lớp dữ liệu danh mục sao từ kính thiên văn **Gaia (DR3)** hoặc **WISE** lên ảnh SPHEREx.
* **Hỗ trợ tham số trên URL (Deep Linking):** Truyền trực tiếp tọa độ RA, Dec, FOV, band... lên thanh địa chỉ URL để người dùng dễ dàng chia sẻ link hoặc nhúng (embed) vào web khác.
* **Hiển thị Metadata:** Hiển thị các cờ cảnh báo nhiễu/lỗi dữ liệu (contamination flags) của từng khung hình.
* **Thư viện chuẩn thiên văn:** Khuyến khích sử dụng **Astropy** (xử lý dữ liệu FITS phía backend) và **Aladin Lite** của CDS (hiển thị bản đồ sao tương tác phía frontend).

---

## 2. Giải mã 4 Nguồn Tài nguyên Kỹ thuật (4 Links)

Dưới đây là bản giải thích chi tiết từng đường link mà NASA cung cấp, vai trò của nó là gì và team sẽ dùng nó vào việc gì trong dự án:

---

### 🔗 Link 1: NASA/IPAC Infrared Science Archive (IRSA) – SPHEREx Resources
* **URL:** `https://irsa.ipac.caltech.edu/Missions/spherex.html`
* **Đây là gì?**
  Là **kho lưu trữ dữ liệu chính thức (Data Warehouse) và cổng dịch vụ API** của NASA dành cho sứ mệnh SPHEREx, do Caltech/IPAC vận hành.
* **Thông tin quan trọng trên trang này:**
  * **Các bản phát hành dữ liệu hiện có:** Đã có các bản Quick Releases (`QR2`, `QR3`) và **Data Release 1 (`DR1`)**. *(Lưu ý kỹ thuật: NASA khuyến nghị ưu tiên dùng **`DR1`** và **`QR3`** vì đã sửa lỗi header PSF từ bản `QR2`)*.
  * **Lưu trữ đám mây:** Dữ liệu SPHEREx được lưu miễn phí trên **AWS S3 Cloud Storage**, cho phép backend truy xuất tốc độ cao mà không cần tải thủ công về máy.
  * **Thông số thiết bị:** Kính dùng bộ lọc biến thiên tuyến tính (LVF) phủ 6 dải bước sóng từ $0.75\,\mu\text{m}$ đến $5.0\,\mu\text{m}$ (chia thành 102 kênh phổ, độ phân giải phổ $R \approx 35\text{--}128$).
  * **Các công cụ / API có sẵn trên IRSA để gọi từ code:**
    * **Cutout Tool:** API cắt một vùng ảnh nhỏ (spatial & spectral cutout) theo tọa độ `(RA, Dec)` từ file FITS gốc dung lượng lớn $\rightarrow$ *Đây là API sống còn giúp web app tải ảnh nhanh trong vài giây.*
    * **Mosaic Tool:** Ghép nhiều ảnh lẻ thành một khối dữ liệu đa bước sóng (Mosaic Cube).
    * **Spectrophotometry Tool:** Trích xuất dữ liệu quang phổ tại một tọa độ bất kỳ.
    * **Moving Object Search Tool (MOST):** Tìm các ảnh SPHEREx đã chụp trúng quỹ đạo của một tiểu hành tinh/sao chổi.
    * **Program Interfaces (TAP / SIA):** Giao diện truy vấn dữ liệu chuẩn thiên văn bằng Python/HTTP.

---

### 🔗 Link 2: SPHEREx Tutorial Notebooks (IRSA Notebooks)
* **URL:** `https://caltech-ipac.github.io/irsa-tutorials/spherex/`
* **Đây là gì?**
  Là **"sách giáo khoa code Python"** (dưới dạng Jupyter Notebooks) do chính đội ngũ kỹ sư của NASA/Caltech viết sẵn, hướng dẫn từng bước cách đọc và xử lý file dữ liệu SPHEREx.
* **Gồm 6 bài hướng dẫn cốt lõi mà AI/Dev cần tham khảo:**
  1. **Data Overview:** Cách viết code tìm tất cả các ảnh SPHEREx chụp trùng vào một tọa độ `(RA, Dec)` và giải mã cấu trúc file **Multi-Extension FITS (MEF)** (gồm các lớp: độ sáng bề mặt, phương sai/sai số, cờ lỗi `flags`, nền trời mô hình hóa, PSF và hệ tọa độ bước sóng WCS).
  2. **Spectral Image Cutouts:** Code mẫu gọi dịch vụ cắt ảnh theo không gian (FOV) và dải phổ $\rightarrow$ *Dùng trực tiếp cho tính năng chọn Field of View.*
  3. **PSF Models:** Cách đọc hàm lan truyền điểm (Point Spread Function) để khử nhiễu hoặc làm nét ảnh.
  4. **Source Discovery Tool:** Code tự động phát hiện vật thể phát sáng trong vùng ảnh.
  5. **Mosaic Cube:** Code đọc và xử lý khối ảnh 3D (2 chiều không gian + 1 chiều bước sóng).
  6. **HiPS All-Sky Cube:** Hướng dẫn xuất/đọc định dạng bản đồ phân cấp **HiPS** (Hierarchical Progressive Surveys) để hiển thị mượt mà trên trình duyệt web (tương thích trực tiếp với thư viện **Aladin Lite**) và trích xuất nhanh biểu đồ phổ (quick-look spectrum).
* **Dùng để làm gì trong dự án?**
  Team không cần tự mò cách đọc file thiên văn FITS phức tạp của SPHEREx; chỉ cần lấy code Python mẫu từ 6 notebook này để viết **Backend Service** (xử lý cắt ảnh, cộng/trừ ảnh, trích xuất phổ).

---

### 🔗 Link 3: WiseView (Hình mẫu thiết kế UI/UX & Thuật toán xử lý ảnh)
* **URL:** `http://byw.tools/wiseview`
* **Đây là gì?**
  Là một ứng dụng web huyền thoại (do Dan Caselden và Paul Westin phát triển cho dự án *Backyard Worlds: Planet 9*), chuyên dùng để soi chuỗi ảnh thời gian của kính thiên văn WISE/NEOWISE. Công chúng đã dùng chính trang web này để phát hiện hàng trăm sao lùn nâu và sao chổi mới. Đề bài gợi ý lấy trang này làm **hình mẫu (Model / Inspiration)**.
* **Các tính năng "ăn tiền" của WiseView cần học hỏi và áp dụng cho SPHEREx:**
  * **Giao diện điều khiển trực quan & URL Parameters:**
    * Ô nhập tọa độ `RA, Dec` hỗ trợ cả hệ thập phân (ví dụ: `133.795 -7.245`) lẫn hệ giờ-phút-giây (`08h55m10.83s -07d14m42.5s`).
    * Thanh trượt chỉnh **Field of View (arcseconds)**, **Zoom**, và **Blink interval (ms)** (tốc độ chớp/chuyển khung hình).
    * Mọi thiết lập đều được lưu thẳng lên URL query string để chia sẻ/nhúng dễ dàng.
  * **Mẹo thị giác thông minh (Dashed Border):** Khi video lặp lại từ khung hình cuối về khung hình đầu tiên, khung viền ảnh sẽ nháy **nét đứt (dashed border)** để báo hiệu cho mắt người biết chu kỳ vừa reset (giúp phân biệt vật thể bay thẳng thật sự với hiệu ứng giật lùi khi lặp video).
  * **Bộ công cụ xử lý ảnh chuyên sâu ngay trên giao diện:**
    * **Sliding Window:** Trượt cửa sổ thời gian (ví dụ 0.5 năm) để cộng gộp các ảnh chụp gần nhau, giúp giảm nhiễu hạt và làm rõ vật thể mờ.
    * **Difference Imaging (Trừ ảnh):** Lấy ảnh epoch sau trừ đi ảnh epoch trước $\rightarrow$ Các ngôi sao đứng yên sẽ biến mất, chỉ còn lại vật thể di chuyển (hiện ra dạng cặp đốm sáng - tối) hoặc sao biến quang.
    * **Shift-and-Add:** Cho phép nhập vận tốc chuyển động riêng (`pmra`, `pmdec` tính bằng $\text{mas/năm}$) để dịch chuyển các khung hình khớp theo tốc độ bay của vật thể, giúp "khóa nét" các thiên thể siêu mờ.
    * **Phối màu đa dải phổ (Color Mapping):** Ở WiseView, kênh W1 được gán màu Xanh dương (Blue), kênh W2 gán màu Đỏ (Red), trung bình là Xanh lá (Green). Áp dụng sang SPHEREx: Team có thể gán 3 nhóm bước sóng (hoặc 3 detector arrays) vào 3 kênh màu **R - G - B** để vật thể lạnh/giàu băng nước hiện màu nổi bật khác hẳn sao thường!
    * **Image Stretching & Invert:** Kéo giãn độ tương phản phi tuyến bằng hàm `Astropy AsinhStretch`, chỉnh ngưỡng sáng `Min - Max`, và nút **Invert pixel values** (đảo màu thành nền trắng - sao đen, giúp mắt người soi vật thể mờ nhạy hơn nhiều lần).
    * **Gaia DR3 Overlay:** Nút bật/tắt vòng tròn đánh dấu các ngôi sao đã có trong danh mục Gaia DR3.

---

### 🔗 Link 4: Gaia Mission Data – Data Release 3 (DR3)
* **URL:** `https://archive.stsci.edu/missions-and-data/gaia`
* **Đây là gì?**
  Là kho lưu trữ dữ liệu từ sứ mệnh **Gaia** của Cơ quan Vũ trụ Châu Âu (ESA) tại cổng MAST (STScI). Gaia là kính thiên văn đo trắc học chính xác nhất lịch sử, lập bản đồ vị trí 3D, khoảng cách (thị sai - parallax) và vận tốc chuyển động riêng (proper motion) của hơn **1,8 tỷ ngôi sao**.
* **Dùng để làm gì trong dự án?**
  1. **Tạo lớp phủ đối chiếu (Gaia DR3 Overlay) trên màn hình xem ảnh:**
     Khi người dùng soi một vùng trời SPHEREx, backend truy vấn nhanh các ngôi sao Gaia DR3 trong vùng đó và vẽ lên giao diện (kèm mũi tên chỉ hướng di chuyển `pmra`, `pmdec`).
  2. **Công cụ "săn" khám phá mới (Discovery Filter):**
     * **Trường hợp 1:** Thấy một đốm sáng di chuyển trên SPHEREx và trùng khớp với một vòng tròn của Gaia DR3 $\rightarrow$ Đây là ngôi sao đã được biết đến (ví dụ: Barnard's Star).
     * **Trường hợp 2:** Thấy một đốm sáng di chuyển rõ rệt trên ảnh hồng ngoại SPHEREx nhưng **hoàn toàn không có trong dữ liệu Gaia DR3** (do Gaia quan sát ở ánh sáng khả kiến nên bị "mù" trước các vật thể quá lạnh và tối) $\rightarrow$ **Dấu hiệu của một Sao lùn nâu (Brown Dwarf) hoặc Hành tinh mới (Planet X) chưa từng được công bố!**
  * **Cách truy xuất bằng code:** Sử dụng thư viện Python `astroquery.gaia` hoặc `astroquery.mast` (truy vấn TAP/ADQL theo tọa độ `RA, Dec` và bán kính `FOV`).

---

## 3. Kiến trúc Hệ thống Gợi ý cho AI & Team

Khi yêu cầu AI viết code, team có thể định hướng kiến trúc **Client - Server** (hoặc Python Fullstack) kết nối 4 nguồn trên theo luồng sau:

```text
[Người dùng nhập RA, Dec, FOV, Band trên Web Frontend]
                       │
                       ▼
[Backend API (Python: FastAPI / Flask + Astropy + Astroquery)]
   ├── 1. Gọi IRSA SPHEREx Cutout API / AWS S3 (từ Link 1 & 2) -> Tải các file FITS cắt theo tọa độ & từng Epoch.
   ├── 2. Xử lý ảnh (học từ Link 3 - WiseView):
   │      • Đọc MEF FITS, kiểm tra contamination flags.
   │      • Cộng gộp (Coadd) theo 6 detector arrays hoặc Sliding Window.
   │      • Thực hiện Difference Imaging (nếu bật) & Astropy AsinhStretch.
   │      • Trích xuất dữ liệu quang phổ 102 kênh (Spectrum JSON) tại tọa độ click.
   └── 3. Gọi Gaia DR3 TAP API (từ Link 4) -> Lấy danh sách tọa độ sao & vector chuyển động (pmra, pmdec).
                       │
                       ▼
[Frontend Web App (React / Next.js / HTML5 Canvas hoặc Aladin Lite)]
   ├── Phát chuỗi ảnh (Blink Video) mượt mà với nút chỉnh tốc độ (ms), Zoom, Invert màu, Dashed Border báo reset.
   ├── Bật/tắt lớp phủ Gaia DR3 Overlay (vòng tròn + mũi tên hướng bay của sao).
   ├── Hiển thị biểu đồ quang phổ 102 bands (0.75 - 5.0 um) khi người dùng click vào một thiên thể.
   └── Đồng bộ toàn bộ trạng thái lên URL (?ra=...&dec=...&fov=...&band=...) để dễ dàng chia sẻ/nhúng.
```

---

## 4. Bộ Dữ liệu Kiểm thử Bắt buộc (Benchmark Targets)

Đề bài yêu cầu công cụ phải **test thành công trên 5 thiên thể chuẩn** dưới đây (chia làm 2 nhóm: nhóm kiểm tra khả năng phát hiện **chuyển động vị trí** và nhóm kiểm tra khả năng phát hiện **biến thiên độ sáng**):

| Tên Thiên thể | Loại vật thể | Tọa độ RA (J2000) | Tọa độ Dec (J2000) | Tọa độ Thập phân (`RA, Dec`) | Hành vi cần thấy rõ trên Web Tool |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Barnard's Star** | Sao lùn đỏ (Red Dwarf) | `17h 57m 48.50s` | `+04d 41m 36.1s` | `269.4521, +4.6934` | **Chuyển động cực nhanh:** Ngôi sao có chuyển động riêng lớn nhất bầu trời ($\approx 10.3\,\text{arcsec/năm}$). Sẽ thấy nó "chạy" rất rõ qua các khung hình. |
| **2. Epsilon Indi B** | Cặp sao lùn nâu đôi | `22h 04m 10.52s` | `-56d 46m 57.7s` | `331.0438, -56.7827` | **Chuyển động nhanh & sáng ở hồng ngoại:** Hệ sao lùn nâu ở gần Hệ Mặt Trời, dịch chuyển vị trí rõ rệt theo thời gian. |
| **3. WISE 0855** | Sao lùn nâu siêu lạnh (Y Dwarf) | `08h 55m 10.831s` | `-07d 14m 42.53s` | `133.7951, -7.2451` | **Bài test khó nhất:** Rất mờ ở bước sóng ngắn nhưng sáng ở vùng $4\text{--}5\,\mu\text{m}$ của SPHEREx, bay cực nhanh ($\approx 8.1\,\text{arcsec/năm}$) và **không có trong Gaia DR3**. |
| **4. RW Aurigae** | Sao trẻ biến quang (T Tauri) | `05h 07m 49.46s` | `+30d 24m 04.8s` | `76.9561, +30.4013` | **Biến đổi độ sáng thất thường:** Đứng yên tại chỗ nhưng độ sáng nhấp nháy/thay đổi đột ngột giữa các mốc thời gian. |
| **5. R Draconis** | Sao khổng lồ biến quang (Mira) | `16h 32m 40.23s` | `+66d 45m 17.9s` | `248.1676, +66.7550` | **Biến đổi độ sáng theo chu kỳ:** Sao biến quang chu kỳ ~8 tháng, độ sáng tăng/giảm rõ rệt qua từng kỳ quét 6 tháng của SPHEREx. |