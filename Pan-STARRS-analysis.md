# A Comprehensive Survey on Multi-Wavelength Astronomical Data: Integrating Pan-STARRS Optical Imaging and WiseView Kinematic Analysis

## Abstract

The modern era of time-domain and multi-wavelength astronomy relies heavily on the synthesis of disparate sky surveys to classify celestial objects and measure their kinematics. This paper provides a comprehensive review of two critical resources: the Panoramic Survey Telescope and Rapid Response System (Pan-STARRS) and WiseView, a time-domain visualization tool for Wide-field Infrared Survey Explorer (WISE) data. By bridging optical/near-infrared static astrometry with mid-infrared kinematic time-series data, researchers can effectively identify elusive targets such as brown dwarfs, high-proper-motion stars, and transient events. This survey covers the theoretical foundations (astronomical, physical, and mathematical), data acquisition methodologies, and interpretation techniques required to utilize these platforms effectively.

---

## 1. Introduction

The identification of substellar objects, rogue planets, and high-redshift galaxies requires observing the sky across multiple electromagnetic bands and over extended time baselines. **Pan-STARRS (PS1)** provides deep, static, multi-band optical and near-infrared (NIR) maps of the sky, serving as an exceptional baseline for spatial resolution and photometric typing. Conversely, **WISE** (and its reactivation mission, **NEOWISE**) provides an unprecedented temporal baseline in the mid-infrared (MIR), sensitive to cold, low-luminosity objects.

**WiseView** emerged as a vital web-based tool to dynamically render WISE/NEOWISE image cutouts as time-series animations (blinking). By analyzing the stationary, high-resolution optical data from Pan-STARRS alongside the dynamic, mid-infrared animations from WiseView, astronomers can confirm both the spectral energy distribution (SED) and the proper motion of a target.

---

## 2. Literature Review

The integration of Pan-STARRS and WISE data has driven numerous discoveries in the solar neighborhood. The *Backyard Worlds: Planet 9* citizen science project heavily utilizes WiseView to crowdsource the discovery of brown dwarfs and low-mass stars. Literature over the past decade demonstrates that combining PS1 dropout techniques (e.g., objects invisible in optical $g$-band but bright in $y$-band) with WISE W1/W2 mid-infrared excess is the standard pipeline for discovering L, T, and Y-class brown dwarfs. Furthermore, tools like WiseView have revolutionized visual inspection, replacing static difference-imaging with human-centric pattern recognition to detect faint dipoles caused by moving sources against crowded stellar backgrounds.

---

## 3. Theoretical Foundations

### 3.1 Astronomical Definitions

* **Equatorial Coordinate System (ICRS):** The absolute addressing system of the sky, analogous to longitude and latitude on Earth. Right Ascension (RA) and Declination (Dec) are used to pinpoint objects. For example, the coordinates `RA = 133.8236418893577, Dec = -7.22845036453723` point to a specific locus on the celestial sphere.
* **Proper Motion ($\mu$):** The apparent angular movement of a star across the celestial sphere over time, typically measured in milliarcseconds per year (mas/yr). It is defined by its components in RA ($\mu_\alpha \cos\delta$) and Dec ($\mu_\delta$).
* **Astrometry & WCS:** The World Coordinate System (WCS) is the mathematical framework that maps 2D pixel coordinates $(x, y)$ in a FITS image to 3D spherical coordinates (RA, Dec) on the sky.

### 3.2 Physical Definitions

* **Blackbody Radiation & Wien's Displacement Law:** The wavelength at which a celestial body emits maximum radiation is inversely proportional to its surface temperature, expressed as:

$$\lambda_{max} = \frac{b}{T}$$



where $b \approx 2.898 \times 10^{-3} \text{ m}\cdot\text{K}$.
* Main-sequence stars (hot) peak in the visible spectrum, making them ideal targets for **Pan-STARRS**.
* Brown dwarfs (cool, $T < 2500 \text{ K}$) peak in the mid-infrared, making them invisible in PS1 but exceptionally bright in **WISE/WiseView** (particularly in the W1: 3.4 $\mu$m and W2: 4.6 $\mu$m bands).


* **Photometry & Color Indices:** The difference in apparent magnitude between two filter bands (e.g., $i - z$ or $W1 - W2$). A highly positive $W1 - W2$ color indicates a very cool object, as the methane absorption in the W1 band suppresses flux, while the W2 band captures the peak thermal emission.

### 3.3 Mathematical Principles

* **Signal-to-Noise Ratio (SNR) and Image Stacking:** Astronomical targets are often masked by Poisson noise from the sky background and instrument read noise. To increase SNR, multiple exposures are "stacked" (co-added). If $N$ independent images are stacked, the signal increases by $N$, while the uncorrelated noise increases by $\sqrt{N}$. Thus, the final SNR scales as:

