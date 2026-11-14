/* Constellation search shared by the viewer and the sky guide.
   Real data: the 3,187 naked-eye stars of sky/sky-data.json (SIMBAD) are placed in constellations with the IAU boundaries of
   Roman (1987), constellation_bounds.tsv (the same table the star cards use), after precessing J2000 positions to B1875. */
(() => {
  const NAMES = {"And": ["Andromeda", "Tiên Nữ"], "Ant": ["Antlia", "Antlia"], "Aps": ["Apus", "Apus"], "Aqr": ["Aquarius", "Bảo Bình"], "Aql": ["Aquila", "Thiên Ưng"], "Ara": ["Ara", "Ara"], "Ari": ["Aries", "Bạch Dương"], "Aur": ["Auriga", "Ngự Phu"], "Boo": ["Boötes", "Mục Phu"], "Cae": ["Caelum", "Caelum"], "Cam": ["Camelopardalis", "Camelopardalis"], "Cnc": ["Cancer", "Cự Giải"], "CVn": ["Canes Venatici", "Canes Venatici"], "CMa": ["Canis Major", "Đại Khuyển"], "CMi": ["Canis Minor", "Tiểu Khuyển"], "Cap": ["Capricornus", "Ma Kết"], "Car": ["Carina", "Carina"], "Cas": ["Cassiopeia", "Tiên Hậu"], "Cen": ["Centaurus", "Bán Nhân Mã"], "Cep": ["Cepheus", "Cepheus"], "Cet": ["Cetus", "Cetus"], "Cha": ["Chamaeleon", "Chamaeleon"], "Cir": ["Circinus", "Circinus"], "Col": ["Columba", "Columba"], "Com": ["Coma Berenices", "Coma Berenices"], "CrA": ["Corona Australis", "Corona Australis"], "CrB": ["Corona Borealis", "Corona Borealis"], "Crv": ["Corvus", "Corvus"], "Crt": ["Crater", "Crater"], "Cru": ["Crux", "Nam Thập Tự"], "Cyg": ["Cygnus", "Thiên Nga"], "Del": ["Delphinus", "Delphinus"], "Dor": ["Dorado", "Dorado"], "Dra": ["Draco", "Thiên Long"], "Equ": ["Equuleus", "Equuleus"], "Eri": ["Eridanus", "Eridanus"], "For": ["Fornax", "Fornax"], "Gem": ["Gemini", "Song Tử"], "Gru": ["Grus", "Grus"], "Her": ["Hercules", "Vũ Tiên"], "Hor": ["Horologium", "Horologium"], "Hya": ["Hydra", "Hydra"], "Hyi": ["Hydrus", "Hydrus"], "Ind": ["Indus", "Indus"], "Lac": ["Lacerta", "Lacerta"], "Leo": ["Leo", "Sư Tử"], "LMi": ["Leo Minor", "Leo Minor"], "Lep": ["Lepus", "Lepus"], "Lib": ["Libra", "Thiên Bình"], "Lup": ["Lupus", "Lupus"], "Lyn": ["Lynx", "Lynx"], "Lyr": ["Lyra", "Thiên Cầm"], "Men": ["Mensa", "Mensa"], "Mic": ["Microscopium", "Microscopium"], "Mon": ["Monoceros", "Monoceros"], "Mus": ["Musca", "Musca"], "Nor": ["Norma", "Norma"], "Oct": ["Octans", "Octans"], "Oph": ["Ophiuchus", "Xà Phu"], "Ori": ["Orion", "Lạp Hộ"], "Pav": ["Pavo", "Pavo"], "Peg": ["Pegasus", "Phi Mã"], "Per": ["Perseus", "Anh Tiên"], "Phe": ["Phoenix", "Phoenix"], "Pic": ["Pictor", "Pictor"], "Psc": ["Pisces", "Song Ngư"], "PsA": ["Piscis Austrinus", "Piscis Austrinus"], "Pup": ["Puppis", "Puppis"], "Pyx": ["Pyxis", "Pyxis"], "Ret": ["Reticulum", "Reticulum"], "Sge": ["Sagitta", "Sagitta"], "Sgr": ["Sagittarius", "Nhân Mã"], "Sco": ["Scorpius", "Thiên Yết"], "Scl": ["Sculptor", "Sculptor"], "Sct": ["Scutum", "Scutum"], "Ser": ["Serpens", "Serpens"], "Sex": ["Sextans", "Sextans"], "Tau": ["Taurus", "Kim Ngưu"], "Tel": ["Telescopium", "Telescopium"], "Tri": ["Triangulum", "Triangulum"], "TrA": ["Triangulum Australe", "Triangulum Australe"], "Tuc": ["Tucana", "Tucana"], "UMa": ["Ursa Major", "Đại Hùng"], "UMi": ["Ursa Minor", "Tiểu Hùng"], "Vel": ["Vela", "Vela"], "Vir": ["Virgo", "Xử Nữ"], "Vol": ["Volans", "Volans"], "Vul": ["Vulpecula", "Vulpecula"]};
  const D2R = Math.PI / 180;
  const fold = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  let bounds = null, byCode = null, ready = null;
  function precess(ra, dec) {                                         // IAU 1976, J2000 -> B1875
    const t = (2405889.258550475 - 2451545.0) / 36525;
    const zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t ** 3) / 3600 * D2R, z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t ** 3) / 3600 * D2R, th = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t ** 3) / 3600 * D2R;
    const a = ra * D2R, d = dec * D2R, A = Math.cos(d) * Math.sin(a + zeta), B = Math.cos(th) * Math.cos(d) * Math.cos(a + zeta) - Math.sin(th) * Math.sin(d), C = Math.sin(th) * Math.cos(d) * Math.cos(a + zeta) + Math.cos(th) * Math.sin(d);
    return [(((Math.atan2(A, B) + z) / D2R) % 360 + 360) % 360, Math.asin(Math.max(-1, Math.min(1, C))) / D2R];
  }
  function find(ra, dec) {
    const [r, d] = precess(ra, dec), h = r / 15;
    for (const b of bounds) if (d >= b[2] && h >= b[0] && h < b[1]) return b[3];
    return null;
  }
  const lang = () => { try { const l = localStorage.getItem('sky-lang'); if (l === 'vi' || l === 'en') return l; } catch { /* ignore */ } return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en'; };
  /* Loads once. Resolves to false if either file is missing, so callers can simply skip the feature. */
  function load(stars) {
    if (ready) return ready;
    ready = (async () => {
      try {
        const [tsv, data] = await Promise.all([fetch('constellation_bounds.tsv').then((r) => r.text()), stars ? Promise.resolve({ field: stars }) : fetch('sky/sky-data.json').then((r) => r.json())]);
        bounds = tsv.split('\n').filter((l) => l && !l.startsWith('#')).map((l) => { const p = l.split('\t'); return [+p[0], +p[1], +p[2], p[3].trim()]; });
        byCode = {};
        data.field.forEach((s, i) => {
          const code = find(s[0], s[1]); if (!code) return;
          (byCode[code] = byCode[code] || []).push({ i, ra: s[0], dec: s[1], mag: s[2], ly: s[4], pmra: s[5] || 0, pmdec: s[6] || 0, sp: s[7] || '', name: s[8] || '' });
        });
        for (const k in byCode) byCode[k].sort((a, b) => a.mag - b.mag);
        return true;
      } catch (e) { console.warn('[constellations]', e); return false; }
    })();
    return ready;
  }
  /* constellations whose name (Latin, Vietnamese) or 3-letter code matches the query, with their brightest stars */
  function search(q, max = 12) {
    q = fold(q.trim()); if (q.length < 2 || !byCode) return [];
    const out = [];
    for (const [code, [latin, viName]] of Object.entries(NAMES)) {
      const hit = fold(latin).includes(q) || fold(viName).includes(q) || (q.length === 3 && fold(code) === q);
      if (hit && byCode[code]) out.push({ code, name: lang() === 'vi' ? viName : latin, latin, count: byCode[code].length, stars: byCode[code].slice(0, max) });
    }
    return out.sort((a, b) => (fold(a.latin).startsWith(q) ? 0 : 1) - (fold(b.latin).startsWith(q) ? 0 : 1));
  }
  /* position of a star now: its J2000 position moved by its measured proper motion */
  function now(s, year = new Date().getUTCFullYear() + 0.87) {
    const dt = year - 2000, cd = Math.cos(s.dec * D2R) || 1;
    return { ra: s.ra + (s.pmra / 1000) * dt / 3600 / cd, dec: s.dec + (s.pmdec / 1000) * dt / 3600 };
  }
  window.SpaceConst = { NAMES, load, search, find, now };
})();
