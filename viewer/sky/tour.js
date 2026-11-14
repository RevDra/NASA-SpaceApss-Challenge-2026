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
    steps: [
      ['Start with the planets', 'Planets and the Moon are placed where they really are right now. Tap one to learn about it.'],
      ['The clock moves the sky', 'Press play, pick a speed or a date. Planets, the Moon and comets move to where they were or will be.'],
      ['Then the constellations', 'Tap a constellation name. Its star figure lights up and a panel opens.'],
      ['When to watch it', 'Under the constellation, a strip of nights shows the best time. Add it to Google Calendar or download it.'],
      ['Where in Vietnam', 'Choose a place on the 3D map of Vietnam. Taller bars mean the constellation climbs higher.'],
      ['Your own sky', 'My sky shows the sky from your place at any time, with the ground and the horizon.'],
      ['Into the real photographs', 'Open any star in the viewer to zoom into real SPHEREx infrared photographs.'],
    ],
  },
  vi: {
    planetH: 'Xoay thử một hành tinh', planetNote: 'Kéo để xoay. Bề mặt là hình vẽ, không phải ảnh chụp; độ dài ngày, độ nghiêng và khoảng cách là số thật.', day: 'Một ngày', hrs: 'giờ', tilt: 'Độ nghiêng trục', dist: 'Cách Mặt Trời', au: 'AU', size: 'Đường kính', km: 'km', speed: 'Đang quay nhanh gấp {n} lần thật',
    howto: 'Hướng dẫn sử dụng', doH: 'Bạn làm được gì ở đây', doSub: 'Mỗi thứ dưới đây mở ra chỉ bằng một cú bấm.',
    tiles: [['sky', 'Bầu trời của tôi', 'Xem bầu trời thật phía trên bạn, ngay lúc này, ở bất kỳ nơi nào.', 'Mở'], ['cons', 'Chòm sao', 'Chọn một chòm để xem các ngôi sao và những đêm ngắm đẹp nhất.', 'Thử Orion'], ['cal', 'Lịch bầu trời', 'Pha Trăng, mưa sao băng và kế hoạch của bạn trong một lịch tháng.', 'Mở lịch'],
      ['map', 'Bản đồ Việt Nam 3D', 'Xem nơi nào ở Việt Nam, cả Hoàng Sa và Trường Sa, ngắm đẹp nhất.', 'Mở bản đồ'], ['spx', 'Ảnh SPHEREx thật', 'Phóng to vào một ngôi sao và xem nó di chuyển trong ảnh hồng ngoại thật.', 'Mở trình xem']],
    next: 'Tiếp', back: 'Quay lại', done: 'Bắt đầu khám phá', skip: 'Bỏ qua', step: 'Bước {a} / {b}',
    steps: [
      ['Bắt đầu từ các hành tinh', 'Các hành tinh và Mặt Trăng nằm đúng chỗ của chúng ngay bây giờ. Bấm vào một hành tinh để tìm hiểu.'],
      ['Đồng hồ điều khiển bầu trời', 'Bấm chạy, chọn tốc độ hoặc một ngày. Hành tinh, Mặt Trăng và sao chổi sẽ di chuyển về nơi chúng từng ở hay sẽ ở.'],
      ['Rồi tới các chòm sao', 'Bấm tên một chòm sao. Hình nối sao sáng lên và một bảng thông tin mở ra.'],
      ['Khi nào ngắm được', 'Dưới chòm sao có dải các đêm kèm giờ đẹp nhất. Thêm vào Google Calendar hoặc tải về.'],
      ['Ở đâu tại Việt Nam', 'Chọn một nơi trên bản đồ 3D Việt Nam. Cột càng cao nghĩa là chòm sao lên càng cao.'],
      ['Bầu trời của riêng bạn', '"Bầu trời của tôi" cho thấy bầu trời từ nơi bạn ở vào bất kỳ lúc nào, có cả mặt đất và đường chân trời.'],
      ['Vào ảnh thật', 'Mở bất kỳ ngôi sao nào trong trình xem để phóng to vào ảnh hồng ngoại SPHEREx thật.'],
    ],
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

  /* ---------------------------------------------------------------- 3. guided tour, planets to constellations */
  const tour = Object.assign(document.createElement('aside'), { id: 'tour', hidden: true });
  tour.setAttribute('role', 'dialog'); tour.setAttribute('aria-label', 'Tour'); document.body.appendChild(tour);
  const hl = Object.assign(document.createElement('div'), { id: 'tour-hl', hidden: true }); document.body.appendChild(hl);
  let step = 0; const N = 7;
  const target = ['#time-dock', '#time-dock', null, '#pl', null, '#mode-seg', null];
  const enterSky = () => api.enter();
  function runStep() {
    const tx = t(), [h, p] = tx.steps[step], P = window.SpacePlan;
    tour.innerHTML = `<p class="tour-n">${esc(fmt(tx.step, { a: step + 1, b: N }))}</p><h3>${esc(h)}</h3><p>${esc(p)}</p><div class="tour-dots">${[...Array(N)].map((_, i) => `<i class="${i === step ? 'is-on' : ''}"></i>`).join('')}</div>
      <div class="tour-btns"><button type="button" class="tour-skip" data-a="skip">${esc(tx.skip)}</button><span></span>${step ? `<button type="button" class="tour-b" data-a="back">${esc(tx.back)}</button>` : ''}<button type="button" class="tour-b tour-primary" data-a="next">${esc(step === N - 1 ? tx.done : tx.next)}</button></div>`;
    tour.hidden = false; hl.hidden = true;
    const close = () => { if (P && P.closeModals) P.closeModals(); };
    if (step === 0) { close(); api.setSkyMode('map'); if (api.state.eph) api.select('body', 'jupiter'); }
    else if (step === 1) { close(); api.closePanel(); }
    else if (step === 2) { close(); api.select('const', 'Ori'); }
    else if (step === 3) { close(); const pl = $('#pl'); if (pl) pl.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    else if (step === 4) { if (P) { P.setConst('Ori'); P.openMap(); } }
    else if (step === 5) { close(); api.setSkyMode('local'); }
    else if (step === 6) { close(); api.select('star', Math.max(0, api.state.stars.f.findIndex((s) => s[8] === 'Sirius'))); }
    setTimeout(() => { const el = target[step] && $(target[step]); if (el && el.offsetParent !== null) { const b = el.getBoundingClientRect(); Object.assign(hl.style, { left: b.left - 6 + 'px', top: b.top - 6 + 'px', width: b.width + 12 + 'px', height: b.height + 12 + 'px' }); hl.hidden = false; } }, 900);
  }
  function start() { enterSky(); step = 0; setTimeout(runStep, api.state.mode === 'intro' ? 1400 : 100); }
  function end() { tour.hidden = true; hl.hidden = true; const P = window.SpacePlan; if (P && P.closeModals) P.closeModals(); try { localStorage.setItem('space-vi-tour-done', '1'); } catch { /* ignore */ } }
  tour.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a; if (a === 'skip') end(); else if (a === 'back') { step = Math.max(0, step - 1); runStep(); } else if (step === N - 1) end(); else { step++; runStep(); } });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !tour.hidden) end(); });

  /* the "How to use" buttons: on the landing page and in the sky */
  const heroCta = $('#hero .hero-cta'), bar = $('.bar-actions');
  const mk = (cls) => Object.assign(document.createElement('button'), { type: 'button', className: cls });
  const b1 = mk('btn btn-ghost'), b2 = mk('chip'); b2.id = 'howto-bar'; b1.id = 'howto';
  if (heroCta) heroCta.insertBefore(b1, $('#skip-sky'));
  if (bar) bar.insertBefore(b2, $('#lang'));
  [b1, b2].forEach((b) => b.addEventListener('click', start));
  function refresh() { const tx = t(); b1.textContent = tx.howto; b2.textContent = tx.howto; renderDo(); planetCard.dataset.built = ''; if (planetCard.isConnected && p3.raf) buildPlanet(); else card(); if (!tour.hidden) runStep(); }
  refresh();
  return { refresh, start };
}
