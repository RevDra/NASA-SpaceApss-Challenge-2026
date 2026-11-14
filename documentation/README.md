# 🛰️ NASA Space Apps Challenge Ho Chi Minh City 2026
## SPHEREx Sky Viewer — Master Documentation

> **Dự án:** SPHEREx Sky Viewer  
> **Sự kiện:** NASA Space Apps Challenge Ho Chi Minh City 2026 (In-Person Hackathon)  
> **Địa điểm:** Galleria Center, 2Bis Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh  
> **Thời gian:** 14/11 – 15/11/2026  

---

## 📁 Danh mục các thư mục tài liệu

Toàn bộ tài liệu kỹ thuật, cẩm nang cuộc thi và tài liệu khoa học được tổ chức phân chia theo các thư mục chuyên môn:

### 0. 🏆 [00-strategy-and-gap-analysis/](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/00-strategy-and-gap-analysis) — Nghiên cứu đối thủ & Ma trận khoảng trống
- **[competitor_and_gap_analysis.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/00-strategy-and-gap-analysis/competitor_and_gap_analysis.md):** Phân tích 4 nhóm giải pháp vô địch thế giới, mổ xẻ 6 hệ thống đầu ngành (LSST, ZTF, TrackML, WWT, MPC, Ariel), ma trận 8 khoảng trống chiến lược (8 Deep Gaps) và giải mã 5 bài test ngầm của NASA (*Barnard's Star, WISE 0855, Epsilon Indi B, RW Aurigae, R Draconis*).

---

### 1. 📘 [01-hackathon-rules/](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/01-hackathon-rules) — Thể lệ, Lịch trình & Pitching
- **[hackathon-guide.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/01-hackathon-rules/hackathon-guide.md):** Tóm tắt toàn bộ thể lệ trích xuất từ Handbook chính thức của ban tổ chức (mốc thời gian, quy chế chấm thi, Scoring Rubric thang 20, cơ cấu 8 giải thưởng và checklist nộp bài trước 23:59).
- **[pitch-and-demo-strategy.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/01-hackathon-rules/pitch-and-demo-strategy.md):** Kịch bản chuẩn 7 slide thuyết trình (yêu cầu bắt buộc của HCMC live-pitch), chiến lược ghi trọn điểm 5 tiêu chí Rubric và bộ câu hỏi phản biện Q&A từ Ban Giám khảo.

---

### 2. 🔭 [02-spherex-mission/](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/02-spherex-mission) — Dữ liệu Sứ mệnh NASA SPHEREx
- **[spherex_intro.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/02-spherex-mission/spherex_intro.md):** Giới thiệu chi tiết sứ mệnh SPHEREx (phóng 03/2025), cấu trúc định dạng file Multi-Extension FITS (MEF), hệ tọa độ Astrometric và Spectral WCS, cùng phương thức tương tác Astropy & Firefly.
- **[spherex_cutouts.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/02-spherex-mission/spherex_cutouts.md):** Hướng dẫn kỹ thuật truy vấn trích xuất ảnh cắt (Cutout API) đa thời kỳ từ kho lưu trữ Caltech IPAC/IRSA, kỹ thuật xử lý đồng thời (concurrent futures) tối ưu tốc độ.

---

### 3. 🌌 [03-panstarrs-wiseview/](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/03-panstarrs-wiseview) — Dữ liệu Quang học & Động học thời gian
- **[PANSTARRS.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/03-panstarrs-wiseview/PANSTARRS.md):** Giới thiệu khảo sát quang học Pan-STARRS (bộ lọc $g, r, i, z, y$) kết hợp công cụ WiseView hồng ngoại trung ($W1, W2$) để phát hiện chuyển động riêng (Proper Motion) của sao lùn nâu (Brown Dwarfs).
- **[Pan-STARRS-analysis.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/03-panstarrs-wiseview/Pan-STARRS-analysis.md):** Phân tích chi tiết quy trình trích xuất ảnh Pan-STARRS, nguyên lý dịch chuyển Wien giữa sao nóng và thiên thể lạnh, cơ chế xếp chồng ảnh (image stacking) cải thiện tỷ lệ tín hiệu trên nhiễu (SNR).

---

### 4. 🏗️ [04-system-architecture/](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/04-system-architecture) — Kiến trúc Kỹ thuật Hệ thống
- **[system_architecture.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/04-system-architecture/system_architecture.md):** Kiến trúc mã nguồn phần mềm SPHEREx Sky Viewer: Các module JavaScript (`app.js`, `blink-engine.js`, `spherex-api.js`, `spectrum.js`, `colormaps.js`), thuật toán trừ ảnh (Difference imaging), hàm kéo dãn tương phản Asinh/Log/Sqrt, và danh mục thiên thể benchmark.
- **[scientific_foundation.md](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/04-system-architecture/scientific_foundation.md):** Cơ sở vật lý thiên văn tổng hợp, bảng đối sánh đa bước sóng (Optical vs Mid-IR) và sự kết hợp dữ liệu mở NASA.
