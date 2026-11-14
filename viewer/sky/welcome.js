/* SPHEREx Sky: welcome experience.
   The sky here is a function of a clock. Move the clock (live, scrub, or play a week per second) and the Moon, planets, comets,
   meteor showers and, in "My sky", the whole celestial sphere move to where they really are.
   Data: SIMBAD (stars), NASA JPL Horizons (Sun, Moon, planets, comets), IMO working list (meteor showers), NASA SkyView (plate photographs).
   The text/panel/guide layer does not depend on WebGL, so the page still works if the 3D sky cannot start. */
import { UI, CONSTELLATIONS, MOVERS, BODIES } from './content.js';
import * as A from './astro.js';
import { initPlan } from './plan.js';

const $ = (s, el = document) => el.querySelector(s);
const { D2R, clamp, wrap360 } = A;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eq = A.eqToVec;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let lang = (() => {
  try { const s = localStorage.getItem('sky-lang'); if (s === 'vi' || s === 'en') return s; } catch { /* private mode */ }
  return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
})();
const warned = new Set();
const T = (k) => { const v = UI[lang][k]; if (v === undefined && !warned.has(k)) { warned.add(k); console.warn('[sky] missing string', k); } return v ?? k; };
const pick = (o) => o[lang];
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const nf = (n, d = 0) => Number(n).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

const SITES = [
  { name: 'Hà Nội', lat: 21.03, lon: 105.85 }, { name: 'TP. Hồ Chí Minh', lat: 10.78, lon: 106.7 }, { name: 'Đà Nẵng', lat: 16.05, lon: 108.22 },
  { name: 'Greenwich', lat: 51.48, lon: 0 }, { name: 'New York', lat: 40.71, lon: -74.0 }, { name: 'Sydney', lat: -33.87, lon: 151.21 },
];
/* Places known for very dark skies: observatory sites and IDA / Starlight protected reserves. Coordinates rounded.
   Whether a place is dark RIGHT NOW (Sun below -18 degrees, Moon down or thin) is computed from the clock, not stored. */
const DARK_SITES = [
  { name: 'Doi Inthanon (Thai National Observatory)', lat: 18.59, lon: 98.48, kind: 'obs' },
  { name: 'Mauna Kea, Hawaii', lat: 19.82, lon: -155.47, kind: 'obs' },
  { name: 'La Palma, Roque de los Muchachos', lat: 28.76, lon: -17.89, kind: 'starlight' },
  { name: 'NamibRand Nature Reserve, Namibia', lat: -24.98, lon: 16.0, kind: 'ida' },
  { name: 'Atacama (ESO Paranal), Chile', lat: -24.63, lon: -70.4, kind: 'obs' },
  { name: 'Aoraki Mackenzie, New Zealand', lat: -43.99, lon: 170.46, kind: 'ida' },
  { name: 'Pic du Midi, France', lat: 42.94, lon: 0.14, kind: 'ida' },
  { name: 'Cherry Springs, Pennsylvania', lat: 41.66, lon: -77.82, kind: 'ida' },
];
const SPEEDS = [1, 60, 3600, 86400, 604800, 2592000];
const BODY_KEYS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const MOON_ARCSEC = 1865;   // mean angular diameter of the Moon
const TAIL_SEG = 14;

const state = {
  data: null, eph: null, cons: {}, stars: null, sel: null, mode: 'intro', skyMode: 'map',
  show: { lines: true, names: true, grid: false, bodies: true, comets: true, meteors: true, movers: true, clouds: true },
  site: SITES[0], t: { ms: Date.now(), speed: 1, dir: 1, playing: true, live: true },
  coach: 0, coachDone: false, track: null, M: [1, 0, 0, 0, 1, 0, 0, 0, 1], pos: {}, lastShowers: [], outOfRangeToast: false, skyLabels: [],
};
try { const s = JSON.parse(localStorage.getItem('sky-site') || 'null'); if (s && Number.isFinite(s.lat) && Number.isFinite(s.lon)) state.site = s; } catch { /* ignore */ }
{ const q = new URLSearchParams(location.search), ra = parseFloat(q.get('ra')), dec = parseFloat(q.get('dec'));
  if (Number.isFinite(ra) && Number.isFinite(dec) && ra >= 0 && ra <= 360 && dec >= -90 && dec <= 90) state.arrive = { ra, dec }; }   // came from the viewer: show where it was pointing
let sky = null;   // Three.js runtime, or null when WebGL is unavailable

/* ================================================================== data */
async function loadData() {
  const [sd, ed] = await Promise.all([
    fetch('sky/sky-data.json').then((r) => { if (!r.ok) throw new Error('sky-data.json ' + r.status); return r.json(); }),
    fetch('sky/ephemeris.json').then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  state.data = sd;
  try {   // current-epoch positions of the five targets (tools/build_targets.py)
    const tj = await fetch('sky/targets.json').then((r) => (r.ok ? r.json() : null));
    if (tj) for (const t of tj.targets) { const m = MOVERS.find((x) => x.id === t.id); if (m) { m.ra = t.ra; m.dec = t.dec; m.band = t.band; m.fov = t.fov; m.sp = t.sp_type; } }
  } catch { /* keep the built-in values */ }
  state.eph = ed ? new A.Ephemeris(ed) : null;
  for (const [code, c] of Object.entries(sd.constellations)) {
    if (!CONSTELLATIONS[code]) continue;
    const vecs = c.stars.map((s) => eq(s.ra, s.dec));
    const sum = vecs.reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]], [0, 0, 0]);
    const n = Math.hypot(...sum), centre = sum.map((x) => x / n), e = A.vecToEq(centre);
    const radius = Math.max(...vecs.map((v) => Math.acos(clamp(v[0] * centre[0] + v[1] * centre[1] + v[2] * centre[2], -1, 1)) / D2R));
    state.cons[code] = { code, ...c, centre, ra: e.ra, dec: e.dec, radius, vecs };
  }
  const f = sd.field, n = f.length, vec = new Float32Array(n * 3);
  f.forEach((s, i) => vec.set(eq(s[0], s[1]), i * 3));
  state.stars = { n, f, vec };
  if (window.SpaceConst) window.SpaceConst.load(f);   // lets the search box list the stars of any constellation
}
const starOf = (i) => { const s = state.stars.f[i]; return { i, ra: s[0], dec: s[1], mag: s[2], bv: s[3], ly: s[4], pmra: s[5], pmdec: s[6], sp: s[7], name: s[8] }; };

/* ================================================================== time */
const jdNow = () => A.toJD(state.t.ms);
function clampTime() {
  const e = state.eph; if (!e) return;
  const lo = A.fromJD(e.jdStart), hi = A.fromJD(e.jdEnd);
  if (state.t.ms < lo || state.t.ms > hi) {
    state.t.ms = clamp(state.t.ms, lo, hi); state.t.playing = false; syncTimeUI(true);
    if (!state.outOfRangeToast) { toast(T('timeOut')); state.outOfRangeToast = true; }
  } else state.outOfRangeToast = false;
}
function tickTime(dtMs) {
  const t = state.t; if (!t.playing) return;
  if (t.live && t.speed === 1 && t.dir === 1) t.ms = Date.now(); else t.ms += dtMs * t.speed * t.dir;
  clampTime();
}
const pad = (n) => String(n).padStart(2, '0');
function localInputValue(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function syncTimeUI(force) {
  const t = state.t, el = $('#t-date');
  if (force || document.activeElement !== el) el.value = localInputValue(t.ms);
  const off = -new Date(t.ms).getTimezoneOffset() / 60;
  $('#t-date-cap').textContent = `${T('timeDate')} · UTC${off >= 0 ? '+' : '−'}${Math.abs(off)}`;
  $('#t-play').setAttribute('aria-pressed', String(t.playing));
  $('#t-play').setAttribute('aria-label', t.playing ? T('timePause') : T('timePlay'));
  $('#t-play-icon').innerHTML = t.playing
    ? '<rect x="6.5" y="5.5" width="4" height="13" rx="1.2" fill="currentColor"/><rect x="13.5" y="5.5" width="4" height="13" rx="1.2" fill="currentColor"/>'
    : '<path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10-6.4a.8.8 0 0 0 0-1.4l-10-6.4A.8.8 0 0 0 8 5.6z" fill="currentColor"/>';
  $('#t-rev').setAttribute('aria-pressed', String(t.dir < 0));
  $('#t-speed').value = String(t.speed);
}
function buildSpeed() { $('#t-speed').innerHTML = SPEEDS.map((s, i) => `<option value="${s}">${esc(T('speeds')[i])}</option>`).join(''); }
function setTime(ms) { state.t.ms = ms; state.t.live = false; clampTime(); syncTimeUI(true); renderLive(); }
$('#t-play').addEventListener('click', () => { state.t.playing = !state.t.playing; if (!state.t.playing) state.t.live = false; syncTimeUI(true); });
$('#t-rev').addEventListener('click', () => { state.t.dir *= -1; state.t.live = false; if (state.t.dir < 0) state.t.playing = true; syncTimeUI(true); });
$('#t-speed').addEventListener('change', (e) => { state.t.speed = +e.target.value; state.t.live = state.t.speed === 1 && state.t.dir === 1; state.t.playing = true; syncTimeUI(true); });
$('#t-date').addEventListener('change', (e) => { const ms = new Date(e.target.value).getTime(); if (Number.isFinite(ms)) { state.t.playing = false; setTime(ms); } });
$('#t-now').addEventListener('click', () => { Object.assign(state.t, { ms: Date.now(), speed: 1, dir: 1, playing: true, live: true }); syncTimeUI(true); renderLive(); });

/* ================================================================== sky mode + location */
const isLocal = () => state.skyMode === 'local' && state.mode !== 'depth';
function setSkyMode(mode) {
  if (mode !== state.skyMode && sky) {   // keep looking at the same piece of sky when switching frame
    const cur = eq(view.ra, view.dec), M = state.M;
    if (mode === 'local') {
      const w = A.applyRows(M, cur), e = A.vecToEq(w);
      Object.assign(view, e.dec < 4 ? { ra: 270, dec: 35 } : { ra: e.ra, dec: e.dec });
    } else {
      const c = [M[0] * cur[0] + M[3] * cur[1] + M[6] * cur[2], M[1] * cur[0] + M[4] * cur[1] + M[7] * cur[2], M[2] * cur[0] + M[5] * cur[1] + M[8] * cur[2]];
      const e = A.vecToEq(c); view.ra = e.ra; view.dec = e.dec;
    }
  }
  state.skyMode = mode; tween = null; vel = { ra: 0, dec: 0 };
  document.body.classList.toggle('is-local', mode === 'local');
  document.querySelectorAll('#mode-seg [role=radio]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
  $('#site-btn').hidden = mode !== 'local' || state.mode === 'intro';
  if (mode !== 'local') setPop('#site-pop', false);
  if (sky) sky.dome.visible = sky.ground.visible = mode === 'local' && state.mode !== 'depth';
  renderGuide(); renderLive();
}
$('#mode-seg').addEventListener('click', (e) => { const b = e.target.closest('[role=radio]'); if (b) setSkyMode(b.dataset.mode); });
function setSite(site) {
  state.site = site; $('#site-name').textContent = site.name;
  try { localStorage.setItem('sky-site', JSON.stringify(site)); } catch { /* ignore */ }
  renderGuide(); renderLive();
}
const ALL_SITES = () => [...SITES, ...DARK_SITES];
/** How good the sky is at a place at the clock time: Sun altitude and the Moon's altitude and phase. */
function darkness(site) {
  const P = state.pos; if (!state.eph || !P.sun || !P.moon) return null;
  const jd = jdNow(), l = A.lstDeg(jd, site.lon), sun = A.altAz(P.sun.ra, P.sun.dec, l, site.lat).alt, moon = A.altAz(P.moon.ra, P.moon.dec, l, site.lat).alt, lit = P.phase.fraction;
  const phase = sun < -18 ? 'night' : sun < -12 ? 'nautical' : sun < 0 ? 'twilight' : 'day';
  const moonUp = moon > 0 && lit > 0.25;
  return { phase, moonUp, moonAlt: moon, lit, best: phase === 'night' && !moonUp, score: (phase === 'night' ? 2 : phase === 'nautical' ? 1 : 0) + (moonUp ? 0 : 1) };
}
function darkChip(d) {
  if (!d) return '';
  const cls = d.best ? 'best' : d.phase === 'day' ? 'day' : 'mid', txt = T('dk')[d.phase] + (d.phase === 'night' || d.phase === 'nautical' ? ` · ${d.moonUp ? T('dkMoonUp') : T('dkMoonDown')}` : '');
  return `<i class="dk ${cls}">${esc(txt)}</i>`;
}
function buildSites() {
  const row = (s, i) => `<button type="button" class="site-item" data-i="${i}">${esc(s.name)}<span>${Math.abs(s.lat).toFixed(1)}°${s.lat >= 0 ? 'N' : 'S'} ${Math.abs(s.lon).toFixed(1)}°${s.lon >= 0 ? 'E' : 'W'}</span></button>`;
  const dark = DARK_SITES.map((s, i) => ({ s, i: SITES.length + i, d: darkness(s) })).sort((a, b) => (b.d?.score ?? 0) - (a.d?.score ?? 0));
  $('#site-list').innerHTML = SITES.map(row).join('') +
    `<p class="site-h">${esc(T('dkTitle'))}</p><p class="site-sub">${esc(T('dkSub'))}</p>` +
    dark.map(({ s, i, d }) => `<button type="button" class="site-item dark" data-i="${i}"><b>${esc(s.name)}</b><small>${esc(T('dkKind')[s.kind])}</small>${darkChip(d)}</button>`).join('');
  $('#site-name').textContent = state.site.name;
}
$('#site-list').addEventListener('click', (e) => { const b = e.target.closest('.site-item'); if (!b) return; setSite(ALL_SITES()[+b.dataset.i]); setPop('#site-pop', false); });
$('#site-geo').addEventListener('click', () => {
  if (!navigator.geolocation) { toast(T('geoDenied')); return; }
  navigator.geolocation.getCurrentPosition(
    (p) => { setSite({ name: T('siteHere'), lat: p.coords.latitude, lon: p.coords.longitude }); setPop('#site-pop', false); },
    () => toast(T('geoDenied')), { timeout: 10000, maximumAge: 600000 });
});
$('#site-btn').addEventListener('click', () => { buildSites(); setPop('#site-pop', $('#site-pop').hidden); });

/* ================================================================== My collection (shared with the viewer) */
const COL = window.SpaceCollection;
if (COL) {
  COL.mount($('#col-pop'), (it) => ({ viewer: `index.html?ra=${it.ra}&dec=${it.dec}&band=SD2&fov=120`, sky: `welcome.html?ra=${it.ra}&dec=${it.dec}#sky` }));
  const cnt = () => { const n = COL.count(), b = $('#col-n'); b.textContent = n || ''; b.hidden = !n; };
  COL.onChange(cnt); cnt();
  $('#col-open').addEventListener('click', () => { const o = $('#col-pop').hidden; $('#col-pop').hidden = !o; $('#col-open').setAttribute('aria-expanded', String(o)); if (o) { setPop('#layers', false); setPop('#site-pop', false); } });
  document.addEventListener('pointerdown', (e) => { if (!$('#col-pop').hidden && !e.target.closest('#col-pop, #col-open, #p-save')) { $('#col-pop').hidden = true; $('#col-open').setAttribute('aria-expanded', 'false'); } });
} else $('#col-open').hidden = true;
function saveCurrent() {
  if (!COL || !state.sel) return;
  const t = targetEq(state.sel), name = $('#panel h2')?.textContent || '', facts = [...$('#panel').querySelectorAll('dl.facts dt')].map((dt) => [dt.textContent.trim(), (dt.nextElementSibling?.textContent || '').trim().replace(/\s+/g, ' ')]).filter(([k, v]) => k && v).slice(0, 5);
  let image = null; if (sky) { try { sky.renderer.render(sky.scene, sky.camera); image = COL.snapshot([{ canvas: sky.renderer.domElement, x: 0, y: 0, w: innerWidth, h: innerHeight }], innerWidth, innerHeight); } catch { /* ignore */ } }
  const summary = [$('#panel .p-nick')?.textContent, ...[...$('#panel').querySelectorAll('.p-sec > p')].slice(0, 2).map((p) => p.textContent)].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const r = COL.add({ kind: state.sel.kind === 'star' ? 'star' : 'obj', name, ra: t ? t.ra : 0, dec: t ? t.dec : 0, facts, summary, image, source: 'Space_VI sky: SIMBAD, JPL Horizons, IMO, NASA SkyView' });
  toast(r.trimmed ? COL.S.full : T('savedOk'));
  const b = $('#p-save'); if (b) { b.classList.add('is-done'); b.textContent = T('savedOk'); }
}

/* decorative clouds: a gentle drifting deck, not weather data */
const CLOUDS = { cover: 0.42, wind: 7, wdir: 250 };
const wx = { off: [0, 0] };
const cloudNow = () => (state.show.clouds ? CLOUDS : null);

/* ================================================================== popovers, toast */
function setPop(sel, open) {
  const el = $(sel); el.hidden = !open;
  if (sel === '#layers') $('#layers-open').setAttribute('aria-expanded', String(open));
  if (sel === '#site-pop') $('#site-btn').setAttribute('aria-expanded', String(open));
  if (open) { if (sel === '#layers') setPop('#site-pop', false); if (sel === '#site-pop') setPop('#layers', false); }
}
$('#layers-open').addEventListener('click', () => setPop('#layers', $('#layers').hidden));
document.addEventListener('pointerdown', (e) => {
  if (!$('#layers').hidden && !e.target.closest('#layers, #layers-open')) setPop('#layers', false);
  if (!$('#site-pop').hidden && !e.target.closest('#site-pop, #site-btn')) setPop('#site-pop', false);
});
let toastTimer = null;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 4200); }

