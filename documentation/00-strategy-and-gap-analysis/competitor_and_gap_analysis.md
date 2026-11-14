# 🏆 NGHIÊN CỨU ĐỐI THỦ, MA TRẬN KHOẢNG TRỐNG & CHIẾN LƯỢC ĐỘT PHÁ
## Dự án: Planet X and SPHEREx (NASA Space Apps Challenge 2026)

> **Mục tiêu:** Phân tích các giải pháp đạt giải quốc tế ở bài toán "Phát hiện vật thể thiên văn chuyển động & biến quang" (Transient & Moving Object Detection) để tìm ra khoảng trống chiến lược (Strategic Gap) giúp sản phẩm vượt lên dẫn đầu.

---

# PHẦN 1: NGHIÊN CỨU CÁC ĐỘI VÔ ĐỊCH & GIẢI PHÁP TIÊU BIỂU TRÊN THẾ GIỚI

Trong các cuộc thi Hackathon và Data Science quốc tế về chủ đề săn tìm hành tinh, tiểu hành tinh và sao biến quang, các giải pháp giành chiến thắng thường thuộc 4 nhóm tiêu biểu sau:

### 1. Hệ sinh thái Zooniverse: "Backyard Worlds: Planet 9" & "WiseView" (Benchmark thực tế của NASA)
* **Bối cảnh:** Dự án Khoa học Công dân thành công nhất lịch sử săn sao lùn nâu và Hành tinh thứ 9 từ dữ liệu kính WISE.
* **Cách họ thắng:**
  * Tạo ra công cụ **WiseView** cắt ảnh bầu trời thành các đoạn băng nhấp nháy (flipbooks) siêu nhẹ trên trình duyệt.
  * Cho phép người dùng bật/tắt chế độ trượt cửa sổ thời gian (Sliding Window) và nhúng tọa độ trực tiếp vào URL để cộng đồng thảo luận.
* **Hạn chế lớn nhất (Điểm yếu cần khắc phục):**
  * **Mù quang phổ (Color/Spectral Blindness):** WiseView chỉ hiển thị ảnh ở 2 dải sóng rộng (W1, W2). Khi thấy một đốm sáng di chuyển, người dùng hoàn toàn không biết thành phần hóa học của nó là gì, phải chờ xin giờ quan sát trên kính viễn vọng mặt đất hàng tháng trời để chụp phổ.
  * **Giao diện "Cổ điển" (Legacy UI):** Quá nhiều thanh trượt kỹ thuật (linear, asinh, min/max trim) khiến người mới bắt đầu (non-experts) bị ngợp trong 5 phút đầu tiên.

### 2. Quán quân các giải Kaggle Astrophysics (PLAsTiCC Astronomical Classification & Catalina Sky Survey)
* **Bối cảnh:** Các cuộc thi phân loại hàng triệu vật thể biến thiên trên bầu trời (Supernovae, Variable Stars, Asteroids, AGN) của LSST/Vera Rubin Observatory.
* **Cách họ thắng:**
  * Không chỉ nhìn ảnh bằng mắt mà trích xuất **Light Curve (Đường cong ánh sáng theo thời gian)** và **Spectral Energy Distribution (Phân bố năng lượng phổ)** để phân biệt nhanh sao biến quang với vật thể di chuyển.
  * Áp dụng kỹ thuật **Difference Imaging (Phép trừ ảnh có căn chỉnh tọa độ)** kết hợp tính toán tỷ lệ tín hiệu trên nhiễu (**SNR**).
* **Hạn chế lớn nhất (Điểm yếu cần khắc phục):**
  * **Hộp đen thiếu trực quan (Black-box Pipeline):** Các đội thi thiên về thuật toán thường xuất ra bảng số liệu CSV hoặc biểu đồ tĩnh, thiếu hoàn toàn giao diện tương tác trực tiếp trên bản đồ bầu trời (Interactive Sky Canvas) cho con người kiểm chứng bằng mắt.

### 3. Quán quân NASA Space Apps & ESA App Camp (Nhóm đề tài NEO / Space Debris / Exoplanet Explorer)
* **Bối cảnh:** Các đội từng đạt giải *Best Use of Data* và *Best Use of Science* các năm trước với bài toán theo dõi tiểu hành tinh và sao biến quang.
* **Cách họ thắng:**
  * Kết hợp **3D/2D Visualization mượt mà** với câu chuyện hướng tới người dùng phổ thông (Gamification, cấp huy hiệu, giải thích thuật ngữ thiên văn bằng ngôn ngữ đời thường).
  * Tích hợp **Cross-matching (Đối chiếu chéo)**: Vẽ đè dữ liệu từ nhiều vệ tinh (như Gaia, TESS, WISE) lên cùng một khung hình để loại trừ các ngôi sao đã biết.
