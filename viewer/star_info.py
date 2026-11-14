"""
Star identity cards for the viewer (standard library only).

Entry point, served by serve.py as /api/star (the field's Gaia sources come from gaia_live.py):

  star_details(source_id)    Everything the hover card shows for one Gaia DR3 source, merged from
                             - ESA Gaia DR3 archive: astrometry, photometry, astrophysical parameters
                               (FLAME radius / mass / luminosity / age / evolutionary stage, GSP-Phot
                               temperature, GSP-Spec element abundances) and variability class
                             - SIMBAD (CDS, with the Harvard mirror as fallback): common name, object
                               type, spectral type, all identifiers, earliest publications
                             - NASA Exoplanet Archive: confirmed planets of the star
                             - IAU constellation boundaries (Roman 1987, shipped as constellation_bounds.tsv)

Each source is optional: if one archive is down, the card still shows what the others returned.
"""
from __future__ import annotations

import csv
import io
import json
import math
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

GAIA_TAP = "https://gea.esac.esa.int/tap-server/tap/sync"
SIMBAD_TAPS = [
    "https://simbad.cds.unistra.fr/simbad/sim-tap/sync",
    "https://simbad.harvard.edu/simbad/sim-tap/sync",
]
EXOPLANET_TAP = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
USER_AGENT = "spherex-planet-x-viewer/1.0 (python urllib)"
ROOT = Path(__file__).resolve().parent
D2R = math.pi / 180.0

_lock = threading.Lock()
_memory: dict[str, dict] = {}


class StarError(Exception):
    """A problem worth showing to the user."""


