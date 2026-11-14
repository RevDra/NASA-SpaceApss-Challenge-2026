/* Plan: when to watch the constellation you opened, an overview calendar, a 3D map of Vietnam, a small "most viewed" card.

   REAL (computed from the clock and the JPL Horizons tables already loaded by the page): when a constellation is above 15 degrees in a dark
   sky, its best month, the Moon's phase and the exact moments of new / quarter / full Moon, the meteor-shower peaks (IMO list).
   DEMO (made-up, labelled "Demo" on screen): the light-pollution class of each Vietnamese place and the "most viewed stars" ranking.
   Calendar: "Google Calendar" opens Google Calendar with the event already filled in (no account is connected to this page),
   ".ics" downloads a file Google, Apple and Outlook import, and plans are also kept in this browser. */

const VN_OFFSET_H = 7;                       // Vietnam time, UTC+7
const MIN_ALT = 15, SUN_LIMIT = -12;         // above 15 degrees, Sun below -12 degrees
/* Coordinates are real; the Bortle class (1 darkest .. 9 city centre) is an illustrative demo estimate, not a measurement. */
const PLACES = [
  { id: 'hag', vi: 'Đồng Văn, Hà Giang', en: 'Dong Van, Ha Giang', lat: 23.28, lon: 105.36, b: 3 },
  { id: 'cao', vi: 'Bản Giốc, Cao Bằng', en: 'Ban Gioc, Cao Bang', lat: 22.85, lon: 106.72, b: 3 },
  { id: 'mcc', vi: 'Mù Cang Chải, Yên Bái', en: 'Mu Cang Chai, Yen Bai', lat: 21.85, lon: 104.08, b: 3 },
  { id: 'sap', vi: 'Sa Pa, Lào Cai', en: 'Sa Pa, Lao Cai', lat: 22.33, lon: 103.84, b: 4 },
  { id: 'han', vi: 'Hà Nội', en: 'Hanoi', lat: 21.03, lon: 105.85, b: 8 },
  { id: 'hue', vi: 'Huế', en: 'Hue', lat: 16.46, lon: 107.59, b: 7 },
  { id: 'dad', vi: 'Đà Nẵng', en: 'Da Nang', lat: 16.05, lon: 108.22, b: 8 },
  { id: 'lys', vi: 'Đảo Lý Sơn, Quảng Ngãi', en: 'Ly Son island, Quang Ngai', lat: 15.38, lon: 109.12, b: 3 },
  { id: 'men', vi: 'Măng Đen, Kon Tum', en: 'Mang Den, Kon Tum', lat: 14.6, lon: 108.28, b: 3 },
  { id: 'dal', vi: 'Đà Lạt, Lâm Đồng', en: 'Da Lat, Lam Dong', lat: 11.94, lon: 108.44, b: 6 },
  { id: 'cat', vi: 'Vườn quốc gia Cát Tiên', en: 'Cat Tien National Park', lat: 11.43, lon: 107.43, b: 3 },
  { id: 'sgn', vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', lat: 10.78, lon: 106.7, b: 9 },
  { id: 'cth', vi: 'Cần Thơ', en: 'Can Tho', lat: 10.03, lon: 105.78, b: 7 },
  { id: 'pqc', vi: 'Hàm Ninh, Phú Quốc', en: 'Ham Ninh, Phu Quoc', lat: 10.22, lon: 103.97, b: 4 },
  { id: 'cdo', vi: 'Côn Đảo', en: 'Con Dao', lat: 8.69, lon: 106.61, b: 3 },
  { id: 'ts', vi: 'Đảo Song Tử Tây, Trường Sa', en: 'Song Tu Tay, Truong Sa', lat: 11.43, lon: 114.33, b: 1 },
  { id: 'hs', vi: 'Đảo Phú Lâm, Hoàng Sa', en: 'Phu Lam (Woody), Hoang Sa', lat: 16.83, lon: 112.33, b: 1 },
];
/* Main islands of the two archipelagos, rounded coordinates (illustrative: the map shows where they are, not their shapes). */
const ARCH = [
  { vi: 'Quần đảo Hoàng Sa', en: 'Hoang Sa (Paracel) Islands', box: [111, 112.9, 15.5, 17.1], isl: [[112.33, 16.83], [111.6, 16.53], [111.7, 16.45], [111.2, 15.78]] },
  { vi: 'Quần đảo Trường Sa', en: 'Truong Sa (Spratly) Islands', box: [111.4, 117.5, 6.6, 11.9], isl: [[114.33, 11.43], [114.48, 10.38], [114.37, 10.18], [114.33, 9.88], [111.92, 8.64], [112.92, 7.88]] },
];
const DEMO_VIEWS = [['Sirius', 4820], ['Betelgeuse', 4310], ['Polaris', 3975], ['Vega', 3560], ['Rigel', 3190], ['Antares', 2870], ['Arcturus', 2540], ['Deneb', 2210], ['Altair', 1980], ['Aldebaran', 1760]];

const G = {
  en: {
    when: 'When to watch', place: 'Where', map3d: '3D map', best: 'Best month', bestSub: 'highest at 9 pm', moon: 'Moon', lit: 'lit', to: 'to', darkWin: 'in a dark sky', peak: 'highest', never: 'Never high enough from here', noWin: 'No dark, high enough stretch this night',
    gcal: 'Google Calendar', ics: '.ics file', save: 'Save to my plan', saved: 'Saved to your plan', view: 'See the sky then', demo: 'Demo', bortle: 'Bortle', mins: 'min',
    cal: 'Calendar', calTitle: 'Sky calendar', today: 'Today', eventsH: 'This month', noEv: 'Nothing this month.', plansDl: 'Download my plan (.ics)', remove: 'Remove', calNote: 'No account is connected: Google Calendar opens with the event filled in; .ics imports into Google, Apple or Outlook.',
    moonEv: ['New Moon', 'First quarter', 'Full Moon', 'Last quarter'], shower: 'Meteor shower peak', planEv: 'My plan', goodMoon: 'dark Moon, good night', badMoon: 'bright Moon, fainter shower', zhr: 'up to {n} per hour in a perfect sky',
    wellPlaced: 'High in the sky at 9 pm', noEph: 'Moon data covers 2025 to 2027.', dayNames: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    mapTitle: 'Where to watch in Vietnam', mapNote: 'Land outline: Natural Earth. Bar height = how high the constellation climbs tonight (grey = not visible). Colour = sky darkness, a demo estimate.',
    mapNone: 'No constellation chosen: bar height shows darkness only.', dark: 'dark', mid: 'middling', bright: 'bright', pick: 'Use this place', top: 'Best places', drag: 'Drag to turn, scroll to zoom', mainland: 'mainland',
    evTitle: 'Watch {n} from {p}', evBody: 'Best time {t} (altitude {a}°). Moon {m}% lit. Planned with Space_VI Sky.', hotH: 'Trending stars', hotSub: 'Demo ranking', views: 'views', like: 'Like', more: 'Show 10', less: 'Show 5', close: 'Close',
  },
  vi: {
    when: 'Khi nào ngắm', place: 'Nơi ngắm', map3d: 'Bản đồ 3D', best: 'Tháng đẹp nhất', bestSub: 'lên cao nhất lúc 21 giờ', moon: 'Trăng', lit: 'sáng', to: 'đến', darkWin: 'khi trời tối', peak: 'cao nhất', never: 'Từ đây không lên đủ cao', noWin: 'Đêm này không có lúc nào vừa tối vừa đủ cao',
    gcal: 'Google Calendar', ics: 'File .ics', save: 'Lưu vào kế hoạch', saved: 'Đã lưu vào kế hoạch', view: 'Xem bầu trời lúc đó', demo: 'Demo', bortle: 'Bortle', mins: 'phút',
    cal: 'Lịch', calTitle: 'Lịch bầu trời', today: 'Hôm nay', eventsH: 'Trong tháng này', noEv: 'Tháng này chưa có sự kiện.', plansDl: 'Tải kế hoạch của tôi (.ics)', remove: 'Xóa', calNote: 'Không cần liên kết tài khoản: Google Calendar mở ra với sự kiện điền sẵn; file .ics nhập được vào Google, Apple hay Outlook.',
    moonEv: ['Trăng non', 'Trăng bán nguyệt đầu', 'Trăng tròn', 'Trăng bán nguyệt cuối'], shower: 'Đỉnh mưa sao băng', planEv: 'Kế hoạch của tôi', goodMoon: 'Trăng tối, đêm đẹp', badMoon: 'Trăng sáng, sao băng mờ hơn', zhr: 'tối đa {n} sao mỗi giờ khi trời hoàn hảo',
    wellPlaced: 'Đang lên cao lúc 21 giờ', noEph: 'Dữ liệu Mặt Trăng chỉ có năm 2025 đến 2027.', dayNames: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    mapTitle: 'Nơi ngắm đẹp ở Việt Nam', mapNote: 'Đường bờ: Natural Earth. Cột càng cao là đêm nay chòm sao lên càng cao (xám = không thấy). Màu = độ tối của bầu trời, là ước tính demo.',
    mapNone: 'Chưa chọn chòm sao: độ cao cột chỉ thể hiện độ tối.', dark: 'tối', mid: 'vừa', bright: 'sáng', pick: 'Chọn nơi này', top: 'Nơi đẹp nhất', drag: 'Kéo để xoay, cuộn để phóng to', mainland: 'đất liền',
    evTitle: 'Ngắm {n} tại {p}', evBody: 'Giờ đẹp nhất {t} (độ cao {a}°). Trăng sáng {m}%. Lên kế hoạch bằng Space_VI Sky.', hotH: 'Sao đang hot', hotSub: 'Xếp hạng demo', views: 'lượt xem', like: 'Thích', more: 'Xem 10', less: 'Xem 5', close: 'Đóng',
  },
};

export function initPlan(api) {
  const A = api.A, D2R = Math.PI / 180;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const t = () => G[api.lang()];
  const SC = () => window.SpaceConst;
  const store = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
  const st = { place: store('space-vi-place', 'han'), night: 0, code: null, mount: null, month: null, day: null, hotMore: false };
  let plans = store('space-vi-plans', []), likes = store('space-vi-likes', {});
  const byId = (id) => PLACES.find((p) => p.id === id) || PLACES[4];
  const pName = (p) => (api.lang() === 'vi' ? p.vi : p.en);
  const short = (p) => pName(p).split(',')[0];

  /* ---------------------------------------------------------------- astronomy (real) */
  const fmtTime = (ms) => { const d = new Date(ms + VN_OFFSET_H * 3600000); return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
  const fmtDay = (ms, long) => { const d = new Date(ms + VN_OFFSET_H * 3600000); return long ? `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}` : `${d.getUTCDate()}/${d.getUTCMonth() + 1}`; };
  const vnParts = (ms) => { const d = new Date(ms + VN_OFFSET_H * 3600000); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: (d.getUTCDay() + 6) % 7 }; };
  const vnDayStart = (ms) => Math.floor((ms + VN_OFFSET_H * 3600000) / 86400000) * 86400000 - VN_OFFSET_H * 3600000;
  function sunAlt(ms, lat, lon) {
    const jd = A.toJD(ms), eph = api.eph(), l = A.lstDeg(jd, lon);
    if (eph && eph.bodies.sun.inRange(jd)) { const s = eph.bodies.sun.at(jd); return A.altAz(s.ra, s.dec, l, lat).alt; }
    const n = jd - 2451545.0, L = (280.46 + 0.9856474 * n) % 360, g = (357.528 + 0.9856003 * n) * D2R;   // low-precision Sun outside the table
    const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * D2R, eps = 23.439 * D2R;
    return A.altAz((Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / D2R + 360) % 360, Math.asin(Math.sin(eps) * Math.sin(lam)) / D2R, l, lat).alt;
  }
  function moonAt(ms) {
    const eph = api.eph(), jd = A.toJD(ms);
    if (!eph || !eph.bodies.moon.inRange(jd) || !eph.bodies.sun.inRange(jd)) return null;
    const p = A.moonPhase(eph.bodies.sun.at(jd), eph.bodies.moon.at(jd));
    return { f: p.fraction, w: p.waxing, ang: p.waxing ? p.elong : 360 - p.elong };
  }
  const centres = {};
  function centre(code) {
    if (centres[code]) return centres[code];
    const r = SC().search(code, 60).find((x) => x.code === code); if (!r) return null;
    let v = [0, 0, 0]; r.stars.forEach((s) => { const e = A.eqToVec(s.ra, s.dec); v = [v[0] + e[0], v[1] + e[1], v[2] + e[2]]; });
    const e = A.vecToEq(v.map((x) => x / Math.hypot(...v)));
    return (centres[code] = { ra: e.ra, dec: e.dec, count: r.count, stars: r.stars, latin: r.latin });
  }
  const cName = (code) => (api.lang() === 'vi' ? SC().NAMES[code][1] : SC().NAMES[code][0]);
  const allCodes = () => Object.keys(SC().NAMES).filter((c) => centre(c));
  function windowFor(code, p, dayStart) {            // longest stretch of the night (18:00 to 06:00) above 15° with the Sun below -12°
    const c = centre(code); let best = null, cur = null, maxAlt = -90, maxAt = 0;
    for (let m = 18 * 60; m <= 30 * 60; m += 10) {
      const ms = dayStart + m * 60000, a = A.altAz(c.ra, c.dec, A.lstDeg(A.toJD(ms), p.lon), p.lat).alt, ok = a >= MIN_ALT && sunAlt(ms, p.lat, p.lon) < SUN_LIMIT;
      if (a > maxAlt) { maxAlt = a; maxAt = ms; }
      if (ok) { if (!cur) cur = { start: ms, end: ms, peak: a, peakAt: ms }; cur.end = ms; if (a > cur.peak) { cur.peak = a; cur.peakAt = ms; } }
      else if (cur) { if (!best || cur.end - cur.start > best.end - best.start) best = cur; cur = null; }
    }
    if (cur && (!best || cur.end - cur.start > best.end - best.start)) best = cur;
    return { win: best, maxAlt, maxAt, culm: 90 - Math.abs(p.lat - c.dec) };
  }
  function bestMonth(code) {
    const c = centre(code); let bm = 0, bd = 999;
    for (let m = 0; m < 12; m++) { const l = A.lstDeg(A.toJD(Date.UTC(2026, m, 15, 21 - VN_OFFSET_H)), 106), d = Math.abs(((l - c.ra + 540) % 360) - 180); if (d < bd) { bd = d; bm = m; } }
    return bm;
  }
  const tonightStart = () => { const n = Date.now(); return vnDayStart(new Date(n + VN_OFFSET_H * 3600000).getUTCHours() < 6 ? n - 86400000 : n); };
  const nightStart = (i) => tonightStart() + i * 86400000;
  const nightInfo = (code, p, i) => { const w = windowFor(code, p, nightStart(i)), mo = moonAt(nightStart(i) + 18 * 3600000), mins = w.win ? (w.win.end - w.win.start) / 60000 + 10 : 0; return { ...w, moon: mo, mins, score: mins * (1 - 0.6 * (mo ? mo.f : 0.3)) }; };

  /* ---------------------------------------------------------------- calendar output */
  const icsDate = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function planEvent(code, i, pid) {
    const p = byId(pid), n = nightInfo(code, p, i), w = n.win; if (!w) return null;
    return { kind: 'plan', code, title: t().evTitle.replace('{n}', cName(code)).replace('{p}', short(p)), place: pName(p), lat: p.lat, lon: p.lon, start: w.start, end: w.end + 10 * 60000,
      body: t().evBody.replace('{t}', `${fmtTime(w.start)} – ${fmtTime(w.end)}`).replace('{a}', Math.round(w.peak)).replace('{m}', n.moon ? Math.round(n.moon.f * 100) : '?') };
  }
  const gcalUrl = (e) => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${icsDate(e.start)}/${icsDate(e.end)}&details=${encodeURIComponent(e.body || '')}&location=${encodeURIComponent((e.place || 'Vietnam'))}&ctz=Asia%2FHo_Chi_Minh`;
  function icsText(list) {
    const cl = (s) => String(s || '').replace(/[,;\n]/g, ' '), lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Space_VI Sky//EN', 'CALSCALE:GREGORIAN'];
    list.forEach((e, i) => { lines.push('BEGIN:VEVENT', `UID:${e.start}-${i}@space-vi-sky`, `DTSTAMP:${icsDate(Date.now())}`, `DTSTART:${icsDate(e.start)}`, `DTEND:${icsDate(e.end)}`, `SUMMARY:${cl(e.title)}`, `DESCRIPTION:${cl(e.body)}`, `LOCATION:${cl(e.place || 'Vietnam')}`);
      if (e.lat != null) lines.push(`GEO:${e.lat};${e.lon}`); lines.push('BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', `DESCRIPTION:${cl(e.title)}`, 'END:VALARM', 'END:VEVENT'); });
    lines.push('END:VCALENDAR'); return lines.join('\r\n');
  }
  function download(name, text) {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/calendar' })), download: name });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const moonSvg = (m) => {
    if (!m) return '<svg class="pl-moon" viewBox="-10 -10 20 20" aria-hidden="true"><circle r="8" fill="none" stroke="rgba(255,255,255,.18)" stroke-dasharray="2 2"/></svg>';
    const k = 1 - 2 * m.f, rx = Math.abs(k) * 8;
    return `<svg class="pl-moon" viewBox="-10 -10 20 20" aria-hidden="true"><circle r="8" fill="#1a2233" stroke="rgba(255,255,255,.25)"/><path transform="${m.w ? '' : 'scale(-1 1)'}" d="M0 -8 A8 8 0 0 1 0 8 A${rx.toFixed(2)} 8 0 0 ${k < 0 ? 1 : 0} 0 -8Z" fill="#f1f5f9"/></svg>`;
  };
  const pin = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9.5" r="2.4" fill="currentColor"/></svg>';

  /* ---------------------------------------------------------------- 1. the block under a constellation */
  function openConst(code) {
    const c = centre(code); if (!c) return;
    if (api.state.cons[code]) api.select('const', code); else api.select('point', { name: cName(code), ra: c.ra, dec: c.dec, ra2000: c.ra, dec2000: c.dec, cons: code });
  }
  function codeOf(sel) { return sel && sel.kind === 'const' ? sel.id : sel && sel.kind === 'point' && sel.id.cons ? sel.id.cons : null; }
  function blockHtml(code) {
    const tx = t(), p = byId(st.place), n = [...Array(14)].map((_, i) => ({ i, ...nightInfo(code, p, i) }));
    const bestI = n.reduce((b, x) => (x.score > b.score ? x : b), n[0]).i, cur = n[st.night] || n[0], w = cur.win, maxM = Math.max(1, ...n.map((x) => x.score));
    const win = w ? `<b>${fmtTime(w.start)}</b> ${esc(tx.to)} <b>${fmtTime(w.end)}</b><span>${esc(tx.peak)} ${Math.round(w.peak)}° ${esc(tx.darkWin)}</span>` : `<span class="pl-warn">${esc(cur.culm <= 0 ? tx.never : tx.noWin)}</span>`;
    return `<h3>${esc(tx.when)}</h3>
      <button type="button" class="pl-place" data-a="map">${pin}<span>${esc(short(p))}</span><i class="pl-b b${p.b <= 3 ? 'd' : p.b <= 6 ? 'm' : 'c'}">${esc(tx.bortle)} ${p.b} · ${esc(tx.demo)}</i><em>${esc(tx.map3d)}</em></button>
      <div class="pl-nights" role="listbox">${n.map((x) => { const d = vnParts(nightStart(x.i)); return `<button type="button" class="pl-night${x.i === st.night ? ' is-on' : ''}${x.i === bestI && x.mins ? ' is-best' : ''}" data-night="${x.i}" title="${x.mins ? Math.round(x.mins) + ' ' + tx.mins : '–'}"><small>${tx.dayNames[d.wd]}</small><b>${d.d}</b><span class="pl-bar"><i style="height:${Math.round(x.score / maxM * 100)}%"></i></span>${moonSvg(x.moon)}</button>`; }).join('')}</div>
      <p class="pl-win">${win}</p>
      <p class="pl-sub">${esc(tx.best)}: <b>${esc(tx.months[bestMonth(code)])}</b> (${esc(tx.bestSub)}) · ${esc(tx.moon)} ${cur.moon ? Math.round(cur.moon.f * 100) + '% ' + esc(tx.lit) : '—'}</p>
      <div class="pl-actions"><button type="button" class="pl-btn" data-a="gcal"${w ? '' : ' disabled'}>${esc(tx.gcal)}</button><button type="button" class="pl-btn" data-a="ics"${w ? '' : ' disabled'}>${esc(tx.ics)}</button><button type="button" class="pl-btn" data-a="save"${w ? '' : ' disabled'}>${esc(tx.save)}</button><button type="button" class="pl-btn pl-go" data-a="view">${esc(tx.view)}</button></div>`;
  }
  function mountPanel(panel, sel) {
    const code = codeOf(sel); st.mount = null; if (!code || !centre(code)) return;
    st.code = code; const box = document.createElement('div'); box.className = 'p-sec pl'; box.id = 'pl';
    const cta = $('.p-cta', panel); panel.insertBefore(box, cta); st.mount = box; box.innerHTML = blockHtml(code);
    box.addEventListener('click', onBlock);
  }
  const remount = () => { if (st.mount && st.mount.isConnected) st.mount.innerHTML = blockHtml(st.code); };
  function onBlock(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.night != null) { st.night = +b.dataset.night; remount(); return; }
    const a = b.dataset.a, p = byId(st.place);
    if (a === 'map') { openMap(); return; }
    const ev = planEvent(st.code, st.night, st.place);
    if (a === 'gcal' && ev) window.open(gcalUrl(ev), '_blank', 'noopener');
    else if (a === 'ics' && ev) download(`${st.code}-${fmtDay(ev.start).replace('/', '-')}.ics`, icsText([ev]));
    else if (a === 'save' && ev) { plans.push({ ...ev, id: Date.now().toString(36) }); put('space-vi-plans', plans); api.toast(t().saved); if (!$('#plc').hidden) renderCal(); }
    else if (a === 'view') { const n = nightInfo(st.code, p, st.night); api.setSite({ name: pName(p), lat: p.lat, lon: p.lon }); api.setSkyMode('local'); api.setTime(n.win ? n.win.peakAt : n.maxAt); }
  }

  /* ---------------------------------------------------------------- 2. overview calendar */
  const dock = $('.dock-left');
  const calBtn = Object.assign(document.createElement('button'), { className: 'btn btn-solid', id: 'pl-open', type: 'button' });
  calBtn.setAttribute('aria-haspopup', 'dialog');
  calBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M9 3.5v4M15 3.5v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span></span>';
  if (dock) dock.appendChild(calBtn);
  const cal = Object.assign(document.createElement('div'), { id: 'plc', className: 'pl-modal', hidden: true });
  cal.setAttribute('role', 'dialog'); cal.setAttribute('aria-modal', 'true'); document.body.appendChild(cal);
  const calOpen = (o) => { cal.hidden = !o; if (o) renderCal(); };
  calBtn.addEventListener('click', () => calOpen(cal.hidden));

  function monthEvents(y, m) {
    const tx = t(), out = [], from = Date.UTC(y, m, 1, -VN_OFFSET_H), to = Date.UTC(y, m + 1, 1, -VN_OFFSET_H);
    let prev = moonAt(from - 3600000);                                  // exact moments of new / quarter / full Moon: where the phase angle crosses 0, 90, 180, 270
    if (prev) for (let ms = from; ms < to; ms += 3600000) {
      const cur = moonAt(ms); if (!cur) break;
      for (let q = 0; q < 4; q++) { const a = q * 90, a0 = prev.ang, a1 = cur.ang; if ((a0 < a && a1 >= a) || (q === 0 && a0 > 300 && a1 < 60)) out.push({ kind: 'moon', q, start: ms, end: ms + 3600000, title: tx.moonEv[q], body: '' }); }
      prev = cur;
    }
    for (const s of A.SHOWERS) if (s.m - 1 === m) {
      const ms = Date.UTC(y, m, s.d, 22 - VN_OFFSET_H), mo = moonAt(ms + 4 * 3600000);
      out.push({ kind: 'shower', start: ms, end: ms + 6 * 3600000, title: `${tx.shower}: ${s.name}`, sub: tx.zhr.replace('{n}', s.zhr) + (mo ? ' · ' + (mo.f < 0.3 ? tx.goodMoon : tx.badMoon) : ''), body: `${s.name}. ${tx.zhr.replace('{n}', s.zhr)}.`, good: mo ? mo.f < 0.3 : null });
    }
    plans.forEach((p) => { if (p.start >= from && p.start < to) out.push({ ...p, kind: 'plan' }); });
    return out.sort((a, b) => a.start - b.start);
  }
  function renderCal() {
    const tx = t(), now = vnParts(Date.now()); calBtn.lastElementChild.textContent = tx.cal;
    if (!st.month) st.month = { y: now.y, m: now.m };
    const { y, m } = st.month, lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), evs = monthEvents(y, m);
    const byDay = {}; evs.forEach((e) => { const d = vnParts(e.start).d; (byDay[d] = byDay[d] || []).push(e); });
    let cells = tx.dayNames.map((d) => `<span class="pl-dn">${d}</span>`).join('') + '<span></span>'.repeat(lead), anyMoon = false;
    for (let d = 1; d <= days; d++) {
      const mo = moonAt(Date.UTC(y, m, d, 21 - VN_OFFSET_H)); if (mo) anyMoon = true;
      const dots = (byDay[d] || []).filter((e) => e.kind !== 'moon').map((e) => `<i class="pl-dot ${e.kind}"></i>`).join('');
      cells += `<button type="button" class="pl-day${now.y === y && now.m === m && now.d === d ? ' is-today' : ''}${st.day === d ? ' is-on' : ''}${mo && mo.f < 0.25 ? ' is-dark' : ''}" data-day="${d}"><b>${d}</b>${moonSvg(mo)}<span class="pl-dots">${dots}</span></button>`;
    }
    const list = (st.day ? evs.filter((e) => vnParts(e.start).d === st.day) : evs);
    const row = (e) => `<li class="ev-${e.kind}"><i></i><span class="ev-t"><b>${esc(e.title)}</b><small>${fmtDay(e.start)} · ${e.kind === 'moon' ? '≈ ' : ''}${fmtTime(e.start)}${e.kind === 'moon' ? '' : '–' + fmtTime(e.end)}${e.sub ? ' · ' + esc(e.sub) : ''}</small></span>${e.kind === 'moon' ? '' : `<a class="pl-lk" href="${esc(gcalUrl(e))}" target="_blank" rel="noopener">Google</a>`}${e.kind === 'plan' ? `<button type="button" class="pl-lk" data-rm="${e.id}">${esc(tx.remove)}</button>` : ''}</li>`;
    let dayInfo = '';
    if (st.day) {
      const ms = Date.UTC(y, m, st.day, 21 - VN_OFFSET_H), mo = moonAt(ms), p = byId(st.place), l = A.lstDeg(A.toJD(ms), p.lon);
      const up = allCodes().map((c) => ({ c, a: A.altAz(centre(c).ra, centre(c).dec, l, p.lat).alt })).filter((x) => x.a > 25).sort((a, b) => b.a - a.a).slice(0, 6);
      dayInfo = `<div class="pl-dayinfo"><p>${st.day}/${m + 1} · ${mo ? Math.round(mo.f * 100) + '% ' + esc(tx.lit) : esc(tx.noEph)} · ${esc(tx.wellPlaced)} · ${esc(short(p))}</p><div class="pl-chips">${up.map((x) => `<button type="button" class="pl-chip" data-code="${x.c}">${esc(cName(x.c))}<small>${Math.round(x.a)}°</small></button>`).join('')}</div></div>`;
    }
    cal.innerHTML = `<div class="pl-card pl-cal"><header class="pl-head"><h2>${esc(tx.calTitle)}</h2><button type="button" class="pl-x" data-a="close" aria-label="${esc(tx.close)}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>
      <div class="pl-cal-body"><div class="pl-cal-l"><div class="pl-cal-h"><button type="button" class="pl-ic" data-mon="-1" aria-label="prev"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><h3>${esc(tx.months[m])} ${y}</h3><button type="button" class="pl-ic" data-mon="1" aria-label="next"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button><button type="button" class="pl-btn pl-sm" data-a="today">${esc(tx.today)}</button></div>
      <div class="pl-grid">${cells}</div>${anyMoon ? '' : `<p class="pl-sub">${esc(tx.noEph)}</p>`}
      <p class="pl-legend"><i class="pl-dot shower"></i>${esc(tx.shower)} <i class="pl-dot plan"></i>${esc(tx.planEv)} <i class="pl-ring"></i>${esc(tx.dark)}</p></div>
      <div class="pl-cal-r"><h3>${esc(st.day ? st.day + '/' + (m + 1) : tx.eventsH)}</h3>${dayInfo}<ul class="pl-ev">${list.length ? list.map(row).join('') : `<li class="pl-none">${esc(tx.noEv)}</li>`}</ul>
      ${plans.length ? `<button type="button" class="pl-btn" data-a="icsAll">${esc(tx.plansDl)}</button>` : ''}<p class="pl-sub">${esc(tx.calNote)}</p></div></div></div>`;
  }
  cal.addEventListener('click', (e) => {
    if (e.target === cal) { calOpen(false); return; }
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.day) { st.day = st.day === +b.dataset.day ? null : +b.dataset.day; renderCal(); return; }
    if (b.dataset.mon) { const d = new Date(Date.UTC(st.month.y, st.month.m + +b.dataset.mon, 1)); st.month = { y: d.getUTCFullYear(), m: d.getUTCMonth() }; st.day = null; renderCal(); return; }
    if (b.dataset.rm) { plans = plans.filter((p) => p.id !== b.dataset.rm); put('space-vi-plans', plans); renderCal(); return; }
    if (b.dataset.code) { calOpen(false); openConst(b.dataset.code); return; }
    if (b.dataset.a === 'close') calOpen(false);
    else if (b.dataset.a === 'today') { st.month = null; st.day = null; renderCal(); }
    else if (b.dataset.a === 'icsAll') download('space-vi-plan.ics', icsText(plans));
  });

  /* ---------------------------------------------------------------- 3. 3D map of Vietnam */
  const vn = { el: null, ready: null, T: null };
  const bColour = (b) => (b <= 3 ? 0x5eead4 : b <= 6 ? 0xf5a54a : 0xf87171);
  async function openMap() {
    if (!vn.el) buildMapShell();
    vn.el.hidden = false; layoutMapText();
    try { if (!vn.ready) vn.ready = initMap(); await vn.ready; vn.start(); vn.refresh(); } catch (e) { console.warn('[map]', e); $('.vn-msg', vn.el).textContent = 'WebGL / three.js unavailable'; }
  }
  function buildMapShell() {
    const el = Object.assign(document.createElement('div'), { className: 'pl-modal', hidden: true }); el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="pl-card pl-map"><header class="pl-head"><h2></h2><button type="button" class="pl-x" data-a="close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header><div class="vn-stage"><canvas class="vn-cv"></canvas><div class="vn-labels"></div><p class="vn-msg"></p><p class="vn-hint"></p></div><div class="vn-foot"><div class="vn-top"></div><div class="vn-sel"></div></div><p class="pl-sub vn-note"></p></div>';
    document.body.appendChild(el); vn.el = el;
    el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-a=close]')) { el.hidden = true; vn.stop && vn.stop(); return; } const b = e.target.closest('button[data-pid]'); if (b) pickPlace(b.dataset.pid, b.dataset.use === '1'); });
  }
  function layoutMapText() { const tx = t(); $('h2', vn.el).textContent = tx.mapTitle; $('.vn-hint', vn.el).textContent = tx.drag; $('.vn-note', vn.el).textContent = tx.mapNote + (st.code ? '' : ' ' + tx.mapNone); }
  function pickPlace(id, use) {
    st.place = id; put('space-vi-place', id);
    if (use) { vn.el.hidden = true; vn.stop && vn.stop(); }
    remount(); if (!cal.hidden) renderCal(); if (vn.refresh && !vn.el.hidden) vn.refresh();
  }
  async function initMap() {
    const THREE = await import('three'); const data = await fetch('sky/vietnam.json').then((r) => r.json()); vn.T = THREE;
    const stage = $('.vn-stage', vn.el), canvas = $('.vn-cv', vn.el), labels = $('.vn-labels', vn.el);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 900 ? 1.5 : 2));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200), kx = Math.cos(15 * D2R);
    const P = (lon, lat) => [(lon - 110) * kx, -(lat - 14.5)];
    scene.add(new THREE.AmbientLight(0xaecbff, 0.9)); const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(-6, 12, 8); scene.add(sun);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: 0x06182b })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; scene.add(sea);
    const grid = new THREE.GridHelper(60, 60, 0x1d3a5c, 0x0e2339); grid.material.transparent = true; grid.material.opacity = 0.45; scene.add(grid);
    const landMat = new THREE.MeshStandardMaterial({ color: 0x24506f, roughness: 0.85, metalness: 0.05 }), lineMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc });
    for (const ring of data.rings) {
      const shape = new THREE.Shape(ring.map(([lon, lat]) => { const [x, z] = P(lon, lat); return new THREE.Vector2(x, -z); }));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false }), mesh = new THREE.Mesh(geo, landMat); mesh.rotation.x = -Math.PI / 2; scene.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), lineMat); edges.rotation.x = -Math.PI / 2; scene.add(edges);
    }
    const dashed = new THREE.LineDashedMaterial({ color: 0xf5a54a, dashSize: 0.22, gapSize: 0.16 }), islMat = new THREE.MeshStandardMaterial({ color: 0x5aa0c8, roughness: 0.7 });
    const labelEls = [], addLabel = (cls, pos, html) => { const d = Object.assign(document.createElement('div'), { className: 'vn-l ' + cls, innerHTML: html }); labels.appendChild(d); labelEls.push({ d, pos }); return d; };
    for (const a of ARCH) {
      const [x0, x1, y0, y1] = a.box, c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([lo, la]) => { const [x, z] = P(lo, la); return new THREE.Vector3(x, 0.03, z); });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c), dashed); line.computeLineDistances(); scene.add(line);
      for (const [lo, la] of a.isl) { const [x, z] = P(lo, la), m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 14), islMat); m.position.set(x, 0.05, z); scene.add(m); }
      const [lx, lz] = P((x0 + x1) / 2, y1 + 0.5); addLabel('arch', new THREE.Vector3(lx, 0.1, lz), '');
      labelEls[labelEls.length - 1].arch = a;
    }
    const pins = [], pinGroup = new THREE.Group(); scene.add(pinGroup);
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let hover = null;
    for (const p of PLACES) {
      const [x, z] = P(p.lon, p.lat), g = new THREE.Group(); g.position.set(x, 0.2, z);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 20), new THREE.MeshBasicMaterial({ color: 0x0b1424 })); base.position.y = 0.0; g.add(base);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35 })); g.add(bar);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); g.add(top);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.29, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.visible = false; g.add(ring);
      g.userData.id = p.id; [bar, top, base].forEach((m) => { m.userData.id = p.id; }); pinGroup.add(g);
      const d = addLabel('pin', new THREE.Vector3(x, 0.2, z), ''); pins.push({ p, g, bar, top, ring, d });
    }
    const cam = { az: 0.0, el: 1.1, dist: 27, tx: -0.3, tz: 0.7 };
    const place = () => { const ce = Math.cos(cam.el); camera.position.set(cam.tx + cam.dist * ce * Math.sin(cam.az), cam.dist * Math.sin(cam.el), cam.tz + cam.dist * ce * Math.cos(cam.az)); camera.lookAt(cam.tx, 0, cam.tz); };
    const size = () => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    new ResizeObserver(size).observe(stage);
    let raf = 0, active = false;
    const v = new THREE.Vector3();
    function draw(now) {
      raf = active ? requestAnimationFrame(draw) : 0; place();
      const w = stage.clientWidth, h = stage.clientHeight, s = byId(st.place);
      for (const q of pins) { const on = q.p.id === s.id; q.ring.visible = on; if (on) { const k = 1 + 0.18 * Math.sin(now / 320); q.ring.scale.set(k, k, k); } q.g.scale.setScalar(on ? 1.15 : 1); }
      for (const l of labelEls) { v.copy(l.pos).project(camera); const vis = v.z < 1; l.d.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`; l.d.style.opacity = vis ? '' : '0'; }
      renderer.render(scene, camera);
    }
    const pick = (cx, cy) => { const r = canvas.getBoundingClientRect(); ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera); const hit = ray.intersectObjects(pinGroup.children, true)[0]; return hit ? hit.object.userData.id : null; };
    let drag = null;
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, az: cam.az, el: cam.el, moved: false }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; cam.az = drag.az - dx * 0.006; cam.el = Math.min(1.45, Math.max(0.35, drag.el + dy * 0.005)); }
      else { const id = pick(e.clientX, e.clientY); canvas.style.cursor = id ? 'pointer' : 'grab'; if (id !== hover) { hover = id; refreshLabels(); } }
    });
    canvas.addEventListener('pointerup', (e) => { if (drag && !drag.moved) { const id = pick(e.clientX, e.clientY); if (id) pickPlace(id, false); } drag = null; });
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.dist = Math.min(44, Math.max(10, cam.dist * (1 + Math.sign(e.deltaY) * 0.08))); }, { passive: false });
    function refreshLabels() {
      const sel = byId(st.place).id;
      for (const q of pins) { const show = q.p.id === sel || q.p.id === hover; q.d.innerHTML = `<span>${esc(short(q.p))}</span>`; q.d.classList.toggle('is-on', show); }
      for (const l of labelEls) if (l.arch) l.d.innerHTML = `<span>${esc(api.lang() === 'vi' ? l.arch.vi : l.arch.en)}</span>`;
    }
    vn.refresh = () => {
      const tx = t(), code = st.code, rows = PLACES.map((p) => ({ p, n: code ? nightInfo(code, p, st.night) : null }));
      for (const q of pins) {
        const r = rows.find((x) => x.p.id === q.p.id), vis = !code || (r.n.win && r.n.win.peak > 0), col = code && !r.n.win ? 0x64748b : bColour(q.p.b);
        const h = code ? (r.n.win ? 0.3 + (r.n.win.peak / 90) * 2.2 : 0.18) : 0.3 + ((10 - q.p.b) / 9) * 1.8;
        q.bar.scale.y = h; q.bar.position.y = h / 2; q.top.position.y = h + 0.05; q.bar.material.color.setHex(col); q.bar.material.emissive.setHex(col); q.top.material.color.setHex(col); q.ring.material.color.setHex(col); q.g.visible = true; void vis;
      }
      refreshLabels();
      const ranked = code ? rows.filter((x) => x.n.win).sort((a, b) => (b.n.mins * (10 - b.p.b)) - (a.n.mins * (10 - a.p.b))).slice(0, 4) : rows.slice().sort((a, b) => a.p.b - b.p.b).slice(0, 4);
      $('.vn-top', vn.el).innerHTML = `<h3>${esc(tx.top)}</h3>` + (ranked.length ? '' : `<span class="pl-sub">${esc(tx.noWin)}</span>`) + ranked.map((x) => `<button type="button" data-pid="${x.p.id}" class="vn-chip${x.p.id === st.place ? ' is-on' : ''}"><i style="background:#${bColour(x.p.b).toString(16).padStart(6, '0')}"></i><b>${esc(short(x.p))}</b>${x.n && x.n.win ? `<small>${fmtTime(x.n.win.start)}–${fmtTime(x.n.win.end)} · ${Math.round(x.n.win.peak)}°</small>` : `<small>${esc(tx.bortle)} ${x.p.b}</small>`}</button>`).join('');
      const s = byId(st.place), ni = code ? nightInfo(code, s, st.night) : null;
      $('.vn-sel', vn.el).innerHTML = `<div><b>${esc(pName(s))}</b><small>${esc(tx.bortle)} ${s.b} · ${esc(s.b <= 3 ? tx.dark : s.b <= 6 ? tx.mid : tx.bright)} <em class="pl-demo">${esc(tx.demo)}</em>${ni ? ' · ' + (ni.win ? `${fmtTime(ni.win.start)}–${fmtTime(ni.win.end)}, ${Math.round(ni.win.peak)}°` : esc(ni.culm <= 0 ? tx.never : tx.noWin)) : ''}</small></div><button type="button" class="pl-btn pl-go" data-pid="${s.id}" data-use="1">${esc(tx.pick)}</button>`;
      layoutMapText();
    };
    vn.start = () => { active = true; size(); if (!raf) raf = requestAnimationFrame(draw); }; vn.stop = () => { active = false; };
    size(); refreshLabels();
  }

  /* ---------------------------------------------------------------- 4. trending stars (demo), a quiet card on the left */
  const hot = Object.assign(document.createElement('aside'), { id: 'pl-hot' });
  const ui = $('#ui'); (ui || document.body).appendChild(hot);
  function renderHot() {
    const tx = t(), rows = DEMO_VIEWS.map(([n, v]) => ({ n, v, like: !!likes[n], total: v + (likes[n] ? 25 : 0) })).sort((a, b) => b.total - a.total).slice(0, st.hotMore ? 10 : 5), max = rows[0].total;
    hot.innerHTML = `<header><h3>${esc(tx.hotH)}</h3><i class="pl-demo">${esc(tx.demo)}</i></header><ol>${rows.map((r, i) => `<li><button type="button" class="hot-star" data-star="${esc(r.n)}" style="--w:${(r.total / max * 100).toFixed(0)}%"><span class="hot-rank">${i + 1}</span><b>${esc(r.n)}</b><small>${r.total.toLocaleString()}</small></button><button type="button" class="hot-like${r.like ? ' is-on' : ''}" data-like="${esc(r.n)}" aria-pressed="${r.like}" aria-label="${esc(tx.like)} ${esc(r.n)}"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button></li>`).join('')}</ol><button type="button" class="hot-more" data-more>${esc(st.hotMore ? tx.less : tx.more)}</button>`;
  }
  hot.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.like) { const n = b.dataset.like; if (likes[n]) delete likes[n]; else likes[n] = 1; put('space-vi-likes', likes); renderHot(); }
    else if (b.dataset.more != null) { st.hotMore = !st.hotMore; renderHot(); }
    else if (b.dataset.star) { const i = api.state.stars.f.findIndex((s) => s[8] && s[8].toLowerCase() === b.dataset.star.toLowerCase()); if (i >= 0) api.select('star', i); }
  });

  addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (vn.el && !vn.el.hidden) { vn.el.hidden = true; vn.stop && vn.stop(); } else if (!cal.hidden) calOpen(false); } });
  const refresh = () => { calBtn.lastElementChild.textContent = t().cal; renderHot(); remount(); if (!cal.hidden) renderCal(); if (vn.el && !vn.el.hidden) { layoutMapText(); vn.refresh && vn.refresh(); } };
  refresh();
  const closeModals = () => { cal.hidden = true; if (vn.el) { vn.el.hidden = true; vn.stop && vn.stop(); } };
  return { refresh, mountPanel, openConst, centre, windowFor, bestMonth, constellations: allCodes, openCalendar: () => calOpen(true), openMap, closeModals, setConst: (c) => { st.code = c; } };
}
