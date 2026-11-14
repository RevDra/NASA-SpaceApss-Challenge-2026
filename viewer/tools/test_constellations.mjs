// Checks that real stars land in the right IAU constellation. Run: node tools/test_constellations.mjs
import fs from 'node:fs'; import vm from 'node:vm';
const root = new URL('..', import.meta.url).pathname;
const ctx = { window: {}, navigator: { language: 'en' }, localStorage: { getItem: () => null }, console, Math, Promise,
  fetch: async (p) => ({ text: async () => fs.readFileSync(root + p, 'utf8'), json: async () => JSON.parse(fs.readFileSync(root + p, 'utf8')) }) };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(root + 'sky/constellations.js', 'utf8'), ctx);
const C = ctx.window.SpaceConst; await C.load();
let bad = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) bad++; };
const near = (name) => C.search(name)[0];
ok(C.find(88.7929, 7.4071) === 'Ori', 'Betelgeuse is in Orion');
ok(C.find(101.287, -16.716) === 'CMa', 'Sirius is in Canis Major');
ok(C.find(37.954, 89.264) === 'UMi', 'Polaris is in Ursa Minor');
ok(C.find(279.2347, 38.7837) === 'Lyr', 'Vega is in Lyra');
ok(C.find(269.452, 4.693) === 'Oph', "Barnard's star is in Ophiuchus");
const o = near('orion'); ok(o && o.code === 'Ori' && o.stars[0].name === 'Betelgeuse' || o.stars[0].name === 'Rigel', 'search "orion" lists Orion, brightest star first: ' + o.stars.slice(0, 3).map((s) => s.name).join(', '));
ok(C.search('lạp hộ')[0]?.code === 'Ori' && C.search('lap ho')[0]?.code === 'Ori', 'Vietnamese name works with and without accents');
ok(C.search('cyg')[0]?.code === 'Cyg', 'IAU code works');
ok(C.search('zzz').length === 0, 'nonsense finds nothing');
process.exit(bad ? 1 : 0);