* **Hạn chế lớn nhất (Điểm yếu cần khắc phục):**
  * **Sai số vật lý ở phần xử lý ảnh thô (Raw FITS):** 90% các đội Hackathon chỉ lấy ảnh preview JPEG/PNG hoặc đọc mảng `IMAGE` thô mà bỏ qua việc căn chỉnh góc xoay hệ tọa độ (`WCS Reprojection`), không trừ nhiễu nền và không đọc bảng cờ lỗi (`FLAGS`), dẫn đến việc "phát hiện nhầm" tia vũ trụ (cosmic rays) hoặc nhiễu cảm biến thành hành tinh mới.

---

# PHẦN 2: 5 "TỬ HUYỆT" MÀ CÁC ĐỘI VÔ ĐỊCH HACKATHON THƯỜNG MẮC PHẢI

Dù đạt giải cao, hầu hết các sản phẩm bước ra từ Hackathon 48 giờ đều có 5 điểm yếu cố hữu dưới đây:

| STT | Điểm yếu của các đội đi trước | Hậu quả thực tế khi Giám khảo chấm | Cách chúng ta lấp lỗ hổng (Our Edge) |
| :--- | :--- | :--- | :--- |
| **1** | **Báo động giả do nhiễu (False Positives từ Cosmic Rays & Bad Pixels)** | Mắt người hoặc thuật toán trừ ảnh thấy một đốm sáng lóe lên ở 1 frame rồi tắt, tưởng là sao mới nhưng thực chất là tia vũ trụ bắn vào cảm biến. | Đọc trực tiếp extension `FLAGS` (HDU 2) và `VARIANCE` (HDU 3) trong file FITS của SPHEREx để gắn nhãn cảnh báo tự động: *"Nhiễu cảm biến / Tia vũ trụ"* vs *"Tín hiệu sạch (High SNR)"*. |
| **2** | **Hiện tượng "Sao nhảy múa" do lệch góc xoay vệ tinh (WCS Misalignment)** | Các lần chụp cách nhau 6 tháng có góc xoay camera khác nhau. Khi chạy Flipbook, toàn bộ bầu trời xoay chuyển hỗn loạn, không thể nhìn ra ngôi sao nào đang thực sự di chuyển. | Áp dụng **WCS Reprojection (căn chỉnh tọa độ chuẩn từng sub-pixel)** về một khung hình gốc trước khi render Flipbook và trước khi làm phép trừ ảnh (`Epoch 2 - Epoch 1`). |
| **3** | **Bẫy bộ lọc biến thiên (LVF Wavelength Bias của riêng SPHEREx)** | Mỗi vị trí trên cảm biến SPHEREx có một bước sóng khác nhau. Ghép bừa các tấm ảnh khác bước sóng thành video sẽ làm một ngôi sao đứng yên tự nhiên "sáng lên tối đi" giả tạo. | Chuẩn hóa khung hình theo cụm dải sóng (`D1`–`D6`), trừ nền bụi hoàng đạo (`IMAGE - ZODI` ở HDU 4), và hiển thị rõ bước sóng trung tâm $\lambda_{\text{center}}$ trên từng frame. |
| **4** | **Đứt gãy giữa "Nhìn thấy" và "Hiểu bản chất" (Visual-to-Science Gap)** | Người dùng thấy đốm sáng di chuyển trên màn hình nhưng không có công cụ nào ngay tại đó để kiểm tra xem nó là tiểu hành tinh đá, sao chổi băng hay sao lùn nâu. | Thiết kế **1-Click Spectral Inspector**: Click trực tiếp vào đốm sáng đang bay để trích xuất phổ từ `WCS-WAVE` (0.75–5.0 µm), tự động đánh dấu vạch hấp thụ của Nước ($H_2O$), Metan ($CH_4$), $CO_2$. |
| **5** | **Độ trễ kinh hoàng khi tải dữ liệu thật (Live API Latency)** | Nhiều đội gọi trực tiếp API cắt hàng trăm file FITS lúc đang thuyết trình, khiến web quay vòng tròn 2–3 phút và sập ngay trên sân khấu. | Kiến trúc **Hybrid Caching**: Pre-cache sẵn 100% dữ liệu đã xử lý của 5 mục tiêu mẫu (*Barnard's Star, WISE 0855, Epsilon Indi B, RW Aurigae, R Draconis*) để load trong `< 100ms`, đồng thời dùng tải đa luồng + gom cụm thời gian (Epoch Binning) cho tọa độ bất kỳ. |

---

# PHẦN 3: KIẾN TRÚC GIẢI PHÁP "VƯỢT CHUẨN" CHO ĐỘI CỦA CHÚNG TA

Định vị sản phẩm là một **"End-to-End Citizen Science Discovery Workstation" (Trạm Săn tìm & Kiểm chứng Vật thể Vũ trụ Toàn diện)** gồm 3 phân lớp khép kín:

### Lớp 1: Xử lý Tín hiệu Vật lý Chuẩn NASA (Astrophysics Engine - Backend)
1. **Zodi-Clean Pipeline:** Tự động lấy `IMAGE (HDU 1) - ZODI (HDU 4)` để loại bỏ hoàn toàn ánh sáng tán xạ từ bụi Hệ Mặt Trời, giúp vật thể mờ như sao lùn nâu nổi bật lên trên nền trời tối sâu.
2. **WCS-Aligned Difference Imaging:** Căn chỉnh toàn bộ các lần chụp từ bộ dữ liệu thống nhất **DR1 (2025) + QR3 (2026)** về chung một lưới pixel chuẩn, sau đó tạo ảnh hiệu (`Difference Frame = Epoch_New - Epoch_Old`). Sao đứng yên sẽ triệt tiêu về màu đen; vật thể di chuyển sẽ hiện thành cặp điểm Sáng - Tối (Dipole footprint) cực dễ nhận diện bằng mắt thường.
3. **False-Color RGB Band Stacking:** Gộp tín hiệu 6 mảng cảm biến của SPHEREx thành 3 kênh màu (Ngắn `0.75–1.6 µm` $\rightarrow$ Xanh lam; Trung `1.6–3.8 µm` $\rightarrow$ Xanh lục; Dài `3.8–5.0 µm` $\rightarrow$ Đỏ). Vật thể lạnh như *WISE 0855* hoặc Hành tinh X sẽ lập tức rực lên màu đỏ cam giữa rừng sao màu xanh trắng.

### Lớp 2: Giao diện Trực quan & Đối chiếu Chéo (Interactive Sky Canvas - Frontend)
1. **Multi-Mode Blink Comparator:** Chuyển đổi mượt mà bằng 1 phím bấm (hoặc phím `Space`) giữa:
   * *Chế độ Flipbook:* Chạy video qua các mốc thời gian.
   * *Chế độ Dipole Difference:* Nhìn ảnh trừ nền để bắt chuyển động tức thì.
   * *Chế độ RGB Composite:* Nhìn màu sắc nhiệt độ của các ngôi sao.
2. **Gaia DR3 Smart Overlay (Lớp lọc sao đã biết):** Phủ danh mục sao từ kính **Gaia DR3** (kèm vector mũi tên chỉ hướng chuyển động riêng `pmra, pmdec`). Nếu một đốm sáng đang di chuyển trùng khớp với mũi tên của Gaia $\rightarrow$ *Vật thể đã biết*. Nếu nó di chuyển mà không có vòng tròn Gaia nào $\rightarrow$ *Ứng viên phát hiện mới (New Candidate)!*

### Lớp 3: Kiểm chứng Quang phổ & Cộng đồng (Verification & Citizen Science)
1. **On-the-fly 102-Band Spectral & Light-Curve Inspector:**
   * Khi click vào vật thể: Hệ thống tự động dò tâm sáng (Centroid tracking) qua các frame để vẽ **Đường cong phổ (0.75 – 5.0 µm)** kèm thanh sai số từ `VARIANCE`.
   * Hiển thị các dải màu nền chỉ dẫn các phân tử hóa học ($H_2O$ băng ở `3.0 µm`, $CH_4$ ở `3.3 µm`, $CO_2$ ở `4.26 µm`) để người không chuyên cũng đọc được: *"Vật thể này có dấu hiệu của khí Metan — khả năng cao là Sao lùn nâu!"*.
   * Đối với sao biến quang (*RW Aurigae*, *R Draconis*), chuyển sang tab **Light Curve** để xem biểu đồ độ sáng nhấp nháy theo ngày tháng (`MJD`).
2. **Artifact Guard (`FLAGS` Validator):** Hiển thị huy hiệu kiểm định tự động (Verified Clean Pixel vs. Cosmic Ray / Saturation Warning) dựa trên bitmap của HDU 2.
3. **Instant Deep-Link & Discovery Card:** Mọi thao tác (`?ra=...&dec=...&fov=...&mode=diff`) được đồng bộ trực tiếp lên URL để nhúng hoặc chia sẻ, kèm nút xuất báo cáo nhanh chuẩn định dạng cho cộng đồng Backyard Worlds.

---

# PHẦN 4: KỊCH BẢN PITCHING ĂN ĐIỂM TUYỆT ĐỐI (THE WINNING STORYLINE)

Cấu trúc 4 bước ngắn gọn (2–3 phút) đánh trúng tâm lý Ban giám khảo:

1. **0:00 – 0:25 | Nỗi đau thực tế (The Hook):**
   * *"SPHEREx mang về ảnh của hơn 1 tỷ vật thể ở 102 dải màu hồng ngoại. Nhưng nếu bạn mở ảnh thô lên, bụi hoàng đạo làm mờ các vật thể lạnh, góc chụp xoay lệch làm bầu trời rung lắc, và các tia vũ trụ tạo ra hàng triệu báo động giả. Mắt thường không thể tìm ra Hành tinh X nếu chỉ dùng một trình xem ảnh thông thường."*
2. **0:25 – 1:15 | Demo Trực diện trên Mục tiêu Chuyển động (WISE 0855 & Barnard's Star):**
   * Bấm vào preset **WISE 0855**. Bật nút **Zodi-Clean + WCS Align** $\rightarrow$ Bầu trời đứng im, nền tối sâu.
   * Bật chế độ **Difference View** và **Gaia DR3 Overlay** $\rightarrow$ Chỉ ra ngay đốm sáng đang dịch chuyển nhanh mà không cần căng mắt tìm.
3. **1:15 – 2:00 | Vũ khí Bí mật 102 Dải sóng & Kiểm tra Cờ nhiễu (Spectral & Variable Star Demo):**
   * Click thẳng vào đốm sáng **WISE 0855** (hoặc chuyển sang sao biến quang **R Draconis**) $\rightarrow$ Cửa sổ bên phải lập tức vẽ ra phổ hồng ngoại `0.75 – 5.0 µm` từ bảng `WCS-WAVE`, chỉ rõ vùng hấp thụ hóa học và huy hiệu xanh **"FLAGS Checked: 0 Contamination"** (Không phải nhiễu tia vũ trụ).
4. **2:00 – 2:30 | Tầm nhìn Khoa học Công dân (Impact & Scalability):**
   * Copy đường link URL chứa sẵn tọa độ, chứng minh hệ thống kết nối trực tiếp với kho dữ liệu `DR1 + QR3` của NASA IRSA và tự động cập nhật mỗi tuần khi có dữ liệu mới, biến bất kỳ người dùng internet nào thành một nhà săn hành tinh chuyên nghiệp.

---

# PHẦN 5: MỔ XẺ 6 HỆ THỐNG & GIẢI PHÁP ĐẦU NGÀNH (BEYOND NASA SPACE APPS)

### 1. Hệ thống Alert Brokers của Kính Vera C. Rubin / LSST (ALeRCE, Fink, Lasair)
* **Bản chất bài toán:** Mỗi đêm LSST tạo ra 10 triệu cảnh báo (alerts) về các vật thể di chuyển hoặc thay đổi độ sáng. Các hệ thống như **ALeRCE** (Chile) và **Fink** (Châu Âu) là những nhà vô địch thực tế trong việc phân loại tự động và hiển thị dữ liệu này cho các nhà khoa học.
* **Cách họ làm:**
  * Luôn hiển thị **Bộ ba ảnh chuẩn (The Science Triad)** cạnh nhau: `Template (Ảnh gốc cũ)` — `Science (Ảnh mới chụp)` — `Difference (Ảnh hiệu số)`.
  * Kết hợp dữ liệu ảnh với xác suất phân loại: Vật thể Hệ Mặt Trời (Solar System Object), Sao biến quang (Variable Star), hay Siêu tân tinh (Transient).
* **Điểm mù (Gap) khi áp vào SPHEREx:**
  * Các Broker này thiết kế cho **Chuyên gia (PhDs)** với hàng chục bảng số liệu phức tạp, hoàn toàn không có cơ chế giải thích trực quan cho công chúng (Citizen Scientists).
  * Chúng chỉ làm việc với 5–6 bộ lọc màu cố định (`u, g, r, i, z, y`), chưa có giao diện nào xử lý được **bộ lọc biến thiên tuyến tính (LVF 102 kênh liên tục)** nơi mỗi pixel trên ảnh lại mang một bước sóng khác nhau như SPHEREx.

### 2. Zwicky Transient Facility (ZTF) Fritz Marshal & "ZTF Bogus/Real" Winners
* **Bản chất bài toán:** Khi lấy hai tấm ảnh bầu trời trừ đi nhau, hơn 90% các đốm sáng hiện ra là **rác (Bogus)**: sai số căn chỉnh tâm sao, bóng ma quang học (optical ghosts), vết xước vệ tinh (satellite streaks), hoặc pixel bão hòa.
* **Cách các đội vô địch xử lý:**
  * Họ không bao giờ tin vào phép trừ ảnh đơn thuần (`Image2 - Image1`). Họ đánh giá **hình dạng của đốm sáng hiệu (Dipole / PSF morphology)** và đối chiếu với mặt nạ trạng thái cảm biến (Bitmask flags).
* **Điểm mù (Gap) ở các cuộc thi Hackathon:**
  * Gần như 100% các đội thi Hackathon khi làm tính năng "Difference Image" đều chỉ lấy hai mảng 2D trừ trực tiếp cho nhau. Vì kích thước điểm nhòe quang học (**PSF - Point Spread Function**) của SPHEREx thay đổi từ `D1 (0.75 µm)` đến `D6 (5.0 µm)` và thay đổi theo vị trí trên cảm biến, phép trừ thô sẽ để lại những "vòng tròn hình bánh rán" (residuals) quanh mọi ngôi sao đứng yên, làm người dùng tưởng nhầm toàn bộ bầu trời đang biến quang!

### 3. Giải đấu "TrackML" & "ESA Kelvins Asteroid Hunting" (Chuyển động phi tuyến tính & Thị sai)
* **Bản chất bài toán:** Nối các chấm sáng qua nhiều mốc thời gian khác nhau (Track Linking) để tìm ra quỹ đạo của vật thể.
* **Khám phá quan trọng từ các đội vô địch:**
  * Các ngôi sao gần (như *Barnard's Star*) hoặc sao lùn nâu (*WISE 0855*) **không đi theo một đường thẳng đơn giản** trên bầu trời! Vì Trái Đất và kính SPHEREx quay quanh Mặt Trời mỗi 6 tháng, vị trí biểu kiến của vật thể là tổng hợp của:
    $$\text{Vị trí biểu kiến} = \text{Chuyển động riêng (Proper Motion)} + \text{Vòng lặp Thị sai (Parallax Ellipse)}$$
  * Trong khi đó, một tiểu hành tinh hoặc **Hành tinh X (Planet X)** ở rìa Hệ Mặt Trời sẽ có chuyển động thị sai cực lớn nhưng chuyển động riêng rất chậm.
* **Điểm mù (Gap) của các công cụ hiện tại (kể cả WiseView):**
  * Chỉ phát video nhấp nháy để mắt người tự đoán hướng đi, không hề vẽ **Quỹ đạo dự phóng (Trajectory Vector / Parallax Track)** nối tâm điểm sáng qua các epoch để giúp phân biệt đâu là sao lùn nâu đang bay thẳng, đâu là vật thể Hệ Mặt Trời đang lắc lư theo chu kỳ 6 tháng của Trái Đất.

### 4. Dự án "astrometry.net" & "WorldWide Telescope (WWT)" (Giải thưởng IEEE VIS / SciVis)
* **Bản chất bài toán:** Đặt một bức ảnh cắt nhỏ (Cutout) vào ngữ cảnh không gian rộng lớn và đa bước sóng.
* **Cách họ thắng giải Visualization:**
  * Cho phép thực hiện **Cross-Wavelength Blinking / Alpha Blending**: Kéo thanh trượt làm mờ dần ảnh của kính viễn vọng này để lộ ra ảnh của kính viễn vọng khác ở ngay bên dưới (ví dụ: trượt từ ảnh quang học sang ảnh hồng ngoại).
* **Điểm mù (Gap):**
  * Các đội thi thường nhúng bản đồ ngoài vào một khung riêng biệt, không đồng bộ tâm ngắm (Crosshair sync) và góc xoay với khung Flipbook SPHEREx, khiến người dùng phải tự dò bằng mắt giữa hai cửa sổ.

### 5. "Catalina Sky Survey" & "Minor Planet Center (MPC)" Citizen Trackers
* **Bản chất bài toán:** Để phát hiện một tiểu hành tinh hoặc sao chổi mới, con người thường xem một bộ 4 tấm ảnh liên tiếp (Blink Quartet).
* **Tử huyệt về mặt Thị giác Nhân học (Human Perception Limitation):**
  * Nghiên cứu thị giác trong các cuộc thi UI/UX chỉ ra rằng: Mắt người rất giỏi phát hiện một chấm sáng nhảy vị trí nếu các khung hình cách đều nhau, nhưng **cực kỳ tệ trong việc nhận biết sự thay đổi độ sáng từ từ (Variable Stars)** hoặc khi thời gian giữa các bức ảnh bị ngắt quãng không đều (ví dụ: 5 tấm chụp trong tháng 5/2025, rồi nhảy vọt sang 3 tấm chụp tháng 11/2025).
* **Điểm mù (Gap):**
  * Mọi trình phát Flipbook đều chạy từng frame với tốc độ cố định (ví dụ `5 FPS`), bất kể hai frame đó cách nhau **10 phút** hay cách nhau **6 tháng**! Điều này làm biến dạng hoàn toàn cảm nhận về vận tốc bay của vật thể và chu kỳ biến quang của ngôi sao.

### 6. Cuộc thi "Ariel Data Challenge (NeurIPS)" & Quang phổ học Ngoại hành tinh
* **Bản chất bài toán:** Trích xuất phổ hồng ngoại từ dữ liệu nhiễu cao mà không làm méo vạch hấp thụ hóa học.
* **Điểm mù (Gap) khi xử lý SPHEREx:**
  * Trong file FITS của SPHEREx có extension thứ 5 là **`EPSF` (Effective Point Spread Function)** chia cảm biến thành lưới $21 \times 21$ (441 vùng) và **`VARIANCE`** (phương sai nhiễu). Các giải pháp nghiệp dư chỉ lấy giá trị của **1 pixel duy nhất** tại tâm ngôi sao để vẽ biểu đồ phổ. Nếu ngôi sao nằm lệch nửa pixel (sub-pixel offset) giữa hai lần chụp, năng lượng ánh sáng bị chia sang pixel bên cạnh $\rightarrow$ đường phổ bị răng cưa dữ dội dù ngôi sao không hề đổi độ sáng!

---

# PHẦN 6: MA TRẬN 8 KHOẢNG TRỐNG CHIẾN LƯỢC (THE 8 DEEP GAPS)

Tổng hợp từ các hệ thống trên và đối chiếu trực tiếp với cấu trúc dữ liệu thật của SPHEREx (`IMAGE`, `FLAGS`, `VARIANCE`, `ZODI`, `EPSF`, `WCS-WAVE`), đây là **8 khoảng trống (Gaps)** mà chưa công cụ Citizen Science nào giải quyết trọn vẹn:

| Mã Gap | Tên khoảng trống (The Gap) | Hiện trạng của các giải pháp thông thường | Giải pháp Đột phá (Deep Solution) của chúng ta |
| :--- | :--- | :--- | :--- |
| **GAP 1** | **Biến dạng thời gian trong Flipbook**<br>*(Non-Uniform Time-Step Illusion)* | Phát các frame liên tiếp với tốc độ đều nhau (`1, 2, 3...`), làm người xem không biết hai ảnh chụp cách nhau 1 giờ hay 6 tháng. | **Time-Aware Epoch Grouping & Timeline Bar:** Gom cụm các lần chụp trong cùng một đợt quét (Observing Pass) thành 1 "Super-Epoch" có SNR cao, đồng thời hiển thị thanh thời gian thực (`MJD / Tháng-Năm`) có khoảng cách tỷ lệ thuận với thời gian thực tế giữa các lần chụp. |
| **GAP 2** | **Giả ảnh biến quang do bộ lọc LVF**<br>*(Wavelength-Induced Fake Variability)* | Ghép các tấm ảnh chụp ở bước sóng `0.8 µm` và `4.5 µm` vào chung một video. Vật thể lạnh sẽ "nhấp nháy" điên cuồng vì nó sáng ở `4.5 µm` nhưng tối ở `0.8 µm`. | **Iso-Wavelength / Detector-Locked Blinking:** Khóa chế độ Blink theo từng dải cảm biến đồng nhất (`D1`–`D6`) hoặc chuẩn hóa thông lượng (Flux Normalization) theo đường cong phổ trung bình của vật thể trước khi phát video. |
| **GAP 3** | **Nhiễu răng cưa khi trích xuất phổ 1-Pixel**<br>*(Sub-Pixel Aperture Loss)* | Chỉ đọc đúng 1 pixel `(int(x), int(y))` khi vẽ phổ 102 kênh. Khi tâm sao rơi vào ranh giới giữa 4 pixel, cường độ sáng bị tụt giảm giả tạo 30–50%. | **Aperture / PSF-Weighted Spectrophotometry:** Tính tổng có trọng số trong ô cửa sổ $3 \times 3$ pixel quanh tâm sáng (đã trừ `ZODI`) và chia chuẩn hóa theo `VARIANCE`, giúp đường phổ 102 kênh mượt và chính xác chuẩn vật lý. |
| **GAP 4** | **Rác quang học khi trừ ảnh khác độ phân giải**<br>*(PSF Mismatch in Difference Imaging)* | Trừ trực tiếp hai bức ảnh dẫn đến viền trắng-đen (ringing artifacts) quanh tất cả các ngôi sao sáng do lệch sub-pixel và lệch độ nhòe `PSF_FWHM`. | **Normalized Zodi-Subtracted Dipole Map:** Căn chỉnh `WCS` cấp độ sub-pixel, trừ nền `ZODI`, làm mượt nhẹ theo `PSF_FWHM` (lấy từ FITS header) rồi mới chia cho $\sqrt{\text{VARIANCE}_1 + \text{VARIANCE}_2}$ để tạo ra **Bản đồ Ý nghĩa Thống kê (SNR Difference Map — đơn vị $\sigma$)**. |
| **GAP 5** | **Mất dấu vật thể bay nhanh khi lấy phổ**<br>*(Moving-Target Spectral Drift)* | Dùng 1 tọa độ `(RA, Dec)` cố định cho cả năm 2025 và 2026 để lấy phổ. Với *Barnard's Star* (di chuyển `10.3 arcsec/năm`) hay *WISE 0855* (`8.1 arcsec/năm`), sau 1 năm nó đã bay lệch khỏi tâm $\rightarrow$ đo phổ vào khoảng không! | **Dynamic Centroid Tracking (Bám tâm động):** Tự động tìm cực đại cục bộ (local peak centroid) trong bán kính nhỏ quanh tọa độ ở từng epoch trước khi trích xuất bước sóng từ `WCS-WAVE`, đảm bảo luôn "bắt dính" vật thể đang bay. |
| **GAP 6** | **Bẫy nhiễu phần cứng và tia vũ trụ**<br>*(Hardware & Cosmic Ray Blindness)* | Người dùng thấy một chấm sáng lạ xuất hiện trong 1 frame, lập tức báo cáo là "Hành tinh mới" mà không biết đó là tia vũ trụ hoặc pixel lỗi. | **Bitmask Flag Decoder (Giải mã trực tiếp 32-bit `FLAGS`):** Đọc trực tiếp từ khóa `MSKN*` và `MSKD*` trong HDU 2 để dịch mã nhị phân thành cảnh báo ngôn ngữ tự nhiên (ví dụ: Bit `CR` = Cosmic Ray, `SAT` = Saturated, `BAD` = Bad Pixel) ngay khi di chuột vào điểm sáng. |
| **GAP 7** | **Nhầm lẫn giữa Chuyển động riêng, Thị sai và Sao đôi**<br>*(Astrometric Ambiguity)* | Nhìn đốm sáng nhúc nhích nhưng không phân biệt được đó là sao gần (như *Barnard*), hệ sao đôi (*Epsilon Indi B*), hay tiểu hành tinh/Hành tinh X. | **Motion Vector & Gaia Proper-Motion Predictor:** Sử dụng dữ liệu `pmra, pmdec, parallax` từ **Gaia DR3** để vẽ sẵn "vệt đường đi dự kiến" của các sao đã biết từ 2025 đến 2026. Mọi chuyển động không nằm trên vệt dự kiến này sẽ nổi bật ngay lập tức. |
| **GAP 8** | **Rào cản nhận thức với 102 dải hồng ngoại**<br>*(Cognitive Overload of 102 Bands)* | Đổ ra một mảng 102 con số hoặc bắt người dùng chọn từng kênh sóng từ 1 đến 102 mà họ không hiểu ý nghĩa vật lý của từng con số. | **Semantic Molecular Band Highlighting & False-Color Presets:** Cung cấp các bộ lọc ngữ nghĩa có sẵn: *"Chế độ Săn Sao Lùn Nâu (Tương phản Metan 3.3 µm vs 4.5 µm)"*, *"Chế độ Tìm Băng/Sao Chổi (Đỉnh hấp thụ Nước 3.0 µm)"*, biến 102 dải sóng thành các nút bấm có mục đích rõ ràng. |

---

# PHẦN 7: ĐỐI CHIẾU 5 MỤC TIÊU BẮT BUỘC CỦA ĐỀ BÀI VỚI CÁC GAP TRÊN

Đề bài của NASA chỉ đích danh **5 vật thể cụ thể (Barnard’s Star, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis)**. Đây chính là **5 bài kiểm tra kỹ thuật (Unit Tests ngầm)** tương ứng với các Gap:

1. **Barnard’s Star (Sao có chuyển động riêng lớn nhất: ~10.3 arcsec/năm):**
   * *Mục đích của giám khảo:* Kiểm tra **GAP 5 (Dynamic Centroid Tracking)** và **GAP 7 (Gaia DR3 Proper Motion)**. Nó rất sáng và có trong Gaia DR3 — công cụ phải chỉ ra được đây là ngôi sao đã biết đang di chuyển đúng theo mũi tên dự báo của Gaia.
2. **WISE 0855 (Sao lùn nâu lạnh nhất ~250K, di chuyển cực nhanh ~8.1 arcsec/năm):**
   * *Mục đích của giám khảo:* Kiểm tra **GAP 2 (Bộ lọc bước sóng)**, **GAP 4 (Trừ nền ZODI)** và **GAP 8 (Phổ hóa học)**. Ở dải sóng ngắn (`D1, D2`: 0.75–1.6 µm), *WISE 0855* **hoàn toàn vô hình (tối đen)** vì nó quá lạnh! Nó chỉ sáng rực lên ở dải sóng dài (`D5, D6`: 3.8–5.0 µm). Nếu đội nào chỉ hiển thị mặc định dải `D1` hoặc `D2` như trong file notebook mẫu, họ sẽ **không nhìn thấy WISE 0855 đâu cả!**
3. **Epsilon Indi B (Cặp sao lùn nâu T1 + T6 quay quanh nhau, cách sao mẹ khá xa):**
   * *Mục đích của giám khảo:* Kiểm tra **GAP 3 (Độ phân giải phổ & Tách nguồn sáng gần nhau)** và khả năng nhận diện chữ ký hấp thụ của khí **Metan ($CH_4$)** và **Hơi nước ($H_2O$)** đặc trưng của sao lùn nâu loại T trong phổ 102 kênh.
4. **RW Aurigae (Sao trẻ T Tauri biến quang hỗn loạn do đĩa bụi che khuất):**
   * *Mục đích của giám khảo:* Kiểm tra **GAP 1 (Timeline không đều)** và khả năng vẽ **Light Curve (Đường cong ánh sáng theo thời gian)** kết hợp quan sát sự thay đổi độ sáng ở cả bước sóng ngắn lẫn bước sóng dài (bụi ấm phát bức xạ hồng ngoại).
5. **R Draconis (Sao biến quang chu kỳ dài loại Mira — phồng to và co lại):**
   * *Mục đích của giám khảo:* Kiểm tra khả năng phân biệt **Vật thể đứng yên nhưng biến thiên độ sáng cực mạnh** (trên bản đồ Difference Image, tâm của nó không nhảy sang bên cạnh tạo hình lưỡng cực trắng-đen như *Barnard's Star*, mà tạo thành một đốm tròn đồng tâm thuần trắng hoặc thuần đen).

---

# PHẦN 8: TỔNG HỢP 4 TRỤ CỘT GIẢI PHÁP (THE 4 CORE PILLARS)

Toàn bộ 8 khoảng trống kỹ thuật ở Phần 6 được quy hoạch thành **4 Trụ cột kiến trúc** tương ứng với 4 module cốt lõi của hệ thống:

| Trụ cột | Tên Trụ cột & Mục tiêu | Các Gap giải quyết | Công nghệ & Thuật toán lõi |
| :--- | :--- | :--- | :--- |
| **Trụ cột 1** | **Làm sạch Tín hiệu & Đồng bộ Không – Thời gian**<br>*(Signal & Astrometric Alignment)* | GAP 1, GAP 2, GAP 4 | - Trừ nền bụi hoàng đạo: `IMAGE (HDU 1) - ZODI (HDU 4)`.<br>- Căn chỉnh góc xoay vệ tinh sub-pixel bằng `astropy` / `reproject`.<br>- Khóa dải cảm biến (`D1`–`D6`), tự động chọn `D6` cho vật thể siêu lạnh (*WISE 0855*), tạo ảnh hiệu số (`Epoch_New - Epoch_Old`) và ghép màu giả lập RGB. |
| **Trụ cột 2** | **Lọc Nhiễu Phần cứng & Định danh Sao Đã biết**<br>*(Real-Bogus & Catalog Cross-Match)* | GAP 6, GAP 7 | - Giải mã bitmask 32-bit từ `FLAGS` (HDU 2, từ khóa `MSKN*`/`MSKD*`) và tính tỷ lệ tín hiệu trên nhiễu `SNR` từ `VARIANCE` (HDU 3) để loại bỏ tia vũ trụ (cosmic rays) và pixel lỗi.<br>- Phủ danh mục **Gaia DR3** kèm mũi tên dự báo chuyển động riêng (`pmra, pmdec`). |
| **Trụ cột 3** | **Trích xuất Quang phổ Động 102 Kênh & Light Curve**<br>*(Dynamic Spectrophotometry)* | GAP 3, GAP 5, GAP 8 | - Bám tâm sáng động (**Dynamic Centroid**) qua từng epoch để không bị trượt khỏi vật thể bay nhanh.<br>- Đo sáng khẩu độ $3 \times 3$ pixel, tra bước sóng từ `WCS-WAVE` (HDU 6) vẽ phổ `0.75–5.0 µm` đánh dấu vạch hấp thụ $H_2O, CH_4, CO_2$, hoặc vẽ **Light Curve** cho sao biến quang. |
| **Trụ cột 4** | **Vòng lặp Khoa học Công dân & Tốc độ Tức thì**<br>*(Citizen Science Loop & Zero-Latency UX)* | Bottleneck API & UX | - **Hybrid Cache:** Pre-cache sẵn 100% dữ liệu 5 mục tiêu mẫu để phản hồi `< 100ms`, kết hợp tải đa luồng (`ThreadPoolExecutor`) cho tọa độ bất kỳ.<br>- **Deep-Link URL** (`?ra=...&dec=...&fov=...&band=...`) & xuất thẻ báo cáo ứng viên mới. |

---

# PHẦN 9: ĐẶC TẢ TÀI NGUYÊN DỮ LIỆU NASA IRSA & THÔNG SỐ KỸ THUẬT

### 1. Nguồn dữ liệu & Giao thức truy vấn (Từ `spherex_intro` & `spherex_cutouts`)
* **Collections chính thức (Đã chuẩn hóa đồng bộ thời gian):**
  * `spherex_dr1` & `spherex_dr1_deep`: Dữ liệu Data Release 1 (tái xử lý từ dữ liệu 2025).
  * `spherex_qr3` & `spherex_qr3_deep`: Dữ liệu Quick Release 3 (2026) — dùng ghép cặp trực tiếp với `DR1` để tạo chuỗi thời gian (bỏ qua `QR1` và `QR2` đã lỗi thời).
* **Câu lệnh SQL TAP cắt ảnh trực tiếp trên server NASA (Không tải full-frame):**
  ```sql
  SELECT
      'https://irsa.ipac.caltech.edu/' || a.uri || '?center={ra},{dec}d&size={fov_deg}' AS uri,
      p.time_bounds_lower
  FROM spherex.artifact a
  JOIN spherex.plane p ON a.planeid = p.planeid
  WHERE 1 = CONTAINS(POINT('ICRS', {ra}, {dec}), p.poly)
    AND p.energy_bandpassname = '{bandpass}'
  ORDER BY p.time_bounds_lower
  ```

### 2. Định dạng Tệp Cắt MEF (Multi-Extension FITS) gồm 6 HDU chuẩn:
* **HDU 0 (Primary):** Metadata quan sát (`OBSID`, `DATE-OBS`, góc xoay vệ tinh).
* **HDU 1 (`IMAGE`):** Ma trận cường độ sáng bức xạ thực (Flux - đơn vị `MJy/sr`).
* **HDU 2 (`FLAGS`):** Bitmask 32-bit ghi nhận trạng thái pixel (tia vũ trụ, bão hòa, vùng viền).
* **HDU 3 (`VARIANCE`):** Phương sai độ không đảm bảo đo (Uncertainty / Noise estimate).
* **HDU 4 (`ZODI`):** Mô hình nền tán xạ bụi hoàng đạo Hệ Mặt Trời (Zodiacal Light Model).
* **HDU 5 (`EPSF`):** Mô hình hàm lan truyền điểm hiệu dụng (Effective Point Spread Function) trên lưới $21 \times 21$.
* **HDU 6 (`WCS-WAVE`):** Bảng chuyển đổi tọa độ pixel sang bước sóng trung tâm thực ($0.75 - 5.0\ \mu\text{m}$).
