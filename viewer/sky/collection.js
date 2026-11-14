/* My collection: what a person saves from the sky or the viewer (a star's facts, a snapshot of the screen).
   Stored only in this browser (localStorage); nothing is uploaded. Shared by welcome.html and index.html. */
(() => {
  const KEY = 'space-vi-collection', MAX = 60;
  let lang = 'en';
  try { const l = localStorage.getItem('sky-lang'); lang = l === 'vi' || l === 'en' ? l : ((navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en'); } catch { /* ignore */ }
  const S = { en: { title: 'My collection', empty: 'Nothing saved yet. Use the Save button on a star, or Save snapshot, and it will appear here.', open: 'Open in viewer', sky: 'Show in sky', png: 'Download image', json: 'Download data', del: 'Remove',
      all: 'Export all (JSON)', allTxt: 'Export all (text)', txt: 'Download text', copy: 'Copy text', copied: 'Copied', clear: 'Clear all', confirm: 'Remove everything you saved?', note: 'Saved only in this browser. Exporting gives you a file you keep.', saved: 'Saved to My collection', full: 'Storage is full: older pictures were dropped to make room.', count: '{n} saved', star: 'Star', snap: 'Snapshot', obj: 'Object' },
    vi: { title: 'Bộ sưu tập của tôi', empty: 'Chưa lưu gì. Dùng nút Lưu trên một ngôi sao, hoặc Lưu ảnh chụp, nó sẽ hiện ở đây.', open: 'Mở trong trình xem', sky: 'Xem trên bầu trời', png: 'Tải ảnh', json: 'Tải dữ liệu', del: 'Xóa',
      all: 'Xuất tất cả (JSON)', allTxt: 'Xuất tất cả (văn bản)', txt: 'Tải văn bản', copy: 'Sao chép văn bản', copied: 'Đã chép', clear: 'Xóa hết', confirm: 'Xóa toàn bộ những gì bạn đã lưu?', note: 'Chỉ lưu trong trình duyệt này. Xuất file để giữ lâu dài.', saved: 'Đã lưu vào Bộ sưu tập', full: 'Bộ nhớ đầy: đã bỏ bớt ảnh cũ để lấy chỗ.', count: 'Đã lưu {n}', star: 'Ngôi sao', snap: 'Ảnh chụp', obj: 'Vật thể' } }[lang];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const listeners = new Set();
  const read = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
  function write(a) {
    let warned = false;
    for (;;) {
      try { localStorage.setItem(KEY, JSON.stringify(a)); break; } catch {
        let i = -1; for (let k = a.length - 1; k >= 0; k--) if (a[k].image) { i = k; break; }   // drop the oldest picture first
        if (i < 0) { a.pop(); if (!a.length) break; } else { delete a[i].image; warned = true; }
      }
    }
    listeners.forEach((f) => f()); return warned;
  }
  function download(name, blobOrUrl, type) {
    const a = document.createElement('a'); a.download = name;
    a.href = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(new Blob([blobOrUrl], { type })); document.body.appendChild(a); a.click(); a.remove();
  }
  /** A readable text version of one saved item: what it is, the numbers, the sources, and where to open it again. */
  function toText(it) {
    const date = new Date(it.saved).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const L = lang === 'vi' ? { head: 'NODIXHI: mục đã lưu', saved: 'Đã lưu', pos: 'Vị trí (RA, Dec, độ)', facts: 'Thông tin', planets: 'Hành tinh đã xác nhận', src: 'Nguồn dữ liệu', link: 'Mở lại', rad: 'bán kính', per: 'chu kỳ', d: 'ngày', er: 'lần Trái Đất' }
      : { head: 'NODIXHI: saved item', saved: 'Saved', pos: 'Position (RA, Dec in degrees)', facts: 'Facts', planets: 'Confirmed planets', src: 'Data sources', link: 'Open again', rad: 'radius', per: 'period', d: 'days', er: 'x Earth' };
    const lines = [L.head, '='.repeat(L.head.length), '', it.name, `${L.saved}: ${date}`, '', `${L.pos}: ${Number(it.ra).toFixed(5)}, ${Number(it.dec).toFixed(5)}`];
    if (it.summary) lines.push('', it.summary);
    if ((it.facts || []).length) lines.push('', L.facts + ':', ...it.facts.map(([k, v]) => `  - ${k}: ${v}`));
    if ((it.planets || []).length) lines.push('', L.planets + ':', ...it.planets.map((p) => `  - ${p.name}${p.rade != null ? `, ${L.rad} ${Number(p.rade).toFixed(2)} ${L.er}` : ''}${p.period_d != null ? `, ${L.per} ${Number(p.period_d).toFixed(1)} ${L.d}` : ''}`));
    if (it.source) lines.push('', `${L.src}: ${it.source}`);
    lines.push('', `${L.link}: ${location.origin}/index.html?ra=${it.ra}&dec=${it.dec}&band=SD2&fov=120`, '');
    return lines.join('\n');
  }
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';
  const api = {
    all: read, toText, count: () => read().length, onChange: (f) => listeners.add(f), S,
    add(item) {
      const a = read().filter((x) => !(x.kind === item.kind && x.name === item.name && x.kind !== 'snapshot'));
      const rec = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), saved: new Date().toISOString(), ...item };
      a.unshift(rec); const trimmed = write(a.slice(0, MAX)); return { rec, trimmed };
    },
    remove(id) { write(read().filter((x) => x.id !== id)); },
    clear() { write([]); },
    exportText() { download('nodixhi-collection.txt', read().map(toText).join('\n' + '-'.repeat(60) + '\n\n'), 'text/plain'); },
    exportAll() { download('nodixhi-collection.json', JSON.stringify({ app: 'NODIXHI', exported: new Date().toISOString(), items: read() }, null, 1), 'application/json'); },
    downloadItem(it, what) {
      if (what === 'txt') download(`${slug(it.name)}.txt`, toText(it), 'text/plain');
      else if (what === 'png' && it.image) download(`${slug(it.name)}.jpg`, it.image);
      else download(`${slug(it.name)}.json`, JSON.stringify({ ...it, image: it.image ? '(see the .jpg download)' : undefined }, null, 1), 'application/json');
    },
    /** Draw canvases (back to front) into one small JPEG. Each entry: {canvas, x, y, w, h} in the source's own pixel box. */
    snapshot(layers, W, H, maxW = 640) {
      const k = Math.min(1, maxW / W), c = document.createElement('canvas'); c.width = Math.round(W * k); c.height = Math.round(H * k);
      const g = c.getContext('2d'); g.fillStyle = '#02040a'; g.fillRect(0, 0, c.width, c.height);
      for (const l of layers) { try { g.drawImage(l.canvas, l.x * k, l.y * k, l.w * k, l.h * k); } catch { /* tainted or empty */ } }
      try { return c.toDataURL('image/jpeg', 0.8); } catch { return null; }
    },
    /** Render the list into an element. `links(item)` returns {viewer, sky} hrefs. */
    mount(el, links) {
      const draw = () => {
        const a = read();
        el.innerHTML = `<div class="col-head"><b>${esc(S.title)}</b><span>${esc(S.count.replace('{n}', a.length))}</span></div>` +
          (a.length ? `<ul class="col-list">${a.map((it) => { const l = links(it);
            return `<li class="col-it" data-id="${esc(it.id)}">${it.image ? `<img src="${it.image}" alt="" class="col-img">` : `<span class="col-img col-noimg" aria-hidden="true"></span>`}` +
              `<div class="col-b"><b>${esc(it.name)}</b><small>${esc(S[it.kind] || S.obj)} · ${new Date(it.saved).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB')}</small>` +
              `<ul class="col-f">${(it.facts || []).slice(0, 3).map(([k, v]) => `<li>${esc(k)} <b>${esc(v)}</b></li>`).join('')}</ul>` +
              `<div class="col-a"><a href="${esc(l.viewer)}">${esc(S.open)}</a><a href="${esc(l.sky)}">${esc(S.sky)}</a><button type="button" data-a="txt">${esc(S.txt)}</button><button type="button" data-a="copy">${esc(S.copy)}</button>${it.image ? `<button type="button" data-a="png">${esc(S.png)}</button>` : ''}<button type="button" data-a="json">${esc(S.json)}</button><button type="button" data-a="del" class="col-del">${esc(S.del)}</button></div></div></li>`; }).join('')}</ul>`
            : `<p class="col-empty">${esc(S.empty)}</p>`) +
          `<div class="col-foot"><p>${esc(S.note)}</p><div><button type="button" data-a="alltxt"${a.length ? '' : ' disabled'}>${esc(S.allTxt)}</button><button type="button" data-a="all"${a.length ? '' : ' disabled'}>${esc(S.all)}</button><button type="button" data-a="clear"${a.length ? '' : ' disabled'}>${esc(S.clear)}</button></div></div>`;
      };
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-a]'); if (!b) return; const act = b.dataset.a, li = b.closest('.col-it'), it = li && read().find((x) => x.id === li.dataset.id);
        if (act === 'alltxt') api.exportText(); else if (act === 'copy' && it) { navigator.clipboard?.writeText(toText(it)).then(() => { b.textContent = S.copied; setTimeout(() => { b.textContent = S.copy; }, 1500); }); }
        else if (act === 'all') api.exportAll(); else if (act === 'clear') { if (confirm(S.confirm)) api.clear(); }
        else if (it && act === 'del') api.remove(it.id); else if (it) api.downloadItem(it, act);
      });
      listeners.add(draw); draw();
    },
  };
  window.SpaceCollection = api;
})();
