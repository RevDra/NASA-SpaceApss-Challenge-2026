/* SPHEREx Sky: welcome experience.
   - A real sky (SIMBAD stars, IAU-style constellation figures) seen from inside the celestial sphere.
   - Click a constellation: fly to it, read about it, then pull its stars apart in 3D to see that the shape is an illusion.
   - Click a ringed target: read why it moves, then open it in the live SPHEREx viewer.
   The text/panel/guide layer does not depend on WebGL, so the page still works if the 3D sky cannot start. */
import { UI, CONSTELLATIONS, MOVERS } from './content.js';

const $ = (s, el = document) => el.querySelector(s);
const D2R = Math.PI / 180;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/* Equatorial -> scene axes. Looking out from the centre, east is to the left and north is up, like the real sky. */
const eq = (ra, dec, r = 1) => [r * Math.cos(dec * D2R) * Math.cos(ra * D2R), r * Math.sin(dec * D2R), -r * Math.cos(dec * D2R) * Math.sin(ra * D2R)];

const L = {
  en: { const: 'Constellation', mover: 'Moves or changes', ra: 'RA', dec: 'Dec' },
  vi: { const: 'Chòm sao', mover: 'Chuyển động hoặc đổi sáng', ra: 'RA', dec: 'Dec' },
};

let lang = (() => {
  try { const s = localStorage.getItem('sky-lang'); if (s === 'vi' || s === 'en') return s; } catch { /* private mode */ }
  return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
})();
const T = (k) => UI[lang][k];
const pick = (obj) => obj[lang];

const state = {
  data: null, cons: {}, sel: null, mode: 'intro',
  show: { lines: true, names: true, grid: false, movers: true },
  coach: 0, coachDone: false,
};
let sky = null;   // the Three.js runtime, or null when WebGL is unavailable

/* ------------------------------------------------------------------ data */
async function loadData() {
  const res = await fetch('sky/sky-data.json');
  if (!res.ok) throw new Error('sky-data.json ' + res.status);
  state.data = await res.json();
  for (const [code, c] of Object.entries(state.data.constellations)) {
    if (!CONSTELLATIONS[code]) continue;
    const vecs = c.stars.map((s) => eq(s.ra, s.dec));
    const sum = vecs.reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]], [0, 0, 0]);
    const n = Math.hypot(...sum);
    const centre = sum.map((x) => x / n);
    const dec = Math.asin(centre[1]) / D2R;
    let ra = Math.atan2(-centre[2], centre[0]) / D2R; if (ra < 0) ra += 360;
    const radius = Math.max(...vecs.map((v) => Math.acos(clamp(v[0] * centre[0] + v[1] * centre[1] + v[2] * centre[2], -1, 1)) / D2R));
    state.cons[code] = { code, ...c, centre, ra, dec, radius, vecs };
  }
}

/* ------------------------------------------------------------------ language + static text */
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T(el.dataset.t); });
  $('#lang').textContent = T('lang'); $('#lang').setAttribute('aria-label', T('langLabel'));
  $('#skip').textContent = T('skip');
  $('#guide-close').setAttribute('aria-label', T('close'));
  $('#depth-back').textContent = T('back');
  $('#depth-from').textContent = T('from'); $('#depth-side').textContent = T('side');
  $('#depth-title').textContent = T('depthTitle'); $('#depth-body').textContent = T('depthBody');
  buildToggles(); buildGuide(); buildLabels(); renderCoach();
  if (state.sel) renderPanel();
  if (sky && sky.depth) rebuildDepthLabels();
}

/* ------------------------------------------------------------------ guide drawer */
function buildGuide() {
  const body = $('#guide-body');
  const consItems = Object.keys(state.cons).map((code) => {
    const c = CONSTELLATIONS[code];
    return `<button class="item" type="button" data-kind="const" data-id="${code}"><b>${pick(c.name)}</b><span>${pick(c.nick)}</span></button>`;
  }).join('');
  const moverItems = MOVERS.map((m) =>
    `<button class="item is-mover" type="button" data-kind="mover" data-id="${m.id}"><b>${pick(m.name)}</b><span>${pick(m.kind)}</span></button>`).join('');
  body.innerHTML =
    `<h3 class="group-title">${T('guideMovers')}</h3><p class="group-sub">${T('guideMoversSub')}</p>${moverItems}` +
    `<h3 class="group-title">${T('guideConst')}</h3><p class="group-sub">${T('guideConstSub')}</p>${consItems}`;
}
function setGuide(open) {
  $('#guide').hidden = !open;
  $('#guide-open').setAttribute('aria-expanded', String(open));
  if (open) $('#guide-close').focus(); else if (!$('#ui').hidden) $('#guide-open').focus({ preventScroll: true });
}
$('#guide-open').addEventListener('click', () => setGuide($('#guide').hidden));
$('#guide-close').addEventListener('click', () => setGuide(false));
$('#guide-body').addEventListener('click', (e) => {
  const b = e.target.closest('.item'); if (!b) return;
  setGuide(false);
  select(b.dataset.kind, b.dataset.id);
});

