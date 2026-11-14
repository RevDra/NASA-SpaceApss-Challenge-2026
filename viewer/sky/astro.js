/* Astronomy helpers for the welcome sky. Pure functions, no DOM, no Three.js: tested in Node (see tools/test_astro.mjs).
   Everything here is computed from a timestamp, so the sky is a function of time, not an animation loop. */

export const D2R = Math.PI / 180;
export const R2D = 180 / Math.PI;
export const wrap360 = (a) => ((a % 360) + 360) % 360;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

/* ---------------------------------------------------------------- time */
export const toJD = (ms) => ms / 86400000 + 2440587.5;
export const fromJD = (jd) => (jd - 2440587.5) * 86400000;

/** Greenwich mean sidereal time in degrees (IAU 1982 linear form; error well under a second of time this century). */
export function gmstDeg(jd) {
  const d = jd - 2451545.0;
  return wrap360(280.46061837 + 360.98564736629 * d);
}
export const lstDeg = (jd, lonDeg) => wrap360(gmstDeg(jd) + lonDeg);

/* ---------------------------------------------------------------- coordinates */
/** Equatorial -> scene axes: x toward RA 0, y toward the celestial pole, z toward RA 270. East is left when looking out. */
export const eqToVec = (ra, dec, r = 1) => [r * Math.cos(dec * D2R) * Math.cos(ra * D2R), r * Math.sin(dec * D2R), -r * Math.cos(dec * D2R) * Math.sin(ra * D2R)];
export function vecToEq(v) {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return { ra: wrap360(Math.atan2(-v[2], v[0]) * R2D), dec: Math.asin(clamp(v[1] / n, -1, 1)) * R2D };
}

/** Rotation taking a celestial vector (eqToVec axes) to the observer's local frame: x = east, y = up (zenith), z = south.
 *  Returns row-major [r00..r22]. Derived from sin(alt) = sinδ sinφ + cosδ cosφ cosH etc. with H = LST - RA. */