# --------------------------------------------------------------------------- TAP helper
def tap(url: str, query: str, timeout: float = 60, attempts: int = 3) -> list[dict]:
    """Run a synchronous ADQL query and return rows as dicts (CSV output)."""
    body = urllib.parse.urlencode({"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv", "QUERY": query}).encode()
    last: Exception | None = None
    for i in range(attempts):
        req = urllib.request.Request(url, data=body, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                text = r.read().decode("utf-8", "replace")
            if text.lstrip().startswith("<"):
                m = re.search(r'QUERY_STATUS" value="ERROR">(.*?)</INFO>', text, re.S)
                raise StarError((m.group(1).strip() if m else "service returned HTML instead of data")[:300])
            return list(csv.DictReader(io.StringIO(text)))
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code not in (429, 500, 502, 503, 504):
                break
        except (urllib.error.URLError, TimeoutError) as exc:
            last = exc
        time.sleep(1.2 * (i + 1))
    raise StarError(f"{urllib.parse.urlsplit(url).netloc}: {last}")


def _num(v):
    if v is None or v == "":
        return None
    try:
        x = float(v)
    except ValueError:
        return v
    return None if math.isnan(x) else x


def _clean(row: dict) -> dict:
    # Gaia source ids are 64-bit integers: keep them as strings (a float would lose the last digits).
    return {k: (v if k in ("source_id", "designation", "main_id", "bibcode") else _num(v)) for k, v in row.items()}


# --------------------------------------------------------------------------- Gaia
GAIA_DETAIL_COLUMNS = """
    g.source_id, g.designation, g.ra, g.dec, g.parallax, g.parallax_error, g.pmra, g.pmdec,
    g.radial_velocity, g.phot_g_mean_mag, g.phot_bp_mean_mag, g.phot_rp_mean_mag, g.bp_rp,
    g.phot_variable_flag, g.non_single_star, g.ruwe,
    ap.teff_gspphot, ap.logg_gspphot, ap.mh_gspphot, ap.distance_gspphot, ap.radius_gspphot,
    ap.radius_flame, ap.mass_flame, ap.lum_flame, ap.age_flame, ap.evolstage_flame,
    ap.spectraltype_esphs, ap.teff_esphs,
    ap.teff_gspspec, ap.mh_gspspec, ap.alphafe_gspspec, ap.fem_gspspec, ap.feiim_gspspec,
    ap.mgfe_gspspec, ap.sife_gspspec, ap.sfe_gspspec, ap.cafe_gspspec, ap.tife_gspspec,
    ap.crfe_gspspec, ap.nife_gspspec, ap.nfe_gspspec, ap.zrfe_gspspec, ap.cefe_gspspec, ap.ndfe_gspspec,
    v.best_class_name, v.best_class_score"""


def gaia_source(source_id: str) -> dict:
    rows = tap(GAIA_TAP, f"""
        SELECT {GAIA_DETAIL_COLUMNS}
        FROM gaiadr3.gaia_source AS g
        LEFT JOIN gaiadr3.astrophysical_parameters AS ap ON ap.source_id = g.source_id
        LEFT JOIN gaiadr3.vari_classifier_result AS v ON v.source_id = g.source_id
        WHERE g.source_id = {int(source_id)}""")
    if not rows:
        raise StarError(f"Gaia DR3 {source_id} not found")
    return _clean(rows[0])


# --------------------------------------------------------------------------- SIMBAD
_simbad_url = [SIMBAD_TAPS[0]]


def simbad_tap(query: str) -> list[dict]:
    """Try the preferred SIMBAD mirror first, then the others; remember whichever answered."""
    order = [_simbad_url[0]] + [u for u in SIMBAD_TAPS if u != _simbad_url[0]]
    last = None
    for url in order:
        try:
            rows = tap(url, query, timeout=30, attempts=1)
            _simbad_url[0] = url
            return rows
        except StarError as exc:
            last = exc
    raise StarError(f"SIMBAD unavailable ({last})")


def simbad_info(source_id: str, ra: float, dec: float) -> dict | None:
    cols = "b.oid, b.main_id, b.otype, d.description AS otype_desc, b.sp_type, b.nbref, b.ra, b.dec"
    rows = simbad_tap(f"""
        SELECT {cols} FROM basic AS b JOIN ident AS i ON i.oidref = b.oid
        LEFT JOIN otypedef AS d ON d.otype = b.otype
        WHERE i.id = 'Gaia DR3 {int(source_id)}'""")
    if not rows:                                     # not cross-matched by Gaia id: nearest object within 3"
        rows = simbad_tap(f"""
            SELECT TOP 1 {cols}, DISTANCE(POINT('ICRS', b.ra, b.dec), POINT('ICRS', {ra}, {dec})) AS sep
            FROM basic AS b LEFT JOIN otypedef AS d ON d.otype = b.otype
            WHERE 1 = CONTAINS(POINT('ICRS', b.ra, b.dec), CIRCLE('ICRS', {ra}, {dec}, {3 / 3600}))
            ORDER BY sep""")
    if not rows:
        return None
    b = _clean(rows[0])
    oid = int(b["oid"])
    ids = [r["id"] for r in simbad_tap(f"SELECT id FROM ident WHERE oidref = {oid}")]
    refs = simbad_tap(f"""
        SELECT TOP 3 r."year" AS yr, r.bibcode, r.title FROM has_ref AS h JOIN ref AS r ON r.oidbib = h.oidbibref
        WHERE h.oidref = {oid} ORDER BY yr ASC""")
    return {
        "main_id": b["main_id"], "otype": b["otype"], "otype_desc": b.get("otype_desc"),
        "sp_type": b["sp_type"], "nbref": b["nbref"], "identifiers": ids,
        "earliest_refs": [{"year": int(_num(r["yr"]) or 0), "bibcode": r["bibcode"], "title": r["title"]} for r in refs],
        "url": f"https://simbad.harvard.edu/simbad/sim-id?Ident={urllib.parse.quote(str(b['main_id']))}",
    }


# --------------------------------------------------------------------------- Exoplanets
def exoplanets(source_id: str) -> list[dict]:
    q = (f"select pl_name, disc_year, discoverymethod, disc_facility, pl_orbper, pl_orbsmax, pl_rade, pl_bmasse "
         f"from pscomppars where gaia_dr3_id = 'Gaia DR3 {int(source_id)}' order by pl_orbper")
    url = EXOPLANET_TAP + "?" + urllib.parse.urlencode({"query": q, "format": "csv"})
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=40) as r:
        text = r.read().decode("utf-8", "replace")
    if text.lstrip().startswith("<"):
        raise StarError("NASA Exoplanet Archive query failed")
    return [_clean(r) for r in csv.DictReader(io.StringIO(text))]


