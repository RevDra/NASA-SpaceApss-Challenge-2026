#!/usr/bin/env python3
"""
Build viewer/sky/hr-gaia.json: the real Hertzsprung-Russell background for the star card.

Two samples from ESA Gaia DR3 (via the Gaia archive TAP service), both with good parallaxes:
  * near : stars closer than 100 pc (parallax > 10 mas, parallax_over_error > 30) -> the main sequence and white dwarfs
  * giant: bright stars from 100 pc to 700 pc (G < 8.5)                           -> red giants and supergiants
Each point is [BP-RP colour, absolute G magnitude], the same two numbers the star card reports for the chosen star, so
the highlighted star lands exactly where it belongs on the diagram. Standard library only; the output is committed.

    python viewer/tools/build_hr_data.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import star_info  # noqa: E402

OUT = HERE.parent / "sky" / "hr-gaia.json"
NEAR = """SELECT TOP 3500 bp_rp, phot_g_mean_mag + 5*log10(parallax/100.0) AS mg
FROM gaiadr3.gaia_source
WHERE parallax > 10 AND parallax_over_error > 30 AND bp_rp IS NOT NULL AND ruwe < 1.4 AND random_index < 24000000"""
GIANT = """SELECT TOP 900 bp_rp, phot_g_mean_mag + 5*log10(parallax/100.0) AS mg
FROM gaiadr3.gaia_source
WHERE parallax BETWEEN 1.4 AND 10 AND parallax_over_error > 20 AND phot_g_mean_mag < 8.5 AND bp_rp IS NOT NULL AND ruwe < 1.4
  AND random_index < 150000000"""


def pts(query):
    rows = star_info.tap(star_info.GAIA_TAP, query, timeout=180)
    return [[round(float(r["bp_rp"]), 2), round(float(r["mg"]), 2)] for r in rows if r.get("bp_rp") and r.get("mg")]


def main():
    near, giant = pts(NEAR), pts(GIANT)
    print(f"near {len(near)}, giant {len(giant)}")
    OUT.write_text(json.dumps({"source": "ESA Gaia DR3", "near": near, "giant": giant}, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
    return 0 if len(near) > 500 else 1


if __name__ == "__main__":
    sys.exit(main())