export function localMatrix(lst, lat) {
  const sL = Math.sin(lst * D2R), cL = Math.cos(lst * D2R), sP = Math.sin(lat * D2R), cP = Math.cos(lat * D2R);
  return [-sL, 0, -cL,
          cP * cL, sP, -cP * sL,
          sP * cL, -cP, -sP * sL];
}
export function applyRows(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
export function altAz(ra, dec, lst, lat) {
  const w = applyRows(localMatrix(lst, lat), eqToVec(ra, dec));
  return { alt: Math.asin(clamp(w[1], -1, 1)) * R2D, az: wrap360(Math.atan2(w[0], -w[2]) * R2D) };   // azimuth from north through east
}

/* ---------------------------------------------------------------- ephemeris (JPL Horizons tables) */
const cr = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

export class Table {
  constructor(t, jd0) { this.t = t; this.jd0 = jd0; this.step = t.step; this.n = t.n; this.name = t.name; this.facts = t.facts || null; }
  get jdStart() { return this.jd0; }
  get jdEnd() { return this.jd0 + (this.n - 1) * this.step; }
  inRange(jd) { return jd >= this.jdStart && jd <= this.jdEnd; }
  /** Position at a Julian date: Catmull-Rom through the table for RA/Dec, linear for the rest. */
  at(jd) {
    const x = clamp((jd - this.jd0) / this.step, 0, this.n - 1.000001), i = Math.floor(x), f = x - i;
    const g = (arr, k) => arr[clamp(k, 0, this.n - 1)];
    const ra = cr(g(this.t.ra, i - 1), g(this.t.ra, i), g(this.t.ra, i + 1), g(this.t.ra, i + 2), f);
    const dec = cr(g(this.t.dec, i - 1), g(this.t.dec, i), g(this.t.dec, i + 1), g(this.t.dec, i + 2), f);
    const lin = (arr) => { const a = arr[i], b = arr[i + 1]; return a == null || b == null ? null : a + (b - a) * f; };
    return { ra: wrap360(ra), dec: clamp(dec, -90, 90), mag: lin(this.t.mag), r: lin(this.t.r), delta: lin(this.t.delta) };
  }
}

export class Ephemeris {
  constructor(json) {
    this.meta = json.meta;
    this.bodies = Object.fromEntries(Object.entries(json.bodies).map(([k, t]) => [k, new Table(t, json.meta.jd0)]));
    this.comets = Object.fromEntries(Object.entries(json.comets).map(([k, t]) => [k, new Table(t, json.meta.jd0)]));
  }
  get jdStart() { return this.bodies.sun.jdStart; }
  get jdEnd() { return this.bodies.sun.jdEnd; }
}

/** Phase of the Moon from the Sun's and Moon's positions. fraction = lit share of the disc (0 new .. 1 full);
 *  limb = position angle of the bright limb, measured from celestial north toward east (radians). */
export function moonPhase(sun, moon) {
  const a0 = sun.ra * D2R, d0 = sun.dec * D2R, a = moon.ra * D2R, d = moon.dec * D2R, da = a0 - a;
  const cosElong = Math.sin(d0) * Math.sin(d) + Math.cos(d0) * Math.cos(d) * Math.cos(da);
  const elong = Math.acos(clamp(cosElong, -1, 1));
  const limb = Math.atan2(Math.cos(d0) * Math.sin(da), Math.sin(d0) * Math.cos(d) - Math.cos(d0) * Math.sin(d) * Math.cos(da));
  const fraction = (1 - cosElong) / 2;   // elongation 0 = new, 180 = full (phase angle is ~ 180 - elongation)
  const waxing = wrap360(moon.ra - sun.ra) < 180;   // Moon east of the Sun = evening sky = waxing
  return { fraction, elong: elong * R2D, limb, waxing };
}
export function moonPhaseName(fraction, waxing) {
  if (fraction < 0.03) return 'new';
  if (fraction > 0.97) return 'full';
  if (Math.abs(fraction - 0.5) < 0.06) return waxing ? 'first-quarter' : 'last-quarter';
  if (fraction < 0.5) return waxing ? 'waxing-crescent' : 'waning-crescent';
  return waxing ? 'waxing-gibbous' : 'waning-gibbous';
}

/** Angular diameter in degrees of a body of given physical diameter (km) at distance delta (AU). */
export const angularDiameterDeg = (km, deltaAU) => 2 * Math.atan(km / 2 / (deltaAU * 149597870.7)) * R2D;
export const BODY_KM = { sun: 1392700, moon: 3474.8, mercury: 4879, venus: 12104, mars: 6779, jupiter: 139820, saturn: 116460, uranus: 50724, neptune: 49244 };

/* ---------------------------------------------------------------- star colour from data */
/** Effective temperature from B-V (Ballesteros 2012). */
export const bvToKelvin = (bv) => 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
/** Blackbody colour, sRGB 0..1 (Tanner Helland's fit to CIE data; good from ~1000 K to 40 000 K). */
export function kelvinToRGB(K) {
  const t = clamp(K, 1000, 40000) / 100; let r, g, b;
  r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [clamp(r, 0, 255) / 255, clamp(g, 0, 255) / 255, clamp(b, 0, 255) / 255];
}
export const starRGB = (bv) => kelvinToRGB(bvToKelvin(clamp(bv, -0.4, 2.2)));
/** Absolute magnitude from apparent magnitude and distance in light-years; null if distance unknown. */
export const absMag = (v, ly) => (ly > 0 ? v - 5 * Math.log10(ly / 3.26156 / 10) : null);
/** Solar luminosities from absolute magnitude (Sun: M_V = 4.83). */
export const lumSolar = (M) => Math.pow(10, (4.83 - M) / 2.5);

/* ---------------------------------------------------------------- meteor showers */
/* Radiant (RA/Dec, degrees), peak date, ZHR at maximum (ideal sky) and speed from the IMO working list of meteor showers,
   rounded. `sigma` is the half-width of the activity profile in days (approximate). Parent bodies as named by the IMO. */
export const SHOWERS = [
  { id: 'QUA', name: 'Quadrantids', m: 1, d: 4, ra: 230, dec: 49, zhr: 80, km: 41, parent: '2003 EH1', sigma: 1.2 },
  { id: 'LYR', name: 'Lyrids', m: 4, d: 22, ra: 271, dec: 34, zhr: 18, km: 49, parent: 'C/1861 G1 (Thatcher)', sigma: 2.5 },
  { id: 'ETA', name: 'Eta Aquariids', m: 5, d: 6, ra: 338, dec: -1, zhr: 50, km: 66, parent: '1P/Halley', sigma: 4 },
  { id: 'SDA', name: 'Southern Delta Aquariids', m: 7, d: 30, ra: 340, dec: -16, zhr: 25, km: 41, parent: '96P/Machholz', sigma: 8 },
  { id: 'PER', name: 'Perseids', m: 8, d: 12, ra: 48, dec: 58, zhr: 100, km: 59, parent: '109P/Swift-Tuttle', sigma: 4 },
  { id: 'ORI', name: 'Orionids', m: 10, d: 21, ra: 95, dec: 16, zhr: 20, km: 66, parent: '1P/Halley', sigma: 4 },
  { id: 'STA', name: 'Southern Taurids', m: 11, d: 5, ra: 52, dec: 14, zhr: 5, km: 27, parent: '2P/Encke', sigma: 12 },
  { id: 'LEO', name: 'Leonids', m: 11, d: 17, ra: 152, dec: 22, zhr: 15, km: 71, parent: '55P/Tempel-Tuttle', sigma: 2 },
  { id: 'GEM', name: 'Geminids', m: 12, d: 14, ra: 112, dec: 33, zhr: 150, km: 35, parent: '3200 Phaethon', sigma: 2.5 },
  { id: 'URS', name: 'Ursids', m: 12, d: 22, ra: 217, dec: 76, zhr: 10, km: 33, parent: '8P/Tuttle', sigma: 1.5 },
];
/** Showers at a given date with their expected rate: zhrNow = ZHR x activity profile. Only those above 3 % of peak. */
export function activeShowers(ms) {
  const d = new Date(ms), y = d.getUTCFullYear(), out = [];
  for (const s of SHOWERS) {
    let best = Infinity;
    for (const yy of [y - 1, y, y + 1]) best = Math.min(best, Math.abs((ms - Date.UTC(yy, s.m - 1, s.d, 12)) / 86400000) );
    const act = Math.exp(-0.5 * (best / s.sigma) ** 2);
    if (act >= 0.03) out.push({ ...s, activity: act, zhrNow: s.zhr * act, daysFromPeak: best });
  }
  return out.sort((a, b) => b.zhrNow - a.zhrNow);
}
/** Signed days from the nearest peak (negative before it). */
export function daysToPeak(s, ms) {
  const y = new Date(ms).getUTCFullYear(); let best = null;
  for (const yy of [y - 1, y, y + 1]) { const dd = (ms - Date.UTC(yy, s.m - 1, s.d, 12)) / 86400000; if (best === null || Math.abs(dd) < Math.abs(best)) best = dd; }
  return best;
}