# --------------------------------------------------------------------------- Constellation
CONSTELLATIONS = {
    "And": "Andromeda", "Ant": "Antlia", "Aps": "Apus", "Aqr": "Aquarius", "Aql": "Aquila", "Ara": "Ara",
    "Ari": "Aries", "Aur": "Auriga", "Boo": "Boötes", "Cae": "Caelum", "Cam": "Camelopardalis", "Cnc": "Cancer",
    "CVn": "Canes Venatici", "CMa": "Canis Major", "CMi": "Canis Minor", "Cap": "Capricornus", "Car": "Carina",
    "Cas": "Cassiopeia", "Cen": "Centaurus", "Cep": "Cepheus", "Cet": "Cetus", "Cha": "Chamaeleon",
    "Cir": "Circinus", "Col": "Columba", "Com": "Coma Berenices", "CrA": "Corona Australis",
    "CrB": "Corona Borealis", "Crv": "Corvus", "Crt": "Crater", "Cru": "Crux", "Cyg": "Cygnus",
    "Del": "Delphinus", "Dor": "Dorado", "Dra": "Draco", "Equ": "Equuleus", "Eri": "Eridanus", "For": "Fornax",
    "Gem": "Gemini", "Gru": "Grus", "Her": "Hercules", "Hor": "Horologium", "Hya": "Hydra", "Hyi": "Hydrus",
    "Ind": "Indus", "Lac": "Lacerta", "Leo": "Leo", "LMi": "Leo Minor", "Lep": "Lepus", "Lib": "Libra",
    "Lup": "Lupus", "Lyn": "Lynx", "Lyr": "Lyra", "Men": "Mensa", "Mic": "Microscopium", "Mon": "Monoceros",
    "Mus": "Musca", "Nor": "Norma", "Oct": "Octans", "Oph": "Ophiuchus", "Ori": "Orion", "Pav": "Pavo",
    "Peg": "Pegasus", "Per": "Perseus", "Phe": "Phoenix", "Pic": "Pictor", "Psc": "Pisces",
    "PsA": "Piscis Austrinus", "Pup": "Puppis", "Pyx": "Pyxis", "Ret": "Reticulum", "Sge": "Sagitta",
    "Sgr": "Sagittarius", "Sco": "Scorpius", "Scl": "Sculptor", "Sct": "Scutum", "Ser": "Serpens",
    "Sex": "Sextans", "Tau": "Taurus", "Tel": "Telescopium", "Tri": "Triangulum", "TrA": "Triangulum Australe",
    "Tuc": "Tucana", "UMa": "Ursa Major", "UMi": "Ursa Minor", "Vel": "Vela", "Vir": "Virgo", "Vol": "Volans",
    "Vul": "Vulpecula",
}
_bounds: list[tuple[float, float, float, str]] = []


def _precess_j2000_to_b1875(ra: float, dec: float) -> tuple[float, float]:
    """IAU 1976 (Lieske) precession from J2000.0 to B1875.0; plenty for constellation boundaries."""
    t = (2405889.258550475 - 2451545.0) / 36525.0
    zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t ** 3) / 3600 * D2R
    z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t ** 3) / 3600 * D2R
    theta = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t ** 3) / 3600 * D2R
    a, d = ra * D2R, dec * D2R
    A = math.cos(d) * math.sin(a + zeta)
    B = math.cos(theta) * math.cos(d) * math.cos(a + zeta) - math.sin(theta) * math.sin(d)
    C = math.sin(theta) * math.cos(d) * math.cos(a + zeta) + math.cos(theta) * math.sin(d)
    return (math.atan2(A, B) + z) / D2R % 360.0, math.asin(max(-1.0, min(1.0, C))) / D2R