/* ================================================================== language + static text */
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T(el.dataset.t); });
  $('#lang').textContent = T('lang'); $('#lang').setAttribute('aria-label', T('langLabel'));
  $('#skip').textContent = T('skip');
  $('#guide-close').setAttribute('aria-label', T('close')); $('#start-x').setAttribute('aria-label', T('close'));
  $('#depth-back').textContent = T('back'); $('#depth-from').textContent = T('from'); $('#depth-side').textContent = T('side');
  $('#depth-title').textContent = T('depthTitle'); $('#depth-body').textContent = T('depthBody');
  $('#t-rev').setAttribute('aria-label', T('timeRev'));
  $('#search').placeholder = lang === 'vi' ? 'Sirius, Sao Mộc, Orion' : 'Sirius, Jupiter, Orion';
  buildLayers(); buildSpeed(); buildSites(); buildStart(); renderGuide(); buildLabels(); renderCoach(); syncTimeUI(true); buildJourney();
  if (state.sel) renderPanel();
  if (sky && sky.depth) rebuildDepthLabels();
  if (planApi) planApi.refresh();
}
let planApi = null;

/* ================================================================== layers */
function buildLayers() {
  const L = T('layers');
  $('#layers-list').innerHTML = Object.keys(state.show).map((k) =>
    `<button type="button" class="ly-row" role="switch" aria-checked="${state.show[k]}" data-k="${k}"><span class="ly-t">${esc(L[k][0])}<small>${esc(L[k][1])}</small></span><span class="sw" aria-hidden="true"></span></button>`).join('');
}
$('#layers-list').addEventListener('click', (e) => {
  const b = e.target.closest('.ly-row'); if (!b) return;
  const k = b.dataset.k; state.show[k] = !state.show[k]; b.setAttribute('aria-checked', String(state.show[k])); applyToggles();
});
function applyToggles() {
  const c = document.body.classList;
  c.toggle('names-off', !state.show.names); c.toggle('movers-off', !state.show.movers); c.toggle('bodies-off', !state.show.bodies);
  c.toggle('comets-off', !state.show.comets); c.toggle('meteors-off', !state.show.meteors);
  if (sky) { sky.lineGroup.visible = state.show.lines; sky.grid.visible = state.show.grid; sky.bodiesG.visible = state.show.bodies; sky.cometG.visible = state.show.comets; }
}

/* ================================================================== start card + coach */
function buildStart() {
  $('#start-list').innerHTML = T('startItems').map(([t, d], i) =>
    `<li><button type="button" class="start-item" data-i="${i}"><span class="start-n">${i + 1}</span><span class="start-t">${esc(t)}<small>${esc(d)}</small></span></button></li>`).join('');
}
function closeStart(remember) {
  $('#start').hidden = true; if (remember) { try { localStorage.setItem('sky-start-seen', '1'); } catch { /* ignore */ } }
  $('#coach').classList.toggle('is-hidden', state.coachDone);
}
$('#start-x').addEventListener('click', () => closeStart(true));
$('#start-list').addEventListener('click', (e) => {
  const b = e.target.closest('.start-item'); if (!b) return; closeStart(true);
  const i = +b.dataset.i;
  if (i === 0) { setGuide(true); $('#guide-body').scrollTop = 0; }
  else if (i === 1) select('const', 'Ori');
  else if (i === 2) select('mover', 'barnard');
  else if (i === 3) { Object.assign(state.t, { speed: 604800, dir: 1, playing: true, live: false }); syncTimeUI(true); if (state.eph) select('body', 'moon'); }
});
function renderCoach() {
  const el = $('#coach'), steps = T('hint');
  if (state.coachDone) { $('#coach-step').textContent = '✓'; $('#coach-text').textContent = T('hintDone'); return; }
  $('#coach-step').textContent = `${state.coach + 1}/${steps.length}`; $('#coach-text').textContent = steps[state.coach];
  el.classList.toggle('is-hidden', !$('#start').hidden);
}
function coachAdvance(from) {
  if (state.coachDone || state.coach !== from) return;
  if (from >= T('hint').length - 1) { state.coachDone = true; renderCoach(); setTimeout(() => $('#coach').classList.add('is-hidden'), 4200); return; }
  state.coach = from + 1; renderCoach();
}

/* ================================================================== solar-system positions (from the clock) */
function updatePositions() {
  const e = state.eph; if (!e) return;
  const jd = jdNow(), P = state.pos;
  P.sun = e.bodies.sun.at(jd); P.moon = e.bodies.moon.at(jd);
  for (const k of BODY_KEYS) if (e.bodies[k]) P[k] = e.bodies[k].at(jd);
  P.comets = {};
  for (const [k, tb] of Object.entries(e.comets)) P.comets[k] = tb.at(jd);
  P.phase = A.moonPhase(P.sun, P.moon);
  state.lastShowers = A.activeShowers(state.t.ms);
}
const lst = () => A.lstDeg(jdNow(), state.site.lon);
const altOf = (p) => (p ? A.altAz(p.ra, p.dec, lst(), state.site.lat) : null);

/* ================================================================== labels (real buttons: keyboard and screen-reader friendly) */
function buildLabels() {
  const host = $('#labels');
  host.querySelectorAll('.lbl').forEach((n) => n.remove());
  const items = [];
  const add = (el, get, opt = {}) => { host.appendChild(el); items.push({ el, get, ...opt }); };
  for (const code of Object.keys(state.cons)) {
    const c = CONSTELLATIONS[code], cc = state.cons[code];
    const b = Object.assign(document.createElement('button'), { className: 'lbl lbl-const', type: 'button' });
    b.dataset.id = code; b.innerHTML = `<span class="nm">${esc(pick(c.name))}</span><small>${esc(pick(c.nick))}</small>`;
    b.setAttribute('aria-label', `${pick(c.name)}: ${pick(c.nick)}`);
    b.addEventListener('click', () => select('const', code));
    b.addEventListener('pointerenter', () => setHover(code)); b.addEventListener('pointerleave', () => setHover(null));
    b.addEventListener('focus', () => setHover(code)); b.addEventListener('blur', () => setHover(null));
    const v = eq(cc.ra, Math.min(cc.dec + cc.radius * 1.05 + 1.5, 86), 10);
    add(b, () => v);
  }
  for (const m of MOVERS) {
    const b = Object.assign(document.createElement('button'), { className: 'lbl lbl-mover', type: 'button' });
    b.dataset.id = m.id; b.innerHTML = `<span class="ring"></span><span class="tag">${esc(pick(m.name))}</span>`;
    b.setAttribute('aria-label', `${pick(m.name)}: ${pick(m.kind)}`);
    b.addEventListener('click', () => select('mover', m.id));
    const v = eq(m.ra, m.dec, 10); add(b, () => v);
  }
  if (state.eph) {
    for (const k of ['sun', 'moon', ...BODY_KEYS]) if (state.eph.bodies[k]) {
      const b = Object.assign(document.createElement('button'), { className: `lbl lbl-body lbl-b-${k}`, type: 'button' });
      b.dataset.id = k; b.innerHTML = `<span class="dot"></span><span class="nm">${esc(pick(BODIES[k].name))}</span>`;
      b.setAttribute('aria-label', pick(BODIES[k].name)); b.addEventListener('click', () => select('body', k));
      add(b, () => { const p = state.pos[k]; return p ? eq(p.ra, p.dec, 10) : null; });
    }
    for (const [k, tb] of Object.entries(state.eph.comets)) {
      const b = Object.assign(document.createElement('button'), { className: 'lbl lbl-comet', type: 'button' });
      b.dataset.id = k; b.innerHTML = `<span class="dot"></span><span class="nm">${esc(tb.name)}</span><small class="cm"></small>`;
      b.setAttribute('aria-label', tb.name); b.addEventListener('click', () => select('comet', k));
      add(b, () => { const p = state.pos.comets && state.pos.comets[k]; return p ? eq(p.ra, p.dec, 10) : null; });
    }
  }
  const near = state.arrive && MOVERS.some((m) => Math.hypot((m.ra - state.arrive.ra) * Math.cos(m.dec * D2R), m.dec - state.arrive.dec) < 0.5);   // a named target already marks this spot
  if (state.found) {
    const b = Object.assign(document.createElement('div'), { className: 'lbl lbl-here is-found' });
    b.innerHTML = `<span class="ring"></span><span class="tag">${esc(state.found.name)}</span>`; const v = eq(state.found.ra, state.found.dec, 10); add(b, () => v);
  }
  if (state.arrive && !near) {
    const b = Object.assign(document.createElement('div'), { className: 'lbl lbl-here' });
    b.innerHTML = `<span class="ring"></span><span class="tag">${esc(T('here'))}</span>`; const v = eq(state.arrive.ra, state.arrive.dec, 10); add(b, () => v);
  }
  for (const s of A.SHOWERS) {
    const b = Object.assign(document.createElement('button'), { className: 'lbl lbl-shower', type: 'button' });
    b.dataset.id = s.id; b.innerHTML = `<span class="rad"></span><span class="nm">${esc(s.name)}</span>`;
    b.setAttribute('aria-label', `${s.name}: ${T('fRadiant')}`); b.addEventListener('click', () => select('shower', s.id));
    const v = eq(s.ra, s.dec, 10); add(b, () => v, { show: () => state.lastShowers.some((x) => x.id === s.id) });
  }
  for (const [k, w] of [['N', [0, 1.25, -10]], ['E', [10, 1.25, 0]], ['S', [0, 1.25, 10]], ['W', [-10, 1.25, 0]]]) {
    const el = Object.assign(document.createElement('div'), { className: 'lbl lbl-compass' }); el.textContent = T('compass')[k];
    add(el, () => w, { world: true, show: () => isLocal() });
  }
  state.skyLabels = items; markSelected();
}
function markSelected() {
  document.querySelectorAll('.lbl-const').forEach((b) => b.classList.toggle('is-sel', !!state.sel && state.sel.kind === 'const' && state.sel.id === b.dataset.id));
}
let hoverCode = null, hoverStar = -1, mouse = { x: 0, y: 0 };
function setHover(code) {
  if (hoverCode === code) return;
  hoverCode = code;
  document.querySelectorAll('.lbl-const').forEach((b) => b.classList.toggle('is-on', b.dataset.id === code));
  document.body.classList.toggle('is-hover', !!code || hoverStar >= 0);
  if (sky) sky.styleLines();
}

/* ================================================================== star hover card */
const starTemp = (s) => Math.round(A.bvToKelvin(clamp(s.bv, -0.4, 2.2)) / 10) * 10;
function describeStar(s) {
  const letter = (s.sp.match(/[OBAFGKM]/) || [''])[0], cls = (s.sp.match(/(IV|III|II|I|V)(?=[ab\-+/:pnsk]|$)/) || [''])[0];
  const colour = letter ? T('colourWord')[letter] : '', noun = cls ? T('classNoun')[cls] : '';
  return { colour, noun, text: [colour, noun].filter(Boolean).join(' '), letter, cls };
}
const swatch = (s) => { const c = A.starRGB(s.bv).map((x) => Math.round(x * 255)); return `rgb(${c[0]},${c[1]},${c[2]})`; };
const pmTotal = (s) => Math.hypot(s.pmra, s.pmdec) / 1000;   // arcsec per year
function showTip(i) {
  const tip = $('#tip');
  if (i < 0) { tip.hidden = true; return; }
  const s = starOf(i), d = describeStar(s);
  tip.innerHTML = `<div class="tip-h"><i class="sw-dot" style="background:${swatch(s)}"></i><b>${esc(s.name)}</b></div>` +
    `<div class="tip-l">${esc(d.text || s.sp || '')}</div>` +
    `<div class="tip-g mono"><span>${T('magShort')} ${nf(s.mag, 1)}</span>${s.ly ? `<span>${nf(s.ly)} ${T('ly')}</span>` : ''}<span>${nf(starTemp(s))} K</span></div>`;
  tip.hidden = false; placeTip();
}
function placeTip() {
  const tip = $('#tip'); if (tip.hidden) return;
  tip.style.transform = `translate(${clamp(mouse.x + 16, 8, innerWidth - tip.offsetWidth - 8)}px, ${clamp(mouse.y + 18, 8, innerHeight - tip.offsetHeight - 8)}px)`;
}

