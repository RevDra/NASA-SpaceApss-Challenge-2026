# 🎯 Chiến lược Pitching & Demo 7 Slides (Chuẩn Ban Giám Khảo HCMC)

Tài liệu hướng dẫn kịch bản thuyết trình, cấu trúc slide chuẩn và chiến lược tối ưu hóa điểm số theo thang điểm Rubric của **NASA Space Apps Ho Chi Minh City 2026**.

---

## 1. Cấu trúc chuẩn 7 Slide thuyết trình (Bắt buộc theo Handbook)

### Slide 1: Title, Challenge & Team (Mở đầu & Nhận diện)
- **Tiêu đề:** SPHEREx Sky Viewer — Khám phá Vũ trụ Động học & Biến quang qua Ảnh Hồng ngoại NASA
- **Thử thách lựa chọn:** Nêu chính xác tên thử thách từ NASA Space Apps 2026 liên quan đến khai thác dữ liệu thiên văn mở.
- **Đội ngũ:** Tên đội, danh sách thành viên và vai trò chuyên môn (Data Science, Astropy/Physics, Frontend Engineering).
- **Thông điệp 1 câu (Hook):** *"Mang kính thiên văn không gian SPHEREx trị giá hàng trăm triệu USD của NASA đến từng trình duyệt web của mọi học sinh, sinh viên và nhà nghiên cứu."*

### Slide 2: Problem & Users (Vấn đề & Đối tượng thụ hưởng)
- **Vấn đề:** 
  - Dữ liệu FITS quang phổ MEF của NASA quá nặng, phức tạp và đòi hỏi kỹ năng lập trình Python/Astropy chuyên sâu.
  - Người yêu thiên văn, học sinh sinh viên và các nhà nghiên cứu nghiệp dư khó có thể tiếp cận để tìm kiếm các thiên thể chuyển động (tiểu hành tinh, sao lùn nâu).
- **Đối tượng thụ hưởng:** 
  1. Các nhà khoa học công dân (Citizen Scientists) tham gia săn tìm tiểu hành tinh.
  2. Học sinh, sinh viên, giáo viên vật lý thiên văn cần công cụ trực quan tương tác.
  3. Các nhà thiên văn học chuyên nghiệp cần công cụ kiểm tra nhanh (quick-look tool) phổ và ảnh cắt mà không cần tải file gigabyte.

### Slide 3: Proposed Solution (Giải pháp đề xuất)
- Giới thiệu **SPHEREx Sky Viewer**: Ứng dụng web trực quan, không cần cài đặt.
- **Tính năng đột phá:**
  - **Blink Comparison Engine:** So sánh nhấp nháy giữa các epoch quan sát theo phong cách Clyde Tombaugh (người tìm ra sao Diêm Vương).
  - **Difference Imaging:** Trừ ảnh tự động để làm lộ diện vật thể dịch chuyển.
  - **102-Band On-the-fly Spectra:** Trích xuất đường cong phổ năng lượng tức thì tại bất kỳ tọa độ nào.

### Slide 4: NASA Data (Nguồn dữ liệu mở NASA cốt lõi)
- **Bộ dữ liệu chính:**
  - **SPHEREx DR1/QR3:** Dữ liệu phổ hồng ngoại $0.75 - 5.0\ \mu\text{m}$ từ Caltech IPAC/IRSA.
  - **WISE / NEOWISE:** Dữ liệu chuỗi thời gian hồng ngoại nhiệt phục vụ đối soát chuyển động riêng.
- **Dữ liệu bổ trợ:** Pan-STARRS (dải quang học $g, r, i, z, y$), Gaia DR3 (astrometry chính xác cao), SIMBAD Name Resolver.
- **Lộ trình dữ liệu:** 
  $$\text{Tọa độ} \rightarrow \text{Truy vấn IRSA TAP} \rightarrow \text{Trích xuất Cutout MEF} \rightarrow \text{Hiệu chỉnh WCS} \rightarrow \text{Render Canvas}$$

### Slide 5: Method & Live Demo (Phương pháp & Trình diễn thực tế)
- **Demo trường hợp thực tế 1 (Sao chuyển động):** Tìm kiếm `Barnard's Star` $\rightarrow$ Bật Blink $\rightarrow$ Thấy rõ sao dịch chuyển vị trí giữa các năm.
- **Demo trường hợp thực tế 2 (Sao lùn nâu cực lạnh):** Tìm kiếm `WISE 0855-0714` $\rightarrow$ Chuyển qua lớp nền Pan-STARRS (không thấy gì vì quá lạnh) $\rightarrow$ Chuyển sang lớp SPHEREx/WISE (hiện rõ rệt nguồn nhiệt).
- **Demo trích xuất phổ:** Nhấp chuột vào tâm thiên thể $\rightarrow$ Hiện đồ thị 102 băng phổ với vạch hấp thụ của nước đá ($\text{H}_2\text{O}$ ice).

