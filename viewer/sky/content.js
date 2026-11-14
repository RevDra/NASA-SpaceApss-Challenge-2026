/* Copy for the welcome sky. Plain language first: every line should make sense to someone who has never read an
   astronomy page. Facts are stated conservatively; distances for the constellation stars come from SIMBAD
   (see tools/build_sky_data.py), the movers' figures from the project's own research notes. */

export const UI = {
  en: {
    skip: 'Skip to the viewer',
    enter: 'Enter the sky',
    heroKicker: 'NASA SPHEREx · Sky explorer',
    heroTitle: 'Look up. Then look again in six months.',
    heroSub: 'The SPHEREx telescope photographs the entire sky every six months. Stars that shift between visits are the ones worth finding. Start with the sky above you.',
    loading: 'Loading the sky',
    hint: ['Drag to look around', 'Scroll or pinch to zoom', 'Click a constellation name or a glowing ring'],
    hintDone: 'You can open the Sky guide any time',
    guide: 'Sky guide',
    guideTitle: 'Where do you want to look?',
    guideConst: 'Find your way',
    guideConstSub: 'Shapes people have used for thousands of years to navigate',
    guideMovers: 'Things that move',
    guideMoversSub: 'Real targets SPHEREx can catch changing',
    toggles: { lines: 'Constellation lines', names: 'Names', grid: 'Coordinate grid', movers: 'Things that move' },
    close: 'Close',
    howToFind: 'How to find it',
    didYouKnow: 'Worth knowing',
    brightest: 'Its stars, in real space',
    brightestNote: 'Distance from the Sun in light-years',
    see3d: 'See it in 3D',
    back: 'Back to the sky',
    from: 'From Earth',
    side: 'From the side',
    youAreHere: 'You are here',
    sun: 'Sun',
    depthTitle: 'The shape is an illusion',
    depthBody: 'These stars only line up when seen from Earth. Drag the slider, or drag the scene, to look from the side and see how far apart they really are.',
    lightLeft: 'Its light left in the year',
    ly: 'ly',
    movers: 'Why SPHEREx cares',
    moversBody: 'SPHEREx revisits every patch of sky about every six months. Comparing the visits shows what changed or moved.',
    watch: 'Watch it move',
    watchNote: 'Opens the live SPHEREx viewer centred on this object. The first load of a new field can take 20 to 30 seconds.',
    coords: 'Coordinates',
    constellationIn: 'In the constellation',
    distance: 'Distance',
    motion: 'Motion',
    kinds: { O: 'blue-white, extremely hot', B: 'blue-white, very hot', A: 'white', F: 'yellow-white', G: 'yellow, like the Sun', K: 'orange', M: 'red-orange, cool' },
    giants: { I: 'supergiant', II: 'bright giant', III: 'giant', IV: 'subgiant', V: '' },
    noWebgl: 'Your browser could not start the 3D sky. The guide still works: pick something to read about it.',
    legendMover: 'Ring = something that moves or changes',
    lang: 'Tiếng Việt',
    langLabel: 'Switch language to Vietnamese',
  },
  vi: {
    skip: 'Bỏ qua, vào trình xem',
    enter: 'Bước vào bầu trời',
    heroKicker: 'NASA SPHEREx · Khám phá bầu trời',
    heroTitle: 'Hãy nhìn lên. Rồi nhìn lại sau sáu tháng.',
    heroSub: 'Kính viễn vọng SPHEREx chụp toàn bộ bầu trời cứ sáu tháng một lần. Những ngôi sao dịch chuyển giữa hai lần chụp chính là thứ đáng đi tìm. Hãy bắt đầu từ bầu trời trên đầu bạn.',
    loading: 'Đang tải bầu trời',
    hint: ['Kéo chuột để nhìn quanh', 'Cuộn hoặc chụm hai ngón để phóng to', 'Bấm vào tên chòm sao hoặc vòng sáng'],
    hintDone: 'Bạn có thể mở Hướng dẫn bầu trời bất cứ lúc nào',
    guide: 'Hướng dẫn bầu trời',
    guideTitle: 'Bạn muốn ngắm gì?',
    guideConst: 'Tìm đường trên trời',
    guideConstSub: 'Những hình dạng con người dùng để định hướng hàng nghìn năm nay',
    guideMovers: 'Vật thể chuyển động',
    guideMoversSub: 'Mục tiêu thật mà SPHEREx có thể bắt gặp đang thay đổi',
    toggles: { lines: 'Nét nối chòm sao', names: 'Tên gọi', grid: 'Lưới toạ độ', movers: 'Vật thể chuyển động' },
    close: 'Đóng',
    howToFind: 'Cách tìm',
    didYouKnow: 'Điều thú vị',
    brightest: 'Các ngôi sao trong không gian thật',
    brightestNote: 'Khoảng cách từ Mặt Trời, tính bằng năm ánh sáng',
    see3d: 'Xem dạng 3D',
    back: 'Quay lại bầu trời',
    from: 'Từ Trái Đất',
    side: 'Nhìn ngang',
    youAreHere: 'Bạn ở đây',
    sun: 'Mặt Trời',
    depthTitle: 'Hình dạng này chỉ là ảo giác',
    depthBody: 'Các ngôi sao chỉ thẳng hàng khi nhìn từ Trái Đất. Kéo thanh trượt, hoặc kéo chuột trên cảnh, để nhìn từ bên cạnh và thấy chúng thực sự cách xa nhau thế nào.',
    lightLeft: 'Ánh sáng của nó rời đi vào năm',
    ly: 'năm ánh sáng',
    movers: 'Vì sao SPHEREx quan tâm',
    moversBody: 'SPHEREx quay lại từng mảng trời khoảng sáu tháng một lần. So sánh các lần chụp sẽ cho thấy cái gì đã đổi hoặc đã di chuyển.',
    watch: 'Xem nó di chuyển',
    watchNote: 'Mở trình xem SPHEREx trực tiếp, căn giữa vào vật thể này. Lần tải đầu của một vùng trời mới có thể mất 20 đến 30 giây.',
    coords: 'Toạ độ',
    constellationIn: 'Thuộc chòm sao',
    distance: 'Khoảng cách',
    motion: 'Chuyển động',
    kinds: { O: 'trắng xanh, cực nóng', B: 'trắng xanh, rất nóng', A: 'trắng', F: 'trắng vàng', G: 'vàng, giống Mặt Trời', K: 'cam', M: 'đỏ cam, lạnh hơn' },
    giants: { I: 'siêu khổng lồ', II: 'khổng lồ sáng', III: 'khổng lồ', IV: 'cận khổng lồ', V: '' },
    noWebgl: 'Trình duyệt không khởi động được bầu trời 3D. Phần hướng dẫn vẫn dùng được: chọn một mục để đọc.',
    legendMover: 'Vòng sáng = vật thể chuyển động hoặc thay đổi',
    lang: 'English',
    langLabel: 'Chuyển ngôn ngữ sang tiếng Anh',
  },
};

