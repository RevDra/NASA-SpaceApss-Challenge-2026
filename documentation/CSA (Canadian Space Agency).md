# Đánh giá Cụm Tài nguyên Đối tác CSA (Space Agency Partner Resources)

Tài liệu này tóm tắt thực chất 4 đường link của **Cơ quan Vũ trụ Canada (CSA)** nằm ở phần dưới cùng trang *Resources* của đề bài **Planet X and SPHEREx**, giúp team `NODIXHI` quyết định nhanh nên dùng hay bỏ qua.

---

## 1. Kết luận nhanh cho Team (Đọc trong 30 giây)

* **Có phải thông tin rác không?** Không. Đây là kho dữ liệu mở hợp pháp của Canada dùng để theo dõi tiểu hành tinh gần Trái Đất (NEO), sao chổi và rác vũ trụ.
* **Có bắt buộc dùng cho đề bài này không?** **Không.** Toàn bộ yêu cầu cốt lõi (*Objectives*) và 5 test cases mẫu (*Barnard’s Star, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis*) đều sử dụng dữ liệu hồng ngoại của kính **SPHEREx** từ kho **NASA/IPAC IRSA**.
* **Lý do xuất hiện trên trang đề bài:** CSA là đối tác đồng tổ chức cuộc thi nên NASA gắn kèm tài nguyên của họ để quảng bá dữ liệu mở và hỗ trợ các đội muốn làm tính năng phụ kết hợp nhiều vệ tinh.

---

## 2. Chi tiết từng tài nguyên trong cụm 4 link của CSA

| Tên tài nguyên | Bản chất thực tế | Có code / data không? | Giá trị đối với dự án của team |
| :--- | :--- | :--- | :--- |
| **1. NEOSSat: Observing Asteroids...** (`asc-csa.gc.ca`) | Trang bài viết giới thiệu tổng quan về vệ tinh NEOSSat (phóng năm 2013). | **Không** (chỉ có văn bản PR/giới thiệu). | **Không dùng.** Chỉ để đọc hiểu khái niệm vệ tinh NEOSSat là gì. |
| **2. Canadian Astronomy Data Centre (CADC)** (`cadc-ccda.hia-iha...`) | Cổng kho dữ liệu thiên văn quốc gia của Canada (chứa ảnh từ kính JWST, Hubble, Gemini, NEOSSat...). | **Có kho data**, nhưng **không có** dữ liệu SPHEREx. | **Không dùng** cho luồng chính vì thiếu toàn bộ dữ liệu hồng ngoại 102 kênh của SPHEREx. |
| **3. NEOSSat Data Tutorial** (`github.com/asc-csa/NEOSSAT_Tutorial`) | Repo GitHub chứa 2 Jupyter Notebooks hướng dẫn dùng Python (`astropy`) mở file `.fits` của NEOSSat. | **Có code mẫu** (dành riêng cho định dạng file của NEOSSat). | **Trùng lặp và lệch chuẩn.** Cấu trúc header FITS của NEOSSat khác với SPHEREx; team đã có code chuẩn hơn trong `spherex_cutouts.md`. |
| **4. NEOSSat Dataset** (`data.asc-csa.gc.ca`) | Cổng tải bộ dữ liệu ảnh quan sát thực tế từ vệ tinh NEOSSat. | **Có file ảnh `.fits`** chụp tiểu hành tinh và rác vũ trụ. | **Không có 5 ngôi sao mẫu** của đề bài. Chỉ dùng được nếu muốn tự tạo thêm test case phụ về tiểu hành tinh bay ngang qua Trái Đất. |

---

## 3. So sánh mức độ ưu tiên các nguồn dữ liệu

Để tối ưu thời gian 24 giờ của hackathon, team nên phân tầng nguồn dữ liệu theo bảng sau:

| Tiêu chí | NASA SPHEREx (`DR1` & `QR3`) | Gaia DR3 / NASA WISE | CSA NEOSSat / CADC |
| :--- | :--- | :--- | :--- |
| **Mức độ ưu tiên** | **Số 1 — Bắt buộc** | **Số 2 — Khuyên dùng (Bonus)** | **Số 3 — Tùy chọn (Thấp)** |
| **Dải bước sóng** | Hồng ngoại gần ($0.75\text{--}5.0\,\mu\text{m}$), 102 kênh phổ | Ánh sáng khả kiến (Gaia) / Hồng ngoại trung (WISE) | Ánh sáng khả kiến (Optical) |
| **Phục vụ 5 Test Cases** | **Đầy đủ 100%** | Dùng để đối chiếu vị trí sao nền đã biết | **Không hỗ trợ** |
| **Vị trí trong đề bài** | Mục *Objectives* (Yêu cầu chính) | Mục *Potential Considerations* (Gợi ý nâng cao) | Mục *Partner Resources* (Tài nguyên đối tác) |

---

## 4. Đề xuất phương án chốt cho Team

1. **Phương án An toàn & Thực chiến (Khuyên chọn):**
   * **Bỏ qua hoàn toàn cả 4 link của CSA.**
   * Dồn 100% thời gian chạy pipeline lấy ảnh SPHEREx (`spherex_cutouts.md`), làm mượt trình phát video Flipbook, chức năng trừ ảnh ($T_2 - T_1$) và vẽ phổ 102 kênh.
2. **Phương án Mở rộng (Chỉ làm khi đã xong hết phần chính trước sáng mai):**
   * Dùng repo `NEOSSAT_Tutorial` tải thêm 1 chuỗi ảnh tiểu hành tinh gần Trái Đất làm tab demo phụ, giúp slide thuyết trình có thêm điểm nhấn *"Tích hợp dữ liệu đa cơ quan vũ trụ (NASA + CSA)"*.