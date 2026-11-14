#!/usr/bin/env python3
"""
Build viewer/sky/ephemeris.json: where the Sun, Moon, planets and a few comets are on the sky, hour by hour or day by day.

Source: NASA/JPL Horizons (https://ssd.jpl.nasa.gov/api/horizons.api), geocentric (observer at Earth's centre),
astrometric RA/Dec in J2000 (the same frame as the star catalogue), plus apparent magnitude and distances.
The welcome sky interpolates this table, so scrubbing or playing time moves real objects to their real positions.

    python viewer/tools/build_ephemeris.py            # 2025-01-01 .. 2027-12-31

Standard library only. Output is committed so the demo works offline. Anything Horizons cannot resolve is skipped and
reported, never invented. Facts about each comet (closest approach to the Sun / Earth, brightest magnitude) are
computed from the table itself, not typed in.
"""
from __future__ import annotations

import datetime as dt
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "sky" / "ephemeris.json"
START, STOP = "2025-01-01", "2027-12-31"
JD_START = 2460676.5   # JD of 2025-01-01 00:00 UTC

PLANETS = [("sun", "10", "1 d", "Sun"), ("mercury", "199", "1 d", "Mercury"), ("venus", "299", "1 d", "Venus"),
           ("mars", "499", "1 d", "Mars"), ("jupiter", "599", "1 d", "Jupiter"), ("saturn", "699", "1 d", "Saturn"),
           ("uranus", "799", "1 d", "Uranus"), ("neptune", "899", "1 d", "Neptune")]
MOON = ("moon", "301", "6 h", "Moon")
COMETS = [("c2025n1", "DES=C/2025 N1;", "3I/ATLAS"), ("c2025a6", "DES=C/2025 A6;", "C/2025 A6 (Lemmon)"),
          ("c2025r2", "DES=C/2025 R2;", "C/2025 R2 (SWAN)"), ("c2026a1", "DES=C/2026 A1;", "C/2026 A1 (MAPS)")]


def horizons(command: str, step: str) -> list[list[str]]:
    params = {
        "format": "json", "COMMAND": f"'{command}'", "OBJ_DATA": "'NO'", "MAKE_EPHEM": "'YES'", "EPHEM_TYPE": "'OBSERVER'",
        "CENTER": "'500@399'", "START_TIME": f"'{START}'", "STOP_TIME": f"'{STOP} 23:59'", "STEP_SIZE": f"'{step}'",
        "QUANTITIES": "'1,9,19,20'", "ANG_FORMAT": "'DEG'", "CSV_FORMAT": "'YES'", "CAL_FORMAT": "'CAL'",
    }
    url = "https://ssd.jpl.nasa.gov/api/horizons.api?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=120) as r:
        text = json.load(r).get("result", "")
    if "$$SOE" not in text:
        raise RuntimeError(text.strip().splitlines()[-1][:120] if text.strip() else "empty reply")
    body = text.split("$$SOE")[1].split("$$EOE")[0]
    return [[c.strip() for c in line.split(",")] for line in body.strip().splitlines()]


def num(s: str):
    try:
        return float(s)
    except ValueError:
        return None


def parse(rows: list[list[str]], step_days: float) -> dict:
    """Columns: date, solar flag, lunar flag, RA, Dec, mag, surface brightness, r (AU), rdot, delta (AU), deldot."""
    ra, dec, mag, r, delta = [], [], [], [], []
    prev = None
    for row in rows:
        a = float(row[3])
        if prev is not None:   # unwrap RA so interpolation never jumps across 0/360
            while a - prev > 180: a -= 360
            while a - prev < -180: a += 360
        prev = a
        ra.append(round(a, 4)); dec.append(round(float(row[4]), 4))
        mag.append(num(row[5])); r.append(num(row[7])); delta.append(num(row[9]))
    return {"step": step_days, "n": len(ra), "ra": ra, "dec": dec,
            "mag": [None if m is None else round(m, 2) for m in mag],
            "r": [None if x is None else round(x, 4) for x in r],
            "delta": [None if x is None else round(x, 5) for x in delta]}


def comet_facts(tbl: dict) -> dict:
    """Facts computed from the table, so they are as real as the ephemeris."""
    def date_of(i):
        d = dt.datetime(2025, 1, 1) + dt.timedelta(days=i * tbl["step"])
        return d.strftime("%Y-%m-%d")
    rs = [(x, i) for i, x in enumerate(tbl["r"]) if x is not None]
    ds = [(x, i) for i, x in enumerate(tbl["delta"]) if x is not None]
    ms = [(x, i) for i, x in enumerate(tbl["mag"]) if x is not None]
    out = {}
    if rs: out["perihelionAU"], out["perihelionDate"] = round(min(rs)[0], 3), date_of(min(rs)[1])
    if ds: out["closestAU"], out["closestDate"] = round(min(ds)[0], 3), date_of(min(ds)[1])
    if ms: out["brightestMag"], out["brightestDate"] = round(min(ms)[0], 1), date_of(min(ms)[1])
    return out


def main() -> int:
    out = {"meta": {"source": "NASA/JPL Horizons", "frame": "geocentric, astrometric RA/Dec J2000", "start": START, "stop": STOP,
                    "jd0": JD_START, "generated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")},
           "bodies": {}, "comets": {}}
    failed = []
    for key, cmd, step, label in [*PLANETS, MOON]:
        try:
            tbl = parse(horizons(cmd, step), 1.0 if step == "1 d" else 0.25)
            tbl["name"] = label
            out["bodies"][key] = tbl
            print(f"{label}: {tbl['n']} rows", flush=True)
        except Exception as e:
            failed.append(f"{label}: {e}")
    for key, cmd, label in COMETS:
        try:
            tbl = parse(horizons(cmd, "1 d"), 1.0)
            tbl["name"] = label; tbl["facts"] = comet_facts(tbl)
            out["comets"][key] = tbl
            print(f"{label}: {tbl['n']} rows, {tbl['facts']}", flush=True)
        except Exception as e:
            failed.append(f"{label}: {e}")
    OUT.write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
    if failed:
        print("SKIPPED:\n  " + "\n  ".join(failed))
    return 0 if "sun" in out["bodies"] and "moon" in out["bodies"] else 1


if __name__ == "__main__":
    sys.exit(main())