/* Constellations: the stars and lines come from sky-data.json, this is only what to say about them. */
export const CONSTELLATIONS = {
  Ari: {
    name: { en: 'Aries', vi: 'Bạch Dương' }, nick: { en: 'The Ram', vi: 'Con cừu đực' },
    find: { en: 'A short bent line of three stars north of the Pleiades: Hamal, Sheratan and Mesarthim.',
            vi: 'Một đường cong ngắn gồm ba ngôi sao ở phía bắc cụm Pleiades: Hamal, Sheratan và Mesarthim.' },
    fact: { en: 'On the March equinox the Sun no longer sits in Aries. Earth\u2019s slow wobble has carried that point into Pisces, though it is still called the first point of Aries.',
            vi: 'Vào ngày xuân phân, Mặt Trời không còn ở trong Bạch Dương nữa. Trục Trái Đất lắc chậm đã đưa điểm đó sang Song Ngư, dù nó vẫn được gọi là điểm đầu tiên của Bạch Dương.' },
  },
  Cnc: {
    name: { en: 'Cancer', vi: 'Cự Giải' }, nick: { en: 'The Crab', vi: 'Con cua' },
    find: { en: 'The faintest zodiac constellation: a dim upside-down Y between Gemini and Leo. On a dark night look for a hazy patch in the middle, the Beehive Cluster.',
            vi: 'Cung hoàng đạo mờ nhất: một chữ Y ngược lờ mờ giữa Song Tử và Sư Tử. Đêm tối trời, hãy tìm một mảng sương mờ ở giữa: cụm Tổ Ong.' },
    fact: { en: 'The Beehive Cluster, M44, holds around a thousand stars. Galileo was among the first to split it into single stars with a telescope, in 1610.',
            vi: 'Cụm Tổ Ong, M44, có chừng một nghìn ngôi sao. Galileo là một trong những người đầu tiên tách nó thành từng ngôi sao bằng kính thiên văn, năm 1610.' },
  },
  Vir: {
    name: { en: 'Virgo', vi: 'Xử Nữ' }, nick: { en: 'The Maiden', vi: 'Thiếu nữ' },
    find: { en: 'Follow the curve of the Big Dipper\u2019s handle to Arcturus, then keep going to Spica, the bright blue-white star of Virgo.',
            vi: 'Đi theo đường cong cán Bắc Đẩu tới Arcturus, rồi đi tiếp tới Spica, ngôi sao xanh trắng sáng của Xử Nữ.' },
    fact: { en: 'Virgo is the second largest constellation. Spica is really two hot stars so close that they circle each other in about four days.',
            vi: 'Xử Nữ là chòm sao lớn thứ hai. Spica thực ra là hai ngôi sao nóng gần nhau đến mức chúng quay quanh nhau trong khoảng bốn ngày.' },
  },
  Lib: {
    name: { en: 'Libra', vi: 'Thiên Bình' }, nick: { en: 'The Scales', vi: 'Cái cân' },
    find: { en: 'A lopsided box of four stars between Virgo and Scorpius.',
            vi: 'Một hình hộp lệch gồm bốn ngôi sao nằm giữa Xử Nữ và Thiên Yết.' },
    fact: { en: 'Its two brightest stars are named the southern claw and the northern claw, because long ago Libra was part of Scorpius. It is the only zodiac constellation that is an object, not a creature.',
            vi: 'Hai ngôi sao sáng nhất mang tên càng nam và càng bắc, vì ngày xưa Thiên Bình là một phần của Thiên Yết. Đây là cung hoàng đạo duy nhất là một vật chứ không phải sinh vật.' },
  },
  Sgr: {
    name: { en: 'Sagittarius', vi: 'Nhân Mã' }, nick: { en: 'The Archer', vi: 'Cung thủ' },
    find: { en: 'A teapot of eight stars. Its spout points toward Scorpius and its steam is the bright band of the Milky Way.',
            vi: 'Một chiếc ấm trà gồm tám ngôi sao. Vòi ấm hướng về Thiên Yết và hơi nước của nó là dải Ngân Hà sáng.' },
    fact: { en: 'The centre of our galaxy lies in the direction of Sagittarius, about 26,000 light-years away, hidden behind dust that infrared light can see through.',
            vi: 'Tâm thiên hà của chúng ta nằm theo hướng Nhân Mã, cách khoảng 26.000 năm ánh sáng, bị bụi che khuất mà ánh sáng hồng ngoại có thể xuyên qua.' },
  },
  Cap: {
    name: { en: 'Capricornus', vi: 'Ma Kết' }, nick: { en: 'The Sea-Goat', vi: 'Dê biển' },
    find: { en: 'A wide, dim triangle of stars like a smile, south-east of the bright star Altair.',
            vi: 'Một tam giác rộng, mờ, như nụ cười, nằm về phía đông nam ngôi sao sáng Altair.' },
    fact: { en: 'It is one of the oldest named constellations: Babylonian star lists drew a goat-fish here more than 3,000 years ago.',
            vi: 'Đây là một trong những chòm sao được đặt tên sớm nhất: danh sách sao của người Babylon đã vẽ một con dê-cá ở đây hơn 3.000 năm trước.' },
  },
  Aqr: {
    name: { en: 'Aquarius', vi: 'Bảo Bình' }, nick: { en: 'The Water Bearer', vi: 'Người mang nước' },
    find: { en: 'A faint, Y-shaped water jar south of Pegasus. Its brightest stars, Sadalsuud and Sadalmelik, are both named for luck.',
            vi: 'Một chiếc bình nước hình chữ Y mờ nhạt ở phía nam Phi Mã. Hai ngôi sao sáng nhất, Sadalsuud và Sadalmelik, đều có tên liên quan đến may mắn.' },
    fact: { en: 'Meteors of the Eta Aquariids, made of dust from Halley\u2019s Comet, seem to fly out of Aquarius in early May.',
            vi: 'Sao băng Eta Aquariids, làm từ bụi của sao chổi Halley, dường như bay ra từ Bảo Bình vào đầu tháng Năm.' },
  },
  Psc: {
    name: { en: 'Pisces', vi: 'Song Ngư' }, nick: { en: 'The Fishes', vi: 'Hai con cá' },
    find: { en: 'Two faint cords of stars forming a V, tied together at Alrescha, below the Square of Pegasus. Best seen from a dark place.',
            vi: 'Hai sợi dây sao mờ tạo thành chữ V, buộc lại ở Alrescha, bên dưới Hình vuông Phi Mã. Nhìn rõ nhất ở nơi tối.' },
    fact: { en: 'The March equinox, where the Sun crosses the celestial equator heading north, lies in Pisces today.',
            vi: 'Điểm xuân phân, nơi Mặt Trời cắt xích đạo thiên cầu đi lên phía bắc, ngày nay nằm trong Song Ngư.' },
  },
  Ori: {
    name: { en: 'Orion', vi: 'Orion' }, nick: { en: 'The Hunter', vi: 'Thợ săn' },
    find: { en: 'Look for three bright stars in a straight row. That is the Belt, and everything else hangs off it.',
            vi: 'Tìm ba ngôi sao sáng thẳng hàng. Đó là Vành đai Orion, mọi thứ còn lại treo quanh nó.' },
    fact: { en: 'Betelgeuse, the orange shoulder, is a star near the end of its life. It is so large that it would reach past the orbit of Mars if it sat where the Sun is.',
            vi: 'Betelgeuse, ngôi sao cam ở vai, là một ngôi sao gần cuối đời. Nó lớn đến mức nếu đặt vào chỗ Mặt Trời, nó sẽ vươn qua cả quỹ đạo sao Hoả.' },
  },
  UMa: {
    name: { en: 'Ursa Major', vi: 'Đại Hùng' }, nick: { en: 'The Big Dipper, inside the Great Bear', vi: 'Gấu Lớn, có "cái muôi" Bắc Đẩu' },
    find: { en: 'A ladle of seven stars. Follow the two stars at the end of the bowl, Dubhe and Merak, and they point to the Pole Star.',
            vi: 'Một cái muôi bảy ngôi sao. Đi theo hai ngôi sao ở mép muôi, Dubhe và Merak, bạn sẽ gặp Sao Bắc Cực.' },
    fact: { en: 'Five of the seven stars are travelling together through space, born from the same cloud. Dubhe and Alkaid are not part of that group, so over a very long time the ladle will bend out of shape.',
            vi: 'Năm trong bảy ngôi sao đang cùng nhau di chuyển trong không gian, sinh ra từ cùng một đám mây. Dubhe và Alkaid không thuộc nhóm đó, nên sau một thời gian rất dài, cái muôi sẽ méo đi.' },
  },
  Cas: {
    name: { en: 'Cassiopeia', vi: 'Tiên Hậu' }, nick: { en: 'The W in the northern sky', vi: 'Chữ W trên trời bắc' },
    find: { en: 'A zigzag shaped like a W or an M, on the opposite side of the Pole Star from the Big Dipper.',
            vi: 'Một đường zigzag hình chữ W hoặc M, nằm phía đối diện Sao Bắc Cực so với chòm Bắc Đẩu.' },
    fact: { en: 'The middle star, Gamma Cassiopeiae, spins so fast it throws off a ring of gas around itself.',
            vi: 'Ngôi sao ở giữa, Gamma Cassiopeiae, quay nhanh đến mức tự hất ra một vòng khí quanh mình.' },
  },
  Cru: {
    name: { en: 'Crux', vi: 'Nam Thập Tự' }, nick: { en: 'The Southern Cross', vi: 'Chữ thập phương Nam' },
    find: { en: 'Four stars in a small, tilted cross. The long arm points almost exactly at the south celestial pole. Seen from the tropics and the southern half of the world.',
            vi: 'Bốn ngôi sao tạo thành chữ thập nhỏ, hơi nghiêng. Cánh dài chỉ gần đúng về cực nam thiên cầu. Thấy được từ vùng nhiệt đới và nửa cầu nam.' },
    fact: { en: 'It is the smallest of the 88 official constellations, and one of the most useful for finding south.',
            vi: 'Đây là chòm nhỏ nhất trong 88 chòm sao chính thức, và là một trong những chòm hữu ích nhất để tìm hướng nam.' },
  },
  Cyg: {
    name: { en: 'Cygnus', vi: 'Thiên Nga' }, nick: { en: 'The Swan, or Northern Cross', vi: 'Thiên Nga, hay Chữ thập phương Bắc' },
    find: { en: 'A large cross lying along the Milky Way on summer nights. Deneb is the tail, Albireo the beak.',
            vi: 'Một chữ thập lớn nằm dọc Ngân Hà vào các đêm hè. Deneb là đuôi, Albireo là mỏ.' },
    fact: { en: 'Albireo looks like one star to the eye, but in a small telescope it splits into a gold star and a blue star side by side.',
            vi: 'Albireo nhìn bằng mắt thường chỉ là một ngôi sao, nhưng qua kính thiên văn nhỏ nó tách thành một sao vàng và một sao xanh cạnh nhau.' },
  },
  Leo: {
    name: { en: 'Leo', vi: 'Sư Tử' }, nick: { en: 'The Lion', vi: 'Sư tử' },
    find: { en: 'A backwards question mark, called the Sickle, marks the head and mane. Regulus is the dot at the bottom.',
            vi: 'Một dấu hỏi ngược, gọi là Lưỡi liềm, tạo nên đầu và bờm. Regulus là dấu chấm ở dưới.' },
    fact: { en: 'Regulus spins once in about 16 hours. That is so fast it bulges at the middle like a squashed ball.',
            vi: 'Regulus quay một vòng chỉ trong khoảng 16 giờ. Nhanh đến mức nó phình ra ở giữa như quả bóng bị ép.' },
  },
  Lyr: {
    name: { en: 'Lyra', vi: 'Thiên Cầm' }, nick: { en: 'The Lyre', vi: 'Đàn lia' },
    find: { en: 'Vega, one of the brightest stars in the sky, with a small slanted parallelogram next to it.',
            vi: 'Vega, một trong những ngôi sao sáng nhất trên trời, có một hình bình hành nhỏ nghiêng nằm cạnh.' },
    fact: { en: 'Earth\'s axis slowly wobbles. Vega was close to the north celestial pole about 12,000 years ago and will be again.',
            vi: 'Trục Trái Đất đảo chậm theo thời gian. Khoảng 12.000 năm trước Vega từng ở gần cực bắc thiên cầu, và sẽ có lại vị trí đó.' },
  },
  Tau: {
    name: { en: 'Taurus', vi: 'Kim Ngưu' }, nick: { en: 'The Bull', vi: 'Bò tót' },
    find: { en: 'A V-shape of stars with orange Aldebaran as a glowing eye. The tiny Pleiades cluster sits up and to the right.',
            vi: 'Một chữ V gồm các ngôi sao, với Aldebaran màu cam như con mắt đang cháy. Cụm Pleiades nhỏ nằm phía trên bên phải.' },
    fact: { en: 'Aldebaran looks like it belongs to the V of stars around it, but it is much closer to us. It only sits in the same line of sight.',
            vi: 'Aldebaran trông như thuộc về chữ V xung quanh, nhưng thực ra gần chúng ta hơn nhiều. Nó chỉ tình cờ nằm cùng hướng nhìn.' },
  },
  Gem: {
    name: { en: 'Gemini', vi: 'Song Tử' }, nick: { en: 'The Twins', vi: 'Cặp song sinh' },
    find: { en: 'Two bright stars side by side, Castor and Pollux, each with a long line of stars trailing like a body.',
            vi: 'Hai ngôi sao sáng đứng cạnh nhau, Castor và Pollux, mỗi sao có một hàng sao kéo dài như thân người.' },
    fact: { en: 'Castor looks like a single star, but it is really six stars orbiting each other.',
            vi: 'Castor trông như một ngôi sao, nhưng thực ra là sáu ngôi sao quay quanh nhau.' },
  },
  CMa: {
    name: { en: 'Canis Major', vi: 'Đại Khuyển' }, nick: { en: 'The Great Dog', vi: 'Chó lớn' },
    find: { en: 'Follow the line of Orion\'s Belt down and to the left. The brightest star in the night sky, Sirius, is the dog\'s nose.',
            vi: 'Đi theo đường thẳng của Vành đai Orion xuống dưới và sang trái. Ngôi sao sáng nhất bầu trời đêm, Sirius, là mũi con chó.' },
    fact: { en: 'Sirius is only about 8.6 light-years away, one of our nearest neighbours. That is why it outshines everything else.',
            vi: 'Sirius chỉ cách khoảng 8,6 năm ánh sáng, là một trong những láng giềng gần nhất. Vì thế nó sáng hơn mọi ngôi sao khác.' },
  },
  Sco: {
    name: { en: 'Scorpius', vi: 'Thiên Yết' }, nick: { en: 'The Scorpion', vi: 'Bọ cạp' },
    find: { en: 'A red star for the heart, then a long curving tail ending in a hooked stinger. Low in the south from the northern hemisphere.',
            vi: 'Một ngôi sao đỏ là trái tim, rồi cái đuôi dài cong kết thúc bằng ngòi độc. Từ bắc bán cầu, chòm này nằm thấp về phía nam.' },
    fact: { en: 'The name Antares means "rival of Mars" in Greek, because its red colour looks so much like the planet.',
            vi: 'Tên Antares trong tiếng Hy Lạp nghĩa là "đối thủ của sao Hoả", vì màu đỏ của nó rất giống hành tinh đó.' },
  },
};

