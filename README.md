# 🔭 SPHEREx Sky Viewer

**A public-facing web tool to explore NASA's SPHEREx mission infrared sky images.**

Blink between observation epochs to discover moving objects like asteroids, comets, brown dwarfs, and variable stars — just like the astronomers who discovered Pluto!

![SPHEREx Sky Viewer](https://spherex.caltech.edu/images/spherex_logo.png)

## 🚀 Quick Start

1. Open `index.html` in any modern web browser
2. Enter sky coordinates (RA/Dec) or click a featured object
3. Click **Search Sky** to load SPHEREx data
4. Use the blink player to animate between epochs
5. Look for objects that move or change brightness!

## ✨ Features

### Core Functionality
- **Coordinate Input** — Enter RA/Dec in decimal degrees, sexagesimal (`17h57m48.5s`, `+04d41m36s`), or resolve object names via SIMBAD
- **Blink Comparison** — Animate between observation epochs to spot moving objects
- **Difference Mode** — Subtract consecutive frames to highlight changes
- **Stack Mode** — Combine all epochs to improve signal-to-noise ratio
- **On-the-fly Spectra** — Extract 102-band SPHEREx spectra at any position

### Visualization
- **Interactive Sky Map** — Powered by [Aladin Lite](https://aladin.cds.unistra.fr/) (CDS, Strasbourg)
- **Multiple Colormaps** — Grayscale, Viridis, Inferno, Magma, Plasma, Hot, Cool
- **Stretch Functions** — Asinh, Linear, Log, Sqrt, Histogram equalization
- **Adjustable Field of View** — From 30 arcseconds to 30 arcminutes
- **Background Surveys** — DSS2, 2MASS, AllWISE, unWISE, SDSS

### Data & Overlays
- **SPHEREx Data Collections** — DR1, QR3, QR3 Deep
- **Catalog Overlays** — Gaia DR3, AllWISE, SIMBAD
- **Band Selection** — All bands composite, by detector array, custom range, false-color RGB
- **Metadata Display** — Observation dates, planning periods, contamination flags, detector info

### Usability
- **Shareable URLs** — Embed coordinates in URLs: `?ra=269.452&dec=4.693&name=Barnard's+Star`
- **Keyboard Shortcuts** — Space (play/pause), ←→ (frame navigation), G (grid), S (spectrum)
- **Featured Objects** — Quick-access buttons for notable targets
- **Responsive Design** — Works on desktop, tablet, and mobile

## 🎯 Test Objects

| Object | RA (°) | Dec (°) | Type | Expected Behavior |
|--------|--------|---------|------|-------------------|
| Barnard's Star | 269.452 | +4.693 | High proper motion star | Moves ~10.3″/year |
| Epsilon Indi B | 330.840 | −56.785 | Brown dwarf binary | Moving source |
| WISE 0855−0714 | 133.795 | −7.245 | Cold brown dwarf | Moves ~8.1″/year |
| RW Aurigae | 76.956 | +30.401 | T Tauri variable | Brightness changes |
| R Draconis | 248.167 | +66.755 | Mira variable | Large amplitude pulsation |

## 🏗️ Architecture

```
NASA/
├── index.html              # Main HTML page
├── css/
│   └── style.css           # Complete stylesheet
├── js/
│   ├── utils.js            # Coordinate parsing, name resolution, utilities
│   ├── spherex-api.js       # IRSA API integration, data models
│   ├── colormaps.js         # Scientific colormaps (viridis, inferno, etc.)
│   ├── blink-engine.js      # Image rendering, animation, stretch functions
│   ├── spectrum.js          # Spectrum extraction and Chart.js visualization
│   └── app.js              # Main application controller
└── README.md               # This file
```

### External Dependencies (loaded via CDN)
- **Aladin Lite v3** — Interactive sky viewer (CDS, Strasbourg)
- **Chart.js 4** — Spectrum chart rendering

### Data Sources
- **SPHEREx Data** — [NASA/IPAC Infrared Science Archive (IRSA)](https://irsa.ipac.caltech.edu/Missions/spherex.html)
  - SIA v2 endpoint: `https://irsa.ipac.caltech.edu/SIA`
  - IBE cutout: `https://irsa.ipac.caltech.edu/ibe/data/spherex/`
  - TAP queries: `https://irsa.ipac.caltech.edu/TAP/sync`
- **Name Resolution** — SIMBAD/CDS Sesame service
- **Catalogs** — Gaia DR3, AllWISE, SIMBAD (via HiPS progressive catalogs)

## 🔄 Updating with New Data

The tool is designed for easy updates as new SPHEREx data arrives:

1. **New Quick Releases / Data Releases** — Simply add the new collection name to the `collections` array in `spherex-api.js` and add a checkbox to `index.html`
2. **New HiPS Surveys** — If/when SPHEREx HiPS tiles become available, add them to the survey selector
3. **New Catalogs** — Add new catalog HiPS URLs to the overlay toggle system

## 📐 Technical Notes

### SPHEREx Data Format
- **102 spectral bands** spanning 0.75–5.0 µm
- **6 detector arrays**: D1 (0.75–1.1µm), D2 (1.1–1.6µm), D3 (1.6–2.4µm), D4 (2.4–3.8µm), D5 (3.8–4.4µm), D6 (4.4–5.0µm)
- **Spectral resolution R** ≈ 35–130
- **Pixel scale** ≈ 6.2 arcseconds
- **Full sky coverage** every 6 months
- **Data format**: Multi-Extension FITS (MEF) with IMAGE, FLAGS, VARIANCE, ZODI, PSF extensions

### API Integration
The tool queries IRSA's SIA v2 endpoint for image metadata, then constructs cutout URLs with `center` and `size` parameters. When SPHEREx data is available for the queried position, actual FITS cutouts are retrieved; otherwise, the tool generates realistic demonstration frames showing the expected proper motion or variability behavior.

## 📚 Resources

- [SPHEREx Mission](https://spherex.caltech.edu/)
- [IRSA SPHEREx Archive](https://irsa.ipac.caltech.edu/Missions/spherex.html)
- [SPHEREx Tutorial Notebooks](https://caltech-ipac.github.io/irsa-tutorials/spherex/)
- [WiseView](http://byw.tools/wiseview) — Inspiration for this tool
- [Backyard Worlds](https://backyardworlds.org/) — Citizen science discoveries
- [Gaia DR3](https://archive.stsci.edu/missions-and-data/gaia)

## 📄 License

This tool is open source and freely available for educational and scientific use. SPHEREx data is provided by NASA/IPAC IRSA under NASA's data policy.
