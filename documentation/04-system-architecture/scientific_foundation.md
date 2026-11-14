# 🔬 Cơ sở khoa học & Dữ liệu thiên văn (SPHEREx, Pan-STARRS & WiseView)

Tài liệu tổng hợp các cơ sở vật lý thiên văn, chuẩn dữ liệu FITS/MEF và quy trình truy xuất dữ liệu từ các tài liệu nghiên cứu: `spherex_intro.md`, `spherex_cutouts.md` và `PANSTARRS.md`.

---

## 1. Sứ mệnh SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer)

### Tổng quan sứ mệnh
- **Nhiệm vụ:** Kính thiên văn không gian thuộc chương trình Medium Explorer của NASA (phóng tháng 03/2025).
- **Dải phổ quan sát:** Phổ học hồng ngoại từ **0.75 đến 5.0 micron** trên toàn bộ bầu trời, độ sâu cao tại các vùng SPHEREx Deep Fields.
- **3 Mục tiêu khoa học cốt lõi:**
  1. **Constrain inflation:** Đo lường dấu vết của lạm phát vũ trụ qua phân bố vật chất quy mô lớn 3 chiều.
  2. **History of cosmic light:** Lần vết lịch sử phát xạ ánh sáng thiên hà qua phép đo gom cụm đa dải băng tần sâu.
  3. **Biogenic ices & water:** Khảo sát sự phong phú và thành phần của nước cùng băng sinh học trong các giai đoạn đầu hình thành đĩa tiền hành tinh và tiền sao.

### Cấu trúc dữ liệu ảnh phổ MEF (Multi-Extension FITS)
Theo tài liệu `spherex_intro.md`, dữ liệu SPHEREx Data Release 1 (DR1) và Quick Release 3 (QR3) được đóng gói dưới định dạng **MEF (Multi-Extension FITS)** gồm nhiều Header Data Units (HDU):
- **Primary HDU (HDU 0):** Metadata chung của lượt quan sát (observation ID, ngày quan sát, góc hướng kính thiên văn).
- **Image HDU:** Ma trận điểm ảnh chứa giá trị thông lượng (Flux) tính bằng đơn vị MJy/sr (MegaJansky per steradian).
- **Variance / Uncertainty HDU:** Ước lượng phương sai lỗi đo trên từng pixel.
- **Flag / Contamination HDU:** Cờ đánh dấu các pixel bị bão hòa, tia vũ trụ, hoặc ánh sáng tán xạ từ Mặt Trời/Mặt Trăng/Trái Đất.
- **Hệ tọa độ WCS (World Coordinate System):** 
  - Astrometric WCS (RA, Dec) ánh xạ vị trí pixel sang tọa độ xích đạo thiên cầu (J2000).
  - Spectral WCS ánh xạ vị trí pixel sang bước sóng trung tâm tương ứng của 102 băng phổ.

---

## 2. Quy trình trích xuất SPHEREx Cutouts API (IPAC/IRSA)

Theo hướng dẫn từ `spherex_cutouts.md`, để không phải tải toàn bộ tệp FITS khổng lồ, hệ thống có thể truy vấn ảnh cắt cục bộ (Cutouts) tại một tọa độ cụ thể:

```python
# Sơ đồ luồng truy vấn Cutout API từ Caltech/IPAC
Input Coordinates (RA, Dec) 
  --> Query IRSA Metadata Table (Tìm các file MEF chứa tọa độ mục tiêu)
  --> Gửi Request trích xuất Cutout (vùng kích thước ví dụ 5' x 5')
  --> Tải các MEF Cutout đa thời kỳ (Observation Epochs)
  --> Đóng gói thành dãy chuỗi ảnh cho Blink Engine
```

### Xử lý đồng thời (Concurrent Processing)
- Sử dụng `concurrent.futures.ThreadPoolExecutor` để tải song song các lát cắt theo từng epoch, giảm độ trễ từ vài chục giây xuống dưới 2 giây cho một vùng quan sát.

---

## 3. Khảo sát quang học Pan-STARRS & Phân tích động học WiseView

Theo nghiên cứu từ `PANSTARRS.md`, việc kết hợp dữ liệu hồng ngoại của SPHEREx với dữ liệu quang học và chuyển động riêng (Proper Motion) mang lại sức mạnh vượt trội:

### A. Pan-STARRS (Panoramic Survey Telescope and Rapid Response System)
- Khảo sát quang học/cận hồng ngoại với 5 bộ lọc: $g, r, i, z, y$ (từ 400 nm đến 1050 nm).
- **Nguyên lý bức xạ vật đen (Wien's Displacement Law):**
  $$\lambda_{\max} \cdot T = b \approx 2.898 \times 10^{-3} \text{ m}\cdot\text{K}$$
  - Các ngôi sao dãy chính nóng ($T > 3000\text{ K}$) phát xạ cực đại ở dải quang học (nhìn thấy rõ trên Pan-STARRS).
  - Các sao lùn nâu lạnh (Brown Dwarfs, $T < 1500\text{ K}$) hoặc tiểu hành tinh không phát ra ánh sáng nhìn thấy mà tỏa nhiệt hồng ngoại ($0.75 - 5\ \mu\text{m}$), ẩn mình trên ảnh quang học nhưng hiện rõ rệt trên SPHEREx và WiseView.

### B. WiseView & Động học thời gian (Proper Motion)
- **WiseView** khai thác dữ liệu từ sứ mệnh WISE/NEOWISE qua các kênh hồng ngoại nhiệt $W1\ (3.4\ \mu\text{m})$ và $W2\ (4.6\ \mu\text{m})$.
- Kỹ thuật **Blink Comparison** (nhấp nháy xen kẽ giữa các năm chụp khác nhau) làm nổi bật chuyển động riêng của các vật thể ở gần hệ Mặt Trời (như sao Barnard dịch chuyển $\sim 10.3''/\text{năm}$, WISE 0855−0714 dịch chuyển $\sim 8.1''/\text{năm}$).

---

## 4. Bảng đối sánh Đa bước sóng (Multi-Wavelength Synthesis)

| Tiêu chí | Pan-STARRS | SPHEREx (DR1/QR3) | WISE / WiseView |
| :--- | :--- | :--- | :--- |
| **Dải bước sóng** | Quang học ($0.4 - 1.05\ \mu\text{m}$) | Cận & Trung Hồng ngoại ($0.75 - 5.0\ \mu\text{m}$) | Trung Hồng ngoại ($3.4 - 22\ \mu\text{m}$) |
| **Số dải phổ** | 5 bộ lọc ($g, r, i, z, y$) | **102 băng phổ liên tục ($R \approx 40 - 130$)** | 4 dải rộng ($W1, W2, W3, W4$) |
| **Điểm mạnh** | Độ phân giải không gian cao, thấy sao nóng | Quang phổ kế phân giải toàn trời, phát hiện nước & băng | Đo nhiệt độ thấp và phát hiện chuyển động riêng dài hạn |
| **Vai trò trong Sky Viewer** | Ảnh nền đối chứng quang học | Phân tích chi tiết đường phổ & trạng thái biến quang | Xác nhận chuyển động thực tế qua chuỗi thời gian |