/* The five movers and variables from the project's research notes. RA/Dec in degrees (J2000-ish, current position for
   fast movers). `band` and `fov` are handed to the live viewer. */
export const MOVERS = [
  {
    id: 'barnard', ra: 269.4466, dec: 4.768, band: 'SD2', fov: 120, constellation: 'Ophiuchus',
    name: { en: "Barnard's Star", vi: 'Sao Barnard' }, kind: { en: 'A runaway red dwarf', vi: 'Sao lùn đỏ chạy nhanh' },
    story: { en: 'No known star crosses our sky faster. In about 180 years it shifts by the width of the full Moon, which you can see across a handful of SPHEREx visits.',
             vi: 'Không có ngôi sao nào được biết là lướt qua bầu trời nhanh hơn. Khoảng 180 năm nó dịch bằng bề rộng của Mặt Trăng tròn, và bạn có thể thấy sự dịch chuyển này qua vài lần SPHEREx ghé thăm.' },
    stats: { distance: { en: '6.0 light-years', vi: '6,0 năm ánh sáng' }, motion: { en: '10.3 arcseconds per year', vi: '10,3 giây cung mỗi năm' } },
  },
  {
    id: 'wise0855', ra: 133.786245, dec: -7.244372, band: 'SD6', fov: 120, constellation: 'Hydra',
    name: { en: 'WISE 0855−0714', vi: 'WISE 0855−0714' }, kind: { en: 'The coldest brown dwarf found', vi: 'Sao lùn nâu lạnh nhất từng tìm thấy' },
    story: { en: 'A failed star, too small to shine like the Sun and so cold that it is no hotter than a chilly day on Earth. It only glows in the infrared, which is exactly where SPHEREx looks.',
             vi: 'Một "ngôi sao hỏng", quá nhỏ để toả sáng như Mặt Trời và lạnh đến mức không nóng hơn một ngày se lạnh trên Trái Đất. Nó chỉ phát sáng trong hồng ngoại, đúng nơi SPHEREx quan sát.' },
    stats: { distance: { en: '7.4 light-years', vi: '7,4 năm ánh sáng' }, motion: { en: '8.1 arcseconds per year', vi: '8,1 giây cung mỗi năm' } },
  },
  {
    id: 'epsindib', ra: 330.84, dec: -56.785, band: 'SD2', fov: 120, constellation: 'Indus',
    name: { en: 'Epsilon Indi B', vi: 'Epsilon Indi B' }, kind: { en: 'A pair of brown dwarfs next door', vi: 'Cặp sao lùn nâu láng giềng' },
    story: { en: 'Two brown dwarfs orbiting each other, travelling with a nearby Sun-like star. Because they are so close, they drift visibly against the background.',
             vi: 'Hai sao lùn nâu quay quanh nhau, đi cùng một ngôi sao giống Mặt Trời gần đó. Vì ở rất gần, chúng trôi rõ rệt so với nền sao phía sau.' },
    stats: { distance: { en: '11.9 light-years', vi: '11,9 năm ánh sáng' }, motion: { en: '4.7 arcseconds per year', vi: '4,7 giây cung mỗi năm' } },
  },
  {
    id: 'rwaur', ra: 76.956, dec: 30.401, band: 'SD2', fov: 120, constellation: 'Auriga',
    name: { en: 'RW Aurigae', vi: 'RW Aurigae' }, kind: { en: 'A young star that flickers', vi: 'Ngôi sao trẻ nhấp nháy' },
    story: { en: 'A baby star still swallowing the gas and dust around it. Its brightness jumps and dips with no fixed schedule, so two visits rarely match.',
             vi: 'Một ngôi sao còn rất non, đang nuốt khí và bụi xung quanh. Độ sáng của nó tăng giảm không theo lịch cố định, nên hai lần chụp hiếm khi giống nhau.' },
    stats: { distance: { en: 'Roughly 450 light-years', vi: 'Khoảng 450 năm ánh sáng' }, motion: { en: 'Changes brightness, does not travel far', vi: 'Đổi độ sáng, không di chuyển nhiều' } },
  },
  {
    id: 'rdra', ra: 248.167, dec: 66.755, band: 'SD3', fov: 120, constellation: 'Draco',
    name: { en: 'R Draconis', vi: 'R Draconis' }, kind: { en: 'A giant star that breathes', vi: 'Ngôi sao khổng lồ biết "thở"' },
    story: { en: 'An old giant that swells and shrinks, brightening and fading by a factor of hundreds over roughly eight months. Two SPHEREx visits can catch it at very different moments.',
             vi: 'Một ngôi sao khổng lồ già, phồng lên rồi co lại, sáng lên và mờ đi hàng trăm lần trong khoảng tám tháng. Hai lần SPHEREx ghé thăm có thể bắt được nó ở hai trạng thái rất khác nhau.' },
    stats: { distance: { en: 'Far beyond the nearest stars', vi: 'Xa hơn nhiều so với các sao gần nhất' }, motion: { en: 'About 246 days from peak to peak', vi: 'Khoảng 246 ngày từ đỉnh này đến đỉnh sau' } },
  },
];