/* ================================================================== detail panel */
const CLOSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const describePlain = (sp) => describeStar({ sp });
const sv = (survey, ra, dec, size, px = 320) => `https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl?Survey=${encodeURIComponent(survey)}&position=${ra.toFixed(5)},${dec.toFixed(5)}&Size=${size}&Pixels=${px}&Return=JPEG`;
function plates(ra, dec, size, note) {
  const fig = (survey, cap) => `<figure><div class="plate shim"><img class="sv" alt="" src="${sv(survey, ra, dec, size)}"><span class="plate-x">${T('imgFail')}</span></div><figcaption>${cap}</figcaption></figure>`;
  return `<div class="p-sec"><h3>${T('imgTitle')}</h3><div class="plates">${fig('DSS1 Red', T('img1'))}${fig('DSS2 Red', T('img2'))}</div><p class="p-note">${note || T('imgNote')}</p></div>`;
}
const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const row = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
const viewerUrl = (ra, dec, fov = 240, band = 'SD2') => `index.html?ra=${ra.toFixed(5)}&dec=${dec.toFixed(5)}&band=${band}&fov=${fov}`;
const raDecText = (ra, dec) => `RA ${ra.toFixed(4)}° · Dec ${dec >= 0 ? '+' : '−'}${Math.abs(dec).toFixed(4)}°`;

function renderPanel() {
  const panel = $('#panel'), { kind, id } = state.sel;
  let html = `<button class="icon-btn x" type="button" id="panel-close" aria-label="${T('close')}">${CLOSE_SVG}</button>`, cta = '';
  if (kind === 'const') {
    const meta = CONSTELLATIONS[id], c = state.cons[id], year = new Date(state.t.ms).getFullYear();
    const rows = [...c.stars].filter((s) => s.ly).sort((a, b) => (a.mag ?? 9) - (b.mag ?? 9)).slice(0, 4).map((s) => {
      const d = describePlain(s.sp || '');
      return `<li><b>${esc(s.name)}</b><span class="d">${nf(s.ly)} ${T('ly')}</span><small>${d.text ? esc(d.text) + ' · ' : ''}${T('lightLeft')} ${year - s.ly}</small></li>`;
    }).join('');
    html += `<p class="p-eyebrow">${T('constLabel')}</p><h2>${esc(pick(meta.name))}</h2><p class="p-nick">${esc(pick(meta.nick))}</p>` +
      `<div class="p-sec"><h3>${T('howToFind')}</h3><p>${esc(pick(meta.find))}</p></div><div class="p-sec"><h3>${T('didYouKnow')}</h3><p>${esc(pick(meta.fact))}</p></div>` +
      `<div class="p-sec"><h3>${T('brightest')}</h3><ul class="stars">${rows}</ul><p class="p-note">${T('brightestNote')}</p></div>`;
    if (sky) cta = `<button class="btn btn-primary btn-wide" type="button" id="go-3d">${T('see3d')}</button>`;
  } else if (kind === 'mover') {
    const m = MOVERS.find((x) => x.id === id);
    html += `<p class="p-eyebrow is-mover">${T('moverLabel')}</p><h2>${esc(pick(m.name))}</h2><p class="p-nick">${esc(pick(m.kind))}</p>` +
      `<div class="p-sec"><p>${esc(pick(m.story))}</p></div>` +
      `<div class="p-sec"><dl class="facts">${row(T('constellationIn'), m.constellation)}${row(T('distance'), esc(pick(m.stats.distance)))}${row(T('motion'), esc(pick(m.stats.motion)))}${row(T('coords'), raDecText(m.ra, m.dec))}</dl></div>` +
      plates(m.ra, m.dec, 0.5, m.id === 'wise0855' ? T('imgIr') : T('imgNote')) +
      `<div class="p-sec"><h3>${T('movers')}</h3><p>${T('moversBody')}</p></div>`;
    cta = `<a class="btn btn-amber btn-wide" href="${viewerUrl(m.ra, m.dec, m.fov, m.band)}">${T('watch')}</a><p class="p-note">${T('watchNote')}</p>`;
  } else if (kind === 'star') {
    const s = starOf(id), d = describeStar(s), M = A.absMag(s.mag, s.ly), lum = M == null ? null : A.lumSolar(M), pm = pmTotal(s);
    const moonYears = pm > 0.005 ? Math.round(MOON_ARCSEC / pm) : 0;
    html += `<p class="p-eyebrow"><i class="sw-dot" style="background:${swatch(s)}"></i>${esc(d.text || T('starLabel'))}</p><h2>${esc(s.name)}</h2>` +
      `<p class="p-nick">${d.cls && T('classHint')[d.cls] ? esc(T('classHint')[d.cls]) : esc(s.sp)}</p>` +
      `<div class="p-sec"><dl class="facts">` +
      row(T('fMag'), nf(s.mag, 2)) + (s.ly ? row(T('fDist'), `${nf(s.ly)} ${T('ly')}`) : '') +
      row(T('fTemp'), `${nf(starTemp(s))} K<small>${T('starTempNote')}</small>`) +
      (lum ? row(T('fLum'), `${nf(lum, lum < 10 ? 1 : 0)} ${T('starLumNote')}`) : '') +
      (s.sp ? row(T('fType'), esc(s.sp)) : '') +
      row(T('fMotion'), pm > 0.005 ? `${nf(pm, 2)}″ / ${T('yr')}<small>${moonYears ? fmt(T('moonWidth'), { n: nf(moonYears) }) : ''}</small>` : T('noMotion')) +
      row(T('fPos'), raDecText(s.ra, s.dec)) + `</dl><div id="live"></div></div>` + plates(s.ra, s.dec, 0.15);
    cta = `<a class="btn btn-primary btn-wide" href="${viewerUrl(s.ra, s.dec)}">${T('openViewer')}</a><p class="p-note">${T('viewerNote')}</p>`;
  } else if (kind === 'point') {
    const o = id, mu = o.pm_mas_yr;
    html += `<p class="p-eyebrow">${T('foundLabel')}</p><h2>${esc(o.name)}</h2><p class="p-nick">${esc([o.sp_type, o.otype].filter(Boolean).join(' · '))}</p>` +
      `<div class="p-sec"><dl class="facts">${row(T('fPos'), raDecText(o.ra, o.dec))}${mu ? row(T('foundDist'), `${nf(mu / 1000, 2)}″ / ${T('yr')}`) : ''}</dl></div>` + plates(o.ra2000, o.dec2000, 0.15);
    cta = `<a class="btn btn-primary btn-wide" href="${viewerUrl(o.ra, o.dec)}">${T('openViewer')}</a>`;
  } else if (kind === 'body') {
    const b = BODIES[id];
    html += `<p class="p-eyebrow">${id === 'sun' ? T('starLabel') : id === 'moon' ? T('moonLabel') : T('planetLabel')}</p><h2>${esc(pick(b.name))}</h2><p class="p-nick" id="live-nick"></p>` +
      `<div class="p-sec"><p>${esc(pick(b.story))}</p></div><div class="p-sec"><dl class="facts" id="live"></dl></div>` + (id === 'sun' ? `<p class="p-note warn">${T('sunWarn')}</p>` : '');
  } else if (kind === 'comet') {
    const tb = state.eph.comets[id], f = tb.facts || {};
    html += `<p class="p-eyebrow is-mover">${T('cometLabel')}</p><h2>${esc(tb.name)}</h2><p class="p-nick" id="live-nick"></p>` +
      `<div class="p-sec"><dl class="facts" id="live"></dl></div>` +
      `<div class="p-sec"><h3>${T('cometFacts')}</h3><dl class="facts">` +
      (f.perihelionAU != null ? row(T('fPeri'), `${nf(f.perihelionAU, 3)} ${T('au')}<small>${fmtDate(f.perihelionDate)}</small>`) : '') +
      (f.closestAU != null ? row(T('fClose'), `${nf(f.closestAU, 3)} ${T('au')}<small>${fmtDate(f.closestDate)}</small>`) : '') +
      (f.brightestMag != null ? row(T('fBest'), `${T('magShort')} ${nf(f.brightestMag, 1)}<small>${fmtDate(f.brightestDate)}</small>`) : '') +
      `</dl><p class="p-note">${T('cometBright')}</p></div><div class="p-sec"><p>${T('tailNote')}</p></div>`;
    cta = `<a class="btn btn-solid btn-wide" target="_blank" rel="noopener" href="https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(tb.name.replace(/ \(.*/, ''))}">${T('jplLink')}</a>`;
  } else if (kind === 'shower') {
    const s = A.SHOWERS.find((x) => x.id === id);
    html += `<p class="p-eyebrow">${T('showerLabel')}</p><h2>${esc(s.name)}</h2><p class="p-nick" id="live-nick"></p>` +
      `<div class="p-sec"><p>${T('showerWhat')}</p></div><div class="p-sec"><dl class="facts" id="live"></dl></div>`;
  }
  html += `<div class="p-cta">${cta}${COL ? `<button class="btn btn-solid btn-wide" type="button" id="p-save">${T('saveBtn')}</button>` : ''}</div>`;
  panel.innerHTML = html; panel.hidden = false; panel.scrollTop = 0;
  if (planApi) planApi.mountPanel(panel, state.sel);
  $('#p-save')?.addEventListener('click', saveCurrent);
  $('#panel-close').addEventListener('click', closePanel);
  const g = $('#go-3d'); if (g) g.addEventListener('click', () => enterDepth(id));
  panel.querySelectorAll('img.sv').forEach((img) => {
    const box = img.parentElement;
    img.addEventListener('load', () => { if (img.naturalWidth > 8) box.classList.remove('shim'); else { box.classList.remove('shim'); box.classList.add('fail'); } });
    img.addEventListener('error', () => { box.classList.remove('shim'); box.classList.add('fail'); });
  });
  renderLive();
}

