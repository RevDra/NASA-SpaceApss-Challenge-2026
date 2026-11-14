# SPHEREx & Planet X Viewer (live IRSA data)

A WiseView-style blink viewer. The **SPHEREx D1–D6** bands show real SPHEREx Level-2 exposures
from NASA/IPAC IRSA. The WISE bands and "SPHEREx sim" are simulated in the browser.

## Run

```bash
cd viewer
python serve.py
```

This needs Python 3.8 or newer and nothing else (standard library only). It opens http://127.0.0.1:8000.
Enter RA/Dec in decimal degrees, then pick a band from **SPHEREx D1** to **D6**.

Example: Barnard's Star at its current position, `269.4466 4.7680`, FOV `120`, band **SPHEREx D2**.
You get three frames (2025.7, 2026.2, 2026.7) and the star moves about 1.3 px (~8″) north.

## How it works

The page must be served by `serve.py`. IRSA does not send CORS headers, so the browser cannot call it
directly. Instead, the page calls `/api/spherex`, and `spherex_live.py` then:

1. Queries IRSA SIA v2 (`spherex_dr1` + `spherex_qr3`) for every exposure covering the position, for the chosen detector.
2. Groups exposures into visits (one SPHEREx pass, about every 6 months) and keeps up to 6 per visit.
3. Downloads small cutouts in parallel. It reads only the `IMAGE` extension and retries when IRSA returns 503.
4. Resamples each cutout with its own TAN-SIP WCS onto a common north-up, east-left, 6.15″/px grid, then subtracts the median background.
5. Returns float32 frames (MJy/sr) to the page and caches them in `spherex_cache/`. Fields you have loaded once also work offline, which is useful for a demo.

API:

| Endpoint | Returns |
|---|---|
| `GET /api/status` | `{"ok": true, "live": true, "gaia": true}` |
| `GET /api/spherex?ra=&dec=&fov=120&band=D2` | frames + metadata. Optional `per_visit=6`, `refresh=1` |
| `GET /api/gaia?ra=&dec=&fov=120` | Real Gaia DR3 catalog sources, parallax, proper motion, and 2026 projected position |

Self-test without the browser:

```bash
python spherex_live.py 269.4466 4.7680 D2
python -c "import gaia_live, pathlib; print(gaia_live.load_gaia_sources(pathlib.Path('.'), 269.4466, 4.7680))"
```

## Features & Scientific Capabilities

- **Real Gaia DR3 overlay.** Press `G` to overlay real stars from ESA Gaia DR3. High-proper-motion stars show yellow motion vector arrows from epoch J2016 to J2026.
- **Offline cache.** Live exposures are cached in `spherex_cache/` and Gaia DR3 records in `gaia_cache/` for instant zero-latency demo.

## Limitations

- **Wavelength changes between exposures.** SPHEREx uses linear variable filters, so a source is imaged at a slightly different wavelength in each exposure. Some brightness change between frames is expected.
- **Brightness controls.** Live frames are always auto-scaled; the Min/Max sliders do not apply.
- **Use current coordinates.** For high-proper-motion stars, enter their current position. J2000 coordinates of Barnard's Star are about 4.5′ off.
- **First load is slow.** The first request for a field takes about 20–30 s. Cached fields load instantly.