/* ------------------------------------------------------------------ toggles + coach */
function buildToggles() {
  const names = T('toggles');
  $('#toggles').innerHTML = Object.keys(names).map((k) =>
    `<button class="tog" type="button" data-k="${k}" aria-pressed="${state.show[k]}">${names[k]}</button>`).join('');
}
$('#toggles').addEventListener('click', (e) => {
  const b = e.target.closest('.tog'); if (!b) return;
  const k = b.dataset.k; state.show[k] = !state.show[k];
  b.setAttribute('aria-pressed', String(state.show[k]));
  applyToggles();
});
function applyToggles() {
  document.body.classList.toggle('names-off', !state.show.names);
  document.body.classList.toggle('movers-off', !state.show.movers);
  if (sky) { sky.lineGroup.visible = state.show.lines; sky.grid.visible = state.show.grid; }
}

function renderCoach() {
  const el = $('#coach');
  const steps = T('hint');
  if (state.coachDone) { $('#coach-step').textContent = '✓'; $('#coach-text').textContent = T('hintDone'); return; }
  $('#coach-step').textContent = `${state.coach + 1}/${steps.length}`;
  $('#coach-text').textContent = steps[state.coach];
  el.classList.remove('is-hidden');
}
function coachAdvance(from) {
  if (state.coachDone || state.coach !== from) return;
  if (from >= T('hint').length - 1) {
    state.coachDone = true; renderCoach();
    setTimeout(() => $('#coach').classList.add('is-hidden'), 4200);
    return;
  }
  state.coach = from + 1; renderCoach();
}

/* ------------------------------------------------------------------ labels on the sky (real buttons: keyboard + screen-reader friendly) */
function buildLabels() {
  const host = $('#labels');
  host.querySelectorAll('.lbl-const, .lbl-mover').forEach((n) => n.remove());
  const items = [];
  for (const code of Object.keys(state.cons)) {
    const c = CONSTELLATIONS[code];
    const b = document.createElement('button');
    b.className = 'lbl lbl-const'; b.type = 'button'; b.dataset.id = code;
    b.innerHTML = `<span class="nm">${pick(c.name)}</span><small>${pick(c.nick)}</small>`;
    b.setAttribute('aria-label', `${pick(c.name)}: ${pick(c.nick)}`);
    b.addEventListener('click', () => select('const', code));
    b.addEventListener('pointerenter', () => setHover(code));
    b.addEventListener('pointerleave', () => setHover(null));
    b.addEventListener('focus', () => setHover(code));
    b.addEventListener('blur', () => setHover(null));
    host.appendChild(b);
    const cc = state.cons[code];   // label sits just above the figure, not on top of its stars
    items.push({ el: b, v: eq(cc.ra, Math.min(cc.dec + cc.radius * 1.05 + 1.5, 86), 10) });
  }
  for (const m of MOVERS) {
    const b = document.createElement('button');
    b.className = 'lbl lbl-mover'; b.type = 'button'; b.dataset.id = m.id;
    b.innerHTML = `<span class="ring"></span><span class="tag">${pick(m.name)}</span>`;
    b.setAttribute('aria-label', `${pick(m.name)}: ${pick(m.kind)}`);
    b.addEventListener('click', () => select('mover', m.id));
    host.appendChild(b);
    items.push({ el: b, v: eq(m.ra, m.dec, 10) });
  }
  state.skyLabels = items;
  markSelected();
}
function markSelected() {
  document.querySelectorAll('.lbl-const').forEach((b) => b.classList.toggle('is-sel', !!state.sel && state.sel.kind === 'const' && state.sel.id === b.dataset.id));
}
let hoverCode = null;
function setHover(code) {
  if (hoverCode === code) return;
  hoverCode = code;
  document.querySelectorAll('.lbl-const').forEach((b) => b.classList.toggle('is-on', b.dataset.id === code));
  document.body.classList.toggle('is-hover', !!code);
  if (sky) sky.styleLines();
}