### Slide 6: Validation & Impact (Kiểm chứng & Tác động thực tế)
- **Tính xác thực (Scientific Validity):** 
  - Tọa độ và chuyển động được đối chiếu chính xác với danh mục chuẩn Gaia DR3.
  - Thuật toán kéo dãn Asinh tuân thủ tiêu chuẩn thiên văn học chuyên nghiệp.
- **Tác động (Impact):**
  - Giảm thời gian kiểm tra một mục tiêu thiên văn từ 15 phút xuống dưới 3 giây.
  - Tương thích 100% trên cả thiết bị di động, máy tính bảng và máy tính để bàn.

### Slide 7: Next Steps (Kế hoạch phát triển)
- Tích hợp mô hình AI Machine Learning để tự động phát hiện vật thể biến quang/chuyển động bất thường (Anomaly Detection).
- Kết nối trực tiếp API đẩy báo cáo phát hiện tiểu hành tinh về Minor Planet Center (MPC).
- Phát hành dưới dạng gói Open Source Web Component cho cộng đồng thiên văn quốc tế.

---

## 2. Chiến lược chinh phục 20/20 điểm Rubric

| Tiêu chí | Trọng tâm ghi điểm tối đa (5/5) |
| :--- | :--- |
| **Impact (5/5)** | Nêu con số cụ thể: Hàng triệu người yêu thiên văn có thể tham gia khám phá vũ trụ; tiết kiệm băng thông và tài nguyên tính toán nhờ cơ chế trích xuất Cutout. |
| **Creativity (5/5)** | So sánh với các công cụ hiện có (Aladin Lite hoặc DS9 quá phức tạp cho người mới); điểm độc đáo là sự kết hợp giữa **Blink Engine cổ điển** với **Dữ liệu ảnh phổ 102 băng tần hiện đại nhất của SPHEREx 2025/2026**. |
| **Validity (5/5)** | Mở trực tiếp các thiên thể benchmark (Barnard's Star, WISE 0855-0714) để chứng minh thuật toán hoạt động chính xác trên dữ liệu thật, không phải mockup. |
| **Relevance (5/5)** | Bám sát 100% dữ liệu sứ mệnh SPHEREx vừa phóng của NASA, thể hiện sự hiểu biết sâu sắc về cấu trúc file FITS/MEF và hệ thống WCS. |
| **Presentation (5/5)** | Slide thiết kế tối giản, trực quan, độ tương phản cao; diễn giả phối hợp nhịp nhàng giữa lời nói và thao tác chuột trên màn hình demo. |

---

## 3. Bộ câu hỏi dự kiến từ Ban Giám Khảo (Q&A Prep)

1. **Giám khảo hỏi:** *"Dữ liệu SPHEREx rất lớn, làm sao web của các bạn tải nhanh như vậy mà không bị đơ trình duyệt?"*
   - **Trả lời:** *"Chúng em không tải toàn bộ file FITS gốc hàng gigabyte mà áp dụng kỹ thuật **Cutout API** từ Caltech IPAC theo chuẩn trong tài liệu nghiên cứu. Hệ thống chỉ trích xuất vùng tọa độ $5' \times 5'$ cần xem và render trực tiếp lên HTML5 Canvas với độ trễ dưới 2 giây."*

2. **Giám khảo hỏi:** *"Điểm khác biệt lớn nhất giữa việc nhìn thiên thể qua Pan-STARRS và SPHEREx là gì?"*
   - **Trả lời:** *"Dựa trên Định luật dịch chuyển Wien, các ngôi sao nóng phát ra ánh sáng nhìn thấy nên thấy rõ trên Pan-STARRS. Nhưng các thiên thể lạnh như Sao lùn nâu (Brown Dwarf) hay bụi khí chứa nước đá chỉ bức xạ ở dải hồng ngoại $0.75 - 5\ \mu\text{m}$. Nhờ SPHEREx và tính năng Blink, chúng ta phát hiện được những thiên thể hoàn toàn tàng hình trong mắt người."*

3. **Giám khảo hỏi:** *"Dự án đã kiểm chứng độ chính xác như thế nào?"*
   - **Trả lời:** *"Chúng em kiểm chứng chéo với danh mục vệ tinh Gaia DR3 và các tọa độ benchmark đã công bố của Caltech/IPAC. Vị trí và vận tốc chuyển động riêng trên màn hình hoàn toàn trùng khớp với các báo cáo thiên văn học chính thống."*