def constellation(ra: float, dec: float) -> dict | None:
    if not _bounds:
        path = ROOT / "constellation_bounds.tsv"
        if not path.exists():
            return None
        for line in path.read_text("utf-8").splitlines():
            if line.startswith("#") or not line.strip():
                continue
            lo, hi, de, abbr = line.split("\t")
            _bounds.append((float(lo), float(hi), float(de), abbr.strip()))
    ra75, dec75 = _precess_j2000_to_b1875(ra, dec)
    rah = ra75 / 15.0
    for lo, hi, de, abbr in _bounds:
        if dec75 >= de and lo <= rah < hi:
            return {"abbr": abbr, "name": CONSTELLATIONS.get(abbr, abbr)}
    return None


# --------------------------------------------------------------------------- derived values
# Catalogue prefix -> (catalogue, year it was published). Used to build an observation-history timeline.
CATALOGS = [
    ("BD", "Bonner Durchmusterung", 1859), ("CD", "Cordoba Durchmusterung", 1892),
    ("CPD", "Cape Photographic Durchmusterung", 1896), ("HR", "Harvard Revised Photometry", 1908),
    ("HD", "Henry Draper Catalogue", 1918), ("GCRV", "General Catalogue of Radial Velocities", 1953),
    ("LTT", "Luyten Two-Tenths catalogue", 1957), ("GJ", "Gliese Catalogue of Nearby Stars", 1969),
    ("Gl", "Gliese Catalogue of Nearby Stars", 1969), ("SAO", "Smithsonian Astrophysical Observatory Catalog", 1966),
    ("G", "Giclas proper-motion survey", 1971), ("LHS", "Luyten Half-Second catalogue", 1979),
    ("NLTT", "New Luyten Two-Tenths catalogue", 1979), ("IRAS", "IRAS infrared survey", 1983),
    ("V*", "General Catalogue of Variable Stars", 1948), ("NSV", "New Suspected Variables catalogue", 1982),
    ("HIP", "Hipparcos", 1997), ("TYC", "Tycho-2", 2000), ("2MASS", "2MASS near-infrared survey", 2003),
    ("LSPM", "LSPM-North proper-motion catalogue", 2005), ("WISE", "WISE all-sky survey", 2012),
    ("AllWISE", "AllWISE", 2013), ("Gaia DR1", "Gaia DR1", 2016), ("Gaia DR2", "Gaia DR2", 2018),
    ("TIC", "TESS Input Catalog", 2018), ("Gaia DR3", "Gaia DR3", 2022),
]


def catalog_timeline(identifiers: list[str]) -> list[dict]:
    seen, out = set(), []
    for ident in identifiers:
        s = ident.strip()
        for prefix, name, year in CATALOGS:
            if (s == prefix or s.startswith(prefix + " ") or s.startswith(prefix + "+") or s.startswith(prefix + "-")
                    or (prefix in ("2MASS", "WISE", "AllWISE", "LSPM") and s.startswith(prefix + " J"))) and name not in seen:
                seen.add(name)
                out.append({"year": year, "catalog": name, "id": s})
                break
    return sorted(out, key=lambda e: e["year"])


def evolution_stage(code) -> str | None:
    if code is None:
        return None
    c = float(code)
    if c < 360:
        return f"Main sequence ({max(0, min(100, round((c - 100) / 2.59)))}% through hydrogen burning)"
    if c < 420:
        return "Subgiant (core hydrogen exhausted)"
    if c <= 490:
        return "Red giant branch"
    return "Post-red-giant stage"