/* Facts that depend on the clock; refreshed every second while their panel is open. */
function renderLive() {
  if (!state.sel || $('#panel').hidden) return;
  const { kind, id } = state.sel, P = state.pos, live = $('#live'); if (!live) return;
  const alt = (p) => { if (!isLocal() || !p) return ''; const a = altOf(p).alt; return row(T('fAlt'), `${nf(Math.abs(a), 0)}° ${a >= 0 ? T('aboveHorizon') : T('belowHorizon')}`); };
  if (kind === 'body' && P[id]) {
    const p = P[id], d = p.delta, km = d * 149597870.7, lightMin = d * 8.3168, nick = $('#live-nick');
    if (id === 'moon') {
      const ph = P.phase;
      nick.textContent = `${T('phases')[A.moonPhaseName(ph.fraction, ph.waxing)]} · ${nf(ph.fraction * 100)}% ${T('lit')}`;
      live.innerHTML = row(T('fDist'), `${nf(km)} km`) + row(T('fLight'), `${nf(lightMin * 60, 1)} s`) + alt(p);
    } else if (id === 'sun') {
      nick.textContent = '';
      live.innerHTML = row(T('fDist'), `${nf(d, 3)} ${T('au')}<small>${nf(km / 1e6, 1)} million km</small>`) + row(T('fLight'), `${nf(lightMin, 1)} ${T('lightMin')}`) + alt(p);
    } else {
      nick.textContent = `${T('mag')} ${nf(p.mag, 1)}`;
      live.innerHTML = row(T('fDist'), `${nf(d, 2)} ${T('au')}`) + row(T('fLight'), lightMin > 90 ? `${nf(lightMin / 60, 1)} ${T('lightHr')}` : `${nf(lightMin, 1)} ${T('lightMin')}`) + row(T('fMag'), nf(p.mag, 1)) + alt(p);
    }
  } else if (kind === 'comet' && P.comets && P.comets[id]) {
    const p = P.comets[id], faint = p.mag == null || p.mag > 13;
    $('#live-nick').textContent = faint ? T('cometFaint') : `${T('mag')} ${nf(p.mag, 1)}`;
    live.innerHTML = row(T('fRange'), `${nf(p.r, 2)} ${T('au')}`) + row(T('fDistEarth'), `${nf(p.delta, 2)} ${T('au')}`) + row(T('fMag'), p.mag == null ? '–' : nf(p.mag, 1)) + alt(p);
  } else if (kind === 'shower') {
    const s = A.SHOWERS.find((x) => x.id === id), now = A.activeShowers(state.t.ms).find((x) => x.id === id), dd = A.daysToPeak(s, state.t.ms), n = Math.round(Math.abs(dd));
    $('#live-nick').textContent = n === 0 ? T('atPeak') : fmt(dd < 0 ? T('daysBefore') : T('daysAfter'), { n });
    live.innerHTML = row(T('fNow'), now ? `${nf(now.activity * 100)}%` : '< 3%') + row(T('fRate'), `${now ? nf(now.zhrNow, 0) : '0'} <small>(max ${nf(s.zhr)})</small>`) +
      row(T('fPeak'), new Date(Date.UTC(2000, s.m - 1, s.d)).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' })) +
      row(T('fRadiant'), raDecText(s.ra, s.dec)) + row(T('fSpeed'), `${s.km} ${T('kmps')}`) + row(T('fParent'), esc(s.parent));
  } else if (kind === 'star') {
    if (isLocal()) { const s = starOf(id), a = A.altAz(s.ra, s.dec, lst(), state.site.lat).alt; live.innerHTML = `<dl class="facts">${row(T('fAlt'), `${nf(Math.abs(a), 0)}° ${a >= 0 ? T('aboveHorizon') : T('belowHorizon')}`)}</dl>`; }
    else live.innerHTML = '';
  }
}
setInterval(() => { renderLive(); if (!$('#site-pop').hidden) buildSites(); if (!$('#guide').hidden) renderGuideLive(); }, 1000);
function closePanel() { state.sel = null; state.track = null; $('#panel').hidden = true; $('#star-ring').hidden = true; markSelected(); if (sky) sky.styleLines(); }

/* ================================================================== select + fly */
function targetEq(sel) {
  const { kind, id } = sel;
  if (kind === 'const') return { ra: state.cons[id].ra, dec: state.cons[id].dec };
  if (kind === 'mover') { const m = MOVERS.find((x) => x.id === id); return { ra: m.ra, dec: m.dec }; }
  if (kind === 'star') { const s = starOf(id); return { ra: s.ra, dec: s.dec }; }
  if (kind === 'body') return state.pos[id] || null;
  if (kind === 'comet') return (state.pos.comets && state.pos.comets[id]) || null;
  if (kind === 'shower') { const s = A.SHOWERS.find((x) => x.id === id); return { ra: s.ra, dec: s.dec }; }
  if (kind === 'point') return { ra: id.ra, dec: id.dec };
  return null;
}
function select(kind, id) {
  if (state.mode === 'depth') exitDepth(true);
  if (state.mode === 'intro') return;
  closeStart(true); setGuide(false); setPop('#layers', false);
  if (kind === 'point') { state.found = id; buildLabels(); }
  state.sel = { kind, id };
  renderPanel(); markSelected(); coachAdvance(2);
  if (!sky) return;
  sky.styleLines();
  const t = targetEq(state.sel); if (!t) return;
  if (isLocal() && A.altAz(t.ra, t.dec, lst(), state.site.lat).alt < 1) {
    const nm = $('#panel h2')?.textContent || ''; setSkyMode('map'); toast(fmt(T('belowNow'), { n: nm }));
  }
  const fov = kind === 'const' ? clamp(state.cons[id].radius * 2.7 + 14, 24, 80) : kind === 'mover' ? 22 : kind === 'point' ? 16 : kind === 'star' ? 18 : kind === 'shower' ? 55 : id === 'moon' || id === 'sun' ? 12 : 20;
  flyTo(t.ra, t.dec, fov, true);
  state.track = (isLocal() || kind === 'body' || kind === 'comet') ? () => targetEq(state.sel) : null;
}

/* ================================================================== guide drawer */
function setGuide(open) {
  $('#guide').hidden = !open; $('#guide-open').setAttribute('aria-expanded', String(open));
  if (open) { setPop('#layers', false); renderGuide(); $('#search').focus(); } else if (!$('#ui').hidden) $('#guide-open').focus({ preventScroll: true });
}
$('#guide-open').addEventListener('click', () => setGuide($('#guide').hidden));
$('#guide-close').addEventListener('click', () => setGuide(false));
const item = (kind, id, title, sub, cls = '') => `<button class="item ${cls}" type="button" data-kind="${kind}" data-id="${esc(id)}"><b>${esc(title)}</b><span>${esc(sub)}</span></button>`;
function nowItems() {
  const P = state.pos; if (!state.eph || !P.moon) return '';
  const ph = P.phase, altTxt = (p) => { if (!isLocal()) return ''; const a = altOf(p).alt; return ` · ${a >= 0 ? nf(a, 0) + '° ' + T('aboveHorizon') : T('belowHorizon')}`; };
  const out = [item('body', 'moon', pick(BODIES.moon.name), `${T('phases')[A.moonPhaseName(ph.fraction, ph.waxing)]} · ${nf(ph.fraction * 100)}% ${T('lit')}${altTxt(P.moon)}`)];
  for (const k of BODY_KEYS) if (P[k]) out.push(item('body', k, pick(BODIES[k].name), `${T('mag')} ${nf(P[k].mag, 1)}${altTxt(P[k])}`));
  return out.join('');
}
function showerItems() {
  const sh = A.activeShowers(state.t.ms).filter((s) => s.activity > 0.08);
  if (!sh.length) return `<p class="group-sub">${T('guideShowersNone')}</p>`;
  return sh.map((s) => { const dd = A.daysToPeak(s, state.t.ms), n = Math.round(Math.abs(dd)); return item('shower', s.id, s.name, `${n === 0 ? T('atPeak') : fmt(dd < 0 ? T('daysBefore') : T('daysAfter'), { n })} · ${nf(s.zhrNow, 0)} / ${lang === 'vi' ? 'giờ' : 'h'}`); }).join('');
}
function cometItems() {
  if (!state.eph) return '';
  return Object.entries(state.eph.comets).map(([k, tb]) => { const p = state.pos.comets && state.pos.comets[k]; return item('comet', k, tb.name, p && p.mag != null ? `${T('mag')} ${nf(p.mag, 1)}${p.mag > 13 ? ' · ' + T('cometFaintShort') : ''}` : ''); }).join('');
}
function renderGuide() {
  const body = $('#guide-body'); if (!body) return;
  const consItems = Object.keys(state.cons).map((code) => item('const', code, pick(CONSTELLATIONS[code].name), pick(CONSTELLATIONS[code].nick))).join('');
  const moverItems = MOVERS.map((m) => item('mover', m.id, pick(m.name), pick(m.kind), 'is-mover')).join('');
  body.innerHTML =
    (state.eph ? `<h3 class="group-title">${T('guideNow')}</h3><p class="group-sub">${T('guideNowSub')}</p><div id="g-now">${nowItems()}</div>` +
      `<h3 class="group-title">${T('guideShowers')}</h3><div id="g-showers">${showerItems()}</div>` +
      `<h3 class="group-title">${T('guideComets')}</h3><p class="group-sub">${T('guideCometsSub')}</p><div id="g-comets">${cometItems()}</div>` : '') +
    `<h3 class="group-title">${T('guideMovers')}</h3><p class="group-sub">${T('guideMoversSub')}</p>${moverItems}` +
    `<h3 class="group-title">${T('guideConst')}</h3><p class="group-sub">${T('guideConstSub')}</p>${consItems}`;
}
function renderGuideLive() {
  if (!state.eph || !$('#g-now')) return;
  $('#g-now').innerHTML = nowItems(); $('#g-showers').innerHTML = showerItems(); $('#g-comets').innerHTML = cometItems();
}
$('#guide-body').addEventListener('click', (e) => { const b = e.target.closest('.item'); if (b) select(b.dataset.kind, b.dataset.id); });

/* search: stars (by name), bodies, constellations, movers, comets */
function searchAll(q) {
  q = q.trim().toLowerCase(); if (!q || !state.stars) return [];
  const out = [], has = (s) => s.toLowerCase().includes(q);
  for (const code of Object.keys(state.cons)) { const c = CONSTELLATIONS[code]; if (has(c.name.en) || has(c.name.vi) || has(c.nick.en) || has(c.nick.vi)) out.push({ kind: 'const', id: code, t: pick(c.name), s: T('constLabel') }); }
  if (state.eph) for (const k of ['sun', 'moon', ...BODY_KEYS]) if (has(BODIES[k].name.en) || has(BODIES[k].name.vi)) out.push({ kind: 'body', id: k, t: pick(BODIES[k].name), s: k === 'sun' ? T('starLabel') : k === 'moon' ? T('moonLabel') : T('planetLabel') });
  for (const m of MOVERS) if (has(m.name.en) || has(m.name.vi)) out.push({ kind: 'mover', id: m.id, t: pick(m.name), s: T('moverLabel') });
  if (state.eph) for (const [k, tb] of Object.entries(state.eph.comets)) if (has(tb.name)) out.push({ kind: 'comet', id: k, t: tb.name, s: T('cometLabel') });
  const stars = []; state.stars.f.forEach((s, i) => { if (s[8] && s[8].toLowerCase().includes(q)) stars.push([s[2], i]); });
  stars.sort((a, b) => a[0] - b[0]).slice(0, 8).forEach(([, i]) => { const s = starOf(i); out.push({ kind: 'star', id: i, t: s.name, s: `${T('starLabel')} · ${T('magShort')} ${nf(s.mag, 1)}` }); });
  // a constellation name lists its brightest real stars (IAU boundaries + SIMBAD), so a picture of "Orion" gives a pick-list of stars
  const hits = window.SpaceConst ? window.SpaceConst.search(q, 10) : [];
  if (hits.length) {
    const c = hits[0], list = out.slice(0, 3).filter((x) => x.kind !== 'star');
    out.length = 0; out.push(...list.filter((x) => x.kind !== 'const'), { kind: 'cons', id: c.code, t: `${c.name} · ${c.count} ${lang === 'vi' ? 'sao' : 'stars'}`, s: lang === 'vi' ? 'Xem lịch ngắm' : 'When to watch' });
    for (const s of c.stars) out.push({ kind: 'star', id: s.i, t: s.name || 'HIP star', s: `${T('starLabel')} · ${T('magShort')} ${nf(s.mag, 1)}${s.ly ? ' · ' + nf(s.ly, 0) + (lang === 'vi' ? ' nas' : ' ly') : ''}` });
    return out;
  }
  return out.slice(0, 10);
}
const pickResult = (b) => (b.dataset.kind === 'cons' ? (planApi && planApi.openConst(b.dataset.id)) : b.dataset.kind === 'simbad' ? simbadLookup(b.dataset.q) : select(b.dataset.kind, b.dataset.kind === 'star' ? +b.dataset.id : b.dataset.id));
function parseCoordsText(q) {
  const p = q.replace(/[,;]/g, ' ').trim().split(/\s+/).map((x) => Number(x.replace('\u2212', '-')));
  return p.length === 2 && p.every(Number.isFinite) && p[0] >= 0 && p[0] <= 360 && Math.abs(p[1]) <= 90 ? { ra: p[0], dec: p[1] } : null;
}
async function simbadLookup(q) {
  const c = parseCoordsText(q); if (c) { select('point', { name: `${c.ra.toFixed(3)}, ${c.dec.toFixed(3)}`, ra: c.ra, dec: c.dec, ra2000: c.ra, dec2000: c.dec }); return; }
  toast(fmt(T('simbadWait'), { q }));
  try {
    const r = await fetch(`/api/resolve?name=${encodeURIComponent(q)}`).then((x) => x.json());
    if (r.ok) select('point', r); else toast(fmt(T('simbadNone'), { q }));
  } catch { toast(fmt(T('simbadNone'), { q })); }
}
$('#search').addEventListener('input', (e) => {
  const r = searchAll(e.target.value), box = $('#search-results');
  box.hidden = !e.target.value.trim();
  const q = e.target.value.trim();
  box.innerHTML = r.map((x) => `<button type="button" role="option" class="sr-item${x.kind === 'cons' ? ' sr-head' : ''}" data-kind="${x.kind}" data-id="${x.id}"><b>${esc(x.t)}</b><span>${esc(x.s)}</span></button>`).join('') +
    (q.length >= 2 ? `<button type="button" role="option" class="sr-item sr-simbad" data-kind="simbad" data-q="${esc(q)}"><b>${esc(fmt(T('simbadFor'), { q }))}</b><span>SIMBAD</span></button>` : '');
});
$('#search').addEventListener('keydown', (e) => { if (e.key === 'Enter') { const b = $('#search-results .sr-item'); if (b) { e.preventDefault(); pickResult(b); } } });
$('#search-results').addEventListener('click', (e) => { const b = e.target.closest('.sr-item'); if (b) pickResult(b); });


/* ================================================================== the opening journey */
const J = { p: 0, target: 0, px: 0, py: 0, tx: 0, ty: 0 };
const PLANETS_AU = [['mercury', 0.387, 0.2408], ['venus', 0.723, 0.6152], ['earth', 1, 1], ['mars', 1.524, 1.8808], ['jupiter', 5.203, 11.862], ['saturn', 9.537, 29.457], ['uranus', 19.19, 84.02], ['neptune', 30.07, 164.8]];
const orbitR = (au) => 185 * (Math.log10(au) + 0.6) / (Math.log10(700) + 0.6);   // log scale so Mercury and a 500 AU orbit fit one picture
const BAND_RANGES = [[0.75, 1.11, 'D1'], [1.11, 1.64, 'D2'], [1.64, 2.42, 'D3'], [2.42, 3.82, 'D4'], [3.82, 4.42, 'D5'], [4.42, 5.0, 'D6']];
const BAND_COLOURS = ['#4aa3ff', '#38d0c9', '#8be08b', '#f2d45c', '#f5a54a', '#ef6a4a'];
const MOVER_ORDER = ['barnard', 'wise0855', 'rdra', 'rwaur', 'epsindib'];

function buildJourney() {
  // chapter 1: stats + real orbits at their true periods (Earth = 8 s)
  $('#stats1').innerHTML = ['jStat1', 'jStat2', 'jStat3'].map((k) => `<div><dt>${esc(T(k)[0])}</dt><dd>${esc(T(k)[1])}</dd></div>`).join('');
  const sun = BODIES.sun.colour;
  let svg = `<circle class="sun" r="3.2"/>`;
  for (const [k, au, yr] of PLANETS_AU) {
    const r = orbitR(au).toFixed(1), col = k === 'earth' ? [0.55, 0.78, 1] : BODIES[k].colour, c = col.map((x) => Math.round(x * 255)).join(',');
    svg += `<circle class="ring" r="${r}"/><g class="pl" style="--T:${(8 * yr).toFixed(1)}s"><circle cx="${r}" r="${k === 'jupiter' || k === 'saturn' ? 3 : 2.2}" fill="rgb(${c})"/></g>`;
  }
  const rx = orbitR(500).toFixed(1);
  svg += `<circle class="ring x" r="${rx}"/><text class="xl" x="0" y="${-(+rx) - 6}" text-anchor="middle">${esc(T('jOrbitX'))}</text><text x="${orbitR(30.07) + 4}" y="-4" style="font-size:8px">Neptune</text>`;
  $('#orbits').innerHTML = svg;

  // chapter 2: the spectrum, to scale (0.35 to 5.1 micrometres)
  const X = (um) => ((um - 0.35) / 4.75) * 100;
  let spec = `<span class="spec-eye-lbl" style="left:${X(0.4)}%">${esc(T('jEye'))}</span><div class="spec-bar"><div class="spec-eye" style="left:${X(0.4)}%;width:${X(0.7) - X(0.4)}%"></div>` +
    BAND_RANGES.map(([a, b, id], i) => `<button type="button" class="spec-seg${i === 5 ? ' is-on' : ''}" data-i="${i}" style="--c:${BAND_COLOURS[i]};left:${X(a)}%;width:${X(b) - X(a)}%" aria-label="${id} ${a} to ${b} micrometres">${id}</button>`).join('') +
    `</div><div class="spec-axis">${[0.5, 1, 2, 3, 4, 5].map((u) => `<span style="left:${X(u)}%">${u}</span>`).join('')}</div><p class="spec-cap">${esc(T('jAxis'))} · ${esc(T('jFalse'))}</p><div class="spec-read" id="spec-read" aria-live="polite"></div>`;
  $('#spec').innerHTML = spec;
  const showBand = (i) => {
    const [a, b, id] = BAND_RANGES[i];
    $('#spec-read').style.setProperty('--c', BAND_COLOURS[i]);
    $('#spec-read').innerHTML = `<b><i></i>${id}<em>${String(a).replace('.', lang === 'vi' ? ',' : '.')} to ${String(b).replace('.', lang === 'vi' ? ',' : '.')} µm</em></b><p>${esc(T('jBands')[i][0])}</p>`;
    document.querySelectorAll('.spec-seg').forEach((el, j) => el.classList.toggle('is-on', j === i));
  };
  $('#spec').querySelectorAll('.spec-seg').forEach((el) => { const i = +el.dataset.i; ['pointerenter', 'focus', 'click'].forEach((ev) => el.addEventListener(ev, () => showBand(i))); });
  showBand(5);

  // chapter 3: the five targets, drawn from this project's own research notes
  const vis = {
    barnard: `<path class="trail" d="M8 23H66"/><g class="mvdot" style="--dx:52px;--d:3s"><circle class="pt" cx="9" cy="23" r="3.6"/></g>`,
    wise0855: `<path class="trail" d="M8 23H66"/><g class="mvdot" style="--dx:41px;--d:3.4s"><circle class="pt" cx="9" cy="23" r="3.6"/></g>`,
    rdra: `<circle class="pt pulse" cx="37" cy="23" r="16"/>`,
    rwaur: `<circle class="pt flick" cx="37" cy="23" r="9"/>`,
    epsindib: `<g class="orb"><circle class="pt" cx="25" cy="23" r="4.2"/><circle class="pt" cx="50" cy="23" r="2.8"/></g>`,
  };
  $('#mlist').innerHTML = MOVER_ORDER.map((id, i) => {
    const m = MOVERS.find((x) => x.id === id), t = T('jMovers')[i];
    return `<li class="mv"><a href="index.html?ra=${m.ra}&dec=${m.dec}&band=${m.band}&fov=${m.fov}"><svg viewBox="0 0 74 46" aria-hidden="true">${vis[id]}</svg><span><b>${esc(pick(m.name))}</b><span class="cap">${esc(t[1])}</span></span><span class="num">${esc(t[0])}</span></a></li>`;
  }).join('');

  // chapter 4: the path, with live numbers from the data that is actually loaded
  const live = [];
  if (state.stars) live.push(`${nf(state.stars.n)} ${lang === 'vi' ? 'sao' : 'stars'}`);
  if (state.pos.phase) live.push(`${T('jMoonLit')} ${nf(state.pos.phase.fraction * 100)}%`);
  if (state.eph) live.push(`${Object.keys(state.eph.comets).length} ${T('jCometsTracked')}`);
  $('#path').innerHTML = T('jSteps').map(([h, p], i) =>
    `<li data-n="${i + 1}"><h3>${esc(h)}</h3><p>${esc(fmt(p, { n: state.stars ? nf(state.stars.n) : '' }).replace('  ', ' '))}</p>${i === 0 && live.length ? `<span class="live">${live.map(esc).join(' · ')}</span>` : ''}</li>`).join('');

  // chapter rail
  const names = [lang === 'vi' ? 'Mở đầu' : 'Start', T('jK1'), T('jK2'), T('jK3'), T('jK4'), T('jK5')];
  $('#jrail').setAttribute('aria-label', T('jRail'));
  $('#jrail').innerHTML = names.map((n, i) => `<button type="button" data-i="${i}" aria-label="${esc(n)}"><span>${esc(n)}</span></button>`).join('');
  markChapter(J.chap || 0);
}
function markChapter(i) { J.chap = i; document.querySelectorAll('#jrail button').forEach((b) => { if (+b.dataset.i === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); }
function bindJourney() {
  const jr = $('#journey'), chaps = [...document.querySelectorAll('.chap')];
  const upd = () => {
    const max = jr.scrollHeight - jr.clientHeight; J.target = max > 0 ? clamp(jr.scrollTop / max, 0, 1) : 0;
    const mid = jr.scrollTop + jr.clientHeight * 0.45;   // the chapter under the middle of the screen is the current one, however tall it is
    let cur = 0; chaps.forEach((c, i) => { if (c.offsetTop <= mid) cur = i; });
    if (cur !== J.chap) markChapter(cur);
  };
  jr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  // reveal as soon as any part of a chapter is on screen (a ratio threshold never fires for chapters taller than the window)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-in'); }), { root: jr, threshold: 0, rootMargin: '0px 0px -6% 0px' });
  chaps.forEach((c) => io.observe(c));
  setTimeout(() => chaps.forEach((c) => { const b = c.getBoundingClientRect(); if (b.top < innerHeight && b.bottom > 0) c.classList.add('is-in'); }), 600);
  $('#jrail').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) chaps[+b.dataset.i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
  $('#begin').addEventListener('click', () => $('#c1').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
  $('#skip-sky').addEventListener('click', () => enterSky(false));
  addEventListener('pointermove', (e) => { if (state.mode === 'intro') { J.tx = (e.clientX / innerWidth - 0.5) * 2; J.ty = (e.clientY / innerHeight - 0.5) * 2; } }, { passive: true });
}
/* ================================================================== 3D runtime */
const view = { ra: 75, dec: -4.5, fov: 60 };
let tween = null, vel = { ra: 0, dec: 0 }, fovTarget = null, dragging = false;

function viewDirFor(ra, dec) {
  if (!isLocal()) return { a: ra, p: dec };
  const e = A.vecToEq(A.applyRows(state.M, eq(ra, dec))); return { a: e.ra, p: e.dec };
}
function panelShift(fov, p) { if (innerWidth <= 900 || !state.sel) return 0; const h = 2 * Math.atan(Math.tan(fov * D2R / 2) * (innerWidth / innerHeight)) / D2R; return (h * 0.17) / Math.max(Math.cos(p * D2R), 0.25); }
function flyTo(ra, dec, fov, panelAware) {
  const d = viewDirFor(ra, dec); let toA = d.a, toP = clamp(d.p, -84, 84);
  if (panelAware) { toA -= panelShift(fov, toP); if (innerWidth <= 720) toP -= fov * 0.2; }
  if (isLocal()) toP = Math.max(toP, fov * 0.12);   // target below the horizon: keep the horizon in frame instead of staring at the ground
  const from = { ...view }, dRa = ((toA - from.ra + 540) % 360) - 180;
  tween = { t0: performance.now(), dur: reduce ? 1 : 1500, from, dRa, dDec: clamp(toP, -84, 84) - from.dec, dFov: fov - from.fov };
  fovTarget = fov; vel = { ra: 0, dec: 0 };
}
/* Zoom transition into the viewer: the camera dives toward the star while a bright veil grows, then the viewer opens with the matching zoom-out. */
let leaving = false;
function zoomIntoViewer(url) {
  if (leaving) return; leaving = true;
  const q = new URL(url, location.href).searchParams, ra = parseFloat(q.get('ra')), dec = parseFloat(q.get('dec'));
  const go = () => { try { sessionStorage.setItem('space-vi-zoom', '1'); } catch { /* ignore */ } location.href = url; };
  if (reduce || !sky || !Number.isFinite(ra) || !Number.isFinite(dec) || state.mode !== 'sky') { go(); return; }
  const veil = document.createElement('div'); veil.className = 'zoom-veil'; document.body.appendChild(veil);
  const ring = document.createElement('div'); ring.className = 'zoom-ring'; document.body.appendChild(ring);
  flyTo(ra, dec, 2.2, false); if (tween) tween.dur = 1250;
  requestAnimationFrame(() => { veil.classList.add('is-on'); ring.classList.add('is-on'); });
  setTimeout(go, 1300);
}
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="index.html?ra="]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault(); zoomIntoViewer(a.getAttribute('href'));
}, true);
addEventListener('pageshow', (e) => { if (e.persisted) { leaving = false; document.querySelectorAll('.zoom-veil, .zoom-ring').forEach((n) => n.remove()); } });
function fallback() { document.body.classList.add('no-webgl'); const n = $('#nowebgl'); n.textContent = T('noWebgl'); n.hidden = false; }

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
  const celestial = new THREE.Group(); celestial.matrixAutoUpdate = false; scene.add(celestial);   // everything fixed to the stars lives here

  const NOISE = `
    float hash(vec3 p){ p = fract(p*vec3(.1031,.1030,.0973)); p += dot(p, p.yxz+33.33); return fract((p.x+p.y)*p.z); }
    float vnoise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
    float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }`;
  const uVis = { value: 1 };   // 1 at night, 0 in full daylight (My sky)

  /* ---- field stars: real positions, magnitudes and colours (colour = blackbody at the temperature implied by B-V) ---- */
  const { n, f } = state.stars;
  const pos = new Float32Array(n * 3), mag = new Float32Array(n), col = new Float32Array(n * 3), seed = new Float32Array(n);
  f.forEach((s, i) => {
    pos.set(eq(s[0], s[1], 300), i * 3); mag[i] = s[2]; seed[i] = Math.random();
    const c = A.starRGB(s[3]); col.set([c[0] + (1 - c[0]) * 0.18, c[1] + (1 - c[1]) * 0.18, c[2] + (1 - c[2]) * 0.18], i * 3);
  });
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); starGeo.setAttribute('aMag', new THREE.BufferAttribute(mag, 1));
  starGeo.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); starGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: dpr }, uTime: { value: 0 }, uVis },
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aMag; attribute vec3 aCol; attribute float aSeed; uniform float uScale; uniform float uTime; uniform float uVis; varying vec3 vCol; varying float vA; varying float vH;
      void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); float b = pow(10.,-0.12*aMag);
        float tw = 1.0 + 0.09*sin(uTime*(1.3+aSeed*2.0)+aSeed*40.);
        float halo = smoothstep(0.35, 1.6, b);
        gl_PointSize = min((2.4 + 7.0*b + 26.0*halo*halo)*uScale*tw, 120.0); vH = halo; vA = clamp(0.55+1.0*b,0.,1.)*uVis; vCol = aCol; }`,
    fragmentShader: `varying vec3 vCol; varying float vA; varying float vH;
      void main(){ float d = length(gl_PointCoord-.5)*2.; float core = pow(smoothstep(1.,0.,d),2.4);
        float glow = vH*0.55*exp(-d*d*7.0)*smoothstep(1.0,0.7,d);
        gl_FragColor = vec4(vCol, (core + glow)*vA); }`,
  });
  const stars = new THREE.Points(starGeo, starMat); stars.renderOrder = 2; stars.frustumCulled = false; celestial.add(stars);

  /* ---- Milky Way, placed with the real galactic coordinate matrix ---- */
  const mw = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uVis },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vDir; uniform float uVis; ${NOISE}
      void main(){
        vec3 e = vec3(vDir.x, -vDir.z, vDir.y);
        float gx = dot(e, vec3(-0.0548755604,-0.8734370902,-0.4838350155));
        float gy = dot(e, vec3( 0.4941094279,-0.4448296300, 0.7469822445));
        float gz = dot(e, vec3(-0.8676661490,-0.1980763734, 0.4559837762));
        float b = asin(clamp(gz,-1.,1.)); float l = atan(gy,gx);
        float band = exp(-pow(b/0.2,2.)); float core = pow(max(cos(l),0.),3.);
        float n1 = fbm(vDir*7.), n2 = fbm(vDir*24.);
        float dust = smoothstep(0.46,0.72,fbm(vDir*9.+3.))*exp(-pow(b/0.085,2.));
        float I = band*(0.32+0.55*core)*(0.5+1.0*n1) + band*0.14*n2 - dust*0.3*band;
        vec3 c = mix(vec3(0.42,0.52,0.82), vec3(1.0,0.8,0.58), core*0.85);
        gl_FragColor = vec4(c*max(I,0.)*0.5*uVis, 1.);
      }`,
  }));
  mw.renderOrder = 1; celestial.add(mw);

  /* ---- coordinate grid ---- */
  const gridPts = [];
  for (let dec = -60; dec <= 60; dec += 30) for (let a = 0; a < 360; a += 3) gridPts.push(...eq(a, dec, 280), ...eq(a + 3, dec, 280));
  for (let ra = 0; ra < 360; ra += 30) for (let d = -87; d < 87; d += 3) gridPts.push(...eq(ra, d, 280), ...eq(ra, d + 3, 280));
  const grid = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3)),
    new THREE.LineBasicMaterial({ color: 0x5f7fb0, transparent: true, opacity: 0.16, depthTest: false }));
  grid.renderOrder = 3; grid.visible = false; celestial.add(grid);

  /* ---- constellation figures ---- */
  const lineGroup = new THREE.Group(); celestial.add(lineGroup);
  const figs = {};
  for (const code of Object.keys(state.cons)) {
    const c = state.cons[code], pts = [];
    c.lines.forEach(([a, b]) => pts.push(...eq(c.stars[a].ra, c.stars[a].dec, 270), ...eq(c.stars[b].ra, c.stars[b].dec, 270)));
    const mat = new THREE.LineBasicMaterial({ color: 0x7fb8ff, transparent: true, opacity: 0.3, depthTest: false });
    const seg = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)), mat); seg.renderOrder = 4; lineGroup.add(seg);
    const dots = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(c.stars.flatMap((s) => eq(s.ra, s.dec, 270)), 3)),
      new THREE.PointsMaterial({ color: 0x9fd2ff, size: 9 * dpr, sizeAttenuation: false, transparent: true, opacity: 0, depthTest: false, map: ringTexture(THREE) }));
    dots.renderOrder = 5; lineGroup.add(dots);
    figs[code] = { mat, dots, segs: c.lines.map(([a, b]) => [new V3(...c.vecs[a]), new V3(...c.vecs[b])]) };
  }
  function styleLines() {
    for (const [code, fg] of Object.entries(figs)) {
      const sel = state.sel && state.sel.kind === 'const' && state.sel.id === code, on = sel || hoverCode === code;
      fg.mat.opacity = sel ? 0.95 : on ? 0.8 : state.sel ? 0.16 : 0.3;
      fg.mat.color.set(sel ? 0x38bdf8 : on ? 0xcfe6ff : 0x7fb8ff);
      fg.dots.material.opacity = on ? 0.9 : 0; fg.dots.material.color.set(sel ? 0x38bdf8 : 0xcfe6ff);
    }
  }

  /* ---- Sun, planets (glowing points), Moon (phase shader) ---- */
  const bodiesG = new THREE.Group(); celestial.add(bodiesG);
  const mkAttr = (count) => {
    const g = new THREE.BufferGeometry(), c = Math.max(count, 1);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(c * 3), 3)); g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(c), 1));
    g.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(c * 3).fill(0.8), 3)); g.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(c), 1)); return g;
  };
  const glowPoints = (geo, order) => {
    const m = new THREE.Points(geo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSize; attribute vec3 aCol; attribute float aA; varying vec3 vCol; varying float vA;
        void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize = aSize; vCol = aCol; vA = aA; }`,
      fragmentShader: `varying vec3 vCol; varying float vA; void main(){ float d = length(gl_PointCoord-.5)*2.;
        float core = smoothstep(0.34,0.0,d); float halo = exp(-d*d*9.0)*smoothstep(1.0,0.6,d)*0.55;
        gl_FragColor = vec4(mix(vCol,vec3(1.),core*0.6), (core + halo)*vA); }`,
    })); m.renderOrder = order; m.frustumCulled = false; return m;
  };
  const plGeo = mkAttr(BODY_KEYS.length), plPts = glowPoints(plGeo, 6); bodiesG.add(plPts);
  const pointGeo = () => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
  const sunGeo = pointGeo(), sunMat = new THREE.ShaderMaterial({
    uniforms: { uPx: { value: 60 } }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uPx; void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize = uPx; }`,
    fragmentShader: `void main(){ float d = length(gl_PointCoord-.5)*2.; float disc = smoothstep(0.16,0.12,d); float glow = exp(-d*d*6.0)*0.8 + exp(-d*3.0)*0.25;
      gl_FragColor = vec4(vec3(1.0,0.86,0.58)*(disc*1.6+glow), 1.0); }`,
  });
  const sunPts = new THREE.Points(sunGeo, sunMat); sunPts.renderOrder = 7; sunPts.frustumCulled = false; bodiesG.add(sunPts);
  const moonGeo = pointGeo(), moonMat = new THREE.ShaderMaterial({
    uniforms: { uPx: { value: 40 }, uFrac: { value: 0.5 }, uLimb: { value: new THREE.Vector2(1, 0) } }, transparent: true, depthWrite: false, depthTest: false,
    vertexShader: `uniform float uPx; void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize = uPx; }`,
    fragmentShader: `uniform float uFrac; uniform vec2 uLimb; ${NOISE}
      void main(){
        vec2 p = (gl_PointCoord-0.5)*2.0; p.y = -p.y; float r = length(p);
        float R = 0.56; vec2 q = p/R; float rq = length(q);
        float cosA = 2.0*uFrac-1.0, sinA = sqrt(max(0.,1.-cosA*cosA));
        vec3 L = vec3(uLimb*sinA, cosA); float z = sqrt(max(0.,1.-rq*rq)); vec3 nrm = vec3(q,z);
        float lit = smoothstep(-0.03,0.05,dot(nrm,L));
        float m = fbm(vec3(q*2.3,1.7)); float tex = 0.74+0.26*smoothstep(0.38,0.66,m);
        vec3 col = vec3(0.95,0.93,0.88)*tex*lit + vec3(0.09,0.10,0.12)*(1.-lit);
        float disc = smoothstep(1.0,0.97,rq); float halo = exp(-r*r*5.0)*0.22*uFrac;
        gl_FragColor = vec4(mix(vec3(0.75,0.82,1.0), col, disc), max(disc, halo));
      }`,
  });
  const moonPts = new THREE.Points(moonGeo, moonMat); moonPts.renderOrder = 8; moonPts.frustumCulled = false; bodiesG.add(moonPts);

  /* ---- comets: coma glow, plus ion and dust tails pointing away from the Sun ---- */
  const cometG = new THREE.Group(); celestial.add(cometG);
  const cometKeys = state.eph ? Object.keys(state.eph.comets) : [];
  const cGeo = mkAttr(cometKeys.length), cPts = glowPoints(cGeo, 6); cometG.add(cPts);
  const tailMat = (rgb) => new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(...rgb) } }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `attribute float aU; attribute float aW; varying float vU; varying float vW; void main(){ vU = aU; vW = aW; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uCol; varying float vU; varying float vW; void main(){ float a = pow(1.0-vU,1.6)*(1.0-abs(vW)*0.9)*0.55; gl_FragColor = vec4(uCol, a); }`,
  });
  const tails = cometKeys.map(() => {
    const mk = (rgb) => {
      const g = new THREE.BufferGeometry(), np = (TAIL_SEG + 1) * 2;
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(np * 3), 3));
      g.setAttribute('aU', new THREE.BufferAttribute(Float32Array.from({ length: np }, (_, i) => Math.floor(i / 2) / TAIL_SEG), 1));
      g.setAttribute('aW', new THREE.BufferAttribute(Float32Array.from({ length: np }, (_, i) => (i % 2 ? 1 : -1)), 1));
      const idx = []; for (let i = 0; i < TAIL_SEG; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } g.setIndex(idx);
      const m = new THREE.Mesh(g, tailMat(rgb)); m.frustumCulled = false; m.renderOrder = 5; m.visible = false; cometG.add(m); return m;
    };
    return { ion: mk([0.55, 0.78, 1.0]), dust: mk([1.0, 0.9, 0.7]) };
  });

  /* ---- meteors: short-lived streaks along great circles, fanning out from the shower radiant ---- */
  const MET_N = 14, MET_SEG = 12;
  const metPos = new Float32Array(MET_N * MET_SEG * 2 * 3), metA = new Float32Array(MET_N * MET_SEG * 2);
  const metGeo = new THREE.BufferGeometry();
  metGeo.setAttribute('position', new THREE.BufferAttribute(metPos, 3)); metGeo.setAttribute('aA', new THREE.BufferAttribute(metA, 1));
  const metLines = new THREE.LineSegments(metGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aA; varying float vA; void main(){ vA = aA; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying float vA; void main(){ gl_FragColor = vec4(vec3(0.85,0.93,1.0), vA); }`,
  })); metLines.renderOrder = 9; metLines.frustumCulled = false; celestial.add(metLines);
  const meteors = Array.from({ length: MET_N }, () => ({ live: false }));

  /* ---- daylight dome + ground (My sky only) ---- */
  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, uniforms: { uSunAlt: { value: -30 }, uSunDir: { value: new V3(0, -1, 0) } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vDir; uniform float uSunAlt; uniform vec3 uSunDir;
      void main(){
        float up = clamp(vDir.y,-1.,1.);
        float dayF = smoothstep(-6.,8.,uSunAlt), nightF = smoothstep(-18.,-4.,uSunAlt);
        float twF = smoothstep(-16.,-1.,uSunAlt)*(1.-smoothstep(-1.,10.,uSunAlt));
        vec3 base = mix(vec3(0.006,0.010,0.026), mix(vec3(0.03,0.07,0.16), vec3(0.13,0.30,0.58), dayF), nightF);
        float hz = pow(1.-abs(up),3.5);
        vec3 sunH = normalize(vec3(uSunDir.x,0.,uSunDir.z)+1e-5);
        float toSun = max(dot(normalize(vec3(vDir.x,0.,vDir.z)+1e-5), sunH),0.);
        vec3 horCol = mix(vec3(0.015,0.025,0.06), vec3(0.42,0.60,0.82), dayF) + twF*vec3(0.60,0.30,0.14)*(0.35+0.65*pow(toSun,2.));
        gl_FragColor = vec4(base + horCol*hz*(0.55+0.7*nightF), 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(480, 32, 24), domeMat); dome.renderOrder = 0; dome.visible = false; scene.add(dome);
  const ground = new THREE.Mesh(new THREE.SphereGeometry(470, 48, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x06080d, side: THREE.BackSide, transparent: true, depthTest: false, depthWrite: false }));
  ground.renderOrder = 20; ground.visible = false; scene.add(ground);
  const cloudMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false,
    uniforms: { uCover: { value: 0 }, uOff: { value: new THREE.Vector2() }, uT: { value: 0 }, uDay: { value: 0 }, uTw: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vDir; uniform float uCover, uT, uDay, uTw; uniform vec2 uOff; ${NOISE}
      void main(){
        if (vDir.y < 0.0 || uCover < 0.01) discard;
        vec2 uv = vDir.xz/(vDir.y+0.2)*3.4 + uOff;                       // a flat cloud deck seen from below
        float n = 0.62*fbm(vec3(uv*1.3, uT*0.02)) + 0.38*fbm(vec3(uv*3.1+7.0, uT*0.03));
        float lo = mix(0.61, 0.30, uCover);                                // the noise clusters around 0.48 (+-0.08), so this threshold covers roughly uCover of the sky
        float a = max(smoothstep(lo, lo+0.07, n), smoothstep(0.9, 1.0, uCover))*smoothstep(0.0, 0.12, vDir.y)*0.94;
        vec3 day = vec3(0.90,0.93,0.97)*(0.72+0.45*n), night = vec3(0.055,0.07,0.105)*(0.8+0.5*n);
        gl_FragColor = vec4(mix(night, day, uDay) + uTw*vec3(0.34,0.15,0.07), a);
      }`,
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(455, 48, 24), cloudMat); clouds.renderOrder = 15; clouds.frustumCulled = false; ground.add(clouds);
  /* a strip of hills and pines on the horizon: decoration only, it carries no data */
  const hillMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, uniforms: { uDay: { value: 0 }, uTw: { value: 0 } },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vP; uniform float uDay, uTw;
      float h1(float n){ return fract(sin(n*91.345)*47453.5453); }
      void main(){
        float az = atan(vP.z, vP.x), el = degrees(atan(vP.y, length(vP.xz)));
        float hill = 1.9 + 1.2*sin(az*3.0+1.0) + 0.7*sin(az*7.0+2.3) + 0.35*sin(az*17.0+0.6);
        float far = 3.4 + 1.5*sin(az*2.0+4.0) + 0.6*sin(az*5.0+1.1);
        float t = (az+3.14159265)/6.2831853*110.0, cell = fract(t), id = floor(t), r = h1(id);
        float tree = r > 0.5 ? (1.3+2.2*h1(id+7.0))*max(0.0, 1.0-abs(cell-0.5)/(0.16+0.1*r)) : 0.0;
        float near = hill + tree;
        if (el > max(near, far)) discard;
        vec3 cNear = mix(vec3(0.016,0.022,0.034), vec3(0.06,0.10,0.09), uDay) , cFar = mix(vec3(0.035,0.05,0.085), vec3(0.20,0.30,0.38), uDay) + uTw*vec3(0.10,0.05,0.03);
        gl_FragColor = vec4(el <= near ? cNear : cFar, 1.0);
      }`,
  });
  const hills = new THREE.Mesh(new THREE.CylinderGeometry(440, 440, 120, 96, 1, true), hillMat); hills.position.y = 20; hills.renderOrder = 21; hills.frustumCulled = false; ground.add(hills);

  /* ---- intro: nebula + Earth limb (procedural, no image files) ---- */
  const intro = new THREE.Group(); scene.add(intro);
  const introDir = new V3(...eq(75, 2, 1));
  const nebMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uFade: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uFade; ${NOISE}
      void main(){
        vec2 p = (vUv-.5)*vec2(1.7,1.0); float r = length(p);
        vec3 q = vec3(p*2.2, uTime*0.015); vec3 w = vec3(fbm(q), fbm(q+vec3(5.2,1.3,2.)), 0.);
        float n = fbm(vec3(p*3.0,0.)+2.6*w); float fil = pow(1.0-abs(2.0*fbm(vec3(p*4.5,3.)+3.*w)-1.0), 3.2);
        float body = smoothstep(.62,.05,r); float I = body*(0.25+0.9*n) + body*0.9*fil*smoothstep(.55,.1,r);
        vec3 c = mix(vec3(.55,.74,1.0), vec3(1.0,.58,.22), smoothstep(.05,.5,r + .25*(n-.5))); c = mix(c, vec3(.9,.95,1.), fil*.35*smoothstep(.4,0.,r));
        gl_FragColor = vec4(c*I*.85*uFade, 1.);
      }`,
  });
  const neb = new THREE.Mesh(new THREE.PlaneGeometry(210, 125), nebMat); neb.position.copy(introDir).multiplyScalar(150); neb.lookAt(0, 0, 0); neb.renderOrder = 6; intro.add(neb);
  const R = 40, H = 2.6, earth = new THREE.Group(); earth.position.set(0, -(R + H), 0); intro.add(earth);
  const fwd0 = new V3(...eq(75, -4.5)), right0 = new V3().crossVectors(fwd0, new V3(0, 1, 0)).normalize();
  const sunDir = fwd0.clone().add(right0.clone().multiplyScalar(-0.75)).add(new V3(0, 0.16, 0)).normalize();
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { uL: { value: sunDir }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normal; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vW; uniform vec3 uL; uniform float uTime; ${NOISE}
      void main(){
        vec3 N = normalize(vN), V = normalize(cameraPosition - vW); float ndl = dot(N,uL); float day = smoothstep(-.08,.5,ndl);
        vec3 sp = N*5.0; float land = fbm(sp*.9+3.0); float cloud = smoothstep(.47,.78,fbm(sp*2.3+vec3(uTime*.012,0.,11.)));
        float isLand = smoothstep(.54,.58,land); vec3 surf = mix(vec3(.012,.05,.15), vec3(.075,.10,.08), isLand);
        vec3 lit = surf*(.05+1.7*day) + cloud*vec3(.85,.9,1.)*(.04+.9*day)*.75;
        vec3 Hh = normalize(uL+V); lit += pow(max(dot(N,Hh),0.),70.)*(1.-isLand)*(1.-cloud)*vec3(1.,.72,.38)*2.4;
        float city = smoothstep(.62,.9,fbm(sp*8.))*isLand*(1.-day)*(1.-cloud); lit += city*vec3(1.,.7,.35)*.55;
        float fres = pow(1.-max(dot(N,V),0.),3.); lit += mix(vec3(.08,.32,.95), vec3(1.,.64,.3), smoothstep(0.,.7,ndl)*.8)*fres*(.3+1.3*day);
        gl_FragColor = vec4(lit,1.);
      }`,
  });
  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 96), earthMat); earthMesh.renderOrder = 10; earth.add(earthMesh);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.045, 96, 64), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uL: { value: sunDir } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normal; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vW; uniform vec3 uL;
      void main(){ vec3 N = normalize(vN), V = normalize(cameraPosition-vW); float k = pow(abs(dot(N,V)),2.6); float sunSide = smoothstep(-.3,.8,dot(N,uL));
        vec3 c = mix(vec3(.1,.36,1.), vec3(1.,.62,.28), sunSide*.85); gl_FragColor = vec4(c*k*(.55+1.4*sunSide), 1.); }`,
  })); atm.renderOrder = 11; earth.add(atm);

  sky = { THREE, scene, camera, renderer, celestial, starMat, stars, mw, grid, lineGroup, figs, styleLines, intro, earth, neb, nebMat, glowTex: glowTexture(THREE), depth: null, dpr,
          cloudMat, hillMat, bodiesG, cometG, plGeo, sunMat, sunGeo, moonMat, moonGeo, cGeo, tails, cometKeys, metLines, metPos, metA, meteors, MET_N, MET_SEG, dome, domeMat, ground, uVis };
  applyToggles(); styleLines();
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
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.07, 'rgba(255,255,255,.95)'); gr.addColorStop(0.22, 'rgba(255,255,255,.28)'); gr.addColorStop(0.5, 'rgba(255,255,255,.06)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

/* ================================================================== controls */
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
    mouse = { x: e.clientX, y: e.clientY }; placeTip();
    const p = pointers.get(e.pointerId);
    if (!p) { if (state.mode === 'sky') hoverPick(e.clientX, e.clientY); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6) { document.body.classList.add('is-dragging'); dragging = true; showTip(-1); hoverStar = -1; }
    if (pointers.size === 2 && pinch0) {
      const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      view.fov = clamp(pinch0.fov * pinch0.d / Math.max(d, 1), 8, 85); fovTarget = view.fov; coachAdvance(1); return;
    }
    if (state.mode === 'depth') { orbitDepth(dx, dy); return; }
    if (moved > 6) state.track = null;
    const k = dragScale();
    vel.ra = dx * k / Math.max(Math.cos(view.dec * D2R), 0.2); vel.dec = dy * k;
    view.ra += vel.ra; view.dec = clamp(view.dec + vel.dec, -84, 84);
    if (moved > 18) coachAdvance(0);
  });
  const up = (e) => {
    pointers.delete(e.pointerId); pinch0 = null; document.body.classList.remove('is-dragging'); dragging = false;
    if (pointers.size === 0 && moved < 6 && downAt && state.mode === 'sky') {
      hoverPick(e.clientX, e.clientY);
      if (hoverStar >= 0) select('star', hoverStar); else if (hoverCode) select('const', hoverCode);
    }
    if (moved < 6) vel = { ra: 0, dec: 0 };
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', () => { showTip(-1); hoverStar = -1; });
  canvas.addEventListener('wheel', (e) => {
    if (state.mode === 'intro') return; e.preventDefault();
    if (state.mode === 'depth') { const t = $('#depth-t'); t.value = clamp(+t.value - e.deltaY * 0.6, 0, 1000); onDepthSlider(); return; }
    fovTarget = clamp((fovTarget ?? view.fov) * Math.exp(e.deltaY * 0.0012), 8, 85); coachAdvance(1);
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (e.target instanceof Element && e.target.matches('input, textarea, select')) return;
    if (e.key === 'Escape') {
      if (!$('#guide').hidden) setGuide(false); else if (!$('#layers').hidden) setPop('#layers', false); else if (!$('#site-pop').hidden) setPop('#site-pop', false);
      else if (state.mode === 'depth') exitDepth(); else if (state.sel) closePanel(); return;
    }
    if (state.mode !== 'sky') return;
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); state.t.playing = !state.t.playing; syncTimeUI(true); return; }
    const s = view.fov * 0.04;
    if (e.key.startsWith('Arrow')) state.track = null;
    if (e.key === 'ArrowLeft') view.ra += s; else if (e.key === 'ArrowRight') view.ra -= s;
    else if (e.key === 'ArrowUp') view.dec = clamp(view.dec + s, -84, 84); else if (e.key === 'ArrowDown') view.dec = clamp(view.dec - s, -84, 84);
    else if (e.key === '+' || e.key === '=') fovTarget = clamp((fovTarget ?? view.fov) * 0.85, 8, 85); else if (e.key === '-') fovTarget = clamp((fovTarget ?? view.fov) / 0.85, 8, 85);
  });
}