/* ------------------------------------------------------------------ detail panel */
const CLOSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
function describeStar(s) {
  const sp = s.sp || '';
  const letter = (sp.match(/[OBAFGKM]/) || [''])[0];
  const cls = (sp.match(/(IV|III|II|I|V)(?=[ab\-+/:pnsk]|$)/) || [''])[0];
  const parts = [];
  if (letter) parts.push(UI[lang].kinds[letter]);
  if (UI[lang].giants[cls]) parts.push(UI[lang].giants[cls]);
  return parts.join(', ');
}
function renderPanel() {
  const panel = $('#panel');
  const { kind, id } = state.sel;
  let html = `<button class="icon-btn x" type="button" id="panel-close" aria-label="${T('close')}">${CLOSE_SVG}</button>`;
  if (kind === 'const') {
    const meta = CONSTELLATIONS[id], c = state.cons[id];
    const year = new Date().getFullYear();
    const rows = [...c.stars].filter((s) => s.ly).sort((a, b) => (a.mag ?? 9) - (b.mag ?? 9)).slice(0, 4).map((s) => {
      const d = describeStar(s);
      return `<li><b>${s.name}</b><span class="d">${s.ly.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')} ${T('ly')}</span>` +
        `<small>${d ? d + ' · ' : ''}${T('lightLeft')} ${year - s.ly}</small></li>`;
    }).join('');
    html += `<p class="p-eyebrow">${L[lang].const}</p><h2>${pick(meta.name)}</h2><p class="p-nick">${pick(meta.nick)}</p>` +
      `<div class="p-sec"><h3>${T('howToFind')}</h3><p>${pick(meta.find)}</p></div>` +
      `<div class="p-sec"><h3>${T('didYouKnow')}</h3><p>${pick(meta.fact)}</p></div>` +
      `<div class="p-sec"><h3>${T('brightest')}</h3><ul class="stars">${rows}</ul><p class="p-note">${T('brightestNote')}</p></div>` +
      `<div class="p-cta">${sky ? `<button class="btn btn-primary btn-wide" type="button" id="go-3d">${T('see3d')}</button>` : ''}</div>`;
  } else {
    const m = MOVERS.find((x) => x.id === id);
    const url = `index.html?ra=${m.ra}&dec=${m.dec}&band=${m.band}&fov=${m.fov}`;
    html += `<p class="p-eyebrow is-mover">${L[lang].mover}</p><h2>${pick(m.name)}</h2><p class="p-nick">${pick(m.kind)}</p>` +
      `<div class="p-sec"><p>${pick(m.story)}</p></div>` +
      `<div class="p-sec"><dl class="facts"><dt>${T('constellationIn')}</dt><dd>${m.constellation}</dd><dt>${T('distance')}</dt><dd>${pick(m.stats.distance)}</dd>` +
      `<dt>${T('motion')}</dt><dd>${pick(m.stats.motion)}</dd><dt>${T('coords')}</dt><dd>${L[lang].ra} ${m.ra.toFixed(4)}° · ${L[lang].dec} ${m.dec >= 0 ? '+' : '−'}${Math.abs(m.dec).toFixed(4)}°</dd></dl></div>` +
      `<div class="p-sec"><h3>${T('movers')}</h3><p>${T('moversBody')}</p></div>` +
      `<div class="p-cta"><a class="btn btn-amber btn-wide" href="${url}">${T('watch')}</a><p class="p-note">${T('watchNote')}</p></div>`;
  }
  panel.innerHTML = html;
  panel.hidden = false; panel.scrollTop = 0;
  $('#panel-close').addEventListener('click', closePanel);
  const g = $('#go-3d'); if (g) g.addEventListener('click', () => enterDepth(id));
}
function closePanel() {
  state.sel = null; $('#panel').hidden = true; markSelected();
  if (sky) sky.styleLines();
}

function select(kind, id) {
  if (state.mode === 'depth') exitDepth(true);
  if (state.mode === 'intro') return;
  state.sel = { kind, id };
  renderPanel(); markSelected(); coachAdvance(2);
  if (sky) {
    sky.styleLines();
    if (kind === 'const') {
      const c = state.cons[id];
      flyTo(c.ra, c.dec, clamp(c.radius * 2.7 + 14, 24, 80), true);
    } else {
      const m = MOVERS.find((x) => x.id === id);
      flyTo(m.ra, m.dec, 22, true);
    }
  }
}

/* ------------------------------------------------------------------ 3D runtime */
const view = { ra: 75, dec: -4.5, fov: 60 };
let tween = null, vel = { ra: 0, dec: 0 }, fovTarget = null;
function flyTo(ra, dec, fov, offsetForPanel) {
  let toRa = ra;
  if (offsetForPanel && innerWidth > 900) {
    const hfov = 2 * Math.atan(Math.tan(fov * D2R / 2) * (innerWidth / innerHeight)) / D2R;
    toRa = ra - (hfov * 0.17) / Math.max(Math.cos(dec * D2R), 0.25);
  }
  if (offsetForPanel && innerWidth <= 720) dec -= fov * 0.2;   // bottom sheet covers the lower part: keep the target in the upper half
  const from = { ...view };
  const dRa = ((toRa - from.ra + 540) % 360) - 180;
  tween = { t0: performance.now(), dur: reduce ? 1 : 1500, from, dRa, dDec: clamp(dec, -84, 84) - from.dec, dFov: fov - from.fov };
  fovTarget = fov; vel = { ra: 0, dec: 0 };
}

function fallback() {
  document.body.classList.add('no-webgl');
  const n = $('#nowebgl'); n.textContent = T('noWebgl'); n.hidden = false;
}