/* ------------------------------------------------------------------ real-time sky additions */
const MORE = {
  en: {
    modeMap: 'Sky map', modeLocal: 'My sky',
    startTitle: 'Start here',
    startSub: 'Not sure where to look? Pick one. The Sky guide has everything else.',
    startItems: [
      ['What is in the sky right now', 'The Moon, the planets and any meteor shower tonight'],
      ['Learn one constellation', 'Orion, found by its row of three stars'],
      ['Catch a star that moves', "Barnard's Star races across the sky"],
      ['Watch the sky move', 'Play one week per second and follow the Moon and planets'],
    ],
    layersBtn: 'Layers', layersTitle: 'What to show',
    layers: {
      lines: ['Constellation lines', 'The figures used to find your way'],
      names: ['Names', 'Labels on the sky'],
      grid: ['Coordinate grid', 'Right ascension and declination, the numbers the SPHEREx viewer asks for'],
      bodies: ['Sun, Moon and planets', 'Placed from NASA JPL Horizons for the time on the clock'],
      comets: ['Comets', 'Real comets from JPL. Many are too faint to see without a large telescope'],
      meteors: ['Meteors', 'Showers active on the clock date. Rates are boosted tenfold so you can see them; the true rate is in each shower panel'],
      movers: ['Things that move', "Targets from this project's research notes"],
      clouds: ['Clouds', 'Decorative drifting clouds in My sky (not real weather)'],
    },
    timeSpeed: 'Speed', timeDate: 'Date and time', timeNow: 'Now', timePause: 'Pause time', timePlay: 'Play time', timeRev: 'Run time backwards',
    speeds: ['Live', '1 minute per second', '1 hour per second', '1 day per second', '1 week per second', '1 month per second'],
    timeOut: 'Planet and comet positions cover 1 Jan 2025 to 31 Dec 2027. The clock stopped at the edge.',
    colBtn: 'Collection', saveBtn: 'Save to my collection', savedOk: 'Saved to My collection', simbadFor: 'Search SIMBAD for \u201c{q}\u201d', simbadWait: 'Looking up \u201c{q}\u201d\u2026', simbadNone: 'No object called \u201c{q}\u201d. Try a catalogue name such as HD 10700 or M 42.', foundLabel: 'Found in SIMBAD', foundDist: 'Moves', snapNote: 'The picture is the sky on your screen.',
    siteTitle: 'Where are you looking from?', siteGeo: 'Use my location',
    sitePrivacy: 'Your location is used only inside this tab to turn the sky. It is never sent anywhere.',
    dkTitle: 'Dark-sky places', dkSub: 'Observatory sites and protected reserves with very little light pollution. The tag says whether the sky there is dark right now.',
    dk: { night: 'Dark night', nautical: 'Late twilight', twilight: 'Twilight', day: 'Daylight' }, dkMoonUp: 'Moon is up', dkMoonDown: 'no Moon',
    dkKind: { obs: 'Observatory site', ida: 'IDA dark-sky reserve', starlight: 'Starlight reserve' },
    belowNow: '{n} is below your horizon right now, so here is the sky map instead.',
    siteHere: 'Your location', geoDenied: 'Location is blocked or unavailable. Pick a city instead.',
    searchLabel: 'Find a star, planet or constellation', searchNone: 'No match',
    guideNow: 'Right now', guideNowSub: 'At the time on the clock',
    guideShowers: 'Meteor showers', guideShowersNone: 'No shower is near its peak on this date.',
    guideComets: 'Comets', guideCometsSub: 'Real comets tracked by JPL',
    mag: 'brightness', magShort: 'mag', aboveHorizon: 'above the horizon', belowHorizon: 'below the horizon',
    lit: 'lit', phases: { new: 'New Moon', 'waxing-crescent': 'Waxing crescent', 'first-quarter': 'First quarter', 'waxing-gibbous': 'Waxing gibbous', full: 'Full Moon', 'waning-gibbous': 'Waning gibbous', 'last-quarter': 'Last quarter', 'waning-crescent': 'Waning crescent' },
    fDist: 'Distance', fDistEarth: 'Distance from Earth', fLight: 'Light travel time', fMag: 'Brightness (V)', fTemp: 'Surface temperature', fLum: 'True brightness', fType: 'Spectral type', fMotion: 'Drift across the sky', fPos: 'Position, J2000', fAlt: 'Right now in your sky',
    fRange: 'Distance from the Sun', fPeri: 'Closest to the Sun', fClose: 'Closest to Earth', fBest: 'Brightest (predicted)', fRadiant: 'Radiant', fPeak: 'Peak', fRate: 'Meteors per hour', fSpeed: 'Entry speed', fParent: 'Parent body', fNow: 'Activity now',
    au: 'AU', lightMin: 'light-minutes', lightHr: 'light-hours', kmps: 'km/s',
    starTempNote: 'Estimated from its colour (B−V)', starLumNote: 'times the Sun',
    moonWidth: 'One Moon-width every {n} years', noMotion: 'Too slow to measure by eye',
    colourWord: { O: 'Blue', B: 'Blue-white', A: 'White', F: 'Yellow-white', G: 'Yellow', K: 'Orange', M: 'Red' },
    classNoun: { I: 'supergiant', II: 'bright giant', III: 'giant', IV: 'subgiant', V: 'main-sequence star' },
    classHint: { V: 'fuses hydrogen, like the Sun' },
    imgTitle: 'Real sky photographs', imgNote: 'NASA SkyView · Digitized Sky Survey. Same patch of sky, about 40 years apart.',
    img1: 'POSS-I · 1950s', img2: 'POSS-II · 1980s to 90s', imgFail: 'Image service did not answer. Try again later.',
    imgIr: 'Too cold to show on these plates. It only glows in the infrared, which is why SPHEREx is needed.',
    openViewer: 'Open this patch in the SPHEREx viewer', viewerNote: 'Bright stars saturate SPHEREx, so look at the field around them.',
    tailNote: 'The tail always points away from the Sun, pushed by sunlight and the solar wind. Its length here is illustrative; the direction is real.',
    cometFaint: 'Too faint to see without a large telescope right now.',
    cometBright: 'Predicted brightness from JPL. Comets are unpredictable and can brighten or fade.',
    jplLink: 'Open in JPL Small-Body Database',
    showerWhat: 'Meteors in a shower look like they spring from one point, the radiant. They are grains of dust left behind by a comet, burning up as Earth ploughs through the trail.',
    daysBefore: '{n} days before the peak', daysAfter: '{n} days after the peak', atPeak: 'At the peak',
    sunWarn: 'Never look at the Sun without proper eclipse glasses.',
    compass: { N: 'N', E: 'E', S: 'S', W: 'W' },
    tipDrift: 'moves {a}″ a year',
    constLabel: 'Constellation', moverLabel: 'Moves or changes', starLabel: 'Star', moonLabel: 'Moon', planetLabel: 'Planet', cometLabel: 'Comet', showerLabel: 'Meteor shower',
    cometFacts: "From JPL's table", cometFaintShort: 'too faint to see', yr: 'yr',
    hint: ['Drag to look around', 'Scroll or pinch to zoom', 'Click a star, planet or constellation name'],
    here: 'You were looking here',
    toastTime: 'Time set',
    liveObservation: 'Live observation (JPL Horizons)', physicalProfile: 'Physical & orbital profile',
    photoCredit: 'Photo', nasaExplore: 'NASA Solar System Exploration',
    specDiameter: 'Diameter', specMass: 'Mass', specGravity: 'Gravity',
    specDistSun: 'Distance to Sun', specOrbit: 'Orbital period', specDay: 'Day length',
    specTemp: 'Temperature', specAtmosphere: 'Atmosphere', specMoons: 'Moons', specMissions: 'Key missions',
  },
  vi: {
    modeMap: 'Bản đồ sao', modeLocal: 'Bầu trời của tôi',
    startTitle: 'Bắt đầu từ đây',
    startSub: 'Chưa biết nhìn đâu? Chọn một mục. Phần còn lại có trong Hướng dẫn bầu trời.',
    startItems: [
      ['Bây giờ trên trời có gì', 'Mặt Trăng, các hành tinh và mưa sao băng đêm nay'],
      ['Học một chòm sao', 'Orion, nhận ra bằng hàng ba ngôi sao thẳng hàng'],
      ['Bắt một ngôi sao đang chạy', 'Sao Barnard lướt qua bầu trời'],
      ['Xem bầu trời chuyển động', 'Chạy một tuần mỗi giây và theo dõi Mặt Trăng, hành tinh'],
    ],
    layersBtn: 'Lớp hiển thị', layersTitle: 'Hiện những gì',
    layers: {
      lines: ['Nét nối chòm sao', 'Các hình dùng để tìm đường'],
      names: ['Tên gọi', 'Nhãn trên bầu trời'],
      grid: ['Lưới toạ độ', 'Xích kinh và xích vĩ, đúng những con số trình xem SPHEREx cần'],
      bodies: ['Mặt Trời, Mặt Trăng, hành tinh', 'Đặt theo NASA JPL Horizons tại thời điểm trên đồng hồ'],
      comets: ['Sao chổi', 'Sao chổi thật từ JPL. Nhiều cái quá mờ, cần kính thiên văn lớn mới thấy'],
      meteors: ['Sao băng', 'Mưa sao băng đang hoạt động vào ngày trên đồng hồ. Tần suất được tăng mười lần để bạn nhìn thấy; tần suất thật nằm trong bảng thông tin từng mưa sao băng'],
      movers: ['Vật thể chuyển động', 'Các mục tiêu trong ghi chú nghiên cứu của dự án'],
      clouds: ['Mây', 'Mây trang trí trôi nhẹ trong "Bầu trời của tôi" (không phải thời tiết thật)'],
    },
    timeSpeed: 'Tốc độ', timeDate: 'Ngày và giờ', timeNow: 'Bây giờ', timePause: 'Tạm dừng thời gian', timePlay: 'Chạy thời gian', timeRev: 'Chạy ngược thời gian',
    speeds: ['Trực tiếp', '1 phút mỗi giây', '1 giờ mỗi giây', '1 ngày mỗi giây', '1 tuần mỗi giây', '1 tháng mỗi giây'],
    timeOut: 'Vị trí hành tinh và sao chổi có từ 1/1/2025 đến 31/12/2027. Đồng hồ đã dừng ở mép dữ liệu.',
    colBtn: 'Bộ sưu tập', saveBtn: 'Lưu vào bộ sưu tập', savedOk: 'Đã lưu vào Bộ sưu tập', simbadFor: 'Tìm \u201c{q}\u201d trong SIMBAD', simbadWait: 'Đang tra \u201c{q}\u201d\u2026', simbadNone: 'Không có vật thể nào tên \u201c{q}\u201d. Thử tên danh mục như HD 10700 hoặc M 42.', foundLabel: 'Tìm thấy trong SIMBAD', foundDist: 'Chuyển động', snapNote: 'Ảnh là bầu trời trên màn hình bạn.',
    siteTitle: 'Bạn đang nhìn từ đâu?', siteGeo: 'Dùng vị trí của tôi',
    sitePrivacy: 'Vị trí chỉ được dùng ngay trong tab này để xoay bầu trời. Không gửi đi đâu cả.',
    dkTitle: 'Vùng trời tối', dkSub: 'Đài thiên văn và khu bảo tồn có rất ít ô nhiễm ánh sáng. Nhãn cho biết lúc này trời ở đó có tối không.',
    dk: { night: 'Đêm tối', nautical: 'Hoàng hôn muộn', twilight: 'Hoàng hôn', day: 'Ban ngày' }, dkMoonUp: 'có Trăng', dkMoonDown: 'không Trăng',
    dkKind: { obs: 'Đài thiên văn', ida: 'Khu bảo tồn trời tối IDA', starlight: 'Khu bảo tồn Starlight' },
    belowNow: '{n} đang ở dưới đường chân trời của bạn, nên tôi chuyển sang bản đồ sao.',
    siteHere: 'Vị trí của bạn', geoDenied: 'Vị trí bị chặn hoặc không có. Hãy chọn một thành phố.',
    searchLabel: 'Tìm một ngôi sao, hành tinh hoặc chòm sao', searchNone: 'Không có kết quả',
    guideNow: 'Ngay bây giờ', guideNowSub: 'Tại thời điểm trên đồng hồ',
    guideShowers: 'Mưa sao băng', guideShowersNone: 'Ngày này không có mưa sao băng nào gần đỉnh.',
    guideComets: 'Sao chổi', guideCometsSub: 'Sao chổi thật do JPL theo dõi',
    mag: 'độ sáng', magShort: 'cấp', aboveHorizon: 'trên đường chân trời', belowHorizon: 'dưới đường chân trời',
    lit: 'sáng', phases: { new: 'Trăng non', 'waxing-crescent': 'Trăng lưỡi liềm đầu tháng', 'first-quarter': 'Trăng bán nguyệt đầu tháng', 'waxing-gibbous': 'Trăng khuyết đầu tháng', full: 'Trăng tròn', 'waning-gibbous': 'Trăng khuyết cuối tháng', 'last-quarter': 'Trăng bán nguyệt cuối tháng', 'waning-crescent': 'Trăng lưỡi liềm cuối tháng' },
    fDist: 'Khoảng cách', fDistEarth: 'Cách Trái Đất', fLight: 'Ánh sáng đi mất', fMag: 'Độ sáng (V)', fTemp: 'Nhiệt độ bề mặt', fLum: 'Độ sáng thật', fType: 'Loại phổ', fMotion: 'Trôi trên bầu trời', fPos: 'Toạ độ, J2000', fAlt: 'Trên bầu trời của bạn lúc này',
    fRange: 'Cách Mặt Trời', fPeri: 'Gần Mặt Trời nhất', fClose: 'Gần Trái Đất nhất', fBest: 'Sáng nhất (dự đoán)', fRadiant: 'Điểm phát', fPeak: 'Đỉnh', fRate: 'Sao băng mỗi giờ', fSpeed: 'Tốc độ vào khí quyển', fParent: 'Thiên thể mẹ', fNow: 'Mức hoạt động hiện tại',
    au: 'AU', lightMin: 'phút ánh sáng', lightHr: 'giờ ánh sáng', kmps: 'km/s',
    starTempNote: 'Ước tính từ màu sắc (B−V)', starLumNote: 'lần Mặt Trời',
    moonWidth: 'Mỗi {n} năm trôi một bề rộng Mặt Trăng', noMotion: 'Quá chậm để thấy bằng mắt',
    colourWord: { O: 'Xanh', B: 'Trắng xanh', A: 'Trắng', F: 'Trắng vàng', G: 'Vàng', K: 'Cam', M: 'Đỏ' },
    classNoun: { I: 'siêu khổng lồ', II: 'khổng lồ sáng', III: 'khổng lồ', IV: 'cận khổng lồ', V: 'sao dãy chính' },
    classHint: { V: 'đốt hydro, giống Mặt Trời' },
    imgTitle: 'Ảnh chụp bầu trời thật', imgNote: 'NASA SkyView · Digitized Sky Survey. Cùng một vùng trời, cách nhau khoảng 40 năm.',
    img1: 'POSS-I · thập niên 1950', img2: 'POSS-II · thập niên 1980 đến 90', imgFail: 'Dịch vụ ảnh không phản hồi. Hãy thử lại sau.',
    imgIr: 'Quá lạnh nên không hiện trên các tấm kính này. Nó chỉ phát sáng trong hồng ngoại, đó là lý do cần SPHEREx.',
    openViewer: 'Mở vùng trời này trong trình xem SPHEREx', viewerNote: 'Sao sáng sẽ bão hoà trong SPHEREx, hãy nhìn vùng xung quanh chúng.',
    tailNote: 'Đuôi luôn hướng ra xa Mặt Trời, bị đẩy bởi ánh sáng và gió Mặt Trời. Độ dài ở đây chỉ mang tính minh hoạ; hướng là thật.',
    cometFaint: 'Hiện quá mờ, cần kính thiên văn lớn mới thấy.',
    cometBright: 'Độ sáng dự đoán từ JPL. Sao chổi khó đoán, có thể sáng lên hoặc mờ đi.',
    jplLink: 'Mở trong cơ sở dữ liệu thiên thể nhỏ của JPL',
    showerWhat: 'Sao băng trong một mưa sao băng trông như toả ra từ một điểm, gọi là điểm phát. Chúng là hạt bụi sao chổi để lại, cháy sáng khi Trái Đất đi xuyên qua vệt bụi.',
    daysBefore: 'Còn {n} ngày nữa đến đỉnh', daysAfter: 'Đã qua đỉnh {n} ngày', atPeak: 'Đang ở đỉnh',
    sunWarn: 'Đừng bao giờ nhìn thẳng vào Mặt Trời nếu không có kính lọc chuyên dụng.',
    compass: { N: 'B', E: 'Đ', S: 'N', W: 'T' },
    tipDrift: 'trôi {a}″ mỗi năm',
    constLabel: 'Chòm sao', moverLabel: 'Chuyển động hoặc đổi sáng', starLabel: 'Ngôi sao', moonLabel: 'Mặt Trăng', planetLabel: 'Hành tinh', cometLabel: 'Sao chổi', showerLabel: 'Mưa sao băng',
    cometFacts: 'Từ bảng dữ liệu của JPL', cometFaintShort: 'quá mờ để thấy', yr: 'năm',
    hint: ['Kéo chuột để nhìn quanh', 'Cuộn hoặc chụm hai ngón để phóng to', 'Bấm vào một ngôi sao, hành tinh hoặc tên chòm sao'],
    here: 'Bạn vừa xem chỗ này',
    toastTime: 'Đã đặt thời gian',
    liveObservation: 'Quan sát thời gian thực (JPL Horizons)', physicalProfile: 'Hồ sơ vật lý & quỹ đạo',
    photoCredit: 'Ảnh chụp', nasaExplore: 'Khám phá Hệ Mặt Trời (NASA)',
    specDiameter: 'Đường kính', specMass: 'Khối lượng', specGravity: 'Trọng lực bề mặt',
    specDistSun: 'Khoảng cách tới Mặt Trời', specOrbit: 'Chu kỳ quỹ đạo', specDay: 'Độ dài ngày',
    specTemp: 'Nhiệt độ', specAtmosphere: 'Bầu khí quyển', specMoons: 'Vệ tinh tự nhiên', specMissions: 'Nhiệm vụ thám hiểm',
  },
};
Object.assign(UI.en, MORE.en);
Object.assign(UI.vi, MORE.vi);

