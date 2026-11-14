# 🏗️ Kiến trúc kỹ thuật SPHEREx Sky Viewer

Tài liệu mô tả chi tiết kiến trúc phần mềm, cấu trúc mã nguồn, các module JavaScript và luồng xử lý dữ liệu của ứng dụng **SPHEREx Sky Viewer**.

---

## 1. Sơ đồ kiến trúc tổng thể (Architecture Overview)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SPHEREx Sky Viewer (Web UI)                     │
│  [Coordinate / SIMBAD Search]  [Preset Targets]  [Multi-Wavelength Nav]│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌──────────────────────┐                           ┌─────────────────────┐
│  Interactive Sky Map │                           │   Blink Engine      │
│  (Aladin Lite v3)    │                           │  (HTML5 Canvas)     │
│  - DSS2 / 2MASS      │                           │  - Multi-Epoch Play │
│  - AllWISE / unWISE  │                           │  - Difference Mode  │
│  - Catalog Overlays: │                           │  - Stacking Mode    │
│    Gaia DR3, SIMBAD  │                           │  - Stretches & LUTs │
└──────────┬───────────┘                           └──────────┬──────────┘
           │                                                  │
           └─────────────────────────┬────────────────────────┘
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Data Processing & Extraction Tier                    │
│  [spherex-api.js]          [spectrum.js]              [colormaps.js]   │
│  - Caltech/IPAC TAP query  - 102-Band SED Extraction  - Viridis, Magma │
│  - Metadata Parsing        - Ice / Absorption Markers - Inferno, Cool  │
│  - Pan-STARRS Cutout Proxy - Flux Calibration (MJy/sr)                 │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    External Open Data Services (NASA)                  │
│  - NASA IRSA / Caltech SPHEREx Archive (DR1/QR3)                       │
│  - CDS Strasbourg (Aladin HiPS & SIMBAD Resolver)                      │
│  - STScI Pan-STARRS PS1 Image Cutout Service                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết các module mã nguồn (`js/`)

| Tệp mã nguồn | Vai trò & Trách nhiệm chính |
| :--- | :--- |
| **`app.js`** | Module điều phối chính: Khởi tạo ứng dụng, lắng nghe sự kiện UI, quản lý trạng thái tọa độ (RA/Dec), điều khiển bộ lọc dải tần và xử lý phím tắt (Keyboard shortcuts). |
| **`blink-engine.js`** | Trái tim của công cụ phân tích động: Thực hiện vòng lặp hoạt họa nhấp nháy (Blink loop) giữa các epoch, tính toán ảnh trừ (Difference Mode: $I_{\text{diff}} = I_B - I_A$) và ảnh cộng dồn (Stack Mode: $I_{\text{stack}} = \frac{1}{N}\sum I_k$). |
| **`spherex-api.js`** | Lớp giao tiếp API: Thực hiện truy vấn siêu dữ liệu quan sát, kiểm tra độ phủ thiên cầu của SPHEREx, tích hợp địa chỉ IPAC TAP service và xử lý dữ liệu trả về. |
| **`spectrum.js`** | Trực quan hóa quang phổ: Vẽ biểu đồ phổ năng lượng 102 băng tần ($0.75 - 5\ \mu\text{m}$) trên Canvas, tự động đánh dấu các vạch hấp thụ đặc trưng của nước đá ($3.05\ \mu\text{m}$), băng $\text{CO}_2$ ($4.27\ \mu\text{m}$) và $\text{CO}$ ($4.67\ \mu\text{m}$). |
| **`colormaps.js`** | Bộ bảng màu sắc khoa học (Lookup Tables - LUT): Cung cấp các colormap chuẩn thiên văn học (Grayscale, Viridis, Inferno, Magma, Plasma, Hot, Cool) để tối ưu độ tương phản cho mắt người. |
| **`utils.js`** | Các hàm tiện ích: Chuyển đổi định dạng tọa độ (Sexagesimal $\leftrightarrow$ Decimal degrees), tính toán góc vị trí (Position angle), xử lý URL parameters chia sẻ kết quả trực tiếp. |

---

## 3. Các thuật toán & Kỹ thuật xử lý ảnh quan trọng

### A. Hàm kéo dãn tương phản (Image Stretches)
Để hiển thị được cả các cấu trúc mờ lẫn các nguồn sáng chói trong dải động (dynamic range) cực rộng của FITS:
1. **Asinh Stretch (Chuẩn SDSS/Lupton):**
   $$f(x) = \frac{\text{asinh}(x / \beta)}{\text{asinh}(1 / \beta)}$$
   Giữ độ tương phản tuyến tính ở vùng nền tối nhưng nén phi tuyến ở vùng nguồn sáng gắt, không làm cháy ảnh.
2. **Sqrt & Logarithmic:** Làm nổi bật các dải khí và đám mây phân tử mờ.
3. **Histogram Equalization:** Tự động tối ưu hóa phân bố biểu đồ sáng.

### B. Thuật toán trừ ảnh (Difference Imaging)
- Được sử dụng để loại bỏ toàn bộ các thiên thể cố định ở hậu cảnh (các ngôi sao tĩnh).
- Bất kỳ nguồn nào chuyển động hoặc thay đổi độ sáng (như sao biến quang hoặc tiểu hành tinh) sẽ hiện lên dưới dạng một cặp đốm đen/trắng đặc trưng (dipole structure).

---

## 4. Danh sách các thiên thể kiểm thử (Standard Benchmark Objects)

| Tên thiên thể | Tọa độ (RA, Dec) | Loại đối tượng | Hiện tượng kỳ vọng quan sát được |
| :--- | :--- | :--- | :--- |
| **Barnard’s Star** | `269.452°, +4.693°` | Sao có chuyển động riêng nhanh nhất | Dịch chuyển rõ rệt vị trí $\sim 10.3''/\text{năm}$ |
| **Epsilon Indi B** | `330.840°, −56.785°` | Hệ sao lùn nâu đôi | Phát xạ hồng ngoại mạnh, chuyển động nhanh |
| **WISE 0855−0714** | `133.795°, −7.245°` | Sao lùn nâu cực lạnh ($T \approx 250\text{ K}$) | Vô hình ở Pan-STARRS quang học, sáng trên SPHEREx |
| **RW Aurigae** | `76.956°, +30.401°` | Sao trẻ biến quang (T Tauri) | Độ sáng thay đổi thất thường giữa các epoch |
| **R Draconis** | `248.167°, +66.755°` | Sao biến quang Mira | Xung động chu kỳ với biên độ sáng chênh lệch lớn |
