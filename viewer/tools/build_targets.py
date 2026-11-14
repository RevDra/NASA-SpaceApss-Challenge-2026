#!/usr/bin/env python3
"""
Build viewer/sky/targets.json: where the five project targets are NOW.

The research notes list J2000-era coordinates. Fast movers have since travelled: WISE 0855-0714 moves 8.1 arcsec a
year, so a position from 2014 is about 100 arcsec away from where SPHEREx saw it in 2025-26, outside a 2-arcminute
field. Here each target is resolved in SIMBAD (J2000 position plus proper motion) and moved to the current epoch.
Note also that the notes' "Epsilon Indi B" coordinates are those of the primary, Epsilon Indi A.

    python viewer/tools/build_targets.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import star_info  # noqa: E402

OUT = HERE.parent / "sky" / "targets.json"
TARGETS = [  # id, SIMBAD name, SPHEREx band that suits it, field of view (arcsec)
    ("barnard", "Barnard's star", "SD2", 120),
    ("wise0855", "WISEA J085510.74-071442.5", "SD6", 120),
    ("epsindib", "eps Ind B", "SD2", 120),
    ("rwaur", "RW Aur", "SD2", 120),
    ("rdra", "R Dra", "SD3", 120),
]


def main():
    out, epoch = [], None
    for tid, name, band, fov in TARGETS:
        r = star_info.resolve_name(name)
        if not r:
            print("NOT FOUND", name)
            return 1
        epoch = r["epoch"]
        out.append({"id": tid, "simbad": r["name"], "ra": r["ra"], "dec": r["dec"], "ra2000": r["ra2000"], "dec2000": r["dec2000"],
                    "pm_mas_yr": r["pm_mas_yr"], "sp_type": r["sp_type"], "otype": r["otype"], "band": band, "fov": fov})
        print(f"{tid:9} {r['name']:28} {r['ra']:.5f} {r['dec']:+.5f}  pm {r['pm_mas_yr']:>8} mas/yr  {r['sp_type']}")
    OUT.write_text(json.dumps({"source": "SIMBAD (CDS), moved to the current epoch with SIMBAD proper motions", "epoch": epoch, "targets": out}, indent=1), encoding="utf-8")
    print("wrote", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