/* Solar-system bodies: official NASA imagery, physical specs and plain-language guides. Numbers (distance, brightness, phase) are computed live. */
export const BODIES = {
  sun: {
    name: { en: 'Sun', vi: 'Mặt Trời' }, colour: [1, 0.88, 0.62],
    image: 'sky/assets/planets/sun.jpg', credit: 'NASA / SDO (Solar Dynamics Observatory)',
    type: { en: 'Yellow Dwarf Star (G2V)', vi: 'Sao lùn vàng (G2V) · Trung tâm Hệ Mặt Trời' },
    caption: {
      en: 'Extreme ultraviolet portrait of the Sun by NASA SDO, revealing coronal loops, dynamic solar flares, and plasma arcs.',
      vi: 'Chân dung cực tím của Mặt Trời từ vệ tinh NASA SDO, làm nổi bật các cung từ trường và bão plasma rực lửa.'
    },
    story: {
      en: 'Our own star. It contains 99.86% of all mass in the Solar System. Everything on the clock is measured from where it sits, and the whole sky bends around its daylight.',
      vi: 'Ngôi sao của chúng ta, chiếm tới 99,86% tổng khối lượng toàn Hệ Mặt Trời. Mọi thứ trên đồng hồ đều được tính theo vị trí của nó, và cả bầu trời bị ánh sáng ban ngày của nó che lấp.'
    },
    specs: {
      diameter: { en: '1,392,700 km (109 × Earth)', vi: '1.392.700 km (109 × Trái Đất)' },
      mass: { en: '1.989 × 10³⁰ kg (333,000 × Earth)', vi: '1,989 × 10³⁰ kg (333.000 × Trái Đất)' },
      gravity: { en: '274 m/s² (28 × Earth)', vi: '274 m/s² (28 × Trái Đất)' },
      day: { en: '25–35 Earth days (differential rotation)', vi: '25–35 ngày Trái Đất (quay vi sai)' },
      temp: { en: '5,500°C (surface) · 15,000,000°C (core)', vi: '5.500°C (bề mặt) · 15.000.000°C (lõi)' },
      atmosphere: { en: '73.4% Hydrogen, 25.0% Helium plasma', vi: '73,4% Hydro, 25,0% Heli (plasma)' },
      missions: { en: 'SOHO, SDO, Parker Solar Probe, Solar Orbiter', vi: 'SOHO, SDO, Parker Solar Probe, Solar Orbiter' }
    }
  },
  moon: {
    name: { en: 'Moon', vi: 'Mặt Trăng' }, colour: [0.93, 0.92, 0.88],
    image: 'sky/assets/planets/moon.jpg', credit: 'NASA / USGS / Galileo',
    type: { en: 'Earth’s Natural Satellite', vi: 'Vệ tinh tự nhiên duy nhất của Trái Đất' },
    caption: {
      en: 'Full disc view of the Moon by NASA Galileo spacecraft, highlighting the dark volcanic maria and ancient impact highlands.',
      vi: 'Toàn cảnh bề mặt Mặt Trăng chụp bởi tàu NASA Galileo, làm rõ các biển tối (dung nham bazan cổ đại) và hố va chạm dày đặc.'
    },
    story: {
      en: 'The shape you see is real: it is the share of the Moon lit by the Sun, as seen from Earth right now. Because of tidal locking, it always shows us the exact same face.',
      vi: 'Hình dạng bạn thấy là thật: đó là phần Mặt Trăng được Mặt Trời chiếu sáng, nhìn từ Trái Đất ngay lúc này. Do hiện tượng khóa thủy triều, nó luôn hướng cùng một mặt về phía ta.'
    },
    specs: {
      diameter: { en: '3,474 km (0.27 × Earth)', vi: '3.474 km (0,27 × Trái Đất)' },
      mass: { en: '7.35 × 10²² kg (0.012 × Earth)', vi: '7,35 × 10²² kg (0,012 × Trái Đất)' },
      gravity: { en: '1.62 m/s² (1/6 Earth gravity)', vi: '1,62 m/s² (bằng 1/6 Trái Đất)' },
      orbit: { en: '27.3 Earth days around Earth', vi: '27,3 ngày quay quanh Trái Đất' },
      day: { en: '27.3 Earth days (tidally locked)', vi: '27,3 ngày Trái Đất (bị khóa thủy triều)' },
      temp: { en: '-130°C to +120°C (no air buffer)', vi: '-130°C đến +120°C (không có khí quyển điều hòa)' },
      atmosphere: { en: 'Nearly vacuum (extremely thin exosphere)', vi: 'Gần như chân không (exosphere siêu mỏng)' },
      moons: { en: '0', vi: '0' },
      missions: { en: 'Apollo 11–17, LRO, Chang\u2019e, Artemis', vi: 'Apollo 11–17, LRO, Thường Nga, Artemis' }
    }
  },
  mercury: {
    name: { en: 'Mercury', vi: 'Sao Thủy' }, colour: [0.78, 0.74, 0.7],
    image: 'sky/assets/planets/mercury.jpg', credit: 'NASA / JHUAPL / Carnegie (MESSENGER)',
    type: { en: 'Terrestrial Planet', vi: 'Hành tinh đất đá gần Mặt Trời nhất' },
    caption: {
      en: 'Enhanced-color global mosaic by NASA MESSENGER, accentuating subtle mineral and chemical differences across cratered terrains.',
      vi: 'Ảnh ghép màu tăng cường từ tàu NASA MESSENGER, hé lộ thành phần khoáng vật và vô số miệng hố trên bề mặt Sao Thủy.'
    },
    story: {
      en: 'The closest planet to the Sun and the smallest in the Solar System. It never strays far from the Sun, so you only see it low in the dusk or dawn twilight.',
      vi: 'Hành tinh nhỏ nhất và gần Mặt Trời nhất. Nó không bao giờ rời xa Mặt Trời nên bạn chỉ có thể chiêm ngưỡng nó ở vị trí thấp trong ánh chiều tà hoặc bình minh.'
    },
    specs: {
      diameter: { en: '4,879 km (0.38 × Earth)', vi: '4.879 km (0,38 × Trái Đất)' },
      mass: { en: '3.30 × 10²³ kg (0.055 × Earth)', vi: '3,30 × 10²³ kg (0,055 × Trái Đất)' },
      gravity: { en: '3.70 m/s² (0.38 × Earth)', vi: '3,70 m/s² (0,38 × Trái Đất)' },
      distSun: { en: '0.387 AU (57.9 million km)', vi: '0,387 AU (57,9 triệu km)' },
      orbit: { en: '88 Earth days', vi: '88 ngày Trái Đất' },
      day: { en: '58.6 Earth days', vi: '58,6 ngày Trái Đất' },
      temp: { en: '-180°C (night) to +430°C (day)', vi: '-180°C (đêm) đến +430°C (ngày)' },
      atmosphere: { en: 'Trace exosphere (Oxygen, Sodium, Hydrogen)', vi: 'Khí quyển siêu loãng (Oxy, Natri, Hydro)' },
      moons: { en: '0', vi: '0' },
      missions: { en: 'Mariner 10, MESSENGER, BepiColombo', vi: 'Mariner 10, MESSENGER, BepiColombo' }
    }
  },
  venus: {
    name: { en: 'Venus', vi: 'Sao Kim' }, colour: [1, 0.96, 0.82],
    image: 'sky/assets/planets/venus.jpg', credit: 'NASA / JPL (Magellan)',
    type: { en: 'Terrestrial Planet', vi: 'Hành tinh đất đá · Sao Hôm / Sao Mai' },
    caption: {
      en: 'Global radar elevation map from NASA Magellan spacecraft, cutting through dense sulfuric acid clouds to reveal volcanic domes.',
      vi: 'Bản đồ radar toàn cầu của Sao Kim từ tàu NASA Magellan, nhìn xuyên qua tầng mây dày đặc để làm rõ các vòm núi lửa.'
    },
    story: {
      en: 'The brightest planet in the night sky. Thick reflective clouds cause an extreme runaway greenhouse effect, making its surface hotter than an oven day and night.',
      vi: 'Hành tinh sáng nhất trên bầu trời đêm. Lớp mây dày đặc gây ra hiệu ứng nhà kính cực độ, biến bề mặt Sao Kim thành một "lò lửa" nóng hơn cả Sao Thủy suốt ngày đêm.'
    },
    specs: {
      diameter: { en: '12,104 km (0.95 × Earth)', vi: '12.104 km (0,95 × Trái Đất)' },
      mass: { en: '4.87 × 10²⁴ kg (0.815 × Earth)', vi: '4,87 × 10²⁴ kg (0,815 × Trái Đất)' },
      gravity: { en: '8.87 m/s² (0.90 × Earth)', vi: '8,87 m/s² (0,90 × Trái Đất)' },
      distSun: { en: '0.723 AU (108.2 million km)', vi: '0,723 AU (108,2 triệu km)' },
      orbit: { en: '224.7 Earth days', vi: '224,7 ngày Trái Đất' },
      day: { en: '243 Earth days (spins backward)', vi: '243 ngày Trái Đất (quay nghịch hành)' },
      temp: { en: '+465°C average (hottest planet)', vi: '+465°C trung bình (nóng nhất Hệ Mặt Trời)' },
      atmosphere: { en: '96.5% CO₂, 3.5% N₂, H₂SO₄ clouds (92 bar)', vi: '96,5% CO₂, mây axit sunfuric (áp suất 92 atm)' },
      moons: { en: '0', vi: '0' },
      missions: { en: 'Venera, Magellan, Akatsuki, DAVINCI, VERITAS', vi: 'Venera, Magellan, Akatsuki, DAVINCI, VERITAS' }
    }
  },
  earth: {
    name: { en: 'Earth', vi: 'Trái Đất' }, colour: [0.2, 0.6, 1.0],
    image: 'sky/assets/planets/earth.jpg', credit: 'NASA (Apollo 17 Blue Marble)',
    type: { en: 'Terrestrial Planet (Our Home)', vi: 'Hành tinh đất đá · Ngôi nhà của chúng ta' },
    caption: {
      en: 'The iconic "Blue Marble" photograph taken on December 7, 1972, by the Apollo 17 crew heading toward the Moon.',
      vi: 'Bức ảnh lịch sử "Viên ngọc xanh" (The Blue Marble) chụp Trái Đất ngày 7/12/1972 bởi phi hành đoàn tàu Apollo 17.'
    },
    story: {
      en: 'Our home world, the only known place in the universe confirmed to harbor life. Over 71% of its surface is covered by liquid water oceans.',
      vi: 'Hành tinh quê hương của chúng ta, nơi duy nhất trong vũ trụ được xác nhận có sự sống. Hơn 71% bề mặt được bao phủ bởi các đại dương nước lỏng.'
    },
    specs: {
      diameter: { en: '12,742 km', vi: '12.742 km' },
      mass: { en: '5.97 × 10²⁴ kg', vi: '5,97 × 10²⁴ kg' },
      gravity: { en: '9.81 m/s²', vi: '9,81 m/s²' },
      distSun: { en: '1.000 AU (149.6 million km)', vi: '1,000 AU (149,6 triệu km)' },
      orbit: { en: '365.25 days (1 year)', vi: '365,25 ngày (1 năm)' },
      day: { en: '23.93 hours (24h civil)', vi: '23,93 giờ (1 ngày)' },
      temp: { en: '-89°C to +57°C (avg +15°C)', vi: '-89°C đến +57°C (TB +15°C)' },
      atmosphere: { en: '78% N₂, 21% O₂, 1% Argon/Water', vi: '78% Nitơ, 21% Oxy, 1% Argon & hơi nước' },
      moons: { en: '1 (The Moon)', vi: '1 (Mặt Trăng)' },
      missions: { en: 'Home of all space explorers and telescopes', vi: 'Cái nôi khởi nguồn của mọi kính thiên văn vũ trụ' }
    }
  },
  mars: {
    name: { en: 'Mars', vi: 'Sao Hỏa' }, colour: [1, 0.62, 0.42],
    image: 'sky/assets/planets/mars.jpg', credit: 'NASA / USGS (Viking Orbiter)',
    type: { en: 'Terrestrial Planet', vi: 'Hành tinh đất đá · Hành tinh Đỏ' },
    caption: {
      en: 'Global true-color mosaic by NASA Viking 1 orbiter, showing the vast Valles Marineris canyon complex and rust-red desert plains.',
      vi: 'Toàn cảnh ảnh ghép màu thật của Sao Hỏa từ tàu NASA Viking 1, làm nổi bật đại hẻm vực Valles Marineris và các hoang mạc đỏ.'
    },
    story: {
      en: 'The Red Planet gets its iconic hue from iron oxide (rust) on its surface. It hosts the tallest volcano (Olympus Mons) and the deepest canyon in the Solar System.',
      vi: 'Hành tinh Đỏ mang màu sắc đặc trưng từ bụi oxit sắt (rỉ sét) trên bề mặt. Nơi đây sở hữu ngọn núi lửa cao nhất (Olympus Mons) và hẻm vực lớn nhất Hệ Mặt Trời.'
    },
    specs: {
      diameter: { en: '6,779 km (0.53 × Earth)', vi: '6.779 km (0,53 × Trái Đất)' },
      mass: { en: '6.42 × 10²³ kg (0.107 × Earth)', vi: '6,42 × 10²³ kg (0,107 × Trái Đất)' },
      gravity: { en: '3.72 m/s² (0.38 × Earth)', vi: '3,72 m/s² (0,38 × Trái Đất)' },
      distSun: { en: '1.524 AU (227.9 million km)', vi: '1,524 AU (227,9 triệu km)' },
      orbit: { en: '687 Earth days (1.88 years)', vi: '687 ngày Trái Đất (1,88 năm)' },
      day: { en: '24.62 hours (1 Martian Sol)', vi: '24,62 giờ (1 ngày Sao Hỏa - Sol)' },
      temp: { en: '-125°C to +20°C (avg -60°C)', vi: '-125°C đến +20°C (trung bình -60°C)' },
      atmosphere: { en: '95.3% CO₂, 2.6% N₂, 1.9% Argon (thin 0.006 bar)', vi: '95,3% CO₂, 2,6% N₂ (áp suất chỉ bằng 0,6% Trái Đất)' },
      moons: { en: '2 (Phobos & Deimos)', vi: '2 (Phobos và Deimos)' },
      missions: { en: 'Viking, Pathfinder, Curiosity, Perseverance, Ingenuity', vi: 'Viking, Pathfinder, Curiosity, Perseverance, Ingenuity' }
    }
  },
  jupiter: {
    name: { en: 'Jupiter', vi: 'Sao Mộc' }, colour: [1, 0.93, 0.8],
    image: 'sky/assets/planets/jupiter.jpg', credit: 'NASA / JPL / University of Arizona (Cassini)',
    type: { en: 'Gas Giant Planet', vi: 'Hành tinh khí khổng lồ lớn nhất' },
    caption: {
      en: 'True-color portrait of Jupiter photographed by NASA Cassini spacecraft, displaying its swirling cloud bands and the Great Red Spot.',
      vi: 'Chân dung màu thật của Sao Mộc chụp bởi tàu NASA Cassini, hiển thị rõ Vết Đỏ Lớn và các dải mây bão xoáy rực rỡ.'
    },
    story: {
      en: 'The king of planets, with more mass than all other planets combined. Its iconic Great Red Spot is a persistent anticyclonic storm larger than the Earth.',
      vi: 'Vua của các hành tinh, nặng hơn tất cả các hành tinh khác cộng lại. Vết Đỏ Lớn huyền thoại là một cơn bão khổng lồ tồn tại hàng thế kỷ, có kích thước to hơn cả Trái Đất.'
    },
    specs: {
      diameter: { en: '139,820 km (11.0 × Earth)', vi: '139.820 km (11,0 × Trái Đất)' },
      mass: { en: '1.90 × 10²⁷ kg (317.8 × Earth)', vi: '1,90 × 10²⁷ kg (317,8 × Trái Đất)' },
      gravity: { en: '24.79 m/s² (2.53 × Earth)', vi: '24,79 m/s² (2,53 × Trái Đất)' },
      distSun: { en: '5.203 AU (778.5 million km)', vi: '5,203 AU (778,5 triệu km)' },
      orbit: { en: '11.86 Earth years', vi: '11,86 năm Trái Đất' },
      day: { en: '9.93 hours (fastest rotating planet)', vi: '9,93 giờ (tự quay nhanh nhất Hệ Mặt Trời)' },
      temp: { en: '-110°C (cloud deck level)', vi: '-110°C (tại đỉnh tầng mây)' },
      atmosphere: { en: '89.8% Hydrogen, 10.2% Helium, traces of ammonia', vi: '89,8% Hydro, 10,2% Heli, vết amoniac' },
      moons: { en: '95 confirmed (Io, Europa, Ganymede, Callisto)', vi: '95 vệ tinh (Io, Europa, Ganymede, Callisto)' },
      missions: { en: 'Pioneer, Voyager, Galileo, Juno, Europa Clipper', vi: 'Pioneer, Voyager, Galileo, Juno, Europa Clipper' }
    }
  },
  saturn: {
    name: { en: 'Saturn', vi: 'Sao Thổ' }, colour: [0.98, 0.9, 0.7],
    image: 'sky/assets/planets/saturn.jpg', credit: 'NASA / JPL / SSI (Cassini)',
    type: { en: 'Gas Giant Planet', vi: 'Hành tinh khí khổng lồ với vành đai' },
    caption: {
      en: 'Spectacular natural-color panorama of Saturn and its rings, captured by NASA Cassini spacecraft during equinox.',
      vi: 'Bức tranh toàn cảnh màu tự nhiên của Sao Thổ và vành đai tráng lệ chụp bởi tàu NASA Cassini trong thời điểm điểm phân.'
    },
    story: {
      en: 'Celebrated for its awe-inspiring ring system spanning 282,000 km but averaging only 10 metres thick. It is so light that it would float in water if there were an ocean big enough.',
      vi: 'Viên ngọc quý của bầu trời với hệ thống vành đai trải rộng tới 282.000 km nhưng bề dày chỉ khoảng 10 mét. Mật độ của nó nhẹ đến mức có thể nổi trên mặt nước nếu có đại dương đủ lớn.'
    },
    specs: {
      diameter: { en: '116,460 km (9.14 × Earth)', vi: '116.460 km (9,14 × Trái Đất)' },
      mass: { en: '5.68 × 10²⁶ kg (95.2 × Earth)', vi: '5,68 × 10²⁶ kg (95,2 × Trái Đất)' },
      gravity: { en: '10.44 m/s² (1.06 × Earth)', vi: '10,44 m/s² (1,06 × Trái Đất)' },
      distSun: { en: '9.537 AU (1.43 billion km)', vi: '9,537 AU (1,43 tỷ km)' },
      orbit: { en: '29.46 Earth years', vi: '29,46 năm Trái Đất' },
      day: { en: '10.66 hours', vi: '10,66 giờ' },
      temp: { en: '-140°C (cloud deck level)', vi: '-140°C (tại đỉnh tầng mây)' },
      atmosphere: { en: '96.3% Hydrogen, 3.25% Helium, methane traces', vi: '96,3% Hydro, 3,25% Heli, vết metan' },
      moons: { en: '146 confirmed (Titan with lakes, Enceladus with geysers)', vi: '146 vệ tinh (Titan có hồ metan, Enceladus có mạch nước ngầm)' },
      missions: { en: 'Pioneer 11, Voyager 1 & 2, Cassini-Huygens', vi: 'Pioneer 11, Voyager 1 & 2, Cassini-Huygens' }
    }
  },
  uranus: {
    name: { en: 'Uranus', vi: 'Sao Thiên Vương' }, colour: [0.75, 0.93, 0.95],
    image: 'sky/assets/planets/uranus.jpg', credit: 'NASA / JPL-Caltech (Voyager 2)',
    type: { en: 'Ice Giant Planet', vi: 'Hành tinh băng khổng lồ nghiêng 98°' },
    caption: {
      en: 'Pale cyan disc of Uranus recorded by NASA Voyager 2 in 1986. Methane in its upper atmosphere absorbs red wavelengths, creating this peaceful hue.',
      vi: 'Đĩa tròn màu xanh lơ của Sao Thiên Vương chụp bởi tàu NASA Voyager 2 năm 1986. Khí metan hấp thụ ánh sáng đỏ tạo nên sắc xanh ngọc độc đáo.'
    },
    story: {
      en: 'An ice giant that rolls around the Sun on its side with an axial tilt of 97.8°. It holds the coldest planetary atmosphere recorded in the Solar System, plunging down to -224°C.',
      vi: 'Hành tinh băng khổng lồ "nằm nghiêng" khi quay quanh Mặt Trời với độ nghiêng trục lên tới 97,8°. Nó nắm giữ kỷ lục bầu khí quyển lạnh nhất Hệ Mặt Trời, xuống tới -224°C.'
    },
    specs: {
      diameter: { en: '50,724 km (3.98 × Earth)', vi: '50.724 km (3,98 × Trái Đất)' },
      mass: { en: '8.68 × 10²⁵ kg (14.5 × Earth)', vi: '8,68 × 10²⁵ kg (14,5 × Trái Đất)' },
      gravity: { en: '8.69 m/s² (0.89 × Earth)', vi: '8,69 m/s² (0,89 × Trái Đất)' },
      distSun: { en: '19.19 AU (2.87 billion km)', vi: '19,19 AU (2,87 tỷ km)' },
      orbit: { en: '84.02 Earth years', vi: '84,02 năm Trái Đất' },
      day: { en: '17.24 hours (retrograde rotation)', vi: '17,24 giờ (quay nghịch hành)' },
      temp: { en: '-195°C to -224°C (coldest planet)', vi: '-195°C đến -224°C (lạnh nhất Hệ Mặt Trời)' },
      atmosphere: { en: '82.5% H₂, 15.2% He, 2.3% Methane ice', vi: '82,5% Hydro, 15,2% Heli, 2,3% Băng Metan' },
      moons: { en: '28 confirmed (Titania, Oberon, Miranda with giant cliffs)', vi: '28 vệ tinh (Titania, Oberon, Miranda)' },
      missions: { en: 'Voyager 2 (historic flyby in January 1986)', vi: 'Voyager 2 (chuyến bay ngang lịch sử năm 1986)' }
    }
  },
  neptune: {
    name: { en: 'Neptune', vi: 'Sao Hải Vương' }, colour: [0.62, 0.74, 1],
    image: 'sky/assets/planets/neptune.jpg', credit: 'NASA / JPL (Voyager 2)',
    type: { en: 'Ice Giant Planet', vi: 'Hành tinh băng khổng lồ xa nhất' },
    caption: {
      en: 'Full-disc portrait of deep azure Neptune by NASA Voyager 2 in 1989, revealing the Great Dark Spot and bright white cirrus-like methane clouds.',
      vi: 'Toàn cảnh Sao Hải Vương xanh thẳm từ tàu NASA Voyager 2 năm 1989, với Vết Tối Lớn và những dải mây ti metan trắng bay ở tầng cao.'
    },
    story: {
      en: 'The most distant major planet from the Sun, dark, cold, and whipped by supersonic winds reaching 2,100 km/h—the fastest atmospheric storms recorded in the Solar System.',
      vi: 'Hành tinh xa nhất trong Hệ Mặt Trời, lạnh giá và bị tàn phá bởi những cơn cuồng phong siêu thanh lên tới 2.100 km/h — nhanh nhất từng được ghi nhận trong Hệ Mặt Trời.'
    },
    specs: {
      diameter: { en: '49,244 km (3.86 × Earth)', vi: '49.244 km (3,86 × Trái Đất)' },
      mass: { en: '1.02 × 10²⁶ kg (17.1 × Earth)', vi: '1,02 × 10²⁶ kg (17,1 × Trái Đất)' },
      gravity: { en: '11.15 m/s² (1.14 × Earth)', vi: '11,15 m/s² (1,14 × Trái Đất)' },
      distSun: { en: '30.07 AU (4.50 billion km)', vi: '30,07 AU (4,50 tỷ km)' },
      orbit: { en: '164.8 Earth years', vi: '164,8 năm Trái Đất' },
      day: { en: '16.11 hours', vi: '16,11 giờ' },
      temp: { en: '-200°C average', vi: '-200°C trung bình' },
      atmosphere: { en: '80.0% H₂, 19.0% He, 1.5% Methane (supersonic winds)', vi: '80,0% Hydro, 19,0% Heli, 1,5% Metan' },
      moons: { en: '16 confirmed (Triton with active nitrogen geysers)', vi: '16 vệ tinh (Triton có mạch phun băng nitơ)' },
      missions: { en: 'Voyager 2 (August 1989), Hubble, JWST', vi: 'Voyager 2 (1989), Hubble, JWST' }
    }
  },
};


