"""
Mover reports sent from the viewer ("I found a new star") are stored here, for the project admin to review.

    <store>/<id>/report.json   the form (reporter, field, marks, per-frame measurements, motion)
    <store>/<id>/snapshot.jpg  the picture the user marked
    <store>/<id>/evidence.png  crops around the mark from several frames

Nothing is sent anywhere else. The folder is git-ignored and never served as static files; the admin reads it through
/api/admin/* with a token (environment variable ADMIN_TOKEN) or, if no token is set, only from this computer (loopback).
Standard library only.
"""
from __future__ import annotations

import base64
import json
import os
import math
import re
import secrets
import threading
import time
from pathlib import Path

MAX_BODY = 6_000_000            # bytes of JSON accepted per report
MAX_IMAGE = 2_500_000           # bytes per decoded image
PER_IP_PER_HOUR = 8
GLOBAL_PER_HOUR = 200
_lock = threading.Lock()
_hits: dict[str, list[float]] = {}
_all: list[float] = []


class ReportError(Exception):
    pass


def _clean(s, limit: int) -> str:
    s = "" if s is None else str(s)
    s = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", s).strip()
    return s[:limit]


def _num(v, lo: float, hi: float, name: str) -> float:
    try:
        x = float(v)
    except (TypeError, ValueError):
        raise ReportError(f"{name} must be a number")
    if not math.isfinite(x) or x < lo or x > hi:
        raise ReportError(f"{name} is out of range")
    return x


def _image(data_url, kinds: tuple[str, ...]) -> tuple[bytes, str]:
    m = re.match(r"^data:image/(png|jpeg);base64,([A-Za-z0-9+/=\s]+)$", data_url or "")
    if not m or m.group(1) not in kinds:
        raise ReportError("image must be a PNG or JPEG data URL")
    raw = base64.b64decode(m.group(2), validate=False)
    if len(raw) > MAX_IMAGE:
        raise ReportError("image is too large")
    ok = raw.startswith(b"\x89PNG\r\n\x1a\n") if m.group(1) == "png" else raw.startswith(b"\xff\xd8\xff")
    if not ok:
        raise ReportError("image bytes do not match their type")
    return raw, "png" if m.group(1) == "png" else "jpg"


def _rate_ok(ip: str) -> bool:
    now = time.time()
    with _lock:
        mine = [t for t in _hits.get(ip, []) if now - t < 3600]
        _all[:] = [t for t in _all if now - t < 3600]
        if len(mine) >= PER_IP_PER_HOUR or len(_all) >= GLOBAL_PER_HOUR:
            _hits[ip] = mine
            return False
        mine.append(now); _all.append(now); _hits[ip] = mine
        return True


def store_dir(root: Path) -> Path:
    """Where reports live: env REPORTS_DIR, else <repo>/reports, which is NOT inside the folder the web server serves
    (names and contacts must never be reachable as static files, on case-insensitive disks included)."""
    env = os.environ.get("REPORTS_DIR")
    return Path(env).expanduser().resolve() if env else root.resolve().parent / "reports"


def save_report(root: Path, body: bytes, ip: str) -> dict:
    if len(body) > MAX_BODY:
        raise ReportError("report is too large")
    if not _rate_ok(ip):
        raise ReportError("too many reports from this address, please try again later")
    try:
        d = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, ValueError):
        raise ReportError("report is not valid JSON")
    if not isinstance(d, dict):
        raise ReportError("report must be an object")
    rep = d.get("reporter") or {}
    name, contact = _clean(rep.get("name"), 80), _clean(rep.get("contact"), 120)
    if not name or not contact:
        raise ReportError("name and contact are required (the contact is how the admin reaches you)")
    if d.get("consent") is not True:
        raise ReportError("consent to share the report with the admin is required")
    field = d.get("field") or {}
    clean = {
        "version": 1,
        "received_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "reporter": {"name": name, "contact": contact},
        "note": _clean(d.get("note"), 2000),
        "field": {
            "ra": _num(field.get("ra"), 0, 360, "field ra"), "dec": _num(field.get("dec"), -90, 90, "field dec"),
            "fov_arcsec": _num(field.get("fov"), 1, 3600, "field of view"),
            "band": _clean(field.get("band"), 40), "mission": _clean(field.get("mission"), 40), "unit": _clean(field.get("unit"), 60),
            "target": _clean(field.get("target"), 80),
        },
        "window": {"start": _clean((d.get("window") or {}).get("start"), 32), "end": _clean((d.get("window") or {}).get("end"), 32)},
        "frames": [], "marks": [], "detections": [],
        "motion": None,
    }
    for f in (d.get("frames") or [])[:60]:
        clean["frames"].append({"t": _num(f.get("t"), 1900, 2200, "frame epoch"), "date": _clean(f.get("date"), 32), "obsid": _clean(f.get("obsid"), 40)})
    for m in (d.get("marks") or [])[:2]:
        clean["marks"].append({
            "ra": _num(m.get("ra"), 0, 360, "mark ra"), "dec": _num(m.get("dec"), -90, 90, "mark dec"),
            "epoch": _num(m.get("t"), 1900, 2200, "mark epoch"), "date": _clean(m.get("date"), 32),
            "px": [_num(m.get("k"), -1, 1024, "mark column"), _num(m.get("r"), -1, 1024, "mark row")],
            "radius_arcsec": _num(m.get("radius") or 0, 0, 3600, "mark radius"),
        })
    if not clean["marks"]:
        raise ReportError("mark where you saw the object on the picture")
    for x in (d.get("detections") or [])[:60]:
        clean["detections"].append({"date": _clean(x.get("date"), 32), "snr": round(_num(x.get("snr"), -1000, 100000, "snr"), 1)})
    mo = d.get("motion")
    if isinstance(mo, dict):
        clean["motion"] = {"arcsec": round(_num(mo.get("arcsec"), 0, 100000, "motion"), 3), "mas_per_yr": round(_num(mo.get("masyr"), 0, 1e9, "motion rate"), 1),
                           "pa_deg": round(_num(mo.get("pa"), 0, 360, "position angle"), 1), "years": round(_num(mo.get("years"), 0, 400, "baseline"), 3)}
    imgs = d.get("images") or {}
    snap, snap_ext = _image(imgs.get("snapshot"), ("jpeg", "png"))
    evid, evid_ext = _image(imgs.get("evidence"), ("png", "jpeg")) if imgs.get("evidence") else (None, None)

    rid = time.strftime("%Y%m%d-%H%M%S", time.gmtime()) + "-" + secrets.token_hex(3)
    folder = store_dir(root) / rid
    folder.mkdir(parents=True, exist_ok=False)
    (folder / f"snapshot.{snap_ext}").write_bytes(snap)
    if evid:
        (folder / f"evidence.{evid_ext}").write_bytes(evid)
    clean["id"] = rid
    clean["files"] = {"snapshot": f"snapshot.{snap_ext}", "evidence": f"evidence.{evid_ext}" if evid else None}
    (folder / "report.json").write_text(json.dumps(clean, ensure_ascii=False, indent=2), "utf-8")
    return {"ok": True, "id": rid}


def list_reports(root: Path) -> list[dict]:
    out = []
    base = store_dir(root)
    if not base.exists():
        return out
    for p in sorted(base.iterdir(), reverse=True):
        f = p / "report.json"
        if p.is_dir() and f.exists():
            try:
                out.append(json.loads(f.read_text("utf-8")))
            except ValueError:
                continue
    return out


def read_image(root: Path, rid: str, name: str) -> tuple[bytes, str] | None:
    if not re.fullmatch(r"[0-9]{8}-[0-9]{6}-[0-9a-f]{6}", rid or "") or name not in ("snapshot", "evidence"):
        return None
    folder = store_dir(root) / rid
    for ext, mime in (("jpg", "image/jpeg"), ("png", "image/png")):
        f = folder / f"{name}.{ext}"
        if f.exists():
            return f.read_bytes(), mime
    return None