/* Pointer position -> direction in world space (w) and in the celestial frame (c). */
function rayCelestial(cx, cy) {
  const { THREE, camera } = sky;
  const w = new THREE.Vector3((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1, 0.5).unproject(camera).normalize();
  const M = state.M, c = isLocal() ? new THREE.Vector3(M[0] * w.x + M[3] * w.y + M[6] * w.z, M[1] * w.x + M[4] * w.y + M[7] * w.z, M[2] * w.x + M[5] * w.y + M[8] * w.z) : w;
  return { w, c };
}
/* Hover: nearest star (brightness-weighted), else nearest constellation figure, measured in screen pixels. */
function hoverPick(cx, cy) {
  if (!sky || dragging) return;
  const { THREE } = sky, { c } = rayCelestial(cx, cy), local = isLocal(), M = state.M;
  const pxAng = (view.fov / innerHeight) * D2R, lim = 11 * pxAng, cosLim = Math.cos(lim), { vec, f, n } = state.stars;
  let bestS = -1, bs = 1e9;
  for (let i = 0; i < n; i++) {
    const d = vec[i * 3] * c.x + vec[i * 3 + 1] * c.y + vec[i * 3 + 2] * c.z;
    if (d < cosLim) continue;
    if (local && M[3] * vec[i * 3] + M[4] * vec[i * 3 + 1] + M[5] * vec[i * 3 + 2] < 0) continue;
    const ang = Math.acos(clamp(d, -1, 1)), score = ang + f[i][2] * 0.0016 * (view.fov / 60 + 0.3);
    if (ang < lim && score < bs) { bs = score; bestS = i; }
  }
  if (bestS !== hoverStar) { hoverStar = bestS; showTip(bestS); }
  document.body.classList.toggle('is-hover', hoverStar >= 0 || !!hoverCode);
  if (hoverStar >= 0 || !state.show.lines) { setHover(null); return; }
  const limit = 22 * pxAng; let best = null, bd = limit; const ab = new THREE.Vector3(), ap = new THREE.Vector3(), q = new THREE.Vector3();
  for (const [code, fg] of Object.entries(sky.figs)) for (const [a, b] of fg.segs) {
    ab.subVectors(b, a); const t = clamp(ap.subVectors(c, a).dot(ab) / ab.lengthSq(), 0, 1);
    q.copy(a).addScaledVector(ab, t); const dd = 2 * Math.asin(clamp(q.distanceTo(c) / 2, 0, 1)); if (dd < bd) { bd = dd; best = code; }
  }
  setHover(best);
}

/* ================================================================== intro -> sky */
function enterSky(instant) {
  if (state.mode !== 'intro') return;
  state.mode = 'sky';
  if (instant) { $('#journey').style.transition = 'none'; $('#ui').style.transition = 'none'; }
  document.body.classList.remove('is-intro'); $('#ui').hidden = false; $('#mode-seg').hidden = false;
  applyToggles(); setSkyMode(state.skyMode);
  let seen = false; try { seen = localStorage.getItem('sky-start-seen') === '1'; } catch { /* ignore */ }
  $('#start').hidden = instant || seen; renderCoach();
  if (!sky) { setGuide(true); return; }
  const target = state.arrive ? { ra: state.arrive.ra, dec: clamp(state.arrive.dec, -84, 84), fov: 26 } : { ra: 86, dec: 3, fov: 68 };
  if (instant || reduce) { Object.assign(view, target); fovTarget = target.fov; sky.intro.visible = false; return; }
  sky.entering = { t0: performance.now(), dur: 3200, from: { ...view }, target, earthFrom: sky.earth.position.y, fadeFrom: sky.nebMat.uniforms.uFade.value, done: () => { sky.intro.visible = false; } };
}

/* ================================================================== depth (3D) mode: the shape is an illusion */
const SP_RGB = { O: 0x9bb8ff, B: 0xaec8ff, A: 0xdce6ff, F: 0xfff4dc, G: 0xffe19a, K: 0xffb866, M: 0xff8a52 };
function enterDepth(code) {
  if (!sky || state.mode !== 'sky') return;
  const { THREE, scene } = sky, V3 = THREE.Vector3, c = state.cons[code];
  const group = new THREE.Group(); scene.add(group);
  const pts = c.stars.map((s) => (s.ly ? new V3(...eq(s.ra, s.dec, s.ly / 100)) : null)), known = pts.filter(Boolean);
  const C = known.reduce((a, p) => a.add(p), new V3()).multiplyScalar(1 / known.length);
  let spread = 0, maxDist = 0; known.forEach((p) => { spread = Math.max(spread, p.distanceTo(C)); maxDist = Math.max(maxDist, p.length()); });
  const sprites = [];
  c.stars.forEach((s, i) => {
    const p = pts[i]; if (!p) return;
    const absM = (s.mag ?? 3) - 5 * Math.log10((s.ly / 3.26156) / 10), size = clamp(1.3 + (-absM) * 0.28, 0.9, 4.2);
    const mat = new THREE.SpriteMaterial({ map: sky.glowTex, color: SP_RGB[(s.sp || '').match(/[OBAFGKM]/)?.[0]] ?? 0xffffff, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const sp = new THREE.Sprite(mat); sp.position.copy(p); sp.scale.setScalar(size * 1.05); sp.renderOrder = 8; group.add(sp); sprites.push({ sp, s, p });
  });
  const lp = []; c.lines.forEach(([a, b]) => { if (pts[a] && pts[b]) lp.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z); });
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)), new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, depthTest: false })); lines.renderOrder = 7; group.add(lines);
  const rp = []; sprites.forEach(({ p }) => rp.push(0, 0, 0, p.x, p.y, p.z));
  const rays = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthTest: false })); rays.renderOrder = 6; group.add(rays);
  const sunSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sky.glowTex, color: 0xf5a54a, transparent: true, depthTest: false, blending: THREE.AdditiveBlending })); sunSp.scale.setScalar(0.9); sunSp.renderOrder = 9; group.add(sunSp);
  const dir = C.clone().normalize(), side = new V3().crossVectors(dir, new V3(0, 1, 0)); if (side.lengthSq() < 1e-4) side.set(1, 0, 0); side.normalize();
  const sideDist = Math.max(maxDist * 1.45, spread * 2.4, 6), mid = dir.clone().multiplyScalar(maxDist / 2);
  const P = C.clone().addScaledVector(side, sideDist).addScaledVector(new V3(0, 1, 0), sideDist * 0.3);
  const saved = { ...view }; const e = A.vecToEq(C.toArray()); Object.assign(view, { ra: e.ra, dec: e.dec });   // depth mode uses celestial axes, seen straight on from Earth
  sky.depth = { code, group, sprites, C, P, mid, t: 0, auto: !reduce, orbit: new THREE.Quaternion(), startFov: view.fov, saved, t0: performance.now() };
  sky.celestial.visible = false; sky.dome.visible = sky.ground.visible = false;
  state.mode = 'depth'; document.body.classList.add('is-depth'); $('#depth-bar').hidden = false; $('#depth-t').value = 0; $('#go-3d')?.setAttribute('hidden', '');
  rebuildDepthLabels(); if (reduce) { $('#depth-t').value = 1000; onDepthSlider(); } $('#depth-t').focus({ preventScroll: true });
}
function rebuildDepthLabels() {
  const host = $('#labels'); host.querySelectorAll('.lbl-star, .lbl-sun').forEach((n) => n.remove());
  const d = sky.depth; if (!d) return; const items = [];
  d.sprites.forEach(({ s, p }, i) => {
    const el = document.createElement('div'); el.className = 'lbl lbl-star'; el.style.setProperty('--oy', i % 2 ? '-135%' : '35%');
    el.innerHTML = `<b>${esc(s.name)}</b><span>${nf(s.ly)} ${T('ly')}</span>`; host.appendChild(el); items.push({ el, get: () => [p.x, p.y, p.z], world: true });
  });
  const sun = document.createElement('div'); sun.className = 'lbl lbl-sun'; sun.style.setProperty('--oy', '-50%'); sun.textContent = `${T('sun')} · ${T('youAreHere')}`; host.appendChild(sun);
  items.push({ el: sun, get: () => [0, 0, 0], world: true }); state.depthLabels = items;
}
function exitDepth(silent) {
  const d = sky && sky.depth; if (!d) return;
  sky.scene.remove(d.group); sky.depth = null; state.depthLabels = null;
  $('#labels').querySelectorAll('.lbl-star, .lbl-sun').forEach((n) => n.remove());
  sky.celestial.visible = true; Object.assign(view, d.saved); sky.camera.position.set(0, 0, 0);
  state.mode = 'sky'; document.body.classList.remove('is-depth'); $('#depth-bar').hidden = true;
  sky.dome.visible = sky.ground.visible = state.skyMode === 'local'; $('#go-3d')?.removeAttribute('hidden'); if (!silent) $('#go-3d')?.focus({ preventScroll: true });
}
function onDepthSlider() { const d = sky && sky.depth; if (!d) return; d.auto = false; d.t = +$('#depth-t').value / 1000; }
$('#depth-t').addEventListener('input', onDepthSlider);
$('#depth-back').addEventListener('click', () => exitDepth());
function orbitDepth(dx, dy) {
  const d = sky.depth; if (!d) return; d.auto = false; const { THREE } = sky;
  const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -dx * 0.006);
  const right = new THREE.Vector3().subVectors(sky.camera.position, d.C).cross(new THREE.Vector3(0, 1, 0)).normalize();
  const qx = new THREE.Quaternion().setFromAxisAngle(right, -dy * 0.006);
  d.orbit.premultiply(qy).premultiply(qx); if (d.t < 0.2) { d.t = 0.2; $('#depth-t').value = 200; }
}
function updateDepth(now) {
  const d = sky.depth; if (!d) return; const { THREE, camera } = sky;
  if (d.auto) { d.t = clamp((now - d.t0 - 900) / 5200, 0, 1); $('#depth-t').value = Math.round(d.t * 1000); if (d.t >= 1) d.auto = false; }
  const te = ease(d.t), off = new THREE.Vector3().lerpVectors(new THREE.Vector3(), d.P, te).sub(d.C);
  off.applyQuaternion(new THREE.Quaternion().slerp(d.orbit, te));
  camera.position.copy(d.C).add(off); camera.up.set(0, 1, 0); camera.lookAt(new THREE.Vector3().lerpVectors(d.C, d.mid, te));
  camera.fov = d.startFov + (46 - d.startFov) * te; camera.updateProjectionMatrix();
}

