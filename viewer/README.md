# SPHEREx & Planet X Viewer (live IRSA data)

## Space_VI redesign: journey, sky, viewer

The product is now one path: **journey** (`welcome.html`, scroll story) then **sky** (3D, real time) then **viewer** (`index.html`, real SPHEREx photographs).

- **Journey:** six chapters (the brief, the instrument, five targets, the tool, Space_VI) over a 3D scene that follows how far you have read: Earth sinks away, the camera lifts into the real star field. Chapter 1 draws the real planetary orbits at their true periods on a log axis, with the hypothetical Planet Nine dashed. Chapter 2 is the SPHEREx spectrum to scale (D1 to D6, 17 channels each, next to the range of the human eye). Chapter 3 animates the targets from their real proper motions (Barnard 10.3 arcsec/yr, WISE 0855 8.1) and R Draconis' 246-day period. Chapter 4 shows live numbers from the loaded data.
- **Viewer, simplified:** three choices as buttons (a target, one of the six real SPHEREx bands drawn as a colour bar, a zoom) plus one search box that takes a star's name (resolved through SIMBAD, moved to today's epoch with its proper motion) or coordinates in decimal or sexagesimal. Coordinates, display and analysis controls are still there under **Advanced controls**. The photo auto-fits the stage.
- **Real data by default:** the viewer now opens on a real SPHEREx band (Barnard's Star, D2). The simulated WISE and "SPHEREx sim" bands and the injected synthetic movers are hidden from the interface (the code is still there). The Gaia star rings are on by default and coloured by each star's measured temperature.
- **Star card, visual:** vital signs (temperature on a blackbody colour bar, size against the Sun, distance on a log scale with the year its light left, brightness), proper motion as a compass arrow with "one Moon-width every N years", a real Hertzsprung-Russell diagram (3,168 stars within 100 pc and 900 bright giants from Gaia DR3, the star highlighted at its own BP-RP and absolute G), the habitable zone with the confirmed planets of the NASA Exoplanet Archive (each planet coloured by an estimated equilibrium temperature and judged "in the zone / too hot / too cold"), and a plain ledger of what the data says about life, ending with the reminder that a habitable zone is not evidence of life. The zone uses Kopparapu et al. (2013) and reproduces the published Sun values (0.75, 0.99, 1.70, 1.77 AU). The long list of facts moved under "All the details".

### Time machine, collection, dark skies (latest)

- **Time machine (viewer):** open it from the sidebar (or press `T`). Drag the bar anywhere from 1990 to 2040, jump 10 years, or play forward at 0.5x, 1x, 2x or 5x (1x = one year of sky per second). Each Gaia star is drawn where its measured proper motion puts it in that year, and fast movers (above 100 mas/yr) leave a dotted track with a label per decade. With the 1-year SPHEREx span the photo only covers about one year (SPHEREx launched in March 2025), so outside that window only the rings move and the bar says so; switch to the 14-year NEOWISE span (below) to have a real photograph change with the bar. WISE was switched off from 2011 to 2013, so there is honestly no photograph for those years. This extends the timeline using Gaia, as asked, and falls back to SPHEREx where Gaia has no star.
- **Ten-plus years of real photographs (NEOWISE):** in "02 Colour of light" the time span selector has "14 years · WISE 2010 to 2024". It loads real WISE (2010) and NEOWISE-R (2014 to 2024) 4.6 micrometre single-exposure frames from NASA/IPAC IRSA (`wise_live.py`, `GET /api/wise?ra=&dec=&fov=&band=W2`), one frame per visit (the sky is imaged about every six months), resampled onto the viewer grid with the real WCS. In the time machine the photograph follows the bar: it always shows the real frame nearest the chosen year, and the note says so ("A real photograph from 2020.22") or says there is none ("No photograph exists for 2037"). Fast movers such as Barnard's Star visibly jump between frames. First load of a field takes about 70 s; it is then cached in `spherex_cache/`. Limits: W2 saturates very bright stars, so a ring may be missing on those; SPHEREx itself only covers about one year.
- **Data sources (cite these):** SPHEREx images come from the IRSA collections `spherex_dr1` (Data Release 1) and `spherex_qr3` (Quick Release 3), the same images as the IRSA SPHEREx Spectral Image Search (https://irsa.ipac.caltech.edu/applications/spherex/search-spectral-images); its six bands (0.75-1.11 to 4.42-5.00 µm) are exactly the viewer's D1-D6. Star positions, motions and parameters come from Gaia DR3, Gaia Collaboration (2022), ESA dataset DOI 10.5270/esa-qa4lep3 (https://doi.org/10.5270/esa-qa4lep3), queried live from the ESA Gaia archive (`gaiadr3.gaia_source`, `astrophysical_parameters`). Both links are in the viewer's Links panel.
- **Accuracy checks (run 14 Nov 2026):** the pictures were checked against Gaia DR3 rather than trusted. Barnard's field, 22 NEOWISE frames 2010 to 2024: the median offset between Gaia's predicted star positions and the brightest pixels is under 1 arcsecond (pixel is 2.75″) in every frame; SPHEREx D2 on Barnard, 18 frames: peak within about one 6.15″ pixel of the prediction in every frame. In the page, `window.__tm.align()` repeats the test for the frame on screen (it skips saturated stars, whose flat tops say nothing about position). Target coordinates, proper motions and distances were checked against SIMBAD and Gaia (Barnard: 1.828 pc, 10.39″/yr). No simulated frame is ever shown for a real band: while loading, or if IRSA fails, the image is blank and the status bar says so. Stale placeholder text (a fake 2010 epoch, old coordinates) was removed.
- **Two paths, opened automatically when you enter the sky (`sky/tour.js`, `tour.css`; Pro overlay in `index.html`):** a **Start using** button floats at the bottom of the landing journey once you have scrolled past its middle (the last chapter has the same button). Entering the sky opens a chooser by itself (untick-able with "Do not open this automatically"; the **How to use** buttons reopen it). **Starter** = 10 short steps: the real sky, planets, the clock, a constellation, **See it in 3D (the constellation in real depth)**, when to watch it, where in Vietnam (3D map), **pan to a bright star (Sirius) and tap it for its facts**, Barnard's Star (the fastest mover), then the main screen. **Pro** = 2 steps: **pan to Sirius, hover and tap it** (the camera flies there and a ring pulses; the card waits for your tap, or "Open it for me"), the real parameters get highlighted (distance, temperature, brightness, proper motion), then the main screen with four numbered points and one line each (real SPHEREx photo, time bar, Gaia rings, side panel) and the challenge in one sentence. Both end by zooming into the viewer on Barnard's Star, always, with no option to pick, where a short overlay (four numbered points, one line each, the challenge in one sentence) explains the screen and a button opens the star's card. The "See the chance of life" button opens the card of the star nearest the middle of the photograph and scrolls it straight to the life section, which pulses and opens with an honest verdict coloured by what the data says (teal = planets in the habitable zone, amber = a zone but no known planet there, red = giant star), always with the reminder that a habitable zone is not evidence of life. Also on the landing page: a spinning 3D planet (Earth, Mars, Jupiter, Saturn; drag to turn): day length, axis tilt, distance and size are real published values, surfaces are procedurally drawn (said on screen) and the spin is sped up 1,800x; and a chapter "What you can do" with five one-click tiles.
- **Mobile and tablet:** both pages are responsive down to 360 px (`sky/mobile.css`, a phone block in `index.html`). Phones get: a short top bar (modes, ? and language), a row of icon buttons and a compact clock at the bottom, panels, the chooser, the calendar and the 3D map as full-width bottom sheets, the tour card at the top so it never hides the thing it points at, 40-48 px touch targets, safe-area insets, touch wording ("Drag", "Pinch", "Tap") instead of mouse wording, and no horizontal scroll (checked at 390 px: the status line used to push the viewer to 775 px wide). 3D canvases render at most 1.5x pixels on screens under 900 px. Checked in a 390 px frame on the sky page (landing, sky, tour, 3D map, calendar) and the viewer; not yet on a real phone.
- **Plan: when to watch, calendar, 3D map of Vietnam (sky page, `sky/plan.js` + `plan.css`):** open any constellation (click it in the sky, or search it) and a "When to watch" block sits under it: a strip of the next 14 nights (bar = how good the night is, small Moon = its phase), the stretch of the night it is above 15° with the Sun below -12° at your chosen place, the best month, and buttons for Google Calendar (opens with the event filled in, no account connected), `.ics` (Google, Apple, Outlook), save to my plan, and "See the sky then" (My sky at that place and time). The place chip opens a **3D map of Vietnam** (land outline from Natural Earth 1:50m, `sky/vietnam.json`, with the Hoang Sa and Truong Sa archipelagos marked at the coordinates of their main islands): pin height = how high the constellation climbs that night, grey = not visible, colour = sky darkness; drag to turn, scroll to zoom, click a pin or a "Best places" chip to choose. The **Calendar** button shows the whole month: Moon phase per night (dark nights outlined), exact-ish moments of new / quarter / full Moon (RA-based, good to a few hours, marked ≈), IMO meteor-shower peaks with a Moon verdict, your saved plans, and the constellations high at 9 pm for a chosen day. **Trending stars** is a small quiet card on the left. **Real:** all times, altitudes, best months, Moon phases, shower dates. **Demo, labelled on screen:** the light-pollution (Bortle) class of each place and the trending ranking. Island outlines are not drawn (only main-island points and a dashed extent box).
- **Search a constellation, get its stars:** typing a constellation (`Orion`, `Lạp Hộ`, `Cyg`) in the viewer or sky search box opens a dropdown of its brightest stars with magnitude, distance and spectral type; picking one flies there (viewer: at its current-epoch position). `sky/constellations.js` places the 3,187 real SIMBAD stars of `sky/sky-data.json` into the 88 IAU constellations with the Roman (1987) boundaries (`constellation_bounds.tsv`), the same table the star cards use. `node tools/test_constellations.mjs` checks Betelgeuse, Sirius, Polaris, Vega and Barnard's star land in the right constellation. The list is naked-eye stars (to magnitude 5.6), not every star.
- **Tracking objects Gaia cannot see:** a Y dwarf such as WISE 0855-0714 is far too faint for Gaia, so it had no ring. The viewer now marks the five targets and any star you search for from their SIMBAD position and proper motion (teal double ring, a dot per year, a label with the motion). Checked on real NEOWISE photographs: in all 22 frames from 2010 to 2024 a source sits within about one pixel of the predicted position, moving 8.1″ a year. A star already ringed from Gaia is not drawn twice.
- **Hatched pixels (too bright to measure):** a very bright star overflows the detector, and SPHEREx and WISE then flag those pixels and report no value (we checked R Draconis: its core pixels are NaN with the OVERFLOW flag set in the raw FITS). Older builds filled the gap with the background, which drew a black hole in the brightest spot. Now `repair_masked` (in `spherex_live.py`, shared by `wise_live.py`) gives a hole of three or more pixels the brightest valid pixel on its rim (a lower limit: the real light is at least that) and an isolated bad pixel the median of its neighbours, and sends a per-pixel `mask` with each frame. The viewer hatches those pixels in orange and the cursor readout says `≥ value · too bright`. Cache keys were bumped (`clean2_`, `wise2_`), so old caches refetch once.
- **My collection:** save a star's facts plus a picture (viewer star card, "Save snapshot" on the field, or the Save button in any sky panel). Everything stays in this browser (`localStorage`), is shared by both pages, and can be downloaded as a readable text file (`Download text`), copied (`Copy text`), exported all at once as text or JSON, or saved image by image. Nothing is uploaded.
- **Search:** the viewer box and the sky guide both accept any SIMBAD name or catalogue designation (`M 42`, `HD 10700`, `Gaia DR3 ...`), nicknames (`Tabby's star`), common Vietnamese star names with or without accents (`Thiên Lang`, `sao Bắc Cực`), and coordinates (decimal or sexagesimal). In the sky, anything found is flown to and marked with a ring and its name.
- **My sky:** the clouds are decorative (not weather). The location list now has "Dark-sky places" (Doi Inthanon, Mauna Kea, La Palma, NamibRand, Atacama, Aoraki Mackenzie, Pic du Midi, Cherry Springs), each tagged with whether it is dark at the clock time (Sun below 18 degrees and no bright Moon), computed from the ephemeris. The list is a curated set of observatory sites and IDA/Starlight reserves, not a measured light-pollution map.

### Targets are resolved, not copied

`sky/targets.json` (from `python tools/build_targets.py`) holds where the five targets are **now**, taken from SIMBAD and moved to the current epoch. Two corrections to the research notes came out of this: WISE 0855-0714 moves 8.1 arcsec a year, so its notes coordinate (epoch about 2014) is about 100 arcsec from where SPHEREx saw it in 2025-26, outside a 120 arcsec field; and the notes' "Epsilon Indi B" coordinates are those of the primary, Epsilon Indi A (B lies about 8 arcmin away). `server /api/resolve?name=` exposes the same resolver to the search box.

Data for the demo can be fetched once and then works offline: open each target once (about 20 s per SPHEREx field) and it is cached in `spherex_cache/`.

```bash
python tools/build_targets.py      # five targets at the current epoch (SIMBAD)
python tools/build_hr_data.py      # Gaia DR3 background for the HR diagram
```

## Welcome sky (front door)

`python serve.py` now opens `welcome.html` at `/`: a 3D night sky built from real star data. The blink viewer is still at `/index.html`.

- **Intro:** Earth's limb and a procedural nebula (no image files). "Enter the sky" drops you inside the celestial sphere; "Skip to the viewer" goes straight to `index.html`.
- **Sky:** 3,187 naked-eye stars (SIMBAD), the Milky Way placed with the real galactic matrix and drawn procedurally (a bright bulge toward the galactic centre, star clouds, dust lanes and a grain of unresolved stars; it is a drawing, not a photograph, and runs with fewer noise octaves on phones), 19 constellation figures (all 12 zodiac signs included). Drag to look around, scroll or pinch to zoom, hover a figure to highlight it, click to fly there and read about it. A 3-step coach teaches the controls and disappears once used.
- **Things that move:** amber rings mark the five targets from the project notes (Barnard's Star, WISE 0855−0714, Epsilon Indi B, RW Aurigae, R Draconis). Their panel ends in **Watch it move**, which opens `index.html?ra=&dec=&band=&fov=` on that object.
- **See it in 3D:** pulls a constellation's stars out to their true distances (SIMBAD parallax). The slider goes from "From Earth" (the familiar shape) to "From the side" (how far apart the stars really are). Drag to orbit.
- **Accessibility:** every label is a real button, the Sky guide lists everything without dragging, Esc closes panels, `prefers-reduced-motion` skips the flights, and the guide and panels still work if WebGL cannot start. English and Vietnamese (button top right).
- **Deep links accepted by `index.html`:** `?ra=<deg>&dec=<deg>&band=SD2&fov=<arcsec>` (band ids `W1 W2 W12 SPX SD1..SD6`). `welcome.html#sky` skips the intro.

Files: `welcome.html`, `sky/welcome.js` (scene and UI), `sky/astro.js` (pure astronomy, tested), `sky/welcome.css`, `sky/content.js` (all copy, EN/VI), `sky/sky-data.json` and `sky/ephemeris.json` (generated).

### The sky is a function of a clock

The bar at the bottom is the clock. Everything below is computed from it, not animated:

| Thing | Source | How it moves |
|---|---|---|
| Sun, Moon, Mercury to Neptune | NASA JPL Horizons, geocentric J2000, daily (Moon every 6 h), 1 Jan 2025 to 31 Dec 2027 | Catmull-Rom interpolation of the table |
| Moon phase and tilt | Sun and Moon positions | Lit fraction from elongation; bright limb from the position angle, rotated to the screen |
| Comets (3I/ATLAS, C/2025 A6, C/2025 R2, C/2026 A1) | JPL Horizons | Position, magnitude and distances from the table. Tail points away from the Sun (real); its length is illustrative. "Closest to Sun / Earth" and "brightest" are computed from the table |
| Meteor showers | IMO working list (rounded radiant, peak, ZHR, speed) | Activity profile around the peak date; streaks fan out from the radiant. Rate is the real ZHR times 10 so they are visible; the panel shows the true rate |
| 3,187 stars | SIMBAD: position, V, B-V, parallax, proper motion, spectral type, name | Fixed to the celestial sphere |
| Star colour and temperature | B-V colour index | Ballesteros (2012) temperature, then blackbody colour |
| **My sky** | Observer latitude/longitude and the clock | Greenwich sidereal time rotates the sphere, the horizon and compass appear, and the sky brightens through twilight by the Sun's real altitude. Positions are J2000, so absolute altitudes can be off by up to about 0.4 degrees (no precession applied) |

Controls: play, pause, reverse, speed from live to one month per second, a date and time field, and **Now**. Space pauses. Outside 2025 to 2027 the clock stops and says why (no ephemeris beyond that).

Hover any star for name, type, brightness, distance and temperature. Click for the full card: true luminosity, drift across the sky ("one Moon-width every N years"), and two real sky photographs of the same patch about 40 years apart (NASA SkyView, DSS1 and DSS2). The infrared SkyView surveys (2MASS, WISE) were failing on NASA's side when this was written, so only the DSS plates are used.

Rebuild or extend the data (needs network, standard library only):

```bash
python tools/build_sky_data.py     # stars and constellation figures from SIMBAD
python tools/build_ephemeris.py    # Sun, Moon, planets, comets from JPL Horizons
node tools/test_astro.mjs          # checks astro.js against Horizons rows, real new and full moons, the local-sky maths
```

### Friendly layer in the viewer

`index.html` now opens with a plain-language "What you are looking at" card (first visit, or the **Start here** button) with one-click jumps to the five movers, a one-line hint under the HUD that changes with the data source, the real calendar date under each frame's decimal year, and a **Sky map** button that opens the 3D sky at the coordinates the viewer is pointed at (`welcome.html?ra=&dec=#sky`).

To change the stars or constellation figures, edit `tools/build_sky_data.py` and run `python tools/build_sky_data.py` (needs network; the output is committed so the demo works offline). Three.js loads from the CDN, like the viewer's backdrop.

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
The card uses the same Gaia DR3 star list as the Gaia overlay (`/api/gaia`), moved to each frame's date by proper motion.
Press `G` to circle all of them.

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
| `GET /api/status` | `{"ok": true, "live": true, "gaia": true}` |
| `GET /api/spherex?ra=&dec=&fov=120&band=D2` | frames + metadata. Optional `per_visit=6`, `refresh=1` |
| `GET /api/wise?ra=&dec=&fov=300&band=W2` | real WISE/NEOWISE photographs 2010 to 2024, same JSON shape as `/api/spherex` (`wise_live.py`). `band=W1` or `W2`, `refresh=1` |
| `GET /api/gaia?ra=&dec=&fov=120` | Real Gaia DR3 catalog sources, parallax, proper motion, and 2026 projected position (`gaia_live.py`). Optional `limit=400`, `refresh=1` |
| `GET /api/star?id=<Gaia DR3 source_id>` | star card data: Gaia + SIMBAD + exoplanets + constellation (`star_info.py`) |

Self-test without the browser:

```bash
python spherex_live.py 269.4466 4.7680 D2
python -c "import gaia_live, pathlib; print(gaia_live.load_gaia_sources(pathlib.Path('.'), 269.4466, 4.7680))"
python star_info.py 4472832130942575872
```

## Features & Scientific Capabilities

- **Real Gaia DR3 overlay.** Press `G` to overlay real stars from ESA Gaia DR3. High-proper-motion stars show yellow motion vector arrows from epoch J2016 to J2026.
- **Offline cache.** Live exposures are cached in `spherex_cache/` and Gaia DR3 records in `gaia_cache/`, and star cards in `spherex_cache/star_*.json` for instant zero-latency demo.

## Simulated bands (WISE W1/W2, SPHEREx sim)

The simulated bands draw the real Gaia DR3 stars of the current field (`/api/gaia?limit=800`), not a random sky.
Each star keeps its true position, G magnitude, BP−RP colour, proper motion and parallax. Its WISE W2 brightness is
estimated from G and BP−RP (G−W2 ≈ 1.75·(BP−RP) up to BP−RP = 1, then +1.3 per magnitude). Fast movers move when you
blink: for example Barnard's Star at `269.4482 4.7420`, FOV 240, band W2 crosses about 145″ from 2010 to 2024.
The coloured rings and the star cards work on these images too. If Gaia is unreachable, the app falls back to the old
random field and the status bar says so.

## Limitations

- **Wavelength changes between exposures.** SPHEREx uses linear variable filters, so a source is imaged at a slightly different wavelength in each exposure. Some brightness change between frames is expected.
- **Brightness controls.** Live frames are always auto-scaled; the Min/Max sliders do not apply.
- **Use current coordinates.** For high-proper-motion stars, enter their current position. J2000 coordinates of Barnard's Star are about 4.5′ off.
- **First load is slow.** The first request for a field takes about 20–30 s. Cached fields load instantly.
