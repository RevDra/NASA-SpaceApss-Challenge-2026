/* Landing extras: a rotating 3D planet, "what you can do" tiles, and a guided tour from the planets to the constellations.

   REAL: each planet's day length, axial tilt, distance and size (published values) and the clock-driven sky the tour walks through.
   ILLUSTRATIVE (said on screen): the planet surfaces are drawn procedurally, they are not photographs, and the spin is sped up. */

const PLANETS = [
  { id: 'earth', en: 'Earth', vi: 'Trái Đất', hours: 23.93, tilt: 23.44, au: 1, km: 12742, body: null },
  { id: 'mars', en: 'Mars', vi: 'Sao Hỏa', hours: 24.62, tilt: 25.19, au: 1.524, km: 6779, body: 'mars' },
  { id: 'jupiter', en: 'Jupiter', vi: 'Sao Mộc', hours: 9.93, tilt: 3.13, au: 5.203, km: 139820, body: 'jupiter' },
  { id: 'saturn', en: 'Saturn', vi: 'Sao Thổ', hours: 10.66, tilt: 26.73, au: 9.537, km: 116460, body: 'saturn' },
];
const SPEED = 1800;                          // 1 real hour of spin per 2 seconds
const G = {
  en: {
    planetH: 'Spin a planet', planetNote: 'Drag it to turn it. Surfaces are drawn, not photographs; day length, tilt and distance are real.', day: 'One day', hrs: 'hours', tilt: 'Axis tilt', dist: 'From the Sun', au: 'AU', size: 'Width', km: 'km', speed: 'Spinning {n}x faster than real',
    howto: 'How to use', doH: 'What you can do here', doSub: 'Every one of these opens in one click.',
    tiles: [['sky', 'My sky', 'See the real sky above you, right now, from any place.', 'Open'], ['cons', 'Constellations', 'Pick one to see its stars and the best nights to watch it.', 'Try Orion'], ['cal', 'Sky calendar', 'Moon phases, meteor showers and your own plans in one month view.', 'Open calendar'],
      ['map', 'Map of Vietnam in 3D', 'See where in Vietnam, including Hoang Sa and Truong Sa, the view is best.', 'Open the map'], ['spx', 'Real SPHEREx photos', 'Zoom into a star and watch it move in real infrared photographs.', 'Open the viewer']],
    next: 'Next', back: 'Back', done: 'Start exploring', skip: 'Skip', step: 'Step {a} of {b}',
    chooseH: 'How do you want to start?', chooseSub: 'Pick a path. You can open this again any time from the "How to use" button.',
    starter: ['Starter', 'Explore step by step', 'Eight short steps: the sky, planets, the clock, a constellation, when and where to watch it, a star, then the main screen.', 'Start the tour'],
    pro: ['Pro', 'Straight to the data', 'Two steps: open a star and read its real parameters, then see the whole main screen in one look.', 'Go Pro'],
    never: 'Do not open this automatically', toMain: 'Open the main screen', helpMe: 'Open it for me', tryIt: 'Your turn: tap the star', modeStarter: 'Starter', modePro: 'Pro',
    flow: {
      starter: [
        ['This is the real sky', 'Drag to look around, scroll to zoom. Every dot is a real star, put where it really is right now.'],
        ['Planets and the Moon', 'They sit where they really are at this moment. Tap Jupiter, or any planet, to read about it.'],
        ['The clock moves the sky', 'Press play, pick a speed or a date. Everything moves to where it was, or will be.'],
        ['Open a constellation', 'Tap a constellation name. Its star figure lights up and a panel opens with how to find it.'],
        ['When to watch it', 'Under the constellation a strip of nights shows the best time. Add it to Google Calendar or download it.'],
        ['Where in Vietnam', 'Choose a place on the 3D map of Vietnam. Taller bars mean the constellation climbs higher there.'],
        ['Pan to a bright star', 'Drag to pan the sky. The pulsing ring is Sirius, the brightest star. Hover it, then tap it to read its facts.', ['Its facts, from real data', 'Read \u201cDrift across the sky\u201d: the star really is moving. Bigger means faster.']],
        ['The star that moves fastest', 'Barnard\u2019s Star is faint but runs across our sky about 10 arcseconds every year. This is the kind of mover the challenge hunts.'],
        ['Into the main screen', 'Press the button on the star panel, or the one below, to zoom into real SPHEREx infrared photographs of it.'],
      ],
      pro: [
        ['Pan to a bright star, read the numbers', 'Drag to pan. Hover the pulsing ring (Sirius) and tap it: distance, temperature, brightness and proper motion appear.', ['The real parameters', 'From SIMBAD and Gaia. Proper motion is the key number: a star that moves between photographs is what this challenge hunts.']],
        ['The whole main screen', 'You will see the real SPHEREx frames, the time bar, Gaia rings and the controls, each marked with a number and one line.'],
      ],
    },
  },
  vi: {
    planetH: 'Xoay thử một hành tinh', planetNote: 'Kéo để xoay. Bề mặt là hình vẽ, không phải ảnh chụp; độ dài ngày, độ nghiêng và khoảng cách là số thật.', day: 'Một ngày', hrs: 'giờ', tilt: 'Độ nghiêng trục', dist: 'Cách Mặt Trời', au: 'AU', size: 'Đường kính', km: 'km', speed: 'Đang quay nhanh gấp {n} lần thật',
    howto: 'Hướng dẫn sử dụng', doH: 'Bạn làm được gì ở đây', doSub: 'Mỗi thứ dưới đây mở ra chỉ bằng một cú bấm.',
    tiles: [['sky', 'Bầu trời của tôi', 'Xem bầu trời thật phía trên bạn, ngay lúc này, ở bất kỳ nơi nào.', 'Mở'], ['cons', 'Chòm sao', 'Chọn một chòm để xem các ngôi sao và những đêm ngắm đẹp nhất.', 'Thử Orion'], ['cal', 'Lịch bầu trời', 'Pha Trăng, mưa sao băng và kế hoạch của bạn trong một lịch tháng.', 'Mở lịch'],
      ['map', 'Bản đồ Việt Nam 3D', 'Xem nơi nào ở Việt Nam, cả Hoàng Sa và Trường Sa, ngắm đẹp nhất.', 'Mở bản đồ'], ['spx', 'Ảnh SPHEREx thật', 'Phóng to vào một ngôi sao và xem nó di chuyển trong ảnh hồng ngoại thật.', 'Mở trình xem']],
    next: 'Tiếp', back: 'Quay lại', done: 'Bắt đầu khám phá', skip: 'Bỏ qua', step: 'Bước {a} / {b}',
    chooseH: 'Bạn muốn bắt đầu thế nào?', chooseSub: 'Chọn một luồng. Bạn có thể mở lại bất cứ lúc nào bằng nút "Hướng dẫn sử dụng".',
    starter: ['Starter', 'Khám phá từng bước', 'Tám bước ngắn: bầu trời, hành tinh, đồng hồ, một chòm sao, khi nào và ở đâu ngắm, một ngôi sao, rồi vào màn hình chính.', 'Bắt đầu tour'],
    pro: ['Pro', 'Đi thẳng vào dữ liệu', 'Hai bước: mở một ngôi sao và đọc thông số thật, rồi xem toàn bộ màn hình chính trong một lần nhìn.', 'Vào chế độ Pro'],
    never: 'Đừng tự mở cái này nữa', toMain: 'Vào màn hình chính', helpMe: 'Mở giúp tôi', tryIt: 'Đến lượt bạn: bấm vào ngôi sao', modeStarter: 'Starter', modePro: 'Pro',
    flow: {
      starter: [
        ['Đây là bầu trời thật', 'Kéo để nhìn quanh, cuộn để phóng to. Mỗi chấm là một ngôi sao thật, đặt đúng chỗ của nó ngay lúc này.'],
        ['Hành tinh và Mặt Trăng', 'Chúng nằm đúng chỗ thật ở thời điểm này. Bấm vào Sao Mộc, hay hành tinh nào, để đọc về nó.'],
        ['Đồng hồ điều khiển bầu trời', 'Bấm chạy, chọn tốc độ hoặc một ngày. Mọi thứ di chuyển về nơi nó từng ở, hay sẽ ở.'],
        ['Mở một chòm sao', 'Bấm tên một chòm sao. Hình nối sao sáng lên và một bảng mở ra, chỉ cách tìm nó.'],
        ['Khi nào ngắm được', 'Dưới chòm sao có dải các đêm kèm giờ đẹp nhất. Thêm vào Google Calendar hoặc tải về.'],
        ['Ở đâu tại Việt Nam', 'Chọn một nơi trên bản đồ 3D Việt Nam. Cột càng cao nghĩa là chòm sao càng lên cao ở đó.'],
        ['Lia tới một ngôi sao sáng', 'Kéo để lia bầu trời. Vòng sáng nhấp nháy là Sirius, ngôi sao sáng nhất. Rê chuột vào nó rồi bấm để đọc thông tin.', ['Thông tin thật của nó', 'Đọc dòng \u201cTrôi trên bầu trời\u201d: ngôi sao này thực sự đang di chuyển. Số càng lớn là chạy càng nhanh.']],
        ['Ngôi sao chạy nhanh nhất', 'Sao Barnard mờ nhưng chạy ngang bầu trời khoảng 10 giây cung mỗi năm. Đây đúng là loại vật đề bài đi tìm.'],
        ['Vào màn hình chính', 'Bấm nút trên bảng sao, hoặc nút bên dưới, để phóng to vào ảnh hồng ngoại SPHEREx thật của nó.'],
      ],
      pro: [
        ['Lia tới sao sáng, đọc thông số', 'Kéo để lia. Rê chuột vào vòng sáng nhấp nháy (Sirius) rồi bấm: khoảng cách, nhiệt độ, độ sáng và chuyển động riêng hiện ra.', ['Thông số thật', 'Lấy từ SIMBAD và Gaia. Chuyển động riêng là con số then chốt: sao dịch chuyển giữa các lần chụp chính là thứ đề bài này đi tìm.']],
        ['Toàn bộ màn hình chính', 'Bạn sẽ thấy các khung SPHEREx thật, thanh thời gian, vòng Gaia và bảng điều khiển, mỗi thứ đánh số kèm một dòng giải thích.'],
      ],
    },
  },
};

export function initTour(api) {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const t = () => G[api.lang()];
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);

  /* ---------------------------------------------------------------- 1. chapters added to the landing page */
  const c1viz = $('#c1 .chap-viz'), c5 = $('#c5');
  const planetCard = Object.assign(document.createElement('div'), { className: 'pl3d', id: 'pl3d' });
  if (c1viz) c1viz.appendChild(planetCard);
  const doSec = Object.assign(document.createElement('section'), { className: 'chap', id: 'c4b' });
  doSec.setAttribute('aria-labelledby', 'h4b'); doSec.classList.add('is-in'); if (c5) c5.parentNode.insertBefore(doSec, c5);
  const vnPath = fetch('sky/vietnam.json').then((r) => r.json()).then((d) => {
    const ring = d.rings.reduce((a, b) => (b.length > a.length ? b : a)), xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), k = 64 / Math.max(x1 - x0, y1 - y0);
    return 'M' + ring.map(([x, y]) => `${((x - x0) * k).toFixed(1)} ${((y1 - y) * k).toFixed(1)}`).join('L') + 'Z';
  }).catch(() => '');
  const ICON = {
    sky: '<path d="M6 40c8-20 44-20 52 0" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="22" r="2" fill="currentColor"/><circle cx="40" cy="16" r="2.4" fill="currentColor"/><circle cx="46" cy="30" r="1.6" fill="currentColor"/><path d="M4 44h56" stroke="currentColor" stroke-width="2"/>',
    cons: '<path d="M10 40l12-18 12 8 8-16 12 14" fill="none" stroke="currentColor" stroke-width="1.6"/><g fill="currentColor"><circle cx="10" cy="40" r="3"/><circle cx="22" cy="22" r="3"/><circle cx="34" cy="30" r="3"/><circle cx="42" cy="14" r="3.4"/><circle cx="54" cy="28" r="3"/></g>',
    cal: '<rect x="8" y="12" width="48" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 24h48M20 8v8M44 8v8" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="38" r="5" fill="currentColor"/><circle cx="40" cy="38" r="5" fill="none" stroke="currentColor" stroke-width="2"/>',
    spx: '<circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="2.6" fill="currentColor"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8" stroke="currentColor" stroke-width="2"/>',
  };
  async function renderDo() {
    const tx = t(), vn = await vnPath;
    doSec.innerHTML = `<div class="chap-in"><div class="chap-text wide"><p class="chap-n"><b>05</b><span>${esc(api.lang() === 'vi' ? 'Bạn làm được gì' : 'What you can do')}</span></p><h2 id="h4b">${esc(tx.doH)}</h2><p class="body">${esc(tx.doSub)}</p></div>
      <ul class="do-grid">${tx.tiles.map(([k, h, p, b]) => `<li><button type="button" class="do-tile" data-do="${k}"><svg viewBox="0 0 64 64" aria-hidden="true">${k === 'map' ? `<path d="${vn}" fill="rgba(56,189,248,.18)" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="46" cy="20" r="1.6" fill="#f5a54a"/><circle cx="50" cy="34" r="1.6" fill="#f5a54a"/>` : ICON[k]}</svg><b>${esc(h)}</b><span>${esc(p)}</span><em>${esc(b)}</em></button></li>`).join('')}</ul></div>`;
    const n = $('#c5 .chap-n b'); if (n) n.textContent = '06';
  }
  doSec.addEventListener('click', (e) => {
    const b = e.target.closest('[data-do]'); if (!b) return; const k = b.dataset.do;
    if (k === 'spx') { location.href = 'index.html'; return; }
    api.enter(); const P = () => window.SpacePlan;
    setTimeout(() => {
      if (k === 'sky') api.setSkyMode('local');
      else if (k === 'cons' && P()) P().openConst('Ori');
      else if (k === 'cal' && P()) P().openCalendar();
      else if (k === 'map' && P()) P().openMap();
    }, 700);
  });

  /* ---------------------------------------------------------------- 2. rotating 3D planet */
  const p3 = { THREE: null, cur: 'earth', raf: 0, drag: 0 };
  function planetInfoHtml() {
    const tx = t(), p = PLANETS.find((x) => x.id === p3.cur), vi = api.lang() === 'vi';
    return `<div class="pl3d-tabs" role="tablist">${PLANETS.map((x) => `<button type="button" role="tab" aria-selected="${x.id === p3.cur}" data-pl="${x.id}">${esc(vi ? x.vi : x.en)}</button>`).join('')}</div>
      <div class="pl3d-stage"><canvas></canvas><p class="pl3d-speed">${esc(fmt(tx.speed, { n: SPEED.toLocaleString() }))}</p></div>
      <dl class="pl3d-facts"><div><dt>${esc(tx.day)}</dt><dd>${p.hours.toLocaleString(vi ? 'vi-VN' : 'en-US', { maximumFractionDigits: 1 })} ${esc(tx.hrs)}</dd></div><div><dt>${esc(tx.tilt)}</dt><dd>${p.tilt.toLocaleString(vi ? 'vi-VN' : 'en-US')}°</dd></div><div><dt>${esc(tx.dist)}</dt><dd>${p.au.toLocaleString(vi ? 'vi-VN' : 'en-US')} ${esc(tx.au)}</dd></div><div><dt>${esc(tx.size)}</dt><dd>${p.km.toLocaleString(vi ? 'vi-VN' : 'en-US')} ${esc(tx.km)}</dd></div></dl>
      <p class="pl3d-note">${esc(tx.planetNote)}</p>`;
  }
  const FRAG = `precision highp float; varying vec3 vP; varying vec3 vN; uniform int uT; uniform vec3 uL;
    float h(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    float nz(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
    float fbm(vec3 x){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*nz(x); x*=2.03; a*=.5; } return s; }
    void main(){ vec3 p = normalize(vP); vec3 c;
      if (uT == 0) { float n = fbm(p*2.6); float land = smoothstep(.5,.54,n); c = mix(vec3(.03,.16,.4), mix(vec3(.16,.42,.2), vec3(.5,.42,.25), smoothstep(.58,.8,n)), land); c = mix(c, vec3(.95), smoothstep(.86,.93,abs(p.y))); float cl = smoothstep(.55,.8,fbm(p*3.4+vec3(4.,1.,2.))); c = mix(c, vec3(1.), cl*.75); }
      else if (uT == 1) { float n = fbm(p*3.2); c = mix(vec3(.55,.24,.13), vec3(.78,.42,.24), n); c = mix(c, vec3(.28,.14,.1), smoothstep(.62,.8,fbm(p*5.))*.5); c = mix(c, vec3(.95), smoothstep(.9,.96,abs(p.y))*.9); }
      else if (uT == 2) { float w = p.y*14. + fbm(p*vec3(1.,6.,1.)*2.)*3.; float b = sin(w)*.5+.5; c = mix(vec3(.86,.74,.58), vec3(.6,.38,.26), b); c = mix(c, vec3(.95,.9,.82), smoothstep(.62,.9,sin(w*.5+1.)*.5+.5)*.35); float s = length((p.xy-vec2(.3,-.28))*vec2(1.,2.2)); c = mix(c, vec3(.75,.32,.2), smoothstep(.16,.08,s)*.8); }
      else { float w = p.y*9. + fbm(p*vec3(1.,5.,1.)*1.6)*1.4; float b = sin(w)*.5+.5; c = mix(vec3(.86,.76,.55), vec3(.7,.58,.4), b); }
      float l = dot(normalize(vN), normalize(uL)); float d = smoothstep(-.1,.7,l);
      vec3 col = c*(.06 + .98*d); if (uT == 0) col += vec3(.1,.3,.7)*pow(1.-max(dot(normalize(vN), vec3(0,0,1)),0.), 3.)*(.2+d*.8);
      gl_FragColor = vec4(col,1.); }`;
  const VERT = 'varying vec3 vP; varying vec3 vN; void main(){ vP = position; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }';
  async function buildPlanet() {
    card(); const canvas = $('canvas', planetCard); if (!canvas) return;
    if (!p3.THREE) { try { p3.THREE = await import('three'); } catch { return; } }
    const T = p3.THREE; cancelAnimationFrame(p3.raf);
    const stage = $('.pl3d-stage', planetCard), r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, 0.1, 50); cam.position.set(0, 0, 6.4);
    const p = PLANETS.find((x) => x.id === p3.cur), idx = PLANETS.indexOf(p), group = new T.Group(), spin = new T.Group();
    group.rotation.z = -p.tilt * Math.PI / 180; group.add(spin); scene.add(group);
    const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { uT: { value: idx }, uL: { value: new T.Vector3(-1.4, 0.7, 1.2) } } });
    const ball = new T.Mesh(new T.SphereGeometry(1.5, 64, 48), mat); spin.add(ball);
    if (p.id === 'saturn') {
      const ring = new T.Mesh(new T.RingGeometry(2.0, 3.2, 128, 1), new T.ShaderMaterial({ transparent: true, side: T.DoubleSide, vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = position.xy; vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
        fragmentShader: 'varying vec2 vU; void main(){ float r=length(vU); float b=.55+.45*sin(r*34.); float gap=smoothstep(2.55,2.6,r)*(1.-smoothstep(2.62,2.68,r)); float a=(1.-gap*.85)*smoothstep(2.0,2.1,r)*(1.-smoothstep(3.1,3.2,r))*(.35+.5*b); gl_FragColor=vec4(vec3(.82,.72,.55)*(.7+.3*b),a); }' }));
      ring.rotation.x = Math.PI / 2; group.add(ring);
    }
    const size = () => { const w = stage.clientWidth, h = stage.clientHeight; if (!w) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }; size(); new ResizeObserver(size).observe(stage);
    let last = performance.now(), yaw = 0; const omega = (2 * Math.PI) / (p.hours * 3600 / SPEED);
    canvas.addEventListener('pointerdown', (e) => { p3.drag = e.clientX; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (p3.drag) { yaw += (e.clientX - p3.drag) * 0.01; p3.drag = e.clientX; } });
    canvas.addEventListener('pointerup', () => { p3.drag = 0; });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function frame(now) { p3.raf = requestAnimationFrame(frame); const dt = Math.min((now - last) / 1000, 0.1); last = now; yaw += reduce ? 0 : omega * dt; spin.rotation.y = yaw; r.render(scene, cam); })(performance.now());
  }
  function card() { if (!planetCard.dataset.built || planetCard.dataset.lang !== api.lang() || planetCard.dataset.pl !== p3.cur) { planetCard.innerHTML = `<h3>${esc(t().planetH)}</h3>` + planetInfoHtml(); planetCard.dataset.built = '1'; planetCard.dataset.lang = api.lang(); planetCard.dataset.pl = p3.cur; } }
  planetCard.addEventListener('click', (e) => { const b = e.target.closest('[data-pl]'); if (b && b.dataset.pl !== p3.cur) { p3.cur = b.dataset.pl; buildPlanet(); } });
  new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting && !p3.raf) buildPlanet(); else if (!e.isIntersecting) { cancelAnimationFrame(p3.raf); p3.raf = 0; } }); }, { threshold: 0.05 }).observe(planetCard);

  /* ---------------------------------------------------------------- 3. two flows: Starter (explore) and Pro (data, then the main screen) */
  const KEY_AUTO = 'space-vi-tour-auto';
  const SP = () => window.SpacePlan;
  const closeModals = () => { const p = SP(); if (p && p.closeModals) p.closeModals(); };
  const FLOWS = {
    starter: [
      { run: () => { closeModals(); api.setSkyMode('map'); api.closePanel(); }, target: '#mode-seg' },
      { run: () => { closeModals(); api.setSkyMode('map'); if (api.state.eph) api.select('body', 'jupiter'); } },
      { run: () => { closeModals(); api.closePanel(); }, target: '#time-dock' },
      { run: () => { closeModals(); api.select('const', 'Ori'); } },
      { run: () => { closeModals(); const pl = $('#pl'); if (pl) pl.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, target: '#pl' },
      { run: () => { const p = SP(); if (p) { p.setConst('Ori'); p.openMap(); } } },
      { ask: true, run: () => { closeModals(); api.setSkyMode('map'); api.closePanel(); api.focusStar('Sirius'); } },
      { run: () => { closeModals(); api.select('mover', 'barnard'); }, target: '#panel .facts' },
      { run: () => { closeModals(); }, target: '#panel .p-cta', final: true },
    ],
    pro: [
      { ask: true, run: () => { closeModals(); api.setSkyMode('map'); api.closePanel(); api.focusStar('Sirius'); } },
      { run: () => { closeModals(); }, final: true },
    ],
  };
  const tour = Object.assign(document.createElement('aside'), { id: 'tour', hidden: true });
  tour.setAttribute('role', 'dialog'); tour.setAttribute('aria-label', 'Tour'); document.body.appendChild(tour);
  const hl = Object.assign(document.createElement('div'), { id: 'tour-hl', hidden: true }); document.body.appendChild(hl);
  const pick = Object.assign(document.createElement('div'), { id: 'tour-pick', className: 'tour-pick', hidden: true });
  pick.setAttribute('role', 'dialog'); pick.setAttribute('aria-modal', 'true'); document.body.appendChild(pick);
  let mode = null, step = 0, forced = false, hlTimer = 0;
  const setOn = (on) => document.body.classList.toggle('tour-on', on);

  const picked = () => !!(api.state.sel && api.state.sel.kind === 'star');
  let poll = 0;
  function placeHl(sel) {
    clearTimeout(hlTimer);
    hlTimer = setTimeout(() => { const el = sel && $(sel); if (el && el.offsetParent !== null) { const b = el.getBoundingClientRect(); Object.assign(hl.style, { left: b.left - 6 + 'px', top: b.top - 6 + 'px', width: b.width + 12 + 'px', height: b.height + 12 + 'px' }); hl.hidden = false; } else hl.hidden = true; }, 900);
  }
  function renderCard(flowKey, f, found) {
    const tx = t(), N = FLOWS[flowKey].length, [h0, p0, fd] = tx.flow[flowKey][step], h = found && fd ? fd[0] : h0, p = found && fd ? fd[1] : p0;
    const nextLabel = f.final ? tx.toMain : f.ask && !found ? tx.helpMe : tx.next;
    tour.innerHTML = `<p class="tour-n"><span class="tour-mode is-${flowKey}">${esc(flowKey === 'pro' ? tx.modePro : tx.modeStarter)}</span> ${esc(fmt(tx.step, { a: step + 1, b: N }))}</p><h3>${esc(h)}</h3><p>${esc(p)}</p>${f.ask && !found ? `<p class="tour-try">${esc(tx.tryIt)}</p>` : ''}<div class="tour-dots">${[...Array(N)].map((_, i) => `<i class="${i === step ? 'is-on' : ''}"></i>`).join('')}</div>
      <div class="tour-btns"><button type="button" class="tour-skip" data-a="skip">${esc(tx.skip)}</button><span></span>${step ? `<button type="button" class="tour-b" data-a="back">${esc(tx.back)}</button>` : ''}<button type="button" class="tour-b tour-primary" data-a="next">${esc(nextLabel)}</button></div>`;
  }
  function runStep() {
    const f = FLOWS[mode][step]; clearInterval(poll); api.clearHint && api.clearHint();
    renderCard(mode, f, false); tour.hidden = false; hl.hidden = true; setOn(true); f.run();
    placeHl(f.target);
    if (f.ask) {                                              // hands-on: the user pans, hovers and taps the star; we notice and show what to read
      poll = setInterval(() => { if (tour.hidden) { clearInterval(poll); return; } if (picked()) { clearInterval(poll); renderCard(mode, f, true); placeHl('#panel .facts'); } }, 300);
    }
  }
  function end() { clearInterval(poll); api.clearHint && api.clearHint(); tour.hidden = true; hl.hidden = true; pick.hidden = true; setOn(false); closeModals(); }
  function begin(m) { mode = m; step = 0; pick.hidden = true; runStep(); }
  function toMain() {
    const m = mode; end(); try { sessionStorage.setItem('space-vi-vtour', m); } catch { /* ignore */ }
    api.go(api.moverUrl());
  }
  tour.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a, last = FLOWS[mode].length - 1;
    const f = FLOWS[mode][step];
    if (a === 'skip') { clearInterval(poll); end(); } else if (a === 'back') { step = Math.max(0, step - 1); runStep(); }
    else if (a === 'next' && f.ask && !picked()) { api.selectStar('Sirius'); }       // "open it for me": the poll then shows the facts
    else if (step === last) toMain(); else { step++; runStep(); }
  });

  /* the chooser: shown by itself when the sky opens, and by the "How to use" buttons */
  function showChooser() {
    const tx = t();
    let off = false; try { off = localStorage.getItem(KEY_AUTO) === 'off'; } catch { /* ignore */ }
    const card = (k, ic) => { const [tag, h, p, b] = tx[k]; return `<button type="button" class="tp-card is-${k}" data-mode="${k}"><span class="tp-ic">${ic}</span><em>${esc(tag)}</em><b>${esc(h)}</b><span class="tp-p">${esc(p)}</span><i class="tp-go">${esc(b)}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg></i></button>`; };
    pick.innerHTML = `<div class="tp-box"><button type="button" class="tp-x" data-a="close" aria-label="${esc(tx.skip)}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><h2>${esc(tx.chooseH)}</h2><p class="tp-sub">${esc(tx.chooseSub)}</p>
      <div class="tp-grid">${card('starter', '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="24" rx="20" ry="7" transform="rotate(-24 24 24)" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="14" r="2.4" fill="currentColor"/></svg>')}${card('pro', '<svg viewBox="0 0 48 48"><path d="M6 36l10-12 8 6 10-16 8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M6 42h36" stroke="currentColor" stroke-width="2"/></svg>')}</div>
      <label class="tp-never"><input type="checkbox" id="tp-never"${off ? ' checked' : ''}> ${esc(tx.never)}</label></div>`;
    pick.hidden = false; setOn(true); $('#start') && ($('#start').hidden = true);
  }
  pick.addEventListener('click', (e) => {
    const never = $('#tp-never'); const remember = () => { try { never && never.checked ? localStorage.setItem(KEY_AUTO, 'off') : localStorage.removeItem(KEY_AUTO); } catch { /* ignore */ } };
    const c = e.target.closest('[data-mode]'); if (c) { remember(); begin(c.dataset.mode); return; }
    if (e.target === pick || e.target.closest('[data-a="close"]')) { remember(); pick.hidden = true; setOn(false); }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!pick.hidden) { pick.hidden = true; setOn(false); } else if (!tour.hidden) end(); } });

  /* called when the sky opens: show the chooser by itself (unless switched off, or we came back from the viewer with a target) */
  function auto() {
    if (api.state.arrive) { forced = false; return; }
    let off = false; try { off = localStorage.getItem(KEY_AUTO) === 'off'; } catch { /* ignore */ }
    if (off && !forced) return; forced = false;
    setTimeout(showChooser, 900);
  }
  function start() { if (api.state.mode === 'intro') { forced = true; api.enter(); } else showChooser(); }

  /* "How to use" buttons, and the Start button that appears at the end of the landing journey */
  const heroCta = $('#hero .hero-cta'), bar = $('.bar-actions');
  const mk = (cls) => Object.assign(document.createElement('button'), { type: 'button', className: cls });
  const b1 = mk('btn btn-ghost'), b2 = mk('chip'); b2.id = 'howto-bar'; b1.id = 'howto';
  if (heroCta) heroCta.insertBefore(b1, $('#skip-sky'));
  if (bar) bar.insertBefore(b2, $('#lang'));
  [b1, b2].forEach((b) => b.addEventListener('click', start));
  const fab = Object.assign(document.createElement('button'), { type: 'button', id: 'start-fab', className: 'btn btn-primary' });
  document.body.appendChild(fab); fab.addEventListener('click', () => api.enter());
  const jr = $('#journey');
  if (jr) {
    const upd = () => { const max = jr.scrollHeight - jr.clientHeight, r = max > 0 ? jr.scrollTop / max : 0; fab.classList.toggle('is-on', document.body.classList.contains('is-intro') && r > 0.45 && r < 0.96); };
    jr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    new MutationObserver(upd).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  function refresh() {
    const tx = t(); b1.textContent = tx.howto; b2.textContent = tx.howto; fab.innerHTML = `<span>${esc(api.lang() === 'vi' ? 'Bắt đầu sử dụng' : 'Start using')}</span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    renderDo(); planetCard.dataset.built = ''; if (planetCard.isConnected && p3.raf) buildPlanet(); else card();
    if (!tour.hidden) runStep(); if (!pick.hidden) showChooser();
  }
  refresh();
  return { refresh, start, auto };
}
