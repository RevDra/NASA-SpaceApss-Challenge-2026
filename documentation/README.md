# 🛰️ NASA Space Apps Challenge Ho Chi Minh City 2026
## SPHEREx Sky Viewer — Technical & Competition Documentation

> **Dự án:** SPHEREx Sky Viewer  
> **Sự kiện:** NASA Space Apps Challenge Ho Chi Minh City 2026 (In-Person Hackathon)  
> **Địa điểm:** Galleria Center, 2Bis Nguyễn Thị Minh Khai, TP. Hồ Chí Minh  
> **Thời gian:** Thứ Bảy 14/11 – Chủ Nhật 15/11/2026  

---

## 📂 Danh mục tài liệu hệ thống

| Tài liệu | Mô tả chi tiết |
| :--- | :--- |
| 📘 **[01. Cẩm nang Hackathon & Quy chế chấm điểm](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/01_hackathon_guide.md)** | Tóm tắt toàn bộ thể lệ từ Handbook: Lịch trình, quy định pitch 7 slides, tiêu chí chấm điểm (Scoring Rubric out of 20), cơ cấu giải thưởng và checklist nộp bài lên portal NASA trước 23:59. |
| 🔬 **[02. Cơ sở khoa học & Dữ liệu thiên văn](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/02_scientific_foundation.md)** | Phân tích sâu sứ mệnh SPHEREx (quang phổ hồng ngoại 0.75–5 µm, định dạng MEF/FITS, WCS), API trích xuất Cutouts từ Caltech IPAC/IRSA, kết hợp quang học Pan-STARRS và phân tích Proper Motion từ WiseView. |
| 🏗️ **[03. Kiến trúc kỹ thuật SPHEREx Sky Viewer](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/03_system_architecture.md)** | Thiết kế kiến trúc phần mềm Frontend: Aladin Lite, Blink Engine (so sánh ảnh đa thời kỳ), Difference/Stack mode, phổ 102 băng tần, cơ chế caching và kế hoạch tích hợp đa bước sóng. |
| 🎯 **[04. Chiến lược Pitching & Demo 7 Slides](file:///Users/vinhh/Desktop/NASA/NASA-SpaceApss-Challenge-2026/documentation/04_pitch_and_demo_strategy.md)** | Kịch bản trình bày trực tiếp trước Ban Giám khảo (tối ưu theo 5 tiêu chí: Impact, Creativity, Validity, Relevance, Presentation) và cấu trúc chuẩn 7 slides theo yêu cầu bắt buộc của ban tổ chức HCMC. |

---

## 🚀 Trọng tâm kỹ thuật & Giá trị cạnh tranh của dự án

1. **Khám phá thiên thể biến quang & chuyển động (Blink Comparison):** Mô phỏng lại phương pháp tìm ra sao Diêm Vương (Pluto) để phát hiện tiểu hành tinh, sao chổi, sao lùn nâu (Brown Dwarfs).
2. **Khai thác dữ liệu NASA mới nhất:** Sử dụng SPHEREx DR1/QR3 kết hợp cùng Gaia DR3, AllWISE và Pan-STARRS.
3. **Trải nghiệm web tương tác thời gian thực:** Không cần cài đặt Python/FITS reader phức tạp, người dùng phổ thông và nhà nghiên cứu đều có thể truy cập qua trình duyệt.
