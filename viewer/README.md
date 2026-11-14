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

## Star identity cards

On the SPHEREx D1–D6 bands, hover a star to open its card, click to pin it (then it scrolls), and press Esc to close.
Real Gaia DR3 stars (G < 18.5) are matched to the image after moving them to each frame's date by proper motion.
Turn on **Gaia DR3 overlay** to circle all of them.

| Card section | Data source |
|---|---|
| Name, Gaia designation, SIMBAD ID | Gaia DR3 + SIMBAD (common name such as "Barnard's star") |
| Constellation, sky position | IAU boundaries (Roman 1987, `constellation_bounds.tsv`), Gaia position |
| History | SIMBAD: earliest publications (e.g. Barnard 1916) with ADS links, number of papers, catalogue timeline from the identifiers (BD 1859, HD 1918 … Gaia DR3 2022) |
| Distance, radius / diameter, mass, luminosity, age, evolutionary stage | Gaia parallax, Gaia FLAME and GSP-Phot |
| Temperature, colour, spectral type, apparent / absolute magnitude | Gaia GSP-Phot, BP−RP, SIMBAD spectral type |
| Planets | NASA Exoplanet Archive (discovery year, method, facility, orbit, mass) |
| Special phenomena | SIMBAD object type, Gaia variability class, binarity, RUWE |
| Spectrum strip | Coloured by wavelength, brightness = blackbody at the star's temperature. Dark lines mark the elements expected at that temperature, one colour per element in spectral order, with Gaia GSP-Spec abundances [X/H] when measured |
| Archival images | NASA SkyView: DSS1 (POSS-I, 1950s), DSS2, 2MASS |

Limitations of the cards:

- **Missing values.** Some fields show "no data" when Gaia did not compute them. For example, FLAME gives no mass for M dwarfs, and GSP-Spec abundances exist only for bright FGK stars.
- **No core temperatures.** These cannot be measured from photometry.
- **No discoverer names.** Catalogues do not record who discovered a star. The card shows the earliest publication instead.
- **SIMBAD mirror.** The main CDS server in Strasbourg was down when this was written, so `star_info.py` falls back to the Harvard SIMBAD mirror.

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
| `GET /api/status` | `{"ok": true, "live": true}` |
| `GET /api/spherex?ra=&dec=&fov=120&band=D2` | frames + metadata. Optional `per_visit=6`, `refresh=1` |
| `GET /api/gaia?ra=&dec=&fov=120` | Gaia DR3 sources in the field |
| `GET /api/star?id=<Gaia DR3 source_id>` | star card data: Gaia + SIMBAD + exoplanets + constellation |

Self-test without the browser:

```bash
python spherex_live.py 269.4466 4.7680 D2
```

## Limitations

- **Wavelength changes between exposures.** SPHEREx uses linear variable filters, so a source is imaged at a slightly different wavelength in each exposure. Some brightness change between frames is expected.
- **Simulation-only features.** The Gaia overlay and synthetic movers apply to simulated imagery only.
- **Brightness controls.** Live frames are always auto-scaled; the Min/Max sliders do not apply.
- **Use current coordinates.** For high-proper-motion stars, enter their current position. J2000 coordinates of Barnard's Star are about 4.5′ off.
- **First load is slow.** The first request for a field takes about 20–30 s. Cached fields load instantly.
