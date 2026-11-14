// node viewer/tools/test_astro.mjs : checks astro.js against values from JPL Horizons and textbook identities
import { readFileSync } from 'node:fs';
import * as A from '../sky/astro.js';
const eph = new A.Ephemeris(JSON.parse(readFileSync(new URL('../sky/ephemeris.json', import.meta.url))));
let fail = 0;
const ok = (name, cond, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); if (!cond) fail++; };
const close = (a, b, tol) => Math.abs(a - b) <= tol;

// GMST at J2000.0 (2000-01-01 12:00 UT) is 280.46061837 deg
ok('GMST at J2000', close(A.gmstDeg(2451545.0), 280.4606, 1e-3));
// Mars on 2026-11-14 00:00 UT per Horizons: RA 147.43879, Dec 15.13533
const jd = A.toJD(Date.UTC(2026, 10, 14));
const m = eph.bodies.mars.at(jd);
ok('Mars RA/Dec matches Horizons row', close(m.ra, 147.43879, 1e-3) && close(m.dec, 15.13533, 1e-3), `${m.ra.toFixed(5)} ${m.dec.toFixed(5)}`);
// halfway through that day the position should lie between the two table rows
const m12 = eph.bodies.mars.at(jd + 0.5);
ok('Mars interpolates between rows', m12.ra > 147.43879 && m12.ra < 147.88854);
// 3I/ATLAS row from the same query: RA 106.08451 Dec 19.30084 r 13.3176
const c = eph.comets.c2025n1.at(jd);
ok('3I/ATLAS matches Horizons row', close(c.ra, 106.08451, 1e-3) && close(c.r, 13.3176, 1e-3));
// Local frame: rotation matrix is orthonormal and a pole star sits at altitude = latitude
const M = A.localMatrix(123.4, 21.03);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
ok('local matrix orthonormal', close(dot(M.slice(0, 3), M.slice(3, 6)), 0, 1e-12) && close(dot(M.slice(3, 6), M.slice(3, 6)), 1, 1e-12));
ok('celestial pole altitude = latitude', close(A.altAz(0, 90, 77, 21.03).alt, 21.03, 1e-9));
ok('object on meridian south of zenith: az 180', close(A.altAz(50, 0, 50, 21.03).az, 180, 1e-6) && close(A.altAz(50, 0, 50, 21.03).alt, 90 - 21.03, 1e-6));
// East is where stars rise: RA > LST by 90 deg-ish is rising (hour angle -90)
ok('rising object is in the east', A.altAz(100, 0, 10, 0).az > 45 && A.altAz(100, 0, 10, 0).az < 135);
// Moon phase: new moon has Moon at the Sun's position, full has it opposite
const ph = A.moonPhase({ ra: 100, dec: 20 }, { ra: 100.5, dec: 20 });
ok('new moon fraction ~ 0', ph.fraction < 0.001);
ok('full moon fraction ~ 1', A.moonPhase({ ra: 100, dec: 20 }, { ra: 280, dec: -20 }).fraction > 0.999);
// real data check: the Moon is near full on 2025-12-04 (full moon 23:14 UT) and new on 2025-11-20 (06:47 UT)
const at = (y, mo, d, h) => { const j = A.toJD(Date.UTC(y, mo - 1, d, h)); return A.moonPhase(eph.bodies.sun.at(j), eph.bodies.moon.at(j)); };
ok('full moon 2025-12-04 23h UT', at(2025, 12, 4, 23).fraction > 0.995, at(2025, 12, 4, 23).fraction.toFixed(4));
ok('new moon 2025-11-20 07h UT', at(2025, 11, 20, 7).fraction < 0.005, at(2025, 11, 20, 7).fraction.toFixed(4));
ok('waxing a week after new moon', at(2025, 11, 27, 0).waxing === true && at(2025, 12, 12, 0).waxing === false);
// Colours from B-V: Sun (0.65) ~ 5700 K, Rigel (-0.03) blue-white, Betelgeuse (1.85) orange-red
const T = A.bvToKelvin(0.65); ok('Sun B-V -> ~5700 K', T > 5400 && T < 6000, T.toFixed(0));
const rig = A.starRGB(-0.03), bet = A.starRGB(1.85);
ok('Rigel bluer than Betelgeuse', rig[2] > bet[2] && bet[0] > bet[2]);
// Meteor showers
const leo = A.activeShowers(Date.UTC(2026, 10, 14)).map((s) => s.id);
ok('Leonids active on 14 Nov', leo.includes('LEO'), leo.join(','));
ok('Geminids not active in July', !A.activeShowers(Date.UTC(2026, 6, 1)).some((s) => s.id === 'GEM'));
console.log(fail ? `\n${fail} FAILED` : '\nall passed'); process.exit(fail ? 1 : 0);
