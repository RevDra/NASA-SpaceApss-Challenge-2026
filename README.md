# NODIXHI — SPHEREx Sky Explorer

NODIXHI is a public-facing astronomy experience built for the NASA Space Apps Challenge. It helps people explore real SPHEREx infrared observations, compare how a patch of sky changes over time, and learn about the stars and objects in the field.

## The challenge

NASA’s SPHEREx mission surveys the entire sky in 102 near-infrared spectral channels, revisiting it about every six months. Comparing observations can reveal objects that move or change in brightness, including asteroids, comets, brown dwarfs, variable stars, and distant galaxies. The volume of data makes accessible, human-guided exploration valuable.

This project brings together a welcoming 3D sky, a time-domain image viewer, live astronomy data, and educational tools. It is designed to make it easier to find a target, view observations, and understand what the data can—and cannot—show.

## Explore the project

- **Welcome journey and 3D sky:** Start at the landing page to explore a guided introduction, a real-star sky, constellations, planets, and observing tools. The sky can be explored by dragging and zooming; search can take you to stars and constellations.
- **Image viewer:** View real SPHEREx D1–D6 detector data from NASA/IPAC IRSA and compare observations by blinking through frames. Search by object name or coordinates, change the field of view, and inspect stars in the field.
- **Longer time baselines:** Load real WISE/NEOWISE W2 observations from 2010–2024 to see changes over a longer period. The viewer can also overlay Gaia DR3 sources and their measured motions.
- **Learning and participation:** Explore star identity cards, guided tours, a time machine, observing plans, and a browser-only personal collection. Users can submit candidate-object reports for review; a submitted report is not a confirmed discovery.
- **Research and experiments:** The repository includes an optional FITS cleaning pipeline, Pan-STARRS/WISE analysis, research scripts, and technical documentation.

### Try these targets

The project’s featured targets follow the challenge: Barnard’s Star, Epsilon Indi B, WISE 0855−0714, RW Aurigae, and R Draconis. Search by name in the viewer; names are resolved to current coordinates so high-proper-motion objects are easier to locate. Expected behavior includes apparent motion for nearby stars and brown dwarfs, and brightness variation for variable stars.

## Quick start

The viewer needs to be served by its local Python server to access the live-data proxy; opening an HTML file directly will not provide the full experience.

```powershell
Set-Location viewer
python serve.py
```

Open the address printed by the server (usually `http://127.0.0.1:8000`). The root page opens the welcome journey; the image viewer is available at `/index.html`.

The server uses Python’s standard library for its core web and proxy functionality. Python 3.8 or newer is recommended. Live data requires an internet connection and is subject to the availability and response time of the upstream archives. First loads can take tens of seconds; fetched fields are cached locally for subsequent viewing and offline demos.

### Optional scientific pipeline and tools

The default viewer does not require the packages in `requirements.txt`. To install the scientific and data-analysis dependencies for the optional FITS pipeline and research scripts:

```powershell
Set-Location ..
python -m pip install -r requirements.txt
```

See [backend/README.md](backend/README.md) for the FITS cleaning pipeline and [viewer/README.md](viewer/README.md) for viewer details, endpoints, and troubleshooting.

## How it works

```text
Browser
  ├─ welcome.html + sky/      Guided introduction and interactive 3D sky
  └─ index.html                Time-domain image viewer
          │ same-origin requests
          ▼
viewer/serve.py                Static files and local API/data proxy
  ├─ spherex_live.py           SPHEREx observations from NASA/IPAC IRSA
  ├─ wise_live.py              WISE/NEOWISE observations from NASA/IPAC IRSA
  ├─ gaia_live.py              Gaia DR3 field sources
  ├─ star_info.py              Star cards and related catalog lookups
  └─ reports_store.py          Candidate reports and admin endpoints
```

SPHEREx and WISE images are retrieved from NASA/IPAC IRSA and resampled onto a common viewer grid. Gaia DR3 supplies catalog data such as source positions and proper motions. The server provides a same-origin API because the browser cannot directly make all required archive requests. Local caches reduce repeat downloads.

The optional [`backend/`](backend/) package contains a separate FITS processing pipeline for background subtraction, flagged-pixel handling, and signal-to-noise estimates. Its scientific Python dependencies are not installed in the default deployment image.