/* ================================================================== per-frame sky update */
let last = performance.now(), lastSecond = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = now - last, dt = Math.min(rawDt, 60); last = now; const secs = now / 1000;   // dt smooths animation; the clock uses real elapsed time
  const { camera, starMat, renderer, scene } = sky;
  tickTime(Math.min(rawDt, 5000)); updatePositions();
  const local = isLocal(), lstNow = lst();
  state.M = local ? A.localMatrix(lstNow, state.site.lat) : [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const M = state.M;
  sky.celestial.matrix.set(M[0], M[1], M[2], 0, M[3], M[4], M[5], 0, M[6], M[7], M[8], 0, 0, 0, 0, 1); sky.celestial.matrixWorldNeedsUpdate = true;
  starMat.uniforms.uTime.value = secs;

  if (sky.entering) {
    const e = sky.entering, k = clamp((now - e.t0) / e.dur, 0, 1), te = ease(k);
    view.ra = e.from.ra + (((e.target.ra - e.from.ra + 540) % 360) - 180) * te; view.dec = e.from.dec + (e.target.dec - e.from.dec) * te; view.fov = e.from.fov + (e.target.fov - e.from.fov) * te;
    sky.earth.position.y = e.earthFrom - 90 * ease(clamp(k * 1.25, 0, 1)); sky.nebMat.uniforms.uFade.value = e.fadeFrom * (1 - clamp(k * 1.6, 0, 1));
    if (k >= 1) { fovTarget = view.fov; sky.entering = null; e.done(); }
  } else if (state.mode === 'intro') {
    const k = reduce ? 1 : 1 - Math.pow(0.0004, dt / 1000);
    J.p += (J.target - J.p) * k; J.px += (J.tx - J.px) * k; J.py += (J.ty - J.py) * k;
    const drift = reduce ? 0 : Math.sin(secs * 0.06) * 1.2, p = J.p;
    view.ra = 75 + p * 85 + drift + J.px * 1.6; view.dec = -4.5 + p * 36 - J.py * 1.1; view.fov = 60 + p * 14;
    sky.earth.position.y = -(40 + 2.6) - clamp(p * 6, 0, 1) * 90;                       // the Earth sinks away as you start reading
    sky.nebMat.uniforms.uFade.value = 1 - clamp(p * 4.5, 0, 1);
    sky.nebMat.uniforms.uTime.value = secs; sky.earth.children[0].material.uniforms.uTime.value = secs;
  } else if (state.mode === 'sky') {
    if (tween) {
      const k = clamp((now - tween.t0) / tween.dur, 0, 1), te = ease(k);
      view.ra = tween.from.ra + tween.dRa * te; view.dec = tween.from.dec + tween.dDec * te; view.fov = tween.from.fov + tween.dFov * te; if (k >= 1) tween = null;
    } else {
      if (Math.abs(vel.ra) > 0.0005 || Math.abs(vel.dec) > 0.0005) { view.ra += vel.ra; view.dec = clamp(view.dec + vel.dec, -84, 84); const fr = Math.pow(0.92, dt / 16); vel.ra *= fr; vel.dec *= fr; }
      if (fovTarget != null) { view.fov += (fovTarget - view.fov) * (1 - Math.pow(0.001, dt / 1000)); if (Math.abs(fovTarget - view.fov) < 0.01) fovTarget = null; }
      if (state.track && !dragging) {   // keep a selected moving thing, or anything in a turning sky, in view
        const t = state.track(); if (t) {
          const d = viewDirFor(t.ra, t.dec), toA = d.a - panelShift(view.fov, d.p), toP = clamp(Math.max(d.p - (innerWidth <= 720 && state.sel ? view.fov * 0.2 : 0), local ? view.fov * 0.12 : -84), -84, 84), k = 1 - Math.pow(0.002, dt / 1000);
          view.ra += (((toA - view.ra + 540) % 360) - 180) * k; view.dec += (toP - view.dec) * k;
        }
      }
    }
  }
  view.ra = wrap360(view.ra);

  if (state.mode === 'depth') updateDepth(now);
  else { const fv = eq(view.ra, view.dec); camera.position.set(0, 0, 0); camera.up.set(0, 1, 0); camera.fov = view.fov; camera.updateProjectionMatrix(); camera.lookAt(fv[0], fv[1], fv[2]); }
  camera.updateMatrixWorld(true);
  starMat.uniforms.uScale.value = sky.dpr * Math.pow(60 / camera.fov, 0.4);

  /* daylight: only meaningful where the horizon is shown */
  let sunAlt = -90;
  if (state.pos.sun && state.mode !== 'intro') sunAlt = A.altAz(state.pos.sun.ra, state.pos.sun.dec, lstNow, state.site.lat).alt;
  if (local && state.pos.sun) {
    const sw = A.applyRows(M, eq(state.pos.sun.ra, state.pos.sun.dec));
    sky.domeMat.uniforms.uSunAlt.value = sunAlt; sky.domeMat.uniforms.uSunDir.value.set(sw[0], sw[1], sw[2]);
    sky.uVis.value = 1 - clamp((sunAlt + 14) / 11, 0, 1);   // stars fade between -14 and -3 degrees of solar altitude
  } else sky.uVis.value = 1;

  if (local) {
    const c = cloudNow(), cm = sky.cloudMat.uniforms, day = clamp((sunAlt + 8) / 14, 0, 1), tw = clamp((sunAlt + 14) / 13, 0, 1) * (1 - clamp((sunAlt + 1) / 10, 0, 1));
    cm.uCover.value += ((c ? c.cover : 0) - cm.uCover.value) * 0.05;
    if (c && state.t.playing) {   // clouds drift downwind (wind direction is where it blows FROM); x = east, z = south
      const th = c.wdir * D2R, k = c.wind * Math.min(Math.abs(state.t.speed), 600) * state.t.dir * (rawDt / 1000) * 0.00035;
      wx.off[0] += -Math.sin(th) * k; wx.off[1] += Math.cos(th) * k;
    }
    cm.uOff.value.set(wx.off[0], wx.off[1]); cm.uT.value = secs; cm.uDay.value = day; cm.uTw.value = tw;
    sky.hillMat.uniforms.uDay.value = day; sky.hillMat.uniforms.uTw.value = tw;
  }
  if (state.mode !== 'depth') { updateBodies(); updateMeteors(dt, sunAlt, local); }
  renderer.render(scene, camera);
  updateLabels(); updateRing();
  if (secs - lastSecond > 0.5) { lastSecond = secs; syncTimeUI(false); }
}