/* ------------------------------------------------------------------ the opening journey (scroll story) */
const JOURNEY = {
  en: {
    jHeroKick: 'Space_VI · NASA Space Apps Challenge 2026',
    jHeroTitle: 'Look up. Then look again in six months.',
    jHeroSub: 'A telescope called SPHEREx photographs the entire sky every six months. Stars that shift between visits are the ones worth finding. This is how we let anyone do it.',
    jBegin: 'Begin the journey', jSkipSky: 'Skip to the sky', jChip: 'Challenge: Planet X and SPHEREx', jScroll: 'Scroll',
    jK1: 'The brief', jT1: 'Somewhere beyond Neptune, something may be hiding.',
    jB1: '"Planet X" is the old name for a planet nobody has found yet. In 2016 Konstantin Batygin and Mike Brown proposed "Planet Nine" to explain the odd orbits of some distant, icy bodies. It has never been confirmed.',
    jB1b: 'NASA launched the SPHEREx telescope in March 2025. It maps the whole sky in infrared, again and again. The challenge: build a tool that lets anyone compare those visits and spot what moves.',
    jStat1: ['6 months', 'to map the whole sky'], jStat2: ['102', 'colours of infrared light'], jStat3: ['0.75 to 5.0 µm', 'wavelength range'],
    jOrbitCap: 'Real orbits on a log scale, each planet at its true period. The dashed ring marks where Planet Nine is predicted, hundreds of times farther than Earth. It is a hypothesis.',
    jOrbitX: 'Planet Nine (hypothetical)',
    jK2: 'The instrument', jT2: 'Light your eyes cannot see.',
    jB2: 'Your eyes read 0.4 to 0.7 micrometres. SPHEREx reads 0.75 to 5.0, in 102 narrow colours. Cold things glow out there: dust, comets, and failed stars called brown dwarfs. Move across the bar.',
    jAxis: 'Wavelength, micrometres', jEye: 'Human eye', jFalse: 'False colour: infrared has no colour of its own.',
    jBands: [['Just past red light. Hot stars shine brightly here.'], ['Near infrared. Thin dust is see-through and cool red stars stand out.'], ['Light from cool, old stars, with the first hint of warm dust.'],
             ['Water ice and organic molecules leave fingerprints in this range.'], ['Carbon dioxide leaves its mark near 4.3 µm.'], ['Carbon monoxide near 4.7 µm. Cold brown dwarfs and comets glow here.']],
    jK3: 'What moves', jT3: 'Five real targets. Each one gives itself away.',
    jB3: 'Two race across the sky. Three change brightness or hide in the dark. The animation is sped up.',
    jMovers: [['10.3″ a year', 'The fastest star across our sky'], ['8.1″ a year', 'The coldest brown dwarf we know'], ['A 246-day pulse', 'A giant that swells and shrinks'], ['No schedule', 'A young star that flickers'], ['A pair next door', 'Brown dwarfs, 11.9 light-years away']],
    jK4: 'The tool', jT4: 'From the whole sky down to one pixel.',
    jSteps: [['Sky', 'Drag across {n} real stars. The Sun, Moon, planets and comets sit where NASA JPL says they are, and move with the clock.'],
             ['Star card', 'Click any star for its colour, temperature, size, distance and habitable zone, computed from Gaia and SIMBAD data.'],
             ['Viewer', 'Blink real SPHEREx photographs taken months apart. A dot that jumps is moving.']],
    jNow: 'Right now', jMoonLit: 'Moon lit', jCometsTracked: 'comets tracked',
    jSources: 'Built on real data',
    jK5: 'Space_VI', jT5: 'Ready when you are.', jB5: 'NASA Space Apps Challenge · Ho Chi Minh City 2026', jEnter: 'Start using',
    jRail: 'Chapters',
  },
  vi: {
    jHeroKick: 'Space_VI · NASA Space Apps Challenge 2026',
    jHeroTitle: 'Hãy nhìn lên. Rồi nhìn lại sau sáu tháng.',
    jHeroSub: 'Kính viễn vọng SPHEREx chụp toàn bộ bầu trời cứ sáu tháng một lần. Những ngôi sao dịch chuyển giữa hai lần chụp chính là thứ đáng đi tìm. Đây là cách chúng tôi để ai cũng làm được điều đó.',
    jBegin: 'Bắt đầu hành trình', jSkipSky: 'Vào thẳng bầu trời', jChip: 'Đề bài: Planet X and SPHEREx', jScroll: 'Cuộn',
    jK1: 'Đề bài', jT1: 'Ở đâu đó ngoài sao Hải Vương, có thể có một thứ đang ẩn mình.',
    jB1: '"Planet X" là tên gọi cũ của một hành tinh chưa ai tìm thấy. Năm 2016, Konstantin Batygin và Mike Brown đề xuất "Hành tinh Chín" để giải thích quỹ đạo kỳ lạ của một số thiên thể băng ở xa. Nó chưa bao giờ được xác nhận.',
    jB1b: 'NASA phóng kính SPHEREx vào tháng 3 năm 2025. Nó lập bản đồ toàn bộ bầu trời bằng hồng ngoại, hết lần này đến lần khác. Thử thách: xây một công cụ để ai cũng có thể so sánh các lần chụp và phát hiện thứ đang di chuyển.',
    jStat1: ['6 tháng', 'để lập bản đồ cả bầu trời'], jStat2: ['102', 'màu của ánh sáng hồng ngoại'], jStat3: ['0,75 đến 5,0 µm', 'dải bước sóng'],
    jOrbitCap: 'Quỹ đạo thật theo thang logarit, mỗi hành tinh quay đúng chu kỳ thật. Vòng nét đứt đánh dấu nơi Hành tinh Chín được dự đoán, xa hơn Trái Đất hàng trăm lần. Đó chỉ là giả thuyết.',
    jOrbitX: 'Hành tinh Chín (giả thuyết)',
    jK2: 'Thiết bị', jT2: 'Thứ ánh sáng mắt ta không thấy.',
    jB2: 'Mắt bạn đọc được từ 0,4 đến 0,7 micromet. SPHEREx đọc từ 0,75 đến 5,0, trong 102 màu hẹp. Ngoài kia, những thứ lạnh phát sáng: bụi, sao chổi và các "ngôi sao hỏng" gọi là sao lùn nâu. Hãy rê chuột dọc thanh này.',
    jAxis: 'Bước sóng, micromet', jEye: 'Mắt người', jFalse: 'Màu giả: hồng ngoại không có màu riêng.',
    jBands: [['Ngay sau ánh sáng đỏ. Sao nóng sáng rực ở đây.'], ['Cận hồng ngoại. Bụi mỏng trở nên trong suốt và sao đỏ lạnh nổi bật.'], ['Ánh sáng từ các sao già, lạnh, cùng dấu hiệu đầu tiên của bụi ấm.'],
             ['Băng nước và phân tử hữu cơ để lại dấu vân tay trong dải này.'], ['Khí cacbonic để lại dấu ấn gần 4,3 µm.'], ['Cacbon monoxit gần 4,7 µm. Sao lùn nâu lạnh và sao chổi phát sáng ở đây.']],
    jK3: 'Thứ đang chuyển động', jT3: 'Năm mục tiêu thật. Mỗi cái tự để lộ mình.',
    jB3: 'Hai cái lao qua bầu trời. Ba cái đổi độ sáng hoặc ẩn trong bóng tối. Hoạt ảnh được tăng tốc.',
    jMovers: [['10,3″ mỗi năm', 'Ngôi sao lướt qua bầu trời nhanh nhất'], ['8,1″ mỗi năm', 'Sao lùn nâu lạnh nhất ta biết'], ['Nhịp 246 ngày', 'Ngôi sao khổng lồ phồng lên rồi co lại'], ['Không theo lịch', 'Ngôi sao trẻ nhấp nháy'], ['Một cặp láng giềng', 'Sao lùn nâu, cách 11,9 năm ánh sáng']],
    jK4: 'Công cụ', jT4: 'Từ cả bầu trời xuống một điểm ảnh.',
    jSteps: [['Bầu trời', 'Kéo chuột qua {n} ngôi sao thật. Mặt Trời, Mặt Trăng, hành tinh và sao chổi nằm đúng chỗ NASA JPL cho biết, và chuyển động theo đồng hồ.'],
             ['Thẻ sao', 'Bấm vào một ngôi sao để xem màu, nhiệt độ, kích thước, khoảng cách và vùng ở được, tính từ dữ liệu Gaia và SIMBAD.'],
             ['Trình xem', 'Nháy qua các ảnh SPHEREx thật chụp cách nhau nhiều tháng. Chấm nào nhảy chỗ là đang chuyển động.']],
    jNow: 'Ngay lúc này', jMoonLit: 'Mặt Trăng sáng', jCometsTracked: 'sao chổi đang theo dõi',
    jSources: 'Xây trên dữ liệu thật',
    jK5: 'Space_VI', jT5: 'Sẵn sàng khi bạn sẵn sàng.', jB5: 'NASA Space Apps Challenge · TP. Hồ Chí Minh 2026', jEnter: 'Bắt đầu sử dụng',
    jRail: 'Các chương',
  },
};
Object.assign(UI.en, JOURNEY.en);
Object.assign(UI.vi, JOURNEY.vi);