async function initSky() {
  let THREE;
  try { THREE = await import('three'); } catch (e) { console.info('[sky] three.js unavailable', e); return fallback(); }
  const canvas = $('#sky');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return fallback(); }
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x02040a, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(view.fov, 1, 0.05, 2000);
  const V3 = THREE.Vector3;

  /* ---- shared GLSL ---- */
  const NOISE = `
    float hash(vec3 p){ p = fract(p*vec3(.1031,.1030,.0973)); p += dot(p, p.yxz+33.33); return fract((p.x+p.y)*p.z); }
    float vnoise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
    float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }`;

  /* ---- field stars (real naked-eye stars) ---- */
  const field = state.data.field, n = field.length;
  const pos = new Float32Array(n * 3), mag = new Float32Array(n), col = new Float32Array(n * 3), seed = new Float32Array(n);
  const ramp = [[-0.3, .6, .74, 1], [0.3, .88, .92, 1], [0.6, 1, .96, .88], [1.0, 1, .82, .6], [1.5, 1, .66, .42], [2.0, 1, .52, .32]];
  const bvRGB = (bv) => {
    if (bv <= ramp[0][0]) return ramp[0].slice(1);
    for (let i = 1; i < ramp.length; i++) if (bv <= ramp[i][0]) {
      const a = ramp[i - 1], b = ramp[i], f = (bv - a[0]) / (b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, a[3] + (b[3] - a[3]) * f];
    }
    return ramp[ramp.length - 1].slice(1);
  };
  field.forEach(([ra, dec, v, bv], i) => {
    const p = eq(ra, dec, 300); pos.set(p, i * 3); mag[i] = v; col.set(bvRGB(bv), i * 3); seed[i] = Math.random();
  });
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('aMag', new THREE.BufferAttribute(mag, 1));
  starGeo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  starGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: dpr }, uTime: { value: 0 } }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aMag; attribute vec3 aCol; attribute float aSeed; uniform float uScale; uniform float uTime; varying vec3 vCol; varying float vA;
      void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); float b = pow(10.,-0.12*aMag);
        float tw = 1.0 + 0.1*sin(uTime*(1.3+aSeed*2.0)+aSeed*40.);
        gl_PointSize = (2.3 + 8.0*b)*uScale*tw; vA = clamp(0.55+1.0*b,0.,1.); vCol = aCol; }`,
    fragmentShader: `varying vec3 vCol; varying float vA; void main(){ float d = length(gl_PointCoord-.5)*2.; float a = pow(smoothstep(1.,0.,d),2.2)*vA; gl_FragColor = vec4(vCol, a); }`,
  });
  const stars = new THREE.Points(starGeo, starMat); stars.renderOrder = 2; stars.frustumCulled = false; scene.add(stars);

  /* ---- Milky Way, placed with the real galactic coordinate matrix ---- */
  const mw = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vDir; ${NOISE}
      void main(){
        vec3 e = vec3(vDir.x, -vDir.z, vDir.y);
        float gx = dot(e, vec3(-0.0548755604,-0.8734370902,-0.4838350155));
        float gy = dot(e, vec3( 0.4941094279,-0.4448296300, 0.7469822445));
        float gz = dot(e, vec3(-0.8676661490,-0.1980763734, 0.4559837762));
        float b = asin(clamp(gz,-1.,1.)); float l = atan(gy,gx);
        float band = exp(-pow(b/0.2,2.));
        float core = pow(max(cos(l),0.),3.);
        float n1 = fbm(vDir*7.), n2 = fbm(vDir*24.);
        float dust = smoothstep(0.46,0.72,fbm(vDir*9.+3.))*exp(-pow(b/0.085,2.));
        float I = band*(0.32+0.55*core)*(0.5+1.0*n1) + band*0.14*n2 - dust*0.3*band;
        vec3 c = mix(vec3(0.42,0.52,0.82), vec3(1.0,0.8,0.58), core*0.85);
        gl_FragColor = vec4(c*max(I,0.)*0.5, 1.);
      }`,
  }));
  mw.renderOrder = 1; scene.add(mw);

  /* ---- coordinate grid (RA every 2h, Dec every 30 deg): the same numbers the viewer asks for ---- */
  const gridPts = [];
  for (let dec = -60; dec <= 60; dec += 30) for (let a = 0; a < 360; a += 3) { gridPts.push(...eq(a, dec, 280), ...eq(a + 3, dec, 280)); }
  for (let ra = 0; ra < 360; ra += 30) for (let d = -87; d < 87; d += 3) { gridPts.push(...eq(ra, d, 280), ...eq(ra, d + 3, 280)); }
  const grid = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3)),
    new THREE.LineBasicMaterial({ color: 0x5f7fb0, transparent: true, opacity: 0.16, depthTest: false }));
  grid.renderOrder = 3; grid.visible = false; scene.add(grid);

  /* ---- constellation figures ---- */
  const lineGroup = new THREE.Group(); lineGroup.renderOrder = 4; scene.add(lineGroup);
  const figs = {};
  for (const code of Object.keys(state.cons)) {
    const c = state.cons[code]; const pts = [];
    c.lines.forEach(([a, b]) => pts.push(...eq(c.stars[a].ra, c.stars[a].dec, 270), ...eq(c.stars[b].ra, c.stars[b].dec, 270)));
    const mat = new THREE.LineBasicMaterial({ color: 0x7fb8ff, transparent: true, opacity: 0.3, depthTest: false });
    const seg = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)), mat);
    seg.renderOrder = 4; lineGroup.add(seg);
    const dots = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(c.stars.flatMap((s) => eq(s.ra, s.dec, 270)), 3)),
      new THREE.PointsMaterial({ color: 0x9fd2ff, size: 9 * dpr, sizeAttenuation: false, transparent: true, opacity: 0, depthTest: false, map: ringTexture(THREE) }));
    dots.renderOrder = 5; lineGroup.add(dots);
    figs[code] = { mat, dots, segs: c.lines.map(([a, b]) => [new V3(...c.vecs[a]), new V3(...c.vecs[b])]) };
  }
  function styleLines() {
    for (const [code, f] of Object.entries(figs)) {
      const sel = state.sel && state.sel.kind === 'const' && state.sel.id === code;
      const on = sel || hoverCode === code;
      f.mat.opacity = sel ? 0.95 : on ? 0.8 : state.sel ? 0.16 : 0.3;
      f.mat.color.set(sel ? 0x38bdf8 : on ? 0xcfe6ff : 0x7fb8ff);
      f.dots.material.opacity = on ? 0.9 : 0; f.dots.material.color.set(sel ? 0x38bdf8 : 0xcfe6ff);
    }
  }

  /* ---- intro: nebula + Earth limb (procedural, no image files) ---- */
  const intro = new THREE.Group(); scene.add(intro);
  const introDir = new V3(...eq(75, 2, 1));
  const nebMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uFade: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uFade; ${NOISE}
      void main(){
        vec2 p = (vUv-.5)*vec2(1.7,1.0); float r = length(p);
        vec3 q = vec3(p*2.2, uTime*0.015);
        vec3 w = vec3(fbm(q), fbm(q+vec3(5.2,1.3,2.)), 0.);
        float n = fbm(vec3(p*3.0,0.)+2.6*w);
        float fil = pow(1.0-abs(2.0*fbm(vec3(p*4.5,3.)+3.*w)-1.0), 3.2);
        float body = smoothstep(.62,.05,r);
        float I = body*(0.25+0.9*n) + body*0.9*fil*smoothstep(.55,.1,r);
        vec3 inner = vec3(.55,.74,1.0), outer = vec3(1.0,.58,.22);
        vec3 c = mix(inner, outer, smoothstep(.05,.5,r + .25*(n-.5)));
        c = mix(c, vec3(.9,.95,1.), fil*.35*smoothstep(.4,0.,r));
        gl_FragColor = vec4(c*I*.85*uFade, 1.);
      }`,
  });
  const neb = new THREE.Mesh(new THREE.PlaneGeometry(210, 125), nebMat);
  neb.position.copy(introDir).multiplyScalar(150); neb.lookAt(0, 0, 0); neb.renderOrder = 6; intro.add(neb);

  const R = 40, H = 2.6;
  const earth = new THREE.Group(); earth.position.set(0, -(R + H), 0); intro.add(earth);
  const fwd0 = new V3(...eq(75, -4.5)), right0 = new V3().crossVectors(fwd0, new V3(0, 1, 0)).normalize();
  const sunDir = fwd0.clone().add(right0.clone().multiplyScalar(-0.75)).add(new V3(0, 0.16, 0)).normalize();
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { uL: { value: sunDir }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normal; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vW; uniform vec3 uL; uniform float uTime; ${NOISE}
      void main(){
        vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
        float ndl = dot(N,uL); float day = smoothstep(-.08,.5,ndl);
        vec3 sp = N*5.0 + vec3(0.,uTime*0.0,0.);
        float land = fbm(sp*.9+3.0);
        float cloud = smoothstep(.47,.78,fbm(sp*2.3+vec3(uTime*.012,0.,11.)));
        float isLand = smoothstep(.54,.58,land);
        vec3 surf = mix(vec3(.012,.05,.15), vec3(.075,.10,.08), isLand);
        vec3 lit = surf*(.05+1.7*day) + cloud*vec3(.85,.9,1.)*(.04+.9*day)*.75;
        vec3 H = normalize(uL+V);
        lit += pow(max(dot(N,H),0.),70.)*(1.-isLand)*(1.-cloud)*vec3(1.,.72,.38)*2.4;
        float city = smoothstep(.62,.9,fbm(sp*8.))*isLand*(1.-day)*(1.-cloud);
        lit += city*vec3(1.,.7,.35)*.55;
        float fres = pow(1.-max(dot(N,V),0.),3.);
        lit += mix(vec3(.08,.32,.95), vec3(1.,.64,.3), smoothstep(0.,.7,ndl)*.8)*fres*(.3+1.3*day);
        gl_FragColor = vec4(lit,1.);
      }`,
  });
  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 96), earthMat); earthMesh.renderOrder = 10; earth.add(earthMesh);
  const atmMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uL: { value: sunDir } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normal; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vW; uniform vec3 uL;
      void main(){ vec3 N = normalize(vN), V = normalize(cameraPosition-vW); float k = pow(abs(dot(N,V)),2.6);
        float sunSide = smoothstep(-.3,.8,dot(N,uL));
        vec3 c = mix(vec3(.1,.36,1.), vec3(1.,.62,.28), sunSide*.85); gl_FragColor = vec4(c*k*(.55+1.4*sunSide), 1.); }`,
  });
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.045, 96, 64), atmMat); atm.renderOrder = 11; earth.add(atm);

  /* ---- depth (3D) mode objects are built on demand ---- */
  const glowTex = glowTexture(THREE);

  sky = { THREE, scene, camera, renderer, starMat, stars, mw, grid, lineGroup, figs, styleLines, intro, earth, neb, nebMat, glowTex, depth: null, dpr };
  applyToggles(); styleLines();

  /* ---- sizing ---- */
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();

  bindControls(canvas);
  requestAnimationFrame(frame);
}

function ringTexture(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.arc(32, 32, 24, 0, Math.PI * 2); g.stroke();
  return new THREE.CanvasTexture(c);
}
function glowTexture(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.07, 'rgba(255,255,255,.95)'); gr.addColorStop(0.22, 'rgba(255,255,255,.28)'); gr.addColorStop(0.5, 'rgba(255,255,255,.06)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------ controls: drag, zoom, pinch, keys, hover */
function bindControls(canvas) {
  const pointers = new Map(); let moved = 0, downAt = null, pinch0 = null;
  const dragScale = () => view.fov / innerHeight;

  canvas.addEventListener('pointerdown', (e) => {
    if (state.mode === 'intro') return;
    canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0; downAt = { x: e.clientX, y: e.clientY }; vel = { ra: 0, dec: 0 }; tween = null;
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), fov: view.fov }; }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (state.mode === 'intro') return;
    const p = pointers.get(e.pointerId);
    if (!p) { if (state.mode === 'sky') hoverPick(e.clientX, e.clientY); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6) document.body.classList.add('is-dragging');
    if (pointers.size === 2 && pinch0) {
      const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      view.fov = clamp(pinch0.fov * pinch0.d / Math.max(d, 1), 12, 85); fovTarget = view.fov; coachAdvance(1); return;
    }
    if (state.mode === 'depth') { orbitDepth(dx, dy); return; }
    const k = dragScale();
    vel.ra = dx * k / Math.max(Math.cos(view.dec * D2R), 0.2); vel.dec = dy * k;
    view.ra += vel.ra; view.dec = clamp(view.dec + vel.dec, -84, 84);
    if (moved > 18) coachAdvance(0);
  });
  const up = (e) => {
    pointers.delete(e.pointerId); pinch0 = null; document.body.classList.remove('is-dragging');
    if (pointers.size === 0 && moved < 6 && downAt && state.mode === 'sky') { if (hoverCode) select('const', hoverCode); }
    if (moved < 6) vel = { ra: 0, dec: 0 };
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => {
    if (state.mode === 'intro') return; e.preventDefault();
    if (state.mode === 'depth') { const t = $('#depth-t'); t.value = clamp(+t.value - e.deltaY * 0.6, 0, 1000); onDepthSlider(); return; }
    fovTarget = clamp((fovTarget ?? view.fov) * Math.exp(e.deltaY * 0.0012), 12, 85); coachAdvance(1);
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'Escape') { if (!$('#guide').hidden) setGuide(false); else if (state.mode === 'depth') exitDepth(); else if (state.sel) closePanel(); return; }
    if (state.mode !== 'sky') return;
    const s = view.fov * 0.04;
    if (e.key === 'ArrowLeft') { view.ra += s; } else if (e.key === 'ArrowRight') { view.ra -= s; }
    else if (e.key === 'ArrowUp') { view.dec = clamp(view.dec + s, -84, 84); } else if (e.key === 'ArrowDown') { view.dec = clamp(view.dec - s, -84, 84); }
    else if (e.key === '+' || e.key === '=') { fovTarget = clamp((fovTarget ?? view.fov) * 0.85, 12, 85); }
    else if (e.key === '-') { fovTarget = clamp((fovTarget ?? view.fov) / 0.85, 12, 85); }
  });
}

/* Hover: nearest figure to the pointer, measured in screen pixels so it feels the same at any zoom. */
function hoverPick(cx, cy) {
  if (!sky || !state.show.lines) { setHover(null); return; }
  const { THREE, camera } = sky;
  const ndc = new THREE.Vector3((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1, 0.5).unproject(camera).normalize();
  const limit = (22 * view.fov / innerHeight) * D2R;
  let best = null, bd = limit;
  const ab = new THREE.Vector3(), ap = new THREE.Vector3(), q = new THREE.Vector3();
  for (const [code, f] of Object.entries(sky.figs)) {
    for (const [a, b] of f.segs) {
      ab.subVectors(b, a); const t = clamp(ap.subVectors(ndc, a).dot(ab) / ab.lengthSq(), 0, 1);
      q.copy(a).addScaledVector(ab, t); const d = 2 * Math.asin(clamp(q.distanceTo(ndc) / 2, 0, 1));
      if (d < bd) { bd = d; best = code; }
    }
  }
  setHover(best);
}

/* ------------------------------------------------------------------ intro -> sky */
function enterSky(instant) {
  if (state.mode !== 'intro') return;
  state.mode = 'sky';
  if (instant) { $('#hero').style.transition = 'none'; $('#ui').style.transition = 'none'; }
  document.body.classList.remove('is-intro');
  $('#ui').hidden = false; applyToggles(); renderCoach();
  const done = () => { if (sky) { sky.intro.visible = false; } };
  if (!sky) { setGuide(true); return; }
  const target = { ra: 86, dec: 3, fov: 68 };
  if (instant || reduce) { Object.assign(view, target); fovTarget = target.fov; done(); return; }
  const from = { ...view }, t0 = performance.now(), dur = 3200;
  sky.entering = { t0, dur, from, target, done };
}

/* ------------------------------------------------------------------ depth (3D) mode: the shape is an illusion */
const SP_RGB = { O: 0x9bb8ff, B: 0xaec8ff, A: 0xdce6ff, F: 0xfff4dc, G: 0xffe19a, K: 0xffb866, M: 0xff8a52 };
function enterDepth(code) {
  if (!sky || state.mode !== 'sky') return;
  const { THREE, scene, camera } = sky; const V3 = THREE.Vector3;
  const c = state.cons[code];
  const group = new THREE.Group(); scene.add(group);
  const pts = c.stars.map((s) => (s.ly ? new V3(...eq(s.ra, s.dec, s.ly / 100)) : null));
  const known = pts.filter(Boolean);
  const C = known.reduce((a, p) => a.add(p), new V3()).multiplyScalar(1 / known.length);
  let spread = 0, maxDist = 0; known.forEach((p) => { spread = Math.max(spread, p.distanceTo(C)); maxDist = Math.max(maxDist, p.length()); });
  const sprites = [];
  c.stars.forEach((s, i) => {
    const p = pts[i]; if (!p) return;
    const absM = (s.mag ?? 3) - 5 * Math.log10((s.ly / 3.26156) / 10);
    const size = clamp(1.3 + (-absM) * 0.28, 0.9, 4.2);
    const mat = new THREE.SpriteMaterial({ map: sky.glowTex, color: SP_RGB[(s.sp || '').match(/[OBAFGKM]/)?.[0]] ?? 0xffffff, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const sp = new THREE.Sprite(mat); sp.position.copy(p); sp.scale.setScalar(size * 1.05); sp.renderOrder = 8; group.add(sp);
    sprites.push({ sp, s, p });
  });
  const lp = []; c.lines.forEach(([a, b]) => { if (pts[a] && pts[b]) lp.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z); });
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, depthTest: false })); lines.renderOrder = 7; group.add(lines);
  const rp = []; sprites.forEach(({ p }) => rp.push(0, 0, 0, p.x, p.y, p.z));
  const rays = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthTest: false })); rays.renderOrder = 6; group.add(rays);
  const sunSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sky.glowTex, color: 0xf5a54a, transparent: true, depthTest: false, blending: THREE.AdditiveBlending }));
  sunSp.scale.setScalar(0.9); sunSp.renderOrder = 9; group.add(sunSp);

  /* camera path: from Earth (origin) round to a side-on position, perpendicular to the line of sight */
  const dir = C.clone().normalize();
  const side = new V3().crossVectors(dir, new V3(0, 1, 0)); if (side.lengthSq() < 1e-4) side.set(1, 0, 0); side.normalize();
  const sideDist = Math.max(maxDist * 1.45, spread * 2.4, 6);   // far enough that Sun and the farthest star both fit
  const mid = dir.clone().multiplyScalar(maxDist / 2);
  const P = C.clone().addScaledVector(side, sideDist).addScaledVector(new V3(0, 1, 0), sideDist * 0.3);

  sky.depth = { code, group, sprites, C, P, mid, t: 0, auto: !reduce, orbit: new THREE.Quaternion(), startFov: view.fov, saved: { ...view }, sunP: new V3(), t0: performance.now() };
  ['stars', 'mw', 'grid', 'lineGroup'].forEach((k) => { sky[k].visible = false; });
  state.mode = 'depth'; document.body.classList.add('is-depth');
  $('#depth-bar').hidden = false; $('#depth-t').value = 0;
  $('#go-3d')?.setAttribute('hidden', '');
  rebuildDepthLabels();
  if (reduce) { $('#depth-t').value = 1000; onDepthSlider(); }
  $('#depth-t').focus({ preventScroll: true });
}
function rebuildDepthLabels() {
  const host = $('#labels'); host.querySelectorAll('.lbl-star, .lbl-sun').forEach((n) => n.remove());
  const d = sky.depth; if (!d) return;
  const items = [];
  d.sprites.forEach(({ s, p }, i) => {
    const el = document.createElement('div'); el.className = 'lbl lbl-star';
    el.style.setProperty('--oy', i % 2 ? '-135%' : '35%');   // stagger so neighbours do not sit on each other
    el.innerHTML = `<b>${s.name}</b><span>${s.ly.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')} ${T('ly')}</span>`;
    host.appendChild(el); items.push({ el, v: p });
  });
  const sun = document.createElement('div'); sun.className = 'lbl lbl-sun'; sun.style.setProperty('--oy', '-50%'); sun.textContent = `${T('sun')} · ${T('youAreHere')}`; host.appendChild(sun);
  items.push({ el: sun, v: d.sunP });
  state.depthLabels = items;
}
function exitDepth(silent) {
  const d = sky && sky.depth; if (!d) return;
  sky.scene.remove(d.group); sky.depth = null; state.depthLabels = null;
  $('#labels').querySelectorAll('.lbl-star, .lbl-sun').forEach((n) => n.remove());
  ['stars', 'mw', 'lineGroup'].forEach((k) => { sky[k].visible = true; }); sky.grid.visible = state.show.grid; sky.lineGroup.visible = state.show.lines;
  Object.assign(view, d.saved); sky.camera.position.set(0, 0, 0);
  state.mode = 'sky'; document.body.classList.remove('is-depth'); $('#depth-bar').hidden = true;
  $('#go-3d')?.removeAttribute('hidden');
  if (!silent) $('#go-3d')?.focus({ preventScroll: true });
}
function onDepthSlider() { const d = sky && sky.depth; if (!d) return; d.auto = false; d.t = +$('#depth-t').value / 1000; }
$('#depth-t').addEventListener('input', onDepthSlider);
$('#depth-back').addEventListener('click', () => exitDepth());
function orbitDepth(dx, dy) {
  const d = sky.depth; if (!d) return; d.auto = false;
  const { THREE } = sky;
  const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -dx * 0.006);
  const right = new THREE.Vector3().subVectors(sky.camera.position, d.C).cross(new THREE.Vector3(0, 1, 0)).normalize();
  const qx = new THREE.Quaternion().setFromAxisAngle(right, -dy * 0.006);
  d.orbit.premultiply(qy).premultiply(qx);
  if (d.t < 0.2) { d.t = 0.2; $('#depth-t').value = 200; }
}
function updateDepth(now) {
  const d = sky.depth; if (!d) return; const { THREE, camera } = sky;
  if (d.auto) { d.t = clamp((now - d.t0 - 900) / 5200, 0, 1); $('#depth-t').value = Math.round(d.t * 1000); if (d.t >= 1) d.auto = false; }
  const te = ease(d.t);
  const off = new THREE.Vector3().lerpVectors(new THREE.Vector3(), d.P, te).sub(d.C);
  const q = new THREE.Quaternion().slerp(d.orbit, te);   // identity -> user orbit, scaled by how far we have left Earth
  off.applyQuaternion(q);
  camera.position.copy(d.C).add(off); camera.up.set(0, 1, 0);
  camera.lookAt(new THREE.Vector3().lerpVectors(d.C, d.mid, te));   // aim drifts to halfway between Sun and farthest star
  camera.fov = d.startFov + (46 - d.startFov) * te; camera.updateProjectionMatrix();
  d.sprites.forEach(({ sp, s }) => { sp.material.opacity = 1; });
}