/* Sun, Moon, planets, comets: sizes in pixels from the field of view, positions from the ephemeris. */
function updateBodies() {
  const P = state.pos; if (!state.eph || !P.sun || state.mode === 'intro') return;
  const { THREE, camera, dpr } = sky, H = innerHeight, fov = camera.fov, zoom = Math.pow(60 / fov, 0.3), degPx = (deg) => (deg / fov) * H * dpr;
  const place = (arr, i, p, R) => { const v = eq(p.ra, p.dec, R); arr[i * 3] = v[0]; arr[i * 3 + 1] = v[1]; arr[i * 3 + 2] = v[2]; };
  const pa = sky.plGeo.attributes;
  BODY_KEYS.forEach((k, i) => {
    const p = P[k]; if (!p) return; place(pa.position.array, i, p, 265);
    const m = p.mag ?? 5; pa.aSize.array[i] = clamp(3 + (7.5 - m) * 2.4, 3, 46) * zoom * dpr; pa.aA.array[i] = clamp(0.35 + (6.5 - m) * 0.12, 0.3, 1);
    pa.aCol.array.set(BODIES[k].colour, i * 3);
  });
  pa.position.needsUpdate = pa.aSize.needsUpdate = pa.aA.needsUpdate = pa.aCol.needsUpdate = true;
  const sp = sky.sunGeo.attributes.position; place(sp.array, 0, P.sun, 265); sp.needsUpdate = true;
  sky.sunMat.uniforms.uPx.value = clamp(Math.max(degPx(0.53) * 4.2, 40 * dpr), 40, 400);
  const mp = sky.moonGeo.attributes.position; place(mp.array, 0, P.moon, 265); mp.needsUpdate = true;   // true angular size, with a floor so it stays visible; phase and orientation are real
  sky.moonMat.uniforms.uPx.value = clamp(Math.max(degPx(A.angularDiameterDeg(A.BODY_KM.moon, P.moon.delta)) / 0.56, 30 * dpr), 30, 420);
  sky.moonMat.uniforms.uFrac.value = P.phase.fraction;
  const M = state.M, proj = (ra, dec) => new THREE.Vector3(...A.applyRows(M, eq(ra, dec, 100))).project(camera);
  const o = proj(P.moon.ra, P.moon.dec), nN = proj(P.moon.ra, P.moon.dec + 0.4), eE = proj(P.moon.ra + 0.4 / Math.max(Math.cos(P.moon.dec * D2R), 0.1), P.moon.dec);
  const sc = (a, b) => { const x = (b.x - a.x) * innerWidth / 2, y = (b.y - a.y) * innerHeight / 2, l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
  const n = sc(o, nN), e = sc(o, eE), lb = P.phase.limb;   // bright limb: position angle from celestial north toward east, projected onto the screen
  sky.moonMat.uniforms.uLimb.value.set(Math.cos(lb) * n[0] + Math.sin(lb) * e[0], Math.cos(lb) * n[1] + Math.sin(lb) * e[1]).normalize();
  const ca = sky.cGeo.attributes, sunV = new THREE.Vector3(...eq(P.sun.ra, P.sun.dec));
  sky.cometKeys.forEach((k, i) => {
    const p = P.comets[k], tl = sky.tails[i]; if (!p) return;
    place(ca.position.array, i, p, 262); const m = p.mag ?? 30;
    ca.aSize.array[i] = clamp(4 + (14 - m) * 2.0, 5, 40) * zoom * dpr; ca.aA.array[i] = clamp((22 - m) / 9, 0.3, 1);
    const cv = new THREE.Vector3(...eq(p.ra, p.dec)), showTail = m < 13.5; tl.ion.visible = tl.dust.visible = showTail;
    if (!showTail) return;
    const away = cv.clone().multiplyScalar(cv.dot(sunV)).sub(sunV).normalize(), perp = new THREE.Vector3().crossVectors(cv, away).normalize();
    const len = clamp(2.0 * Math.pow(10, (12 - m) / 5.5), 1, 35) * D2R;
    const build = (mesh, dirv, L, w0, w1) => {
      const arr = mesh.geometry.attributes.position.array;
      for (let s = 0; s <= TAIL_SEG; s++) {
        const th = (s / TAIL_SEG) * L, pt = cv.clone().multiplyScalar(Math.cos(th)).addScaledVector(dirv, Math.sin(th)), wd = (w0 + (w1 - w0) * (s / TAIL_SEG)) * D2R;
        const a = pt.clone().addScaledVector(perp, wd).normalize().multiplyScalar(262), b = pt.clone().addScaledVector(perp, -wd).normalize().multiplyScalar(262);
        arr.set([a.x, a.y, a.z, b.x, b.y, b.z], s * 6);
      }
      mesh.geometry.attributes.position.needsUpdate = true;
    };
    const dust = away.clone().multiplyScalar(Math.cos(0.14)).addScaledVector(perp, Math.sin(0.14)).normalize();
    build(tl.ion, away, len, 0.05, len / D2R * 0.04); build(tl.dust, dust, len * 0.7, 0.1, len / D2R * 0.1);
  });
  ca.position.needsUpdate = ca.aSize.needsUpdate = ca.aA.needsUpdate = true;
}

/* Meteors: rate comes from the active showers' ZHR (plus a sporadic background), boosted tenfold so they are visible. */
function updateMeteors(dt, sunAlt, local) {
  const { THREE, camera, meteors, metPos, metA, MET_N, MET_SEG } = sky;
  const secs = performance.now() / 1000, t = state.t;
  if (state.show.meteors && state.mode === 'sky' && t.playing && !(local && sunAlt > -6)) {
    const zhr = state.lastShowers.reduce((a, s) => a + s.zhrNow, 0) + 6;
    const rate = Math.min(4, (zhr / 3600) * Math.min(Math.abs(t.speed), 300) * 10);
    if (Math.random() < rate * dt / 1000) {
      const slot = meteors.find((m) => !m.live);
      if (slot) for (let tries = 0; tries < 6; tries++) {
        const { c, w } = rayCelestial(innerWidth * (0.1 + Math.random() * 0.8), innerHeight * (0.1 + Math.random() * 0.8));
        if (local && w.y < 0.05) continue;
        const sh = state.lastShowers.length && Math.random() < (zhr - 6) / zhr ? pickShower(state.lastShowers) : null;
        let tdir;
        if (sh) {
          const r = new THREE.Vector3(...eq(sh.ra, sh.dec)), ang = Math.acos(clamp(c.dot(r), -1, 1)) / D2R; if (ang < 8 || ang > 85) continue;
          tdir = c.clone().multiplyScalar(c.dot(r)).sub(r).normalize();
        } else { const rnd = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5); tdir = rnd.addScaledVector(c, -rnd.dot(c)).normalize(); }
        Object.assign(slot, { live: true, c: c.clone(), t: tdir, L: clamp(camera.fov * (0.08 + Math.random() * 0.06), 3, 14) * D2R, t0: secs, dur: 0.45 + Math.random() * 0.6, br: 0.55 + Math.random() * 0.45 });
        break;
      }
    }
  }
  const p = new THREE.Vector3();
  meteors.forEach((m, mi) => {
    const base = mi * MET_SEG * 2;
    if (m.live && (secs - m.t0) / m.dur >= 1) m.live = false;
    if (!m.live) { metA.fill(0, base, base + MET_SEG * 2); return; }
    const u = (secs - m.t0) / m.dur, head = m.L * ease(Math.min(u * 1.4, 1)), tailLen = m.L * 0.55, fade = Math.sin(Math.PI * Math.min(u, 1)) * m.br;
    for (let s = 0; s < MET_SEG; s++) for (let e = 0; e < 2; e++) {
      const ang = Math.max(head - tailLen * ((s + e) / MET_SEG), 0), o = base + s * 2 + e;
      p.copy(m.c).multiplyScalar(Math.cos(ang)).addScaledVector(m.t, Math.sin(ang)).multiplyScalar(268);
      metPos[o * 3] = p.x; metPos[o * 3 + 1] = p.y; metPos[o * 3 + 2] = p.z; metA[o] = fade * Math.pow(1 - (s + e) / MET_SEG, 1.6);
    }
  });
  sky.metLines.geometry.attributes.position.needsUpdate = true; sky.metLines.geometry.attributes.aA.needsUpdate = true;
}
function pickShower(list) { let r = Math.random() * list.reduce((a, s) => a + s.zhrNow, 0); for (const s of list) { r -= s.zhrNow; if (r <= 0) return s; } return list[0]; }