## Data, interpretation, and limitations

- **SPHEREx:** Real image exposures are queried from IRSA’s SPHEREx collections. The viewer presents detector selections D1–D6; SPHEREx’s instrument data cover 102 spectral channels. Consult the viewer documentation for the current supported display and data details.
- **WISE/NEOWISE:** Real W2 images extend the comparison baseline to 2010–2024. WISE did not observe during its hibernation period, so there are gaps in the time series.
- **Gaia:** Gaia DR3 sources provide context and measured motions for sources Gaia can observe. Very faint objects, including some brown dwarfs, may not appear in the Gaia catalog.
- **Image changes need interpretation:** SPHEREx uses linear variable filters, so the wavelength can differ between exposures. Apparent brightness changes may reflect wavelength, detector flags, saturation, or other observational effects, not only intrinsic variability.
- **No fabricated real-band fallback:** When live archive data for a real band is unavailable, the viewer reports the issue rather than presenting a synthetic frame as a real observation.
- **Candidate reports are unverified:** Reports are leads for review, not scientific confirmation or a promise of a reward.

For archive and catalog citations, see the viewer’s Links panel and [viewer/README.md](viewer/README.md).

## Run checks

The small browser-side astronomy checks use Node.js and can be run from the viewer directory:

```powershell
Set-Location viewer
node tools/test_astro.mjs
node tools/test_constellations.mjs
node tools/test_hz.mjs
```

## Deployment

The repository includes a Dockerfile and Render Blueprint. To deploy, create a new Blueprint in Render and select this repository; the service builds from [Dockerfile](Dockerfile) and uses [render.yaml](render.yaml).

The deployed service listens on the host-provided `PORT`. Render generates an `ADMIN_TOKEN` for accessing the report administration page at `/admin.html?token=...`. Treat this token as a secret. On Render’s free plan, the service may sleep when idle and its local report storage is lost on restart or redeploy; configure persistent storage before relying on hosted report retention.

## Repository map

| Path | Purpose |
|---|---|
| [`viewer/`](viewer/) | Web experience, local server, live-data proxy, sky assets, and viewer documentation |
| [`backend/`](backend/) | Optional FITS cleaning and science-processing API |
| [`documentation/`](documentation/) | Mission, architecture, challenge, data-resource, and strategy documentation |
| [`Pan-STARRS/`](Pan-STARRS/) | Pan-STARRS and WiseView analysis notes |
| [`research/`](research/) | Astronomy research scripts, pipeline experiments, and supporting material |
| [`data/`](data/) | Benchmark data used by the project |
| [`requirements.txt`](requirements.txt) | Python dependencies for optional scientific and research components |
| [`Dockerfile`](Dockerfile), [`render.yaml`](render.yaml) | Container and Render deployment configuration |

### Further reading

- [Viewer guide and API details](viewer/README.md)
- [FITS pipeline guide](backend/README.md)
- [Documentation index](documentation/README.md)
- [NASA data and resources](documentation/05.NASA%20Data%20%26%20Resources.md)
- [System architecture](documentation/04-system-architecture/system_architecture.md)
- [Scientific foundation](documentation/04-system-architecture/scientific_foundation.md)
- [Pan-STARRS analysis](Pan-STARRS/Pan-STARRS%20%2B%20WiseView%20analysis.md)

## Data resources

- [NASA/IPAC Infrared Science Archive — SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html)
- [SPHEREx tutorial notebooks](https://caltech-ipac.github.io/irsa-tutorials/spherex/)
- [Gaia mission data](https://archive.stsci.edu/missions-and-data/gaia)
- [WiseView](http://byw.tools/wiseview), an inspiration for time-domain infrared image comparison
- [Canadian Astronomy Data Centre](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/)
- [NEOSSat](https://www.asc-csa.gc.ca/eng/satellites/neossat/)
- [NEOSSat data tutorial](https://github.com/asc-csa/NEOSSAT_Tutorial) and [dataset](https://data.asc-csa.gc.ca/dataset/neossat)

## License

This project is released under the [MIT License](LICENSE). NASA and partner-mission data remain subject to the policies of their respective archives.
