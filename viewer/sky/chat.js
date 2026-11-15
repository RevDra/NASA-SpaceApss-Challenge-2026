/* Chat bubble for every page. It is NOT a language model: it answers from a small written knowledge base (facts about the
   five targets, SPHEREx and how to use this site), so every sentence can be checked. Typed questions are matched by
   keywords; names it does not know are looked up in SIMBAD through /api/resolve. English and Vietnamese. */
(() => {
  'use strict';
  if (window.__nxChat) return; window.__nxChat = true;
  const lang = () => { try { const l = localStorage.getItem('sky-lang'); if (l === 'vi' || l === 'en') return l; } catch (e) { /* ignore */ } return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en'; };
  const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9+ .'-]/g, ' ');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---- the knowledge base: { id, q (chip text), a (answer), kw (keywords, accents removed), go (offer "open in viewer") } ---- */
  const STARS = {
    barnard: { name: { en: "Barnard's Star", vi: 'Sao Barnard' }, alias: ['barnard'], band: 'SD2', items: [
      { id: 'what', needName: 1, go: 1, q: { en: "What is Barnard's Star?", vi: 'Sao Barnard là gì?' }, kw: ['what is', 'who is', 'about', 'tell me', 'la gi', 'la sao gi', 'gioi thieu', 'ke ve', 'noi ve'],
        a: { en: "A small, dim red dwarf (type M4) only 6 light-years away. After the Alpha Centauri stars it is the nearest star system to the Sun, and no known star drifts across our sky faster: 10.4 arcseconds a year. It is also old, probably older than the Sun.",
             vi: 'Một sao lùn đỏ nhỏ, mờ (kiểu M4) chỉ cách chúng ta 6 năm ánh sáng. Sau các ngôi sao của hệ Alpha Centauri, nó là hệ sao gần Mặt Trời nhất, và không ngôi sao nào được biết là lướt qua bầu trời nhanh hơn: 10,4 giây cung mỗi năm. Nó cũng khá già, nhiều khả năng già hơn Mặt Trời.' } },
      { id: 'fast', q: { en: 'Why does it move so fast?', vi: 'Vì sao nó chạy nhanh vậy?' }, kw: ['fast', 'fastest', 'speed', 'runaway', 'why move', 'nhanh', 'toc do', 'van toc', 'tai sao di chuyen', 'vi sao di chuyen', 'sao chay'],
        a: { en: "Mostly because it is close. In space it moves at roughly 140 km/s relative to the Sun, quick but not extreme. At only 6 light-years, that sideways motion adds up to a big shift on the sky: about the width of the full Moon in 180 years.",
             vi: 'Phần lớn là vì nó ở gần. Trong không gian nó chuyển động khoảng 140 km/s so với Mặt Trời, nhanh nhưng không quá đặc biệt. Vì chỉ cách 6 năm ánh sáng, chuyển động ngang ấy cộng dồn thành một dịch chuyển lớn trên bầu trời: cỡ bề rộng của Mặt Trăng tròn sau khoảng 180 năm.' } },
      { id: 'far', q: { en: 'How far is it?', vi: 'Nó cách bao xa?' }, kw: ['how far', 'distance', 'far', 'light year', 'light-year', 'bao xa', 'khoang cach', 'cach', 'nam anh sang'],
        a: { en: "About 6.0 light-years, around 56 trillion km. It is slowly coming closer and will be nearest in roughly 12,000 years, at about 3.8 light-years.",
             vi: 'Khoảng 6,0 năm ánh sáng, tức chừng 56 nghìn tỷ km. Nó đang tiến lại gần dần và sẽ gần nhất sau khoảng 12.000 năm nữa, ở cỡ 3,8 năm ánh sáng.' } },
      { id: 'see', q: { en: 'Can I see it with my eyes?', vi: 'Nhìn bằng mắt thường được không?' }, kw: ['naked eye', 'see it', 'visible', 'telescope', 'binocular', 'mat thuong', 'nhin thay', 'kinh thien van', 'ong nhom', 'nhin duoc'],
        a: { en: "No. It is so faint (about magnitude 9.5) that you need a telescope, even though it is one of our nearest neighbours. Dim red dwarfs are the most common stars, and almost none can be seen without help.",
             vi: 'Không. Nó mờ đến mức (cỡ cấp sao 9,5) bạn cần kính thiên văn, dù nó là một trong những láng giềng gần nhất. Sao lùn đỏ là loại sao phổ biến nhất, và gần như không ngôi nào thấy được bằng mắt thường.' } },
      { id: 'planet', q: { en: 'Does it have planets?', vi: 'Nó có hành tinh không?' }, kw: ['planet', 'exoplanet', 'life', 'habitable', 'hanh tinh', 'su song', 'ngoai he'],
        a: { en: "Yes. In 2024 astronomers confirmed Barnard b, a planet at least 0.37 times Earth's mass that circles the star every 3.15 days, far too hot for life. A 2025 study reported evidence for three more small planets.",
             vi: 'Có. Năm 2024 các nhà thiên văn xác nhận Barnard b, một hành tinh nặng ít nhất 0,37 lần Trái Đất, quay quanh sao mỗi 3,15 ngày, quá nóng để có sự sống. Một nghiên cứu năm 2025 báo cáo bằng chứng về thêm ba hành tinh nhỏ.' } },
      { id: 'spot', go: 1, q: { en: 'How do I see it move here?', vi: 'Làm sao thấy nó dịch chuyển ở đây?' }, kw: ['how do i', 'see it move', 'spot', 'blink', 'find it', 'lam sao', 'cach xem', 'thay no', 'tim no', 'dich chuyen', 'xem no'],
        a: { en: "Open it in the viewer and press play: the SPHEREx frames blink and the star shifts by about 1 to 2 pixels over a year. For a much clearer jump, choose the 14-year WISE view, where it travels about 145 arcseconds.",
             vi: 'Mở nó trong viewer rồi bấm phát: các khung SPHEREx nhấp nháy và ngôi sao dịch khoảng 1 đến 2 điểm ảnh trong một năm. Muốn thấy rõ hơn nhiều, chọn chế độ 14 năm của WISE, nơi nó đi khoảng 145 giây cung.' } },
      { id: 'colour', q: { en: 'How hot is it?', vi: 'Nó nóng cỡ nào?' }, kw: ['hot', 'temperature', 'colour', 'color', 'red dwarf', 'nong', 'nhiet do', 'mau', 'sao lun do'],
        a: { en: "About 3,200 K at the surface, much cooler than the Sun (about 5,800 K), which is why it glows red and gives off most of its light in the infrared.",
             vi: 'Khoảng 3.200 K ở bề mặt, nguội hơn nhiều so với Mặt Trời (khoảng 5.800 K), nên nó có màu đỏ và phát phần lớn ánh sáng ở vùng hồng ngoại.' } },
    ] },
    wise0855: { name: { en: 'WISE 0855−0714', vi: 'WISE 0855−0714' }, alias: ['wise 0855', 'wise0855', '0855', 'coldest'], band: 'SD6', items: [
      { id: 'what', needName: 1, go: 1, q: { en: 'What is WISE 0855?', vi: 'WISE 0855 là gì?' }, kw: ['what is', 'who is', 'about', 'tell me', 'la gi', 'gioi thieu', 'ke ve', 'noi ve'],
        a: { en: "A brown dwarf, a failed star, and the coldest one known. It was found in 2014 in WISE infrared data and lies 7.4 light-years away, making it one of the Sun's closest neighbours, yet it gives out almost no visible light.",
             vi: 'Một sao lùn nâu ("ngôi sao hỏng"), và là cái lạnh nhất được biết. Nó được tìm thấy năm 2014 trong dữ liệu hồng ngoại của WISE, cách 7,4 năm ánh sáng, là một trong những láng giềng gần nhất của Mặt Trời, vậy mà gần như không phát ánh sáng nhìn thấy.' } },
      { id: 'cold', q: { en: 'How cold is it?', vi: 'Nó lạnh cỡ nào?' }, kw: ['cold', 'coldest', 'temperature', 'hot', 'lanh', 'nhiet do', 'nong'],
        a: { en: "Estimates put it between about −50 °C and +10 °C depending on the measurement, close to temperatures on Earth. Ordinary stars are thousands of degrees. That is why it only glows in the infrared.",
             vi: 'Các ước tính cho nó nằm khoảng từ −50 °C đến +10 °C tùy phép đo, gần với nhiệt độ trên Trái Đất. Sao thường nóng hàng nghìn độ. Vì thế nó chỉ phát sáng ở hồng ngoại.' } },
      { id: 'why', q: { en: 'Why does SPHEREx find it?', vi: 'Vì sao SPHEREx thấy được nó?' }, kw: ['sphere', 'infrared', 'why', 'find', 'hong ngoai', 'tai sao', 'vi sao', 'tim thay'],
        a: { en: "SPHEREx looks in infrared light, from 0.75 to 5 micrometres, and a cold brown dwarf shines brightest around 4 to 5 micrometres, the longest SPHEREx bands. In ordinary photographs it is invisible.",
             vi: 'SPHEREx nhìn bằng ánh sáng hồng ngoại, từ 0,75 đến 5 micromet, và một sao lùn nâu lạnh sáng nhất quanh 4 đến 5 micromet, các dải dài nhất của SPHEREx. Trên ảnh thường nó không thấy được.' } },
      { id: 'fast', q: { en: 'How fast does it move?', vi: 'Nó chuyển động nhanh không?' }, kw: ['fast', 'move', 'speed', 'motion', 'nhanh', 'di chuyen', 'dich chuyen', 'toc do'],
        a: { en: "About 8.1 arcseconds a year, the second-fastest after Barnard's Star among our targets. In 14 years of WISE photographs it shifts by well over 100 arcseconds. Old catalogue positions from 2014 are about 100 arcseconds off today, so the viewer moves them to the current date.",
             vi: 'Khoảng 8,1 giây cung mỗi năm, nhanh thứ hai sau sao Barnard trong số các mục tiêu. Trong 14 năm ảnh WISE nó dịch hơn 100 giây cung. Vị trí trong danh mục cũ (2014) hiện lệch khoảng 100 giây cung, nên viewer dời chúng về ngày hôm nay.' } },
    ] },
    epsindib: { name: { en: 'Epsilon Indi B', vi: 'Epsilon Indi B' }, alias: ['epsilon indi', 'eps indi', 'indi'], band: 'SD2', items: [
      { id: 'what', needName: 1, go: 1, q: { en: 'What is Epsilon Indi B?', vi: 'Epsilon Indi B là gì?' }, kw: ['what is', 'who is', 'about', 'tell me', 'la gi', 'gioi thieu', 'ke ve', 'noi ve'],
        a: { en: "Two brown dwarfs that orbit each other, travelling together with a nearby orange star, Epsilon Indi A. The whole family is about 11.9 light-years away and drifts 4.7 arcseconds a year.",
             vi: 'Hai sao lùn nâu quay quanh nhau, đi cùng một ngôi sao cam ở gần là Epsilon Indi A. Cả gia đình cách khoảng 11,9 năm ánh sáng và trôi 4,7 giây cung mỗi năm.' } },
      { id: 'where', q: { en: 'Which one is it in the viewer?', vi: 'Trong viewer là ngôi nào?' }, kw: ['which', 'where', 'coordinates', 'wrong', 'nao', 'o dau', 'toa do', 'nham'],
        a: { en: "Careful: the brown dwarfs lie about 8 arcminutes away from the bright star Epsilon Indi A. Coordinates that people copy for \"Epsilon Indi B\" are often those of A. The viewer here uses the position of B moved to today.",
             vi: 'Cẩn thận: cặp sao lùn nâu nằm cách ngôi sao sáng Epsilon Indi A khoảng 8 phút cung. Toạ độ mà nhiều người chép cho "Epsilon Indi B" thường lại là của A. Viewer ở đây dùng vị trí của B đã dời về hôm nay.' } },
      { id: 'planet', q: { en: 'Does it have a planet?', vi: 'Có hành tinh không?' }, kw: ['planet', 'exoplanet', 'jwst', 'webb', 'hanh tinh'],
        a: { en: "The bright star Epsilon Indi A has one: in 2024 the James Webb Space Telescope took a direct image of a cold gas giant, Epsilon Indi Ab, several times heavier than Jupiter.",
             vi: 'Ngôi sao sáng Epsilon Indi A có một hành tinh: năm 2024 Kính thiên văn James Webb chụp trực tiếp một hành tinh khí lạnh khổng lồ, Epsilon Indi Ab, nặng gấp vài lần Sao Mộc.' } },
    ] },
    rwaur: { name: { en: 'RW Aurigae', vi: 'RW Aurigae' }, alias: ['rw aur', 'rwaur', 'aurigae'], band: 'SD2', items: [
      { id: 'what', needName: 1, go: 1, q: { en: 'What is RW Aurigae?', vi: 'RW Aurigae là gì?' }, kw: ['what is', 'who is', 'about', 'tell me', 'la gi', 'gioi thieu', 'ke ve', 'noi ve'],
        a: { en: "A very young star, a \"T Tauri\" star, still gathering gas and dust from the disc around it. It lies roughly 450 light-years away in the constellation Auriga.",
             vi: 'Một ngôi sao rất trẻ, loại "T Tauri", vẫn còn hút khí và bụi từ đĩa quanh nó. Nó cách khoảng 450 năm ánh sáng, trong chòm Auriga (Ngự Phu).' } },
      { id: 'flicker', q: { en: 'Why does it flicker?', vi: 'Vì sao nó nhấp nháy?' }, kw: ['flicker', 'bright', 'dim', 'vary', 'variable', 'change', 'nhap nhay', 'do sang', 'thay doi', 'mo di'],
        a: { en: "Clumps of dust and gas drift in front of it, and material falls onto it unevenly, so its brightness jumps around with no fixed schedule. It has had long, deep dimmings, for example around 2010 and 2014.",
             vi: 'Các đám bụi và khí trôi ngang qua trước nó, và vật chất rơi vào nó không đều, nên độ sáng nhảy lên xuống không theo lịch. Nó từng có những đợt mờ đi dài và sâu, ví dụ quanh năm 2010 và 2014.' } },
      { id: 'spot', go: 1, q: { en: 'How do I catch it changing?', vi: 'Làm sao bắt được nó đổi sáng?' }, kw: ['how do i', 'catch', 'spot', 'find', 'blink', 'lam sao', 'cach xem', 'tim no', 'bat'],
        a: { en: "Press play on the blink and watch the star itself, not its position: it barely moves, but its brightness can differ between visits. Compare two frames side by side.",
             vi: 'Bấm phát ở chế độ nhấp nháy và nhìn chính ngôi sao, không phải vị trí: nó gần như không dịch chuyển, nhưng độ sáng có thể khác nhau giữa các lần chụp. Hãy so sánh hai khung cạnh nhau.' } },
    ] },
    rdra: { name: { en: 'R Draconis', vi: 'R Draconis' }, alias: ['r dra', 'rdra', 'draconis'], band: 'SD3', items: [
      { id: 'what', needName: 1, go: 1, q: { en: 'What is R Draconis?', vi: 'R Draconis là gì?' }, kw: ['what is', 'who is', 'about', 'tell me', 'la gi', 'gioi thieu', 'ke ve', 'noi ve'],
        a: { en: "An old red giant of the \"Mira\" kind in the constellation Draco, a star that swells and shrinks so that its brightness rises and falls by a factor of hundreds.",
             vi: 'Một sao khổng lồ đỏ già thuộc loại "Mira" trong chòm Draco (Thiên Long), ngôi sao phồng lên rồi co lại khiến độ sáng của nó tăng giảm hàng trăm lần.' } },
      { id: 'period', q: { en: 'How long is its cycle?', vi: 'Chu kỳ của nó bao lâu?' }, kw: ['cycle', 'period', 'how long', 'when', 'chu ky', 'bao lau', 'khi nao', 'bao nhieu ngay'],
        a: { en: "About 246 days from one peak to the next, roughly eight months. Because SPHEREx revisits every six months, two visits can catch it at quite different moments of the cycle.",
             vi: 'Khoảng 246 ngày từ đỉnh này đến đỉnh sau, tức chừng tám tháng. Vì SPHEREx quay lại sau mỗi sáu tháng, hai lần chụp có thể bắt được nó ở hai thời điểm rất khác nhau của chu kỳ.' } },
      { id: 'see', q: { en: 'Can I see it with my eyes?', vi: 'Nhìn bằng mắt thường được không?' }, kw: ['naked eye', 'see it', 'visible', 'binocular', 'telescope', 'mat thuong', 'nhin thay', 'ong nhom', 'nhin duoc'],
        a: { en: "Only near its brightest, when it reaches roughly magnitude 7, which needs binoculars. At its faintest it drops to about magnitude 13, a job for a telescope.",
             vi: 'Chỉ khi gần sáng nhất, lúc đạt cỡ cấp sao 7, cần ống nhòm. Khi mờ nhất nó tụt xuống khoảng cấp 13, việc của kính thiên văn.' } },
      { id: 'why', q: { en: 'Why does it breathe?', vi: 'Vì sao nó "thở"?' }, kw: ['why', 'breathe', 'pulsate', 'swell', 'tai sao', 'vi sao', 'tho', 'phong'],
        a: { en: "Its outer layers pulse in and out in a slow rhythm, as the star nears the end of its life. Mira stars are cool and bright in the infrared, which suits SPHEREx well.",
             vi: 'Các lớp ngoài của nó co giãn theo nhịp chậm khi ngôi sao đi gần cuối đời. Sao Mira nguội và sáng ở hồng ngoại, rất hợp với SPHEREx.' } },
    ] },
  };
  const GENERAL = [
    { id: 'spherex', q: { en: 'What is SPHEREx?', vi: 'SPHEREx là gì?' }, kw: ['spherex', 'sphere x', 'telescope', 'mission', 'nasa', 'kinh thien van', 'su menh', 'la gi'],
      a: { en: "A NASA space telescope launched in March 2025. It photographs the whole sky in 102 infrared colours between 0.75 and 5 micrometres, and completes a full-sky map about every six months, which is what lets us compare the same patch of sky over time.",
           vi: 'Một kính thiên văn vũ trụ của NASA phóng vào tháng 3 năm 2025. Nó chụp toàn bộ bầu trời ở 102 màu hồng ngoại từ 0,75 đến 5 micromet, và hoàn thành một bản đồ toàn bầu trời khoảng sáu tháng một lần, nhờ đó ta so sánh được cùng một mảng trời theo thời gian.' } },
    { id: 'pm', q: { en: 'What is proper motion?', vi: 'Chuyển động riêng là gì?' }, kw: ['proper motion', 'moving star', 'arcsecond', 'arcsec', 'chuyen dong rieng', 'giay cung'],
      a: { en: "How far a star appears to slide across the sky each year. It is measured in arcseconds: 1 arcsecond is 1/3600 of a degree, and the full Moon is about 1,800 arcseconds wide. Nearby stars have the biggest proper motion.",
           vi: 'Mỗi năm một ngôi sao trông như trượt bao xa trên bầu trời. Đơn vị là giây cung: 1 giây cung bằng 1/3600 độ, còn Mặt Trăng tròn rộng khoảng 1.800 giây cung. Sao ở gần có chuyển động riêng lớn nhất.' } },
    { id: 'blink', q: { en: 'How do I find a moving star?', vi: 'Làm sao tìm ngôi sao chuyển động?' }, kw: ['blink', 'how to find', 'find a moving', 'moving object', 'discover', 'play', 'nhap nhay', 'tim sao', 'tim vat', 'phat hien', 'cach dung'],
      a: { en: "Press play so the frames blink. Everything fixed stays still; a mover jumps from frame to frame. Click a bright dot and choose \"I found a new star\" to report it.",
           vi: 'Bấm phát để các khung nhấp nháy. Mọi thứ cố định đứng yên; vật chuyển động nhảy từ khung này sang khung khác. Bấm vào chấm sáng rồi chọn "Tôi thấy sao mới" để báo cáo.' } },
    { id: 'report', q: { en: 'How do I report a new star?', vi: 'Báo sao mới như thế nào?' }, kw: ['report', 'new star', 'gift', 'prize', 'reward', 'admin', 'bao cao', 'sao moi', 'qua', 'phan thuong', 'gui'],
      a: { en: "In the viewer press \"I found a new star\". Tap the star on the picture; coordinates, dates and brightness fill in by themselves. Add your name and a contact, then send. If you are right, the admin sends you a gift. Sending only means it was received; it is checked afterwards.",
           vi: 'Trong viewer bấm "Tôi thấy sao mới". Chạm vào ngôi sao trên ảnh; toạ độ, ngày và độ sáng tự điền. Thêm tên và liên hệ rồi gửi. Nếu bạn đúng, admin sẽ gửi quà. Gửi chỉ có nghĩa là đã nhận; việc kiểm tra làm sau.' } },
    { id: 'real', q: { en: 'Is this real data?', vi: 'Đây có phải dữ liệu thật không?' }, kw: ['real', 'data', 'fake', 'simulat', 'true', 'source', 'that', 'du lieu', 'gia', 'mo phong', 'nguon', 'dung khong'],
      a: { en: "Yes where it says so: the photographs are real SPHEREx and WISE frames from NASA/IPAC IRSA, stars come from ESA Gaia, names and positions from SIMBAD, planets and ephemerides from NASA JPL. Anything simulated is labelled as simulated.",
           vi: 'Có, ở những chỗ ghi như vậy: ảnh là các khung SPHEREx và WISE thật từ NASA/IPAC IRSA, sao lấy từ ESA Gaia, tên và vị trí từ SIMBAD, hành tinh và lịch thiên văn từ NASA JPL. Phần nào mô phỏng đều được ghi rõ là mô phỏng.' } },
    { id: 'planetx', q: { en: 'What is Planet X?', vi: 'Planet X là gì?' }, kw: ['planet x', 'planet nine', 'planet 9', 'hanh tinh x', 'hanh tinh 9'],
      a: { en: "A hypothetical, still unconfirmed planet far beyond Neptune, proposed to explain the odd orbits of some distant icy bodies (often called Planet Nine). Nobody has seen it. This project practises the same skill: spotting faint things that move.",
           vi: 'Một hành tinh giả thuyết, vẫn chưa được xác nhận, nằm rất xa sau Sao Hải Vương, được đề xuất để giải thích quỹ đạo lạ của một số thiên thể băng giá ở xa (thường gọi là Planet Nine). Chưa ai thấy nó. Dự án này luyện đúng kỹ năng đó: phát hiện vật mờ đang chuyển động.' } },
    { id: 'brown', q: { en: 'What is a brown dwarf?', vi: 'Sao lùn nâu là gì?' }, kw: ['brown dwarf', 'failed star', 'sao lun nau', 'sao hong'],
        a: { en: "An object between a planet and a star: too small to ignite hydrogen fusion like the Sun, so it just cools slowly over billions of years. The coldest ones are barely warmer than a planet.",
             vi: 'Một vật thể nằm giữa hành tinh và ngôi sao: quá nhỏ để đốt cháy hydro như Mặt Trời, nên nó chỉ nguội dần qua hàng tỷ năm. Những cái lạnh nhất chỉ ấm hơn hành tinh một chút.' } },
    { id: 'infrared', q: { en: 'Why infrared?', vi: 'Vì sao dùng hồng ngoại?' }, kw: ['infrared', 'micron', 'micrometre', 'wavelength', 'colour of light', 'hong ngoai', 'buoc song', 'micromet', 'mau cua anh sang'],
      a: { en: "Cool objects, such as brown dwarfs, dust and old giants, glow mostly in the infrared and are invisible in ordinary light. Infrared also passes through dust better, so we see further into the Galaxy.",
           vi: 'Những vật nguội như sao lùn nâu, bụi và sao khổng lồ già phát sáng chủ yếu ở hồng ngoại và vô hình trong ánh sáng thường. Hồng ngoại cũng xuyên qua bụi tốt hơn, nên ta nhìn được sâu hơn vào Ngân Hà.' } },
    { id: 'collection', q: { en: 'What is Save snapshot?', vi: 'Nút lưu ảnh để làm gì?' }, kw: ['save', 'collection', 'snapshot', 'learning board', 'luu', 'bang hoc tap', 'bo suu tap', 'anh chup'],
      a: { en: "It keeps a picture of the field you are looking at, with its facts, in \"Saved\" on this device only. You can also choose to report a new star from the same button.",
           vi: 'Nó giữ lại ảnh vùng trời bạn đang xem, kèm thông tin, trong mục "Đã lưu" chỉ trên thiết bị này. Từ cùng nút đó bạn cũng có thể chọn báo sao mới.' } },
  ];
  const SMALL = {
    hi: { kw: ['hello', 'hi', 'hey', 'xin chao', 'chao', 'alo'], a: { en: 'Hello! Pick a star below, or ask me anything about SPHEREx and the sky.', vi: 'Xin chào! Chọn một ngôi sao bên dưới, hoặc hỏi mình về SPHEREx và bầu trời nhé.' } },
    thanks: { kw: ['thanks', 'thank you', 'cam on', 'cảm ơn'], a: { en: 'Happy to help! Ask me another one anytime.', vi: 'Rất vui được giúp! Cứ hỏi tiếp bất cứ lúc nào.' } },
    who: { kw: ['who are you', 'are you ai', 'are you a bot', 'ban la ai', 'ban la gi', 'bot'], a: { en: 'I am a little helper, not a free-thinking AI: I answer from facts written for this project, and I look unknown names up in SIMBAD. If I do not know, I will say so.', vi: 'Mình là trợ lý nhỏ, không phải AI tự do: mình trả lời bằng những thông tin đã viết sẵn cho dự án này, và tra tên lạ trong SIMBAD. Nếu không biết, mình sẽ nói thật.' } },
  };
  const UI = {
    en: { title: 'Star helper', sub: 'Answers from this project’s facts, not a free AI', hellos: ['Hello! I am the chatbot. How can I help you?', 'Curious about Barnard’s Star? Ask me!', 'I can explain SPHEREx and the stars here. Tap me!'], hideHello: 'Dismiss', open: 'Open chat', dragTip: 'Click to chat, drag to move', close: 'Close chat', ph: 'Ask about a star…', send: 'Send',
      intro: 'Hi, I am your star helper. Pick a star, tap a question, or type your own.', nope: 'I do not know that one yet. I only answer about the stars here, SPHEREx and how to use this site. Try one of these:', look: 'Looking that name up in SIMBAD…',
      found: '{n} is in SIMBAD ({t}). Open it in the viewer?', noSim: 'I could not find “{q}” in SIMBAD either. Try a catalogue name such as HD 10700, or pick one of these:', simFail: 'SIMBAD did not answer just now. Pick one of these:', go: 'Open in viewer', more: 'You may also ask:', general: 'General', picked: 'Now talking about {n}.' },
    vi: { title: 'Trợ lý ngôi sao', sub: 'Trả lời từ thông tin của dự án, không phải AI tự do', hellos: ['Xin chào! Mình là chatbot, mình có thể giúp gì cho bạn?', 'Bạn thắc mắc về sao Barnard? Hỏi mình nhé!', 'Mình giải thích được SPHEREx và các ngôi sao ở đây. Bấm vào mình nhé!'], hideHello: 'Ẩn', open: 'Mở khung chat', dragTip: 'Bấm để chat, kéo để di chuyển', close: 'Đóng khung chat', ph: 'Hỏi về một ngôi sao…', send: 'Gửi',
      intro: 'Chào bạn, mình là trợ lý ngôi sao. Chọn một ngôi sao, bấm một câu hỏi, hoặc tự gõ câu hỏi nhé.', nope: 'Mình chưa biết câu này. Mình chỉ trả lời về các ngôi sao ở đây, SPHEREx và cách dùng trang web. Thử một trong các câu sau nhé:', look: 'Đang tra tên đó trong SIMBAD…',
      found: '{n} có trong SIMBAD ({t}). Mở nó trong viewer nhé?', noSim: 'Mình cũng không tìm thấy "{q}" trong SIMBAD. Thử tên danh mục như HD 10700, hoặc chọn một câu sau:', simFail: 'SIMBAD chưa trả lời lúc này. Chọn một câu sau nhé:', go: 'Mở trong viewer', more: 'Bạn có thể hỏi thêm:', general: 'Chung', picked: 'Giờ mình nói về {n}.' },
  };

  let targets = {}, L = lang(), star = 'barnard', asked = new Set(), started = false;
  fetch('sky/targets.json').then((r) => r.json()).then((j) => { (j.targets || []).forEach((t) => { targets[t.id] = t; }); }).catch(() => {});
  const viewerUrl = (ra, dec, band) => `index.html?ra=${ra}&dec=${dec}&band=${band || 'SD2'}&fov=120`;
  const here = () => {                                          // the star the viewer is looking at, if any
    try { const d = window.__reportData && window.__reportData(); if (d) for (const [id, t] of Object.entries(targets)) if (Math.abs(d.ra - t.ra) < 0.15 && Math.abs(d.dec - t.dec) < 0.15) return id; } catch (e) { /* ignore */ }
    try { const q = new URLSearchParams(location.search), ra = +q.get('ra'), dec = +q.get('dec'); if (q.has('ra')) for (const [id, t] of Object.entries(targets)) if (Math.abs(ra - t.ra) < 0.2 && Math.abs(dec - t.dec) < 0.2) return id; } catch (e) { /* ignore */ }
    return null;
  };

  /* ---- DOM ---- */
  const FACE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5C13 5 5 12.6 5 22.5c0 5.2 2.3 9.7 6 12.8-.2 3-1.4 5.2-3.2 7 4.2-.2 7.600-1.700 10.300-3.800 1.900.5 3.800.8 5.900.8 11 0 19-7.600 19-17S35 5 24 5z" fill="#fbbf6a"/><path d="M24 5C13 5 5 12.6 5 22.5c0 .8.1 1.600.2 2.400C8 15 15 9 24 9c8.500 0 15.500 5.200 18.300 12.500C41.500 12.100 33.700 5 24 5z" fill="#fff" opacity=".28"/><ellipse class="nx-eye" cx="17.500" cy="22" rx="2.600" ry="3.300" fill="#2a1604"/><ellipse class="nx-eye" cx="30.500" cy="22" rx="2.600" ry="3.300" fill="#2a1604"/><path d="M18.500 29c1.600 2.200 3.400 3.200 5.500 3.200s3.900-1 5.500-3.200" fill="none" stroke="#2a1604" stroke-width="2.200" stroke-linecap="round"/><circle cx="12" cy="28" r="2.600" fill="#ef7b5a" opacity=".55"/><circle cx="36" cy="28" r="2.600" fill="#ef7b5a" opacity=".55"/><path d="M39 3l1.500 3.600L44 8l-3.500 1.400L39 13l-1.500-3.600L34 8l3.500-1.400z" fill="#7dd3fc"/></svg>';
  const root = document.createElement('div'); root.id = 'nx-chat';
  root.innerHTML = `<div class="nx-hello" hidden role="status"><button type="button" class="nx-hello-t"></button><button type="button" class="nx-hello-x">×</button></div><button type="button" class="nx-fab" aria-expanded="false" aria-controls="nx-panel">${FACE}<span class="nx-dot"></span></button>
    <section class="nx-panel" id="nx-panel" role="dialog" aria-label="Star helper"><header class="nx-head">${FACE}<div><b></b><small></small></div><button type="button" class="nx-x"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>
      <div class="nx-log" role="log" aria-live="polite"></div><div class="nx-stars"></div><div class="nx-chips"></div>
      <form class="nx-form" autocomplete="off"><input class="nx-in" maxlength="160" enterkeyhint="send"><button class="nx-send" type="submit"><svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-3-6z"/></svg></button></form></section>`;
  const $ = (s) => root.querySelector(s), log = $('.nx-log'), chips = $('.nx-chips'), stars = $('.nx-stars'), inp = $('.nx-in'), fab = $('.nx-fab'), hello = $('.nx-hello'), helloT = $('.nx-hello-t'), helloX = $('.nx-hello-x');
  const t = (k) => UI[L][k];
  const add = (cls, html) => { const m = document.createElement('div'); m.className = 'nx-m ' + cls; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
  const say = (text, extra = '') => { const wait = add('bot', '<span class="nx-typing"><i></i><i></i><i></i></span>'); return new Promise((ok) => setTimeout(() => { wait.innerHTML = esc(text) + extra; log.scrollTop = log.scrollHeight; ok(wait); }, Math.min(650, 200 + text.length * 2))); };
  const goBtn = (id) => { const g = targets[id], s = STARS[id]; return g ? `<br><a class="nx-go" href="${viewerUrl(g.ra, g.dec, s.band)}">${esc(t('go'))} · ${esc(s.name[L])}</a>` : ''; };

  function renderStars() {
    stars.innerHTML = Object.entries(STARS).map(([id, s]) => `<button type="button" class="nx-star${id === star ? ' is-on' : ''}" data-star="${id}">${esc(s.name[L])}</button>`).join('');
  }
  function renderChips(list) {
    const items = list || [...STARS[star].items.filter((i) => !asked.has(star + i.id)).map((i) => ({ ...i, _k: star })), ...GENERAL.filter((g) => !asked.has('g' + g.id)).map((g) => ({ ...g, _k: 'g' }))].slice(0, 6);
    chips.innerHTML = items.map((i) => `<button type="button" class="nx-chip" data-ask="${i._k}:${i.id}">${esc(i.q[L])}</button>`).join('');
  }
  function entry(key) { const [sid, id] = key.split(':'); if (sid === 'g') return { e: GENERAL.find((g) => g.id === id), sid: null }; const e = STARS[sid].items.find((i) => i.id === id) || null; return { e, sid }; }
  async function answer(e, sid) {
    asked.add((sid || 'g') + e.id); if (sid === 'g') sid = null;
    await say(e.a[L], e.go && sid ? goBtn(sid) : '');
    renderChips();
  }
  function reset() {
    L = lang(); log.innerHTML = ''; asked = new Set(); const h = here(); if (h) star = h;
    $('.nx-head b').textContent = t('title'); $('.nx-head small').textContent = t('sub'); inp.placeholder = t('ph'); $('.nx-send').setAttribute('aria-label', t('send')); $('.nx-x').setAttribute('aria-label', t('close')); fab.setAttribute('aria-label', t('open')); fab.title = t('dragTip');
    renderStars(); add('bot', esc(t('intro'))); renderChips();
  }

  /* ---- understanding typed text ---- */
  const hits = (text, kws) => kws.reduce((n, k) => n + (text.includes(k) ? (k.length > 5 ? 2 : 1) : 0), 0);
  function find(raw) {
    const text = ' ' + fold(raw) + ' ';
    let mention = null; for (const [id, s] of Object.entries(STARS)) if (s.alias.some((a) => text.includes(a))) mention = id;
    for (const [k, v] of Object.entries(SMALL)) { if (text.trim().length < 40 && !mention && v.kw.some((w) => text.includes(' ' + fold(w) + ' '))) return { small: v.a }; }
    let best = null, top = 1;
    const all = [...GENERAL.map((e) => ({ e, sid: null })), ...Object.entries(STARS).flatMap(([sid, s]) => s.items.map((e) => ({ e, sid })))];
    for (const { e, sid } of all) {
      let sc = hits(text, e.kw.map(fold)); if (!sc) continue;
      if (sid) { if (e.needName && !mention) continue; if (mention && sid !== mention) continue; if (mention) sc += 3; else if (sid === star) sc += 1; else sc -= 1; }
      else if (mention) sc -= 1;
      if (sc > top) { top = sc; best = { e, sid }; }
    }
    if (best) return best;
    if (mention) return { e: STARS[mention].items[0], sid: mention };
    if (/ (this|nay|dang xem) /.test(text)) return { e: STARS[star].items[0], sid: star };
    return null;
  }
  async function lookup(raw) {
    const q = raw.trim().slice(0, 60); const words = q.split(/\s+/).length; if (q.length < 2 || words > 4 || (words > 2 && !/\d/.test(q))) return false;       // a name, not a sentence
    const w = add('bot', esc(t('look')));
    try {
      const r = await fetch('/api/resolve?name=' + encodeURIComponent(q)), j = await r.json();
      if (j && j.ok) {
        w.innerHTML = esc(t('found').replace('{n}', j.name).replace('{t}', j.sp_type || j.otype || '?')) + `<br><a class="nx-go" href="${viewerUrl(j.ra, j.dec, 'SD2')}">${esc(t('go'))}</a><small>SIMBAD (CDS)</small>`;
        return true;
      }
      w.innerHTML = esc(t('noSim').replace('{q}', q)); return true;
    } catch (e) { w.innerHTML = esc(t('simFail')); return true; }
  }
  async function submit(raw) {
    if (!raw.trim()) return; add('me', esc(raw)); inp.value = '';
    const hit = find(raw);
    if (hit && hit.small) { await say(hit.small[L]); renderChips(); return; }
    if (hit) { if (hit.sid && hit.sid !== star) { star = hit.sid; renderStars(); } await answer(hit.e, hit.sid); return; }
    const known = await lookup(raw); if (!known) await say(t('nope'));
    renderChips([...STARS[star].items.slice(0, 3).map((i) => ({ ...i, _k: star })), ...GENERAL.slice(0, 2).map((g) => ({ ...g, _k: 'g' }))]);
  }

  /* ---- greeting bubble ---- */
  let opened = false, hn = 0, hideTimer = 0;
  function hideHello() { hello.hidden = true; fab.classList.remove('is-ping'); clearTimeout(hideTimer); }
  function showHello() {
    if (opened || root.classList.contains('is-open') || document.hidden) return;
    const list = t('hellos'); helloT.textContent = list[hn++ % list.length]; helloX.setAttribute('aria-label', t('hideHello')); hello.hidden = false; fab.classList.add('is-ping');
    clearTimeout(hideTimer); hideTimer = setTimeout(hideHello, 9000);
  }

  /* ---- open / close ---- */
  const setOpen = (o) => {
    root.classList.toggle('is-open', o); fab.setAttribute('aria-expanded', String(o)); hideHello(); place(); if (o) { opened = true; clearInterval(nudge); try { sessionStorage.setItem('nx-chat-seen', '1'); } catch (e) { /* ignore */ } }
    if (o) { if (!started || L !== lang()) { reset(); started = true; } fab.querySelector('.nx-dot').hidden = true; setTimeout(() => inp.focus({ preventScroll: true }), 60); } else fab.focus({ preventScroll: true });
  };
  fab.addEventListener('click', () => { if (!dragged) setOpen(true); }); helloT.addEventListener('click', () => setOpen(true)); helloX.addEventListener('click', () => { hideHello(); clearInterval(nudge); }); $('.nx-x').addEventListener('click', () => setOpen(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('is-open')) setOpen(false); });
  stars.addEventListener('click', (e) => { const b = e.target.closest('[data-star]'); if (!b) return; star = b.dataset.star; asked = new Set([...asked].filter((k) => k.startsWith('g'))); renderStars(); renderChips(); add('bot', esc(t('picked').replace('{n}', STARS[star].name[L]))); });
  chips.addEventListener('click', (e) => { const b = e.target.closest('[data-ask]'); if (!b) return; const { e: en, sid } = entry(b.dataset.ask); if (!en) return; add('me', esc(en.q[L])); answer(en, sid || 'g'); });
  $('.nx-form').addEventListener('submit', (e) => { e.preventDefault(); submit(inp.value); });
  document.body.appendChild(root); fab.querySelector('.nx-dot').hidden = false; fab.title = t('dragTip');

  /* ---- drag: grab the face (or the panel's title bar) and put it wherever it is not in the way; the spot is remembered ---- */
  let dragged = false, pos = { r: 16, b: 16 };
  try { const v = JSON.parse(localStorage.getItem('nx-chat-pos') || 'null'); if (v && Number.isFinite(v.r) && Number.isFinite(v.b)) pos = { r: v.r, b: v.b }; } catch (e) { /* ignore */ }
  const sheet = () => matchMedia('(max-width: 560px)').matches && root.classList.contains('is-open');      // on phones the open panel is a bottom sheet
  function place(commit) {                                                                                  // commit: the user moved it, so the clamped spot becomes the remembered one
    if (sheet()) { root.style.right = root.style.bottom = ''; return; }
    const w = root.offsetWidth || 66, h = root.offsetHeight || 66, M = 8;
    const r = Math.max(M, Math.min(innerWidth - w - M, pos.r)), b = Math.max(M, Math.min(innerHeight - h - M, pos.b));
    if (commit) { pos.r = r; pos.b = b; }
    root.style.right = r + 'px'; root.style.bottom = b + 'px';
    root.classList.toggle('is-left', innerWidth - r - w < 300);                                         // near the left edge: the greeting opens to the right of the face
  }
  function drag(handle, allowed) {
    let st = null;
    handle.addEventListener('pointerdown', (e) => {
      if (e.button || (allowed && !allowed()) || e.target.closest('.nx-x')) return;
      st = { x: e.clientX, y: e.clientY, r: parseFloat(root.style.right) || pos.r, b: parseFloat(root.style.bottom) || pos.b, moved: false }; handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', (e) => {
      if (!st) return; const dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.moved && Math.hypot(dx, dy) < 6) return;
      if (!st.moved) { st.moved = true; root.classList.add('is-dragging'); hideHello(); }
      pos.r = st.r - dx; pos.b = st.b - dy; place(true);
    });
    const end = () => {
      if (!st) return; const moved = st.moved; st = null; root.classList.remove('is-dragging');
      if (moved) { dragged = true; setTimeout(() => { dragged = false; }, 0); try { localStorage.setItem('nx-chat-pos', JSON.stringify({ r: Math.round(pos.r), b: Math.round(pos.b) })); } catch (e) { /* ignore */ } }
    };
    handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
  }
  drag(fab); drag($('.nx-head'), () => !sheet());
  addEventListener('resize', place); place();
  /* a greeting pops up now and then (first after a few seconds, then about every 40 s) until the chat has been opened once;
     the x on the bubble silences it for this page view */
  let seen = false; try { seen = sessionStorage.getItem('nx-chat-seen') === '1'; } catch (e) { /* ignore */ }
  const nudge = seen ? 0 : setInterval(() => showHello(), 42000);
  if (!seen) setTimeout(() => showHello(), 3500);
})();