/* DOM labels follow their objects. */
function updateLabels() {
  if (state.mode === 'intro') return;
  const depth = state.mode === 'depth', items = depth ? state.depthLabels : state.skyLabels; if (!items) return;
  const { THREE, camera } = sky, w = innerWidth, h = innerHeight, v = new THREE.Vector3(), fwd = new THREE.Vector3(), M = state.M, local = isLocal();
  camera.getWorldDirection(fwd);
  for (const it of items) {
    const g = it.get(); let vis = !!g && (!it.show || it.show());
    if (vis) {
      v.set(g[0], g[1], g[2]);
      if (!it.world) { const r = A.applyRows(M, g); v.set(r[0], r[1], r[2]); if (local && r[1] < 0.75) vis = false; /* under the horizon or behind the hills */ }
      const ahead = v.clone().sub(camera.position).dot(fwd) > 0.01; v.project(camera);
      vis = vis && ahead && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
    }
    it.el.classList.toggle('is-hidden-lbl', !vis);
    if (vis) it.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px) translate(var(--ox, -50%), var(--oy, -50%))`;
  }
  document.querySelectorAll('.lbl-comet').forEach((el) => {
    const p = state.pos.comets && state.pos.comets[el.dataset.id]; if (!p) return;
    el.classList.toggle('is-faint', p.mag == null || p.mag > 13); const cm = $('.cm', el); if (cm) cm.textContent = p.mag == null ? '' : `${T('magShort')} ${nf(p.mag, 1)}`;
  });
}
function updateRing() {
  const ring = $('#star-ring'); let i = -1;
  if (state.sel && state.sel.kind === 'star') i = state.sel.id; else if (hoverStar >= 0 && state.mode === 'sky') i = hoverStar;
  if (i < 0 || state.mode !== 'sky') { ring.hidden = true; return; }
  const s = starOf(i), { THREE, camera } = sky, r = A.applyRows(state.M, eq(s.ra, s.dec, 100)), v = new THREE.Vector3(r[0], r[1], r[2]);
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); const ahead = v.dot(fwd) > 0; v.project(camera);
  if (!ahead || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05 || (isLocal() && r[1] < 0)) { ring.hidden = true; return; }
  ring.hidden = false; ring.classList.toggle('is-sel', !!state.sel && state.sel.kind === 'star');
  ring.dataset.name = state.sel && state.sel.kind === 'star' ? s.name : '';
  ring.style.transform = `translate(${((v.x + 1) / 2 * innerWidth).toFixed(1)}px, ${((1 - v.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%, -50%)`;
}

/* ================================================================== boot */
$('#lang').addEventListener('click', () => {
  lang = lang === 'en' ? 'vi' : 'en';
  try { localStorage.setItem('sky-lang', lang); } catch { /* ignore */ }
  applyLang();
});
$('#enter').addEventListener('click', () => enterSky(false));
bindJourney();
(async function boot() {
  applyLang();
  try { await loadData(); } catch (e) {
    console.error(e); $('#nowebgl').textContent = 'Could not load the sky data. Start the page through serve.py.'; $('#nowebgl').hidden = false; return;
  }
  updatePositions(); applyLang();
  try {   // when to watch a constellation, overview calendar, 3D map of Vietnam, trending card
    if (window.SpaceConst && await window.SpaceConst.load(state.stars.f)) {
      window.SpacePlan = planApi = initPlan({ A, lang: () => lang, eph: () => state.eph, state, setSite, setSkyMode, setTime, select, toast });
    }
  } catch (e) { console.warn('[plan]', e); }
  await initSky();
  $('#enter').disabled = false; $('#skip-sky').disabled = false; $('#loading').classList.add('is-done'); $('#journey').focus({ preventScroll: true });
  if (location.hash === '#sky') enterSky(true);
})();