/* ------------------------------------------------------------------ frame loop */
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(now - last, 60); last = now; const secs = now / 1000;
  const { camera, starMat, renderer, scene } = sky;
  starMat.uniforms.uTime.value = secs;

  if (sky.entering) {
    const e = sky.entering, k = clamp((now - e.t0) / e.dur, 0, 1), te = ease(k);
    view.ra = e.from.ra + (((e.target.ra - e.from.ra + 540) % 360) - 180) * te; view.dec = e.from.dec + (e.target.dec - e.from.dec) * te; view.fov = e.from.fov + (e.target.fov - e.from.fov) * te;
    sky.earth.position.y = -(40 + 2.6) - 90 * ease(clamp(k * 1.25, 0, 1));
    sky.nebMat.uniforms.uFade.value = 1 - clamp(k * 1.6, 0, 1);
    if (k >= 1) { fovTarget = view.fov; sky.entering = null; e.done(); }
  } else if (state.mode === 'intro') {
    const drift = reduce ? 0 : Math.sin(secs * 0.06) * 1.4;
    view.ra = 75 + drift; view.dec = -4.5 + (reduce ? 0 : Math.sin(secs * 0.045) * 0.5);
    sky.nebMat.uniforms.uTime.value = secs; sky.earth.children[0].material.uniforms.uTime.value = secs;
  } else if (state.mode === 'sky') {
    if (tween) {
      const k = clamp((now - tween.t0) / tween.dur, 0, 1), te = ease(k);
      view.ra = tween.from.ra + tween.dRa * te; view.dec = tween.from.dec + tween.dDec * te; view.fov = tween.from.fov + tween.dFov * te;
      if (k >= 1) tween = null;
    } else {
      if (Math.abs(vel.ra) > 0.0005 || Math.abs(vel.dec) > 0.0005) {
        view.ra += vel.ra; view.dec = clamp(view.dec + vel.dec, -84, 84);
        const f = Math.pow(0.92, dt / 16); vel.ra *= f; vel.dec *= f;
      }
      if (fovTarget != null) { view.fov += (fovTarget - view.fov) * (1 - Math.pow(0.001, dt / 1000)); if (Math.abs(fovTarget - view.fov) < 0.01) fovTarget = null; }
    }
  }
  view.ra = ((view.ra % 360) + 360) % 360;

  if (state.mode === 'depth') updateDepth(now);
  else {
    const f = eq(view.ra, view.dec);
    camera.position.set(0, 0, 0); camera.up.set(0, 1, 0); camera.fov = view.fov; camera.updateProjectionMatrix(); camera.lookAt(f[0], f[1], f[2]);
  }
  starMat.uniforms.uScale.value = sky.dpr * Math.pow(60 / camera.fov, 0.4);
  renderer.render(scene, camera);
  updateLabels();
}

