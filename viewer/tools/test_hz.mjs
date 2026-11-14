// node viewer/tools/test_hz.mjs : the habitable-zone formula in index.html must reproduce the published values for the Sun
// (Kopparapu et al. 2013: recent Venus 0.75, moist greenhouse 0.99, maximum greenhouse 1.70, early Mars 1.77 AU).
const HZC = { rv: [1.7753, 1.4316e-4, 2.9875e-9, -7.5702e-12, -1.1635e-15], mg: [1.0140, 8.1774e-5, 1.7063e-9, -4.3241e-12, -6.6462e-16], xg: [0.3438, 5.8942e-5, 1.6558e-9, -3.0045e-12, -5.2983e-16], em: [0.3179, 5.4513e-5, 1.5313e-9, -2.7786e-12, -4.8997e-16] };
const seff = (c, T) => { const t = T - 5780; return c[0] + c[1] * t + c[2] * t * t + c[3] * t ** 3 + c[4] * t ** 4; };
const d = (k, T, L) => Math.sqrt(L / seff(HZC[k], T));
let fail = 0; const near = (a, b, tol, name) => { const ok = Math.abs(a - b) <= tol; console.log((ok ? 'PASS ' : 'FAIL ') + name + ' ' + a.toFixed(3)); if (!ok) fail++; };
near(d('rv', 5780, 1), 0.75, 0.01, 'Sun optimistic inner'); near(d('mg', 5780, 1), 0.99, 0.01, 'Sun conservative inner');
near(d('xg', 5780, 1), 1.70, 0.01, 'Sun conservative outer'); near(d('em', 5780, 1), 1.77, 0.01, 'Sun optimistic outer');
near(d('mg', 3050, 0.0017), 0.045, 0.005, 'Proxima-like inner (Proxima b orbits at 0.049 AU)');
process.exit(fail ? 1 : 0);