ELEMENT_COLUMNS = [  # (symbol, name, Gaia column with [X/Fe])
    ("Mg", "Magnesium", "mgfe_gspspec"), ("Si", "Silicon", "sife_gspspec"), ("S", "Sulfur", "sfe_gspspec"),
    ("Ca", "Calcium", "cafe_gspspec"), ("Ti", "Titanium", "tife_gspspec"), ("Cr", "Chromium", "crfe_gspspec"),
    ("Ni", "Nickel", "nife_gspspec"), ("N", "Nitrogen", "nfe_gspspec"), ("Zr", "Zirconium", "zrfe_gspspec"),
    ("Ce", "Cerium", "cefe_gspspec"), ("Nd", "Neodymium", "ndfe_gspspec"),
]


def abundances(g: dict) -> dict:
    """GSP-Spec abundances relative to the Sun: [M/H], [Fe/H] and [X/H] (dex)."""
    mh, fem = g.get("mh_gspspec"), g.get("fem_gspspec")
    # GSP-Spec is not calibrated for cool M dwarfs and pins failed fits to the grid edge (-3 dex): drop those.
    t_spec = g.get("teff_gspspec")
    if not (isinstance(t_spec, float) and t_spec >= 3800 and isinstance(mh, float) and mh > -2.9):
        mh = fem = None
    feh = mh + fem if isinstance(mh, float) and isinstance(fem, float) else None
    mh_phot = g.get("mh_gspphot")
    if not (isinstance(mh_phot, float) and mh_phot > -3.9):
        mh_phot = None
    out = {"metallicity": mh if isinstance(mh, float) else mh_phot,
           "metallicity_source": "GSP-Spec" if isinstance(mh, float) else ("GSP-Phot, low precision" if mh_phot is not None else None),
           "elements": []}
    if feh is not None:
        out["elements"].append({"symbol": "Fe", "name": "Iron", "x_h": round(feh, 2)})
        for sym, name, col in ELEMENT_COLUMNS:
            v = g.get(col)
            if isinstance(v, float):
                out["elements"].append({"symbol": sym, "name": name, "x_h": round(v + feh, 2)})
    return out


def derive(g: dict) -> dict:
    plx, plx_err = g.get("parallax"), g.get("parallax_error")
    dist_pc, dist_src = None, None
    if isinstance(plx, float) and plx > 0 and (not plx_err or plx / plx_err > 5):
        dist_pc, dist_src = 1000.0 / plx, "Gaia parallax"
    elif isinstance(g.get("distance_gspphot"), float):
        dist_pc, dist_src = g["distance_gspphot"], "Gaia GSP-Phot"
    G = g.get("phot_g_mean_mag")
    abs_g = G - 5 * math.log10(dist_pc) + 5 if isinstance(G, float) and dist_pc else None
    radius = g.get("radius_flame") or g.get("radius_gspphot")
    return {
        "distance_pc": dist_pc, "distance_ly": dist_pc * 3.26156 if dist_pc else None, "distance_source": dist_src,
        "abs_g": abs_g, "radius_rsun": radius,
        "radius_source": "FLAME" if g.get("radius_flame") else ("GSP-Phot" if radius else None),
        "diameter_km": 2 * radius * 695700 if radius else None,
        "mass_msun": g.get("mass_flame"), "lum_lsun": g.get("lum_flame"),
        "age_gyr": g.get("age_flame"), "stage": evolution_stage(g.get("evolstage_flame")),
        "teff": g.get("teff_gspphot") or g.get("teff_gspspec") or g.get("teff_esphs"),
    }


def phenomena(g: dict, simbad: dict | None) -> list[str]:
    out = []
    if simbad and simbad.get("otype_desc"):
        out.append(f"SIMBAD class: {simbad['otype_desc']} ({simbad['otype']})")
    if g.get("phot_variable_flag") == "VARIABLE":
        cls = g.get("best_class_name")
        out.append(f"Gaia variable star{f', classified {cls}' if cls else ''}")
    if (g.get("non_single_star") or 0) > 0:
        out.append("Gaia detects it as a binary or multiple system")
    elif isinstance(g.get("ruwe"), float) and g["ruwe"] > 1.4:
        out.append(f"Astrometric wobble (RUWE {g['ruwe']:.2f}): possible unseen companion")
    if simbad and any(i.startswith("V* ") for i in simbad.get("identifiers", [])):
        out.append("Has a variable-star designation (GCVS)")
    if simbad and any(i.startswith(("IRAS", "WISE", "AllWISE")) for i in simbad.get("identifiers", [])):
        out.append("Detected in infrared all-sky surveys")
    return out