$$\text{SNR}_{stack} \approx \sqrt{N} \cdot \text{SNR}_{single}$$



Both Pan-STARRS and WiseView rely heavily on co-added epochs to reveal faint objects.
* **Difference Imaging:** To detect transients or moving objects, a reference image ($I_{ref}$) is subtracted from a target epoch ($I_{epoch}$).

$$\Delta I(x,y) = I_{epoch}(x,y) - [I_{ref}(x,y) \ast K(x,y)]$$



where $K$ is a convolution kernel matching the Point Spread Functions (PSF). A moving object leaves a characteristic mathematical dipole (a positive peak adjacent to a negative trough).

---

## 4. Methodology: Data Acquisition and Processing

### 4.1 Pan-STARRS Data Retrieval and Pipeline

Pan-STARRS utilizes a 1.8-meter telescope on Haleakalā, Hawaii, equipped with a 1.4 gigapixel camera.

1. **Filter System:** Observations are taken in five broad bands: $g_{P1}$ (green), $r_{P1}$ (red), $i_{P1}$ (near-IR), $z_{P1}$ (near-IR), and $y_{P1}$ (deep near-IR).
2. **Data Access:** Researchers query the STScI MAST Archive using coordinates. For example, querying the [Pan-STARRS Image Access](https://ps1images.stsci.edu/cgi-bin/ps1cutouts) for `pos=133.823642 -7.228450` with `size=240` pixels (60 arcseconds) returns image cutouts.
3. **Processing (Stacking):** The default retrieval type is `stack`, meaning the data represents the median combination of all high-quality exposures taken over the survey's duration. This removes transient artifacts (like cosmic rays) and provides the deepest possible view of the static sky.

### 4.2 WiseView Kinematic Visualization

Instead of providing a static catalog, [WiseView](http://byw.tools/wiseview) dynamically processes imaging data from the unWISE pipeline (which co-adds WISE and NEOWISE exposures into discrete time epochs).

1. **URL Parameterization:** A WiseView query is strictly defined by its URL state. For the locus `RA=133.8236, Dec=-7.2284`, the tool can be configured to fetch a Field of View (FOV) of `170` arcseconds.
2. **Band Selection:** By selecting `band=2` (W2 only), the user isolates the thermal emission peak of cool objects.
3. **Time-Domain Blinking:** The tool utilizes a `speed=500` (milliseconds) interval to blink through sequential epochs (e.g., 2010 to present).
4. **Sliding Window & Difference Imaging:** Applying a sliding window (e.g., `window=0.37671` years) allows the grouping of closely spaced NEOWISE scans to increase depth. Enabling `diff_window=1` applies pixel-math difference imaging on-the-fly, rendering stationary stars as flat noise and moving objects as flashing dipoles.

---

## 5. Interpretation: How to Read the Data

To successfully identify and classify a celestial object using this multi-platform approach, an astronomer follows a systematic workflow:

### Step 1: Spatial Cross-Matching (Pan-STARRS)

* Examine the individual $g, r, i, z, y$ bands.
* **The "Dropout" Method:** If an object is visible in the $y$-band and $z$-band, but completely vanishes in the $g$-band and $r$-band, it is an "optical dropout." This indicates the object is either extremely cool (emitting no visible light) or extremely distant (where cosmic expansion has redshifted its visible light into the infrared).

### Step 2: Kinematic Verification (WiseView)

* Observe the blinking animation in WiseView at the exact same coordinates.
* **Stationary vs. Moving:** If the object appears in WiseView but stays perfectly still relative to background stars, it is likely a distant extragalactic source (like a quasar or a dusty star-forming galaxy).
* **High Proper Motion:** If the object "jumps" or "slides" linearly across the pixels over the 10+ year WISE baseline, it is confirmed to be a local, substellar neighbor (Brown Dwarf) within our Milky Way galaxy. The magnitude of this movement directly correlates with its proximity to the Solar System.

### Step 3: Synthesis

By confirming an optical dropout in Pan-STARRS (proving it is cold/red) and observing high proper motion in WiseView (proving it is nearby), the researcher can definitively classify the source as a local brown dwarf without needing immediate, expensive spectroscopic follow-up from observatories like the James Webb Space Telescope (JWST).

---

## 6. Conclusion

The combination of Pan-STARRS and WiseView represents a paradigm shift in data-driven astronomy. While Pan-STARRS provides the necessary spatial resolution and multi-band optical photometry to filter out hot, main-sequence stars, WiseView unlocks the time-domain mid-infrared sky, allowing the human eye and automated algorithms to detect the subtle proper motions of the coldest objects in the solar neighborhood. Mastery of both tools, underpinned by a solid understanding of astrometry, blackbody physics, and signal processing, is essential for modern astrophysical surveying.