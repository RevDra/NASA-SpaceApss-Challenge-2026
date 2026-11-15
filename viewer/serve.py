#!/usr/bin/env python3
"""
Local launcher for the SPHEREx & Planet X Deep Space Explorer UI.

    python serve.py                 # http://127.0.0.1:8000, opens your browser
    python serve.py --port 9000     # pick a port (falls back to the next free one)
    python serve.py --no-browser    # just serve

Besides the static files it exposes a small proxy to NASA/IPAC IRSA, because IRSA does not send
CORS headers and the browser cannot call it directly:

    GET /api/status                                   -> {"ok": true, "live": true, "gaia": true}
    GET /api/spherex?ra=..&dec=..&fov=120&band=D2     -> real SPHEREx frames (see spherex_live.py)
        optional: per_visit=6 (exposures kept per visit), refresh=1 (ignore the cache)
    GET /api/gaia?ra=..&dec=..&fov=120                -> Gaia DR3 sources in the field (see gaia_live.py)
        optional: limit=400, refresh=1
    GET /api/star?id=<Gaia DR3 source_id>             -> identity card: Gaia + SIMBAD + exoplanets + constellation
                                                         (see star_info.py)
    GET /api/wise?ra=..&dec=..&fov=300&band=W2        -> real WISE/NEOWISE frames 2010-2024 (see wise_live.py)
    GET /api/resolve?name=<text>                      -> SIMBAD name -> coordinates, moved to the current epoch
    POST /api/report                                  -> a "I found a new star" report from the viewer (see reports_store.py)
    GET /api/admin/reports?token=..                   -> the stored reports (token = env ADMIN_TOKEN, or this computer only)

Standard library only (Python 3.8+). Keep this file next to index.html, spherex_live.py, gaia_live.py,
star_info.py and constellation_bounds.tsv.
"""
from __future__ import annotations

import argparse
import functools
import hmac
import http.server
import json
import os
import socket
import sys
import threading
import traceback
import urllib.parse
import webbrowser
from pathlib import Path

import gaia_live
import reports_store
import spherex_live
import wise_live
import star_info

ROOT = Path(__file__).resolve().parent


class Handler(http.server.SimpleHTTPRequestHandler):
    """Static file handler with correct JS MIME types and no caching while you edit."""

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # ---- reports from the viewer: stored for the admin, never served as static files ----
    def client_ip(self) -> str:
        """The caller's address. Behind a host's proxy every request comes from the proxy, so with TRUST_PROXY=1 the first
        X-Forwarded-For entry is used (only for the per-address report limit; a spoofed value cannot beat the global limit)."""
        fwd = self.headers.get("X-Forwarded-For", "")
        if os.environ.get("TRUST_PROXY") == "1" and fwd:
            return fwd.split(",")[0].strip()[:64] or self.client_address[0]
        return self.client_address[0]

    def is_admin(self, query: dict) -> bool:
        token = os.environ.get("ADMIN_TOKEN", "")
        given = (query.get("token") or [""])[0]
        if token:
            return hmac.compare_digest(token.encode(), given.encode())
        # no token: only this computer, and never when the request came through a proxy (that would be the whole internet)
        return self.client_address[0] in ("127.0.0.1", "::1") and not self.headers.get("X-Forwarded-For")

    def is_private_path(self, path: str) -> bool:
        """True for any spelling of /reports/... (case, %-escapes, ./ and ../ tricks), or a path resolving into the store."""
        parts = [seg for seg in urllib.parse.unquote(path).replace("\\", "/").split("/") if seg not in ("", ".")]
        if parts and parts[0].casefold().rstrip(". ") == "reports":
            return True
        try:
            target = Path(self.translate_path(path)).resolve()
            store = reports_store.store_dir(ROOT)
            return target == store or store in target.parents
        except (OSError, ValueError):
            return True

    def do_POST(self) -> None:
        url = urllib.parse.urlsplit(self.path)
        if url.path != "/api/report":
            self.send_json(404, {"error": "unknown endpoint"})
            return
        try:
            n = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            n = 0
        if n <= 0 or n > reports_store.MAX_BODY:
            self.send_json(413, {"error": "report is empty or too large"})
            return
        body = self.rfile.read(n)
        try:
            self.send_json(200, reports_store.save_report(ROOT, body, self.client_ip()))
        except reports_store.ReportError as exc:
            self.send_json(400, {"error": str(exc)})
        except Exception as exc:
            traceback.print_exc()
            self.send_json(500, {"error": f"{type(exc).__name__}: {exc}"})

    def do_HEAD(self) -> None:
        if self.is_private_path(urllib.parse.urlsplit(self.path).path):
            self.send_response(403)
            self.end_headers()
            return
        super().do_HEAD()

    def do_GET(self) -> None:
        url = urllib.parse.urlsplit(self.path)
        if self.is_private_path(url.path):          # defence in depth: reports are stored outside this folder anyway
            self.send_json(403, {"error": "forbidden"})
            return
        if url.path == "/":                        # the welcome sky is the front door; the blink viewer stays at /index.html
            self.path = "/welcome.html" + (("?" + url.query) if url.query else "")
            url = urllib.parse.urlsplit(self.path)
        if url.path.startswith("/api/"):
            self.handle_api(url.path, urllib.parse.parse_qs(url.query))
        else:
            super().do_GET()

    def send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        try:
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass    # the page moved on (another target or band) and cancelled this request: nothing to deliver

    def handle_api(self, path: str, query: dict) -> None:
        arg = lambda name, default=None: query.get(name, [default])[0]
        if path == "/api/status":
            self.send_json(200, {"ok": True, "live": True, "gaia": True, "reports": True})
            return
        if path.startswith("/api/admin/"):
            if not self.is_admin(query):
                self.send_json(403, {"error": "admin only: set ADMIN_TOKEN and pass ?token=..., or open this page on the computer running serve.py"})
                return
            if path == "/api/admin/reports":
                self.send_json(200, {"ok": True, "reports": reports_store.list_reports(ROOT)})
                return
            if path == "/api/admin/image":
                hit = reports_store.read_image(ROOT, arg("id", ""), arg("name", ""))
                if not hit:
                    self.send_json(404, {"error": "no such image"})
                    return
                data, mime = hit
                self.send_response(200); self.send_header("Content-Type", mime); self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)
                return
            self.send_json(404, {"error": f"unknown endpoint {path}"})
            return
        if path == "/api/gaia":
            try:
                ra, dec = float(arg("ra")), float(arg("dec"))
                fov = float(arg("fov", 120))
                limit = int(arg("limit", 400))
            except (TypeError, ValueError):
                self.send_json(400, {"error": "ra, dec and fov must be numbers"})
                return
            try:
                sources = gaia_live.load_gaia_sources(ROOT, ra, dec, fov, limit, refresh=arg("refresh") == "1")
                self.send_json(200, {"ok": True, "ra": ra, "dec": dec, "fov": fov, "sources": sources})
            except Exception as exc:
                traceback.print_exc()
                self.send_json(500, {"error": f"{type(exc).__name__}: {exc}"})
            return
        if path == "/api/star":
            self.handle_star_api(arg)
            return
        if path == "/api/wise":
            try:
                ra, dec = float(arg("ra")), float(arg("dec"))
                fov = float(arg("fov", 300))
            except (TypeError, ValueError):
                self.send_json(400, {"error": "ra, dec (degrees) and fov (arcsec) must be numbers"})
                return
            try:
                self.send_json(200, wise_live.load_epochs(ROOT, ra, dec, fov, arg("band", "W2"), refresh=arg("refresh") == "1"))
            except spherex_live.LiveError as exc:
                self.send_json(502, {"error": str(exc)})
            except Exception as exc:
                traceback.print_exc()
                self.send_json(500, {"error": f"{type(exc).__name__}: {exc}"})
            return
        if path == "/api/resolve":
            name = (arg("name") or "").strip()
            if not name:
                self.send_json(400, {"error": "name is required"})
                return
            try:
                hit = star_info.resolve_name(name)
            except Exception as exc:
                self.send_json(502, {"error": f"SIMBAD did not answer ({exc})"})
                return
            self.send_json(200, {"ok": True, **hit} if hit else {"ok": False, "error": f"No object called \u201c{name}\u201d in SIMBAD"})
            return
        if path != "/api/spherex":
            self.send_json(404, {"error": f"unknown endpoint {path}"})
            return
        try:
            ra, dec = float(arg("ra")), float(arg("dec"))
            fov = float(arg("fov", 120))
            per_visit = int(arg("per_visit", 6))
        except (TypeError, ValueError):
            self.send_json(400, {"error": "ra, dec (degrees), fov (arcsec) and per_visit must be numbers"})
            return
        try:
            data = spherex_live.load_epochs(ROOT, ra, dec, fov, arg("band", "D2"), per_visit,
                                            refresh=arg("refresh") == "1")
        except spherex_live.LiveError as exc:
            self.send_json(502, {"error": str(exc)})
            return
        except Exception as exc:  # keep the server alive and tell the page what went wrong
            traceback.print_exc()
            self.send_json(500, {"error": f"{type(exc).__name__}: {exc}"})
            return
        self.send_json(200, data)

    def handle_star_api(self, arg) -> None:
        sid = arg("id", "")
        if not sid.isdigit():
            self.send_json(400, {"error": "id must be a Gaia DR3 source_id"})
            return
        try:
            data = star_info.star_details(sid)
        except star_info.StarError as exc:
            self.send_json(502, {"error": str(exc)})
            return
        except Exception as exc:
            traceback.print_exc()
            self.send_json(500, {"error": f"{type(exc).__name__}: {exc}"})
            return
        self.send_json(200, data)

    def log_message(self, fmt: str, *args) -> None:
        sys.stdout.write(f"  {self.log_date_time_string()}  {fmt % args}\n")


def free_port(host: str, start: int, attempts: int = 20) -> int:
    for port in range(start, start + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, port))
                return port
            except OSError:
                continue
    raise SystemExit(f"No free port between {start} and {start + attempts - 1}.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the SPHEREx & Planet X viewer locally.")
    parser.add_argument("--host", default=os.environ.get("HOST") or ("0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"), help="interface to bind (default 127.0.0.1; 0.0.0.0 when the host sets PORT)")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT") or 8000), help="first port to try (default 8000, or the PORT variable)")
    parser.add_argument("--no-browser", action="store_true", help="do not open a browser window")
    args = parser.parse_args()

    if not (ROOT / "index.html").exists():
        raise SystemExit("index.html was not found next to serve.py.")

    port = free_port(args.host, args.port)
    url = f"http://{args.host}:{port}/"
    handler = functools.partial(Handler, directory=str(ROOT))

    with http.server.ThreadingHTTPServer((args.host, port), handler) as httpd:
        print("\n  SPHEREx // PLANET X VIEWER")
        print(f"  Serving {ROOT}")
        print(f"  Open    {url}")
        print("  Stop    Ctrl+C\n")
        if os.environ.get("PORT") and not os.environ.get("ADMIN_TOKEN"):
            print("  NOTE    ADMIN_TOKEN is not set: the admin page is switched off on a public host.\n")
        if not args.no_browser and not os.environ.get("PORT"):
            threading.Timer(0.6, webbrowser.open, args=(url,)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Stopped.")


if __name__ == "__main__":
    main()