def _name(simbad: dict | None, designation: str) -> str:
    if simbad:
        names = [i[5:].strip() for i in simbad["identifiers"] if i.startswith("NAME ")]
        if names:
            return names[0]
        return str(simbad["main_id"]).replace("NAME ", "").strip()
    return designation


def image_urls(ra: float, dec: float) -> list[dict]:
    base = "https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl"
    out = []
    for survey, label in (("DSS1 Red", "POSS-I photographic plate (1950s)"), ("DSS2 Red", "POSS-II plate (1980s–90s)"),
                          ("2MASS-K", "2MASS K band (1997–2001)")):
        q = urllib.parse.urlencode({"Survey": survey, "position": f"{ra:.6f},{dec:.6f}", "Size": "0.04",
                                    "Pixels": "220", "Return": "JPEG"})
        out.append({"survey": survey, "label": label, "url": f"{base}?{q}"})
    return out


# --------------------------------------------------------------------------- name resolver
def _fold(text: str) -> str:
    """Lower-case and strip accents, so 'Thiên Lang' and 'thien lang' meet."""
    import unicodedata
    t = unicodedata.normalize("NFD", text.replace("\u0111", "d").replace("\u0110", "D"))
    return "".join(c for c in t if unicodedata.category(c) != "Mn").lower().strip()


# Nicknames SIMBAD does not know (Vietnamese star names follow the traditional Chinese-Vietnamese names).
ALIASES = {
    "tabby's star": "KIC 8462852", "boyajian's star": "KIC 8462852", "tabbys star": "KIC 8462852",
    "sao bac cuc": "Polaris", "bac cuc": "Polaris", "thien lang": "Sirius", "sao thien lang": "Sirius",
    "chuc nu": "Vega", "sao chuc nu": "Vega", "nguu lang": "Altair", "sao nguu lang": "Altair",
    "sao barnard": "Barnard's star", "barnard": "Barnard's star", "proxima": "Proxima Centauri",
}


def resolve_name(name: str) -> dict | None:
    """Turn what a person types ("Barnard's star", "HD 10700", "M31", "eps Ind") into coordinates, using SIMBAD.

    The catalogue position is for epoch J2000. For fast movers that is minutes of arc away from where the star is
    now, so the answer also carries the position moved to the current epoch with SIMBAD's proper motion."""
    import re
    n = " ".join(str(name).strip().split())[:80]
    if not n:
        return None
    n = ALIASES.get(_fold(n), n)
    forms = {n, "NAME " + n, "* " + n, "V* " + n, "** " + n}
    m = re.match(r"^(M|NGC|IC|HD|HIP|HR|GJ|TYC|LHS|LTT|WISE|2MASS|PSR)\s*([0-9J].*)$", n, re.I)
    if m:
        forms.add(f"{m.group(1).upper()} {m.group(2)}")
    ids = ", ".join("'" + f.replace("'", "''") + "'" for f in forms)
    rows = simbad_tap(f"""
        SELECT TOP 1 b.main_id, b.ra, b.dec, b.pmra, b.pmdec, b.plx_value, b.sp_type, b.otype
        FROM ident i JOIN basic b ON b.oid = i.oidref WHERE i.id IN ({ids})""")
    if not rows:   # short survey names such as "WISE 0855-0714": match the full J-designation by its first digits
        m = re.match(r"^(WISE|2MASS)\s*J?\s*(\d{4})\s*([+\u2212-])\s*(\d{4})$", n, re.I)
        if m:
            sign = "-" if m.group(3) in "-\u2212" else "+"
            rows = simbad_tap(f"""
                SELECT TOP 1 b.main_id, b.ra, b.dec, b.pmra, b.pmdec, b.plx_value, b.sp_type, b.otype
                FROM ident i JOIN basic b ON b.oid = i.oidref
                WHERE i.id LIKE '{m.group(1).upper()} J{m.group(2)}%{sign}{m.group(4)}%'""")
    if not rows:
        return None
    r = rows[0]
    ra0, dec0 = float(r["ra"]), float(r["dec"])
    pmra = float(r["pmra"]) if r.get("pmra") not in (None, "") else 0.0
    pmdec = float(r["pmdec"]) if r.get("pmdec") not in (None, "") else 0.0
    years = (time.time() - 946728000.0) / (365.25 * 86400.0)          # J2000.0 to now
    cosd = max(math.cos(math.radians(dec0)), 1e-6)
    ra = (ra0 + pmra * years / 3.6e6 / cosd) % 360.0
    dec = max(-90.0, min(90.0, dec0 + pmdec * years / 3.6e6))
    main = re.sub(r"^(NAME |V\* |\*\* |\* )", "", str(r["main_id"]).strip())
    return {"query": n, "name": " ".join(main.split()), "ra": round(ra, 6), "dec": round(dec, 6), "ra2000": round(ra0, 6), "dec2000": round(dec0, 6),
            "pm_mas_yr": round(math.hypot(pmra, pmdec), 1), "sp_type": (r.get("sp_type") or "").strip() or None, "otype": (r.get("otype") or "").strip() or None,
            "epoch": round(2000.0 + years, 2)}