function updateLabels() {
  if (state.mode === 'intro') return;
  const items = state.mode === 'depth' ? state.depthLabels : state.skyLabels; if (!items) return;
  const { THREE, camera } = sky; const w = innerWidth, h = innerHeight; const v = new THREE.Vector3();
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
  for (const it of items) {
    v.set(it.v.x ?? it.v[0], it.v.y ?? it.v[1], it.v.z ?? it.v[2]);
    const rel = v.clone().sub(camera.position);
    const ahead = rel.dot(fwd) > 0.01;
    v.project(camera);
    const vis = ahead && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
    it.el.classList.toggle('is-hidden-lbl', !vis);
    if (vis) it.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px) translate(var(--ox, -50%), var(--oy, -50%))`;
  }
}

/* ------------------------------------------------------------------ boot */
$('#lang').addEventListener('click', () => {
  lang = lang === 'en' ? 'vi' : 'en';
  try { localStorage.setItem('sky-lang', lang); } catch { /* ignore */ }
  applyLang();
});
$('#enter').addEventListener('click', () => enterSky(false));

(async function boot() {
  applyLang();
  try { await loadData(); } catch (e) {
    console.error(e); $('#nowebgl').textContent = 'Could not load sky-data.json. Run viewer/tools/build_sky_data.py, or start the page through serve.py.'; $('#nowebgl').hidden = false; return;
  }
  applyLang();
  await initSky();
  $('#enter').disabled = false; $('#loading').classList.add('is-done');
  if (location.hash === '#sky') enterSky(true);
})();
