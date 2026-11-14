#!/usr/bin/env python3
"""
Build viewer/sky/sky-data.json for the welcome sky (welcome.html).

Everything in the file comes from SIMBAD (CDS) so the intro sky is the real sky:
  * field   - ~3200 naked-eye stars (V < 5.6): RA, Dec, V magnitude, B-V colour, distance, proper motion, spectral type, name
  * stars   - the named stars that make up each constellation figure: RA, Dec, parallax -> distance (ly),
              spectral type, V magnitude
  * lines   - the figure itself as index pairs into `stars`

Run once (needs network, standard library only):

    python viewer/tools/build_sky_data.py

The output is committed, so the welcome page works offline at the demo.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import star_info  # noqa: E402  (re-uses its SIMBAD TAP client with mirror fallback)

OUT = HERE.parent / "sky" / "sky-data.json"

# Constellation stick figures: SIMBAD identifier -> short label, then pairs of labels to join.
FIGURES = {
    "Ori": {
        "stars": {"Betelgeuse": "* alf Ori", "Bellatrix": "* gam Ori", "Meissa": "* lam Ori", "Alnitak": "* zet Ori",
                  "Alnilam": "* eps Ori", "Mintaka": "* del Ori", "Saiph": "* kap Ori", "Rigel": "* bet Ori"},
        "lines": [("Meissa", "Betelgeuse"), ("Meissa", "Bellatrix"), ("Betelgeuse", "Alnitak"), ("Bellatrix", "Mintaka"),
                  ("Alnitak", "Alnilam"), ("Alnilam", "Mintaka"), ("Alnitak", "Saiph"), ("Mintaka", "Rigel")],
    },
    "UMa": {
        "stars": {"Dubhe": "* alf UMa", "Merak": "* bet UMa", "Phecda": "* gam UMa", "Megrez": "* del UMa",
                  "Alioth": "* eps UMa", "Mizar": "* zet UMa", "Alkaid": "* eta UMa"},
        "lines": [("Dubhe", "Merak"), ("Merak", "Phecda"), ("Phecda", "Megrez"), ("Megrez", "Dubhe"),
                  ("Megrez", "Alioth"), ("Alioth", "Mizar"), ("Mizar", "Alkaid")],
    },
    "Cas": {
        "stars": {"Caph": "* bet Cas", "Schedar": "* alf Cas", "Gamma Cas": "* gam Cas", "Ruchbah": "* del Cas",
                  "Segin": "* eps Cas"},
        "lines": [("Caph", "Schedar"), ("Schedar", "Gamma Cas"), ("Gamma Cas", "Ruchbah"), ("Ruchbah", "Segin")],
    },
    "Cru": {
        "stars": {"Acrux": "* alf01 Cru", "Gacrux": "* gam Cru", "Mimosa": "* bet Cru", "Imai": "* del Cru"},
        "lines": [("Acrux", "Gacrux"), ("Mimosa", "Imai")],
    },
    "Cyg": {
        "stars": {"Deneb": "* alf Cyg", "Sadr": "* gam Cyg", "Albireo": "* bet01 Cyg", "Gienah": "* eps Cyg",
                  "Delta Cyg": "* del Cyg"},
        "lines": [("Deneb", "Sadr"), ("Sadr", "Albireo"), ("Gienah", "Sadr"), ("Sadr", "Delta Cyg")],
    },
    "Leo": {
        "stars": {"Regulus": "* alf Leo", "Algieba": "* gam01 Leo", "Zosma": "* del Leo", "Denebola": "* bet Leo",
                  "Chertan": "* tet Leo", "Adhafera": "* zet Leo", "Rasalas": "* mu. Leo", "Algenubi": "* eps Leo",
                  "Eta Leo": "* eta Leo"},
        "lines": [("Regulus", "Eta Leo"), ("Eta Leo", "Algieba"), ("Algieba", "Adhafera"), ("Adhafera", "Rasalas"),
                  ("Rasalas", "Algenubi"), ("Algenubi", "Regulus"), ("Algieba", "Zosma"), ("Zosma", "Denebola"),
                  ("Zosma", "Chertan"), ("Chertan", "Regulus")],
    },
    "Lyr": {
        "stars": {"Vega": "* alf Lyr", "Zeta Lyr": "* zet01 Lyr", "Sheliak": "* bet Lyr", "Sulafat": "* gam Lyr",
                  "Delta Lyr": "* del02 Lyr"},
        "lines": [("Vega", "Zeta Lyr"), ("Zeta Lyr", "Sheliak"), ("Sheliak", "Sulafat"), ("Sulafat", "Delta Lyr"),
                  ("Delta Lyr", "Zeta Lyr")],
    },
    "Tau": {
        "stars": {"Aldebaran": "* alf Tau", "Elnath": "* bet Tau", "Zeta Tau": "* zet Tau", "Theta2 Tau": "* tet02 Tau",
                  "Gamma Tau": "* gam Tau", "Epsilon Tau": "* eps Tau", "Pleiades Alcyone": "* eta Tau"},
        "lines": [("Elnath", "Aldebaran"), ("Aldebaran", "Gamma Tau"), ("Gamma Tau", "Epsilon Tau"),
                  ("Aldebaran", "Theta2 Tau"), ("Elnath", "Zeta Tau")],
    },
    "Gem": {
        "stars": {"Castor": "* alf Gem", "Pollux": "* bet Gem", "Alhena": "* gam Gem", "Tejat": "* mu. Gem",
                  "Mebsuta": "* eps Gem", "Wasat": "* del Gem"},
        "lines": [("Castor", "Mebsuta"), ("Mebsuta", "Tejat"), ("Pollux", "Wasat"), ("Wasat", "Alhena")],
    },
    "CMa": {
        "stars": {"Sirius": "* alf CMa", "Mirzam": "* bet CMa", "Adhara": "* eps CMa", "Wezen": "* del CMa",
                  "Aludra": "* eta CMa", "Muliphein": "* gam CMa"},
        "lines": [("Mirzam", "Sirius"), ("Sirius", "Wezen"), ("Wezen", "Adhara"), ("Wezen", "Aludra"),
                  ("Mirzam", "Muliphein")],
    },
    "Sco": {
        "stars": {"Antares": "* alf Sco", "Graffias": "* bet01 Sco", "Dschubba": "* del Sco", "Tau Sco": "* tau Sco",
                  "Epsilon Sco": "* eps Sco", "Mu Sco": "* mu.01 Sco", "Zeta Sco": "* zet02 Sco", "Eta Sco": "* eta Sco",
                  "Theta Sco": "* tet Sco", "Iota Sco": "* iot01 Sco", "Kappa Sco": "* kap Sco", "Shaula": "* lam Sco"},
        "lines": [("Graffias", "Dschubba"), ("Dschubba", "Antares"), ("Antares", "Tau Sco"), ("Tau Sco", "Epsilon Sco"),
                  ("Epsilon Sco", "Mu Sco"), ("Mu Sco", "Zeta Sco"), ("Zeta Sco", "Eta Sco"), ("Eta Sco", "Theta Sco"),
                  ("Theta Sco", "Iota Sco"), ("Iota Sco", "Kappa Sco"), ("Kappa Sco", "Shaula")],
    },
}

LY_PER_PARSEC = 3.26156

# SIMBAD has no parallax / magnitude on these multiple-star components; values from the Hipparcos new reduction
# (van Leeuwen 2007), rounded. Only fills gaps, never overrides SIMBAD.
FALLBACK = {"Acrux": {"ly": 321}, "Mizar": {"ly": 83, "mag": 2.04, "sp": "A2V"}}
SELECT_STAR = """
SELECT b.main_id, b.ra, b.dec, b.plx_value, b.sp_type, f.V
FROM ident i JOIN basic b ON b.oid = i.oidref LEFT JOIN allfluxes f ON f.oidref = b.oid
WHERE i.id = '{ident}'
"""


def num(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def resolve(ident: str) -> dict | None:
    rows = star_info.simbad_tap(SELECT_STAR.format(ident=ident.replace("'", "''")))
    if not rows:
        return None
    r = rows[0]
    plx = num(r.get("plx_value"))
    return {
        "ra": round(num(r["ra"]), 4),
        "dec": round(num(r["dec"]), 4),
        "mag": num(r.get("V")),
        "ly": round(LY_PER_PARSEC * 1000.0 / plx) if plx and plx > 0 else None,
        "sp": (r.get("sp_type") or "").strip() or None,
    }


GREEK = {"alf": "α", "bet": "β", "gam": "γ", "del": "δ", "eps": "ε", "zet": "ζ", "eta": "η", "tet": "θ", "iot": "ι", "kap": "κ",
         "lam": "λ", "mu.": "μ", "nu.": "ν", "ksi": "ξ", "omi": "ο", "pi.": "π", "rho": "ρ", "sig": "σ", "tau": "τ", "ups": "υ",
         "phi": "φ", "chi": "χ", "psi": "ψ", "ome": "ω"}


def pretty_designation(main_id: str) -> str:
    """'* alf Ori' -> 'α Ori', 'V* R Dra' -> 'R Dra'; anything unusual is left as SIMBAD wrote it."""
    s = main_id.strip()
    for pre in ("* ", "V* ", "** ", "*** ", "NAME "):
        if s.startswith(pre):
            s = s[len(pre):]
            break
    parts = s.split()
    s = " ".join(parts)
    if parts and parts[0][:3] in GREEK and len(parts) >= 2:
        g = GREEK[parts[0][:3]]
        tail = parts[0][3:]
        s = g + (tail.lstrip("0") if tail and tail != "." else "") + " " + " ".join(parts[1:])
    return s


def build_field() -> list:
    """Naked-eye stars with the facts needed for a hover card: designation or proper name, distance, spectral type,
    proper motion (mas/yr) and colour. Entry: [ra, dec, V, B-V, ly (0 = unknown), pmRA, pmDec, spType, name]."""
    rows = star_info.simbad_tap("""
        SELECT b.oid, b.main_id, b.ra, b.dec, f.V, f.B, b.plx_value, b.pmra, b.pmdec, b.sp_type
        FROM basic b JOIN allfluxes f ON f.oidref = b.oid
        WHERE f.V < 5.6 AND b.plx_value IS NOT NULL AND b.ra IS NOT NULL
    """)
    names = {}
    for r in star_info.simbad_tap("""
        SELECT i.oidref, i.id FROM ident i JOIN allfluxes f ON f.oidref = i.oidref JOIN basic b ON b.oid = i.oidref
        WHERE f.V < 5.6 AND b.plx_value IS NOT NULL AND i.id LIKE 'NAME %'
    """):
        n = r["id"][5:].strip()
        old = names.get(r["oidref"])
        if old is None or len(n) < len(old):
            names[r["oidref"]] = n
    field = []
    for r in rows:
        ra, dec, v, b = num(r["ra"]), num(r["dec"]), num(r["V"]), num(r.get("B"))
        if None in (ra, dec, v):
            continue
        plx = num(r.get("plx_value"))
        ly = round(LY_PER_PARSEC * 1000.0 / plx) if plx and plx > 0.5 else 0
        pmra, pmdec = num(r.get("pmra")), num(r.get("pmdec"))
        field.append([round(ra, 3), round(dec, 3), round(v, 2), round(b - v, 2) if b is not None else 0.6, ly,
                      round(pmra) if pmra is not None else 0, round(pmdec) if pmdec is not None else 0,
                      (r.get("sp_type") or "").strip(), names.get(r["oid"]) or pretty_designation(r["main_id"])])
    return field


def main() -> int:
    data = {"field": [], "constellations": {}}
    print("field stars ...", flush=True)
    data["field"] = build_field()
    print(f"  {len(data['field'])} stars")

    failed = []
    for code, fig in FIGURES.items():
        stars, names = [], []
        for label, ident in fig["stars"].items():
            info = resolve(ident)
            if info is None:
                failed.append(f"{code}: {label} ({ident})")
                continue
            info["name"] = label
            for key, val in FALLBACK.get(label, {}).items():
                if info.get(key) is None:
                    info[key] = val
            stars.append(info)
            names.append(label)
        lines = [[names.index(a), names.index(b)] for a, b in fig["lines"] if a in names and b in names]
        data["constellations"][code] = {"stars": stars, "lines": lines}
        print(f"{code}: {len(stars)}/{len(fig['stars'])} stars, {len(lines)} lines", flush=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
    if failed:
        print("UNRESOLVED:\n  " + "\n  ".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