# --------------------------------------------------------------------------- public entry
def star_details(source_id: str) -> dict:
    source_id = str(int(source_id))
    key = f"star:{source_id}"
    with _lock:
        if key in _memory:
            return _memory[key]
    cache = ROOT / "spherex_cache" / f"star_{source_id}.json"
    if cache.exists():
        data = json.loads(cache.read_text("utf-8"))
        with _lock:
            _memory[key] = data
        return data

    g = gaia_source(source_id)            # required: everything else hangs off the Gaia record
    errors = {}
    with ThreadPoolExecutor(max_workers=3) as pool:
        f_sim = pool.submit(simbad_info, source_id, g["ra"], g["dec"])
        f_exo = pool.submit(exoplanets, source_id)
        simbad = planets = None
        try:
            simbad = f_sim.result()
        except Exception as exc:
            errors["simbad"] = str(exc)
        try:
            planets = f_exo.result()
        except Exception as exc:
            errors["exoplanets"] = str(exc)

    derived = derive(g)
    data = {
        "source_id": source_id,
        "designation": g.get("designation") or f"Gaia DR3 {source_id}",
        "name": _name(simbad, g.get("designation") or f"Gaia DR3 {source_id}"),
        "gaia": g, "derived": derived, "simbad": simbad, "planets": planets,
        "constellation": constellation(g["ra"], g["dec"]),
        "abundances": abundances(g),
        "phenomena": phenomena(g, simbad),
        "timeline": catalog_timeline(simbad["identifiers"]) if simbad else [],
        "spectral_type": (simbad or {}).get("sp_type") or g.get("spectraltype_esphs"),
        "spectral_type_source": "SIMBAD" if (simbad or {}).get("sp_type") else ("Gaia ESP-HS" if g.get("spectraltype_esphs") else None),
        "images": image_urls(g["ra"], g["dec"]),
        "errors": errors,
        "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    with _lock:
        _memory[key] = data
    if not errors:                        # only cache complete cards on disk
        cache.parent.mkdir(exist_ok=True)
        cache.write_text(json.dumps(data), "utf-8")
    return data


if __name__ == "__main__":  # python star_info.py 4472832130942575872
    import sys
    d = star_details(sys.argv[1] if len(sys.argv) > 1 else "4472832130942575872")
    print(json.dumps({k: v for k, v in d.items() if k not in ("gaia",)}, indent=2, ensure_ascii=False)[:4000])
