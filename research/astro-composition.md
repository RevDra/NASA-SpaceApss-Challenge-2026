# Comprehensive Methods for Observing and Inferring the Elemental Composition of Astronomical Bodies

## Executive Summary

The determination of elemental and molecular composition in astronomical bodies (astrobodies) is a fundamental pillar of planetary science, stellar astrophysics, and cosmochemistry. This report provides a systematic literature review of the diverse methodologies employed to observe and conclude the chemical makeup of these bodies, ranging from nearby asteroids and planets to distant exoplanets and stars. The methodologies are broadly categorized into passive remote sensing, active remote sensing, in-situ measurements, and laboratory analysis of returned samples or meteorites.

Passive remote sensing remains the most widely applied approach, utilizing the electromagnetic spectrum from gamma rays to radio waves. Nuclear spectroscopy (gamma-ray and neutron) is unique in its ability to detect specific rock-forming elements and natural radioelements by measuring cosmic ray-induced emissions from shallow subsurface layers [1], [2]. Visible and infrared (VIR) spectroscopy provides critical data on surface mineralogy, ices, and organic matter by analyzing reflected sunlight and thermal emission [8], [16]. In the realm of exoplanets, transmission and emission spectroscopy during transits and eclipses allow for the detection of atmospheric constituents and even surface types, although these are heavily reliant on complex radiative transfer models and stellar templates [10], [24].

Active methods, such as Laser-Induced Breakdown Spectroscopy (LIBS) and Raman spectroscopy, offer high-precision elemental and mineralogical data, often at stand-off distances [4], [27]. Emerging technologies like Remote Laser Evaporative Molecular Absorption (R-LEMA) propose vaporizing surface material to probe bulk composition via absorption spectroscopy [18], [22]. Furthermore, in-situ analysis using mass spectrometers and laboratory studies of sample-return materials (e.g., Ryugu, cometary dust) provide the "ground truth" necessary to calibrate remote observations [5], [12]. Despite the sophistication of these techniques, limitations persist, including signal-to-noise constraints, surface-versus-bulk sensitivity, and the inherent degeneracies of inverse modeling in remote sensing [10], [46].

## Table of Contents
1. Introduction
2. Passive Remote Sensing Methodologies
    2.1 Nuclear Spectroscopy (Gamma-Ray and Neutron)
    2.2 Reflectance and Emission Spectroscopy (UV-VIS-IR)
    2.3 Photometry and Polarimetry
3. Active Remote Sensing and Directed Energy Techniques
    3.1 Laser-Induced Breakdown Spectroscopy (LIBS) and Raman
    3.2 Remote Laser Evaporative Molecular Absorption (R-LEMA)
4. In-Situ Analysis and Laboratory Characterization
    4.1 Mass Spectrometry and Gas Chromatography
    4.2 Sample Return and Meteoritic Analogs
5. Exoplanetary and Stellar Compositional Inference
    5.1 Transmission and Emission Spectroscopy
    5.2 Atmospheric Retrieval and Internal Structure Modeling
6. Findings and Comparative Analysis
7. Limitations of the Evidence
8. Future Directions and Research Gaps
9. Conclusion

## 1. Introduction
Understanding the elemental composition of astronomical bodies is essential for reconstructing the history of the solar system, characterizing the habitability of exoplanets, and testing models of stellar evolution. An "astrobody" encompasses a vast range of objects, including planets, moons, asteroids, comets, stars, and interstellar objects. Each type presents unique observational challenges. While stars and planetary atmospheres are primarily studied through absorption and emission features in their spectra, airless bodies like asteroids and the Moon require methods that can probe solid surfaces and shallow subsurfaces [6], [7].

The methodologies for concluding composition have evolved from simple photometric color indices to high-resolution spectroscopy and complex "inversion" models that translate spectral data into abundance mass percentages [13], [36]. This review synthesizes these methods, highlighting the physical principles, instrumentation, and the specific chemical species they are capable of detecting.

## 2. Passive Remote Sensing Methodologies

### 2.1 Nuclear Spectroscopy (Gamma-Ray and Neutron)
Nuclear spectroscopy is a powerful remote sensing technique used to determine the concentrations of rock-forming elements (e.g., Fe, Mg, Si, O, Ti, Ca) and natural radioelements (K, Th, U) on planetary surfaces [1], [11]. The method relies on the detection of characteristic gamma rays and neutrons emitted from the top ~1 meter of a solid surface [2].

**Physical Principles:**
The primary source of these emissions is the interaction of galactic cosmic rays (GCRs) with the planetary regolith. High-energy GCRs penetrate the surface, triggering spallation reactions that produce secondary neutrons. These neutrons can be captured by nuclei or undergo inelastic scattering, resulting in the emission of gamma rays at discrete energies unique to each element [1], [7]. Additionally, the decay of naturally occurring radioisotopes like $^{40}$K, $^{232}$Th, and $^{238}$U produces distinct gamma-ray lines [2].

**Capabilities and Instrumentation:**
Instruments such as Gamma-Ray Spectrometers (GRS) and Neutron Spectrometers (NS) are typically carried on orbiting spacecraft or landers. For example, neutron spectroscopy is highly sensitive to hydrogen-bearing compounds, as hydrogen is exceptionally effective at moderating (slowing down) neutrons, allowing for the mapping of water ice or hydrated minerals [7], [47]. GRS can provide absolute mass percentages of elements with uncertainties often below 5% for certain species [25].

### 2.2 Reflectance and Emission Spectroscopy (UV-VIS-IR)
Reflectance spectroscopy analyzes sunlight reflected from a body's surface, while emission spectroscopy measures the thermal radiation emitted by the body itself. These techniques are the workhorses for mineralogical and molecular characterization [8], [14].

**Visible and Near-Infrared (VNIR):**
VNIR spectroscopy (typically 0.4 to 2.5 $\mu\text{m}$) is sensitive to electronic transitions in transition metal ions (especially $\text{Fe}^{2+}$) and vibrational overtones of molecular bonds (e.g., O-H, C-H) [19], [21]. It is extensively used to identify silicates like olivine and pyroxene on asteroids, as well as water ice and organics [21], [28], [32]. The Dawn mission, for instance, used VNIR spectroscopy to map the differentiated crust and mantle of Vesta, revealing regional variations in eucritic and diogenitic components [28]. 

For small bodies, the slope of the spectral continuum (the "redness") and the presence of specific absorption bands (e.g., the 1-micron and 2-micron bands for pyroxenes) allow researchers to correlate asteroids with specific meteorite groups, such as Howardite-Eucrite-Diogenite (HED) meteorites for V-type asteroids [28], [40]. The "space weathering" effect, caused by solar wind and micrometeorite bombardment, typically reddens and darkens the spectra of airless bodies, complicating the direct interpretation of mineral chemistry [26], [39].

**Thermal and Mid-Infrared (MIR):**
Mid-infrared observations (3 to 25 $\mu\text{m}$) probe the fundamental vibrational modes of minerals and molecules. This range is particularly useful for identifying the "Reststrahlen bands" of silicates and the diagnostic features of organic matter [17], [60]. In cometary studies, infrared spectroscopy has revealed the presence of volatiles like $CO_2$, CO, and various hydrocarbons in the coma [5], [9]. Observations of the interstellar object 3I/ATLAS using JWST and other telescopes showed amorphous silicate emission, which indicated the object had not been processed at temperatures above 800 K [9].

**Radiometry and Radar:**
Beyond the infrared, radiometry measures thermal inertia and surface roughness, while radar provides insights into the bulk density and metallic content of near-Earth objects [6], [57]. These methods complement spectroscopic data by providing a physical context for the chemical information derived from light reflection [6].

### 2.3 Photometry and Polarimetry
When spectroscopic data are unavailable or have low signal-to-noise ratios, photometry and polarimetry provide essential proxies for composition.

*   **Photometry:** Measures the brightness of an object in broad or narrow wavelength bands. The resulting "color" and albedo (reflectivity) are used to classify asteroids into taxonomic complexes (C, S, M, etc.) [54], [58]. Recent taxonomic models have reintroduced visual albedo as a primary observable, allowing for the resolution of spectral degeneracies in the X-complex and establishing the P-class as a subset of the C-complex [58].
*   **Polarimetry:** Studies the polarization of light scattered by surface regolith or dust particles. The degree of linear polarization as a function of phase angle (the angle between the Sun, the object, and the observer) provides clues about surface texture, porosity, and the composition of carbonaceous or aqueous-altered materials [29], [41], [59]. For instance, optical spectropolarimetry of large C-complex asteroids has provided evidence for heterogeneous surface compositions linked to carbon's optical influence and aqueous alteration [29].

## 3. Active Remote Sensing and Directed Energy Techniques

### 3.1 Laser-Induced Breakdown Spectroscopy (LIBS) and Raman
Active techniques use an artificial energy source to excite the target material, providing higher spatial resolution and sensitivity than passive methods.

*   **LIBS:** A high-power pulsed laser (such as a Nd:YAG laser) is used to vaporize and electronically excite rock surfaces, creating a glowing plasma [27]. The emission spectrum of this plasma is analyzed to determine the absolute concentrations of major and minor elements [4], [27]. LIBS instruments have been deployed on surface rovers (e.g., on Mars) to provide precise point-by-point elemental maps [27].
*   **Raman Spectroscopy:** Employs a laser (e.g., at 532 nm) to detect mineralogy and organics through inelastic scattering [4], [12]. Raman is uniquely capable of identifying biomarkers and biogenic minerals at distances exceeding 100 meters [4]. When combined with fluorescence and lidar systems, these instruments can perform long-range atmospheric profiling and surface mineral mapping simultaneously [4].
*   **Photothermal Spectroscopy:** A more recent development for planetary science, photothermal spectroscopy measures mid-IR absorption by detecting the thermal expansion of a sample induced by a tunable laser, offering a way to characterize planetary materials with high sensitivity [60], [61].

### 3.2 Remote Laser Evaporative Molecular Absorption (R-LEMA)
Proposed for the exploration of cold solar system targets like asteroids, comets, and icy moons, R-LEMA (or R-LEMAS) uses a directed energy beam (~10 MW/m²) to melt and vaporize a spot to approximately 2,500 K [15], [18]. This process creates a high-temperature blackbody source and a molecular plume of ejected material. A spectrometer then views the heated spot through the plume; the resulting absorption lines reveal the bulk molecular and atomic composition [22], [30]. This method bypasses the surface-only limitation of reflectance spectroscopy by actively vaporizing the material to reveal deeper composition and creating spatial composition maps by scanning the surface [18], [22].

## 4. In-Situ Analysis and Laboratory Characterization

### 4.1 Mass Spectrometry and Gas Chromatography
Direct measurement of material via landers or atmospheric probes offers the most precise chemical data. 

*   **Mass Spectrometry (MS):** Instruments like Time-of-Flight (TOF) mass spectrometers identify ions or molecules based on their mass-to-charge ratio [5], [49]. In-situ systems often use X-ray, charged particle, or neutron excitation sources to probe surface materials on stationary or roving missions [11].
*   **Gas Chromatography (GC):** Often coupled with mass spectrometry (GC-MS), this technique is vital for analyzing volatile molecules, isotopes, and evolved gases in planetary atmospheres or cometary comae [5], [20], [44]. In situ measurements in the atmospheres of planets like Jupiter or Venus can detect droplets, particles, and isotopic abundance ratios that provide constraints on the body's origin [20].
*   **Secondary Ion Mass Spectrometry (SIMS):** Remote SIMS uses the solar wind to sputter ions from a target's surface, which are then detected by a spacecraft to determine the elemental and isotopic composition of the Moon or asteroids [43].

### 4.2 Sample Return and Meteoritic Analogs
The analysis of returned samples—such as the Ryugu asteroid samples from Hayabusa2 or cometary dust from Stardust—provides the "ground truth" needed to calibrate all other remote sensing data [12], [62]. These materials are analyzed in terrestrial laboratories using:
*   **Microscopic Mapping:** Instruments like the Bruker Hyperion 2000 map mineralogy and organics at spatial resolutions down to 50 $\mu\text{m}$ [12].
*   **Confocal Raman Microscopy:** Detects mineralogical and organic diversity at the micron scale [12].
*   **Bulk Chemistry Analysis:** Techniques like X-ray fluorescence (XRF) and Scanning Electron Microscopy (SEM) with Energy Dispersive X-ray (EDX) maps analyze microstructures and elemental abundances [12].

Meteorites found on Earth, particularly carbonaceous chondrites, serve as primary analogs for low-albedo asteroids [38], [55]. Laboratory measurements of meteorites, such as the Reflectance Experiment Laboratory (RELAB) catalog, are used to build models that estimate bulk carbon and hydrogen content from the 3-micron absorption feature in asteroid spectra [17].

## 5. Exoplanetary and Stellar Compositional Inference

### 5.1 Transmission and Emission Spectroscopy
The chemical characterization of exoplanets is largely dependent on observations during transits and eclipses.

*   **Transmission Spectroscopy:** As a planet transits its host star, starlight filters through the atmosphere, allowing for the detection of species like $\text{H}_2\text{O}$, $\text{CO}_2$, $\text{SO}_2$, $\text{CH}_4$, and Na [23], [24]. Recent JWST observations have probed the $0.69\ \mu\text{m}$ to $5.3\ \mu\text{m}$ range to search for biosignatures in Earth-like planets around M-dwarfs like TRAPPIST-1 e [23].
*   **Emission Spectroscopy:** Measures the thermal emission of a planet during a secondary eclipse. This technique has been used to identify refractory species like aluminum oxide in ultra-hot Jupiters like WASP-33 b [31]. For rocky exoplanets, secondary eclipse observations at 12.8 and 15.0 $\mu\text{m}$ are used to probe surface composition, though these are limited by uncertainties in the host star's spectrum [3].

### 5.2 Stellar Abundances as Proxies
A major method for concluding the composition of exoplanets involves high-precision spectroscopic analysis of their host stars. This approach assumes that the planet's bulk chemical makeup is related to the primordial composition of the protoplanetary disk, as reflected in the star's atmosphere [10], [45].

*   **Differential Abundance Analysis:** By performing line-by-line comparisons between a planet-hosting star and a "solar twin" without planets, researchers can detect subtle depletion or enrichment patterns [45]. For example, the Sun is known to be depleted in refractory elements compared to many solar twins, a signature hypothesized to be linked to the formation of terrestrial planets [45].
*   **Galactic Archaeology:** Surveys like GALAH use large-scale spectroscopic data to refine the chemical properties of stars targeted by TESS, helping to link galactic chemical evolution to the types of planets formed [48].
*   **Polluted White Dwarfs:** These stars provide a unique observational window into exoplanet interiors. When a rocky body is disrupted and accreted by a white dwarf, its elements (e.g., Fe, Mg, Si, O) appear in the star's spectrum [35], [42]. Machine learning pipelines like `cecilia` are used to measure these metal abundances, effectively performing a post-mortem chemical analysis of destroyed planetary systems [35].

### 5.3 Atmospheric Retrieval and Internal Modeling
Because exoplanets cannot be resolved, their composition is "retrieved" by fitting atmospheric models to observations.

*   **Retrieval Codes:** Tools like Ariel and ExoPlex use Bayesian statistics to explore the parameter space of chemical abundances and physical structures [46], [50]. ExoPlex specifically models the core, mantle, and water layers of rocky planets (0.1 to 5 Earth masses) based on host star compositions [50].
*   **Degeneracies and Uncertainties:** A significant challenge is that mass and radius measurements alone provide only first-order estimates of internal structure [50]. Models are often degenerate, meaning different chemical compositions can result in the same observed mass and radius [24]. Furthermore, the precision of interior parameters is highly sensitive to the uncertainties in the observational data [51], [53].

## 6. Findings and Comparative Analysis

The effectiveness of a compositional method depends on the target's nature and the desired depth of information. Nuclear spectroscopy is superior for determining bulk elemental abundances in the top meter of airless bodies but lacks the spatial resolution of VIR imaging spectroscopy [1], [8]. VIR spectroscopy is highly effective for mineralogical mapping but is sensitive only to the uppermost microns of the surface, making it susceptible to "space weathering" effects that can alter spectral slopes and mask diagnostic features [26], [40].

Active methods like LIBS and R-LEMA offer a solution to surface sensitivity and spatial resolution but require high power and proximity [22], [27]. In the exoplanetary field, the primary finding is the extreme model-dependence of results; uncertainties in stellar models can prevent the distinction between different bare surface types (e.g., basalt vs. Fe-oxidized) [3].

| Method | Target Type | Depth | Key Elements/Species | Primary Limitation |
| :--- | :--- | :--- | :--- | :--- |
| GRS / Neutron | Planets, Small Bodies | ~1 m | Fe, Mg, Si, K, Th, U, H | Coarse spatial resolution [8] |
| VIR Reflectance | Asteroids, Moons | <1 mm | Olivine, Pyroxene, Ices | Space weathering effects [26] |
| LIBS / Raman | In-situ (Mars, Moon) | Point | Major/Minor elements, Minerals | Power/Proximity required [27] |
| Transmission Spec | Exoplanets | Atmosphere | $\text{H}_2\text{O}$, $\text{CO}_2$, Na, $\text{CH}_4$ | Cloud/Aerosol obscuration [37] |
| R-LEMA | Remote (Airless) | ~cm-m | Bulk atoms/molecules | High directed energy needed [15] |

## 7. Limitations of the Evidence

A significant limitation in concluding the elements of astrobodies is the degeneracy of remote sensing data. For instance, multiple mineral mixtures can produce similar reflectance spectra, a problem often addressed using statistical methods or neural networks, though these are limited by the quality of training sets [34], [38].

In exoplanet studies, the "curse of clouds" significantly hinders the detection of molecular features in transmission spectra [37]. Furthermore, the reliance on 1D radiative transfer models often fails to capture the 3D complexity of planetary atmospheres [10]. For small bodies, the inability to separate the nucleus signal from dust and gas in remote observations can lead to inaccurate abundance estimates [5].

## 8. Future Directions and Research Gaps

Progress in this field is driven by advancements in instrumentation and data processing. Future missions will likely employ:
*   **Focusing X-ray Optics:** Like MiXO, which uses Wolter-I optics to enable high-resolution elemental mapping of asteroids and comets [33].
*   **Machine Learning:** To improve isotopic abundance refinements and automate the classification of large photometric surveys [52], [58].
*   **Sample Return:** Expanding to non-cryogenic comet nucleus samples to preserve volatile and organic structures [63].

Research gaps remain in understanding how aqueous alteration and space weathering impact the spectral signatures of complex organics [17], [63]. Additionally, there is a need for more comprehensive laboratory reference catalogs for minerals and organics under extreme space conditions [14], [56].

## 9. Conclusion

The elemental characterization of astronomical bodies relies on a synergistic application of remote, in-situ, and laboratory techniques. While passive spectroscopy provides the broad context for millions of objects across the galaxy, active and in-situ methods provide the high-fidelity data needed for geochemical and astrobiological assessments. The integration of advanced modeling—informed by stellar abundances and laboratory analogs—continues to refine our understanding of the chemical diversity of the universe. As instrumentation like JWST and future X-ray telescopes mature, the ability to conclude the specific elements of even the most distant astrobodies will transition from broad estimates to precise chemical cartography.

## References

[1]T. H. Prettyman, “Chapter 54 – Remote Sensing of Chemical Elements Using Nuclear Spectroscopy,” pp. 1161–1183, Jan. 2014, doi: 10.1016/B978-0-12-415845-0.00054-2.

[2]T. H. Prettyman, “Remote Chemical Sensing Using Nuclear Spectroscopy,” pp. 765–786, Jan. 2007, doi: 10.1016/B978-012088589-3/50045-1.

[3]T. Fauchez, E. Ducrot, B. V. Rackham, K. B. Stevenson, L. C. Mayorga, and J. de Wit, “Stellar Models Also Limit Exoplanet Atmosphere Studies in Emission,” Feb. 2025, doi: 10.3847/1538-4357/adf068.

[4]M. N. Abedin et al., “Mineralogy and Astrobiology Detection Using Laser Remote Sensing Instrument,” Applied Optics, vol. 54, no. 25, pp. 7598–7611, Sept. 2015, doi: 10.1364/AO.54.007598.

[5]J. Crovisier, “The molecular composition of comets and its interrelation with other small bodies of the Solar System,” vol. 1, pp. 133–152, Aug. 2005, doi: 10.1017/S174392130500671X.

[6]V. V. Busarev, “Spectrophotometry and Other Remote-Sensing Methods to Study Asteroids: Achievements and New Approaches,” Астрономический вестник, vol. 57, no. 1, pp. 55–70, Jan. 2023, doi: 10.31857/s0320930x23010012.

[7]K. J. Kim and N. Hasebe, “Nuclear Planetology: Especially Concerning the Moon and Mars,” Research in Astronomy and Astrophysics, vol. 12, no. 10, pp. 1313–1380, Oct. 2012, doi: 10.1088/1674-4527/12/10/001.

[8]W. Gao, T. J. Jackson, J. Wang, and N.-B. Chang, “Front Matter: Volume 8156,” Proceedings of SPIE, p. 815601, Sept. 2011, doi: 10.1117/12.913641.

[9]“Chemical and Spectroscopic Analysis of 3I/ATLAS (C/2025 N1 (ATLAS)),” Nov. 2025, doi: 10.5281/zenodo.17521082.

[10]C. M. Guimond, H. Wang, F. Seidler, P. A. Sossi, A. S. Mahajan, and O. Shorttle, “8 From Stars to Diverse Mantles, Melts, Crusts, and Atmospheres of Rocky Exoplanets,” pp. 259–300, Aug. 2024, doi: 10.1515/9781501520815-008.

[11]J. I. Trombka et al., “A Team Approach to the Development of Gamma Ray and x Ray Remote Sensing and in Situ Spectroscopy for Planetary Exploration Missions,” p. 26, Jan. 1993.

[12]A. Maturilli et al., “Linking remote sensing, in situ and laboratory spectroscopy for a Ryugu analog meteorite sample,” Frontiers in space technologies, vol. 3, Oct. 2022, doi: 10.3389/frspt.2022.1023393.

[13]P. E. Clark, L. G. Evans, and J. I. Trombka, “Remote geochemical experiment package for Discovery class missions,” p. 267, Jan. 1994.

[14]G. Arnold, D. Kappel, L. Moroz, K. Markus, and J. Helbert, “Spaceborne VIR spectroscopy of small planetary bodies and inherent clues to their composition: a review and discussions of future requirements,” vol. 11128, p. 1112802, Sept. 2019, doi: 10.1117/12.2528287.

[15]G. B. Hughes et al., “Stand-off molecular composition analysis,” Proceedings of SPIE, vol. 9616, p. 961603, Sept. 2015, doi: 10.1117/12.2186795.

[16]M. Matsuoka, “In-Situ Planetary Spectroscopy”, doi: 10.1016/b978-0-08-102908-4.00071-0.

[17]H. Kaplan, R. E. Milliken, C. M. O. Alexander, and C. D. K. Herd, “Reflectance spectroscopy of insoluble organic matter (IOM) and carbonaceous meteorites,” Meteoritics & Planetary Science, vol. 54, no. 5, pp. 1051–1068, May 2019, doi: 10.1111/MAPS.13264.

[18]G. B. Hughes et al., “Directed energy stand-off molecular composition analysis,” pp. 1–9, Mar. 2017, doi: 10.1109/AERO.2017.7943811.

[19]T. B. McCord and M. J. Gaffey, “Asteroids: Surface Composition from Reflection Spectroscopy,” Science, vol. 186, no. 4161, pp. 352–355, Oct. 1974, doi: 10.1126/SCIENCE.186.4161.352.

[20]Th. Encrenaz and M. Combes, “The composition of planetary atmospheres,” vol. 96, pp. 1–33, Jan. 1981, doi: 10.1017/S0074180900075112.

[21]J. M. Sunshine and C. M. Pieters, “Determining the composition of olivine on asteroidal surfaces,” p. 1379, Jan. 1993.

[22]G. B. Hughes et al., “Remote laser evaporative molecular absorption spectroscopy,” Proceedings of SPIE, vol. 9981, p. 12, Sept. 2016, doi: 10.1117/12.2242730.

[23]D. S. Duque-Castaño, J. I. Zuluaga, and L. M. F. Torres, “Machine-assisted classification of potential biosignatures in earth-like   exoplanets using low signal-to-noise ratio transmission spectra,” July 2024, doi: 10.48550/arxiv.2407.19167.

[24]E. M.-R. Kempton and H. A. Knutson, “Transiting Exoplanet Atmospheres in the Era of JWST,” Apr. 2024, doi: 10.48550/arxiv.2404.15430.

[25]C. Yaping, Y. Yong, and G. Wanlei, “New methods for studying the composition of asteroids”, doi: 10.16708/j.cnki.1000-758x.2023.0080.

[26]J. de León, J. Licandro, M. Serra-Ricart, N. Pinilla-Alonso, and H. Campins, “Observations, compositional, and physical characterization of near-Earth and Mars-crosser asteroids from a spectroscopic survey,” Astronomy and Astrophysics, vol. 517, July 2010, doi: 10.1051/0004-6361/200913852.

[27]J. Blacic, D. Pettit, D. Cremers, and N. Roessler, “Laer-induced Breakdown Spectroscopy Instrument for Element Analysis of Planetary Surfaces,” Jan. 1993.

[28]M. C. D. Sanctis et al., “Spectroscopic Characterization of Mineralogy and Its Diversity Across Vesta,” Science, vol. 336, no. 6082, pp. 697–700, May 2012, doi: 10.1126/SCIENCE.1219270.

[29]Y. G. Kwon, S. Bagnulo, and A. Cellino, “Optical spectropolarimetry of large C-complex asteroids: polarimetric evidence for heterogeneous surface compositions,” Jan. 2023, doi: 10.48550/arxiv.2307.15441.

[30]G. B. Hughes and P. Lubin, “Molecular Composition Analysis of Distant Targets,” Feb. 2017.

[31]C. von Essen et al., “An optical transmission spectrum of the ultra-hot Jupiter WASP-33 b. First indication of aluminum oxide in an exoplanet,” Astronomy and Astrophysics, vol. 622, Feb. 2019, doi: 10.1051/0004-6361/201833837.

[32]J. de León, N. Pinilla-Alonso, J. Licandro, H. Campins, and G. A. Marzo, “Near-infrared spectroscopic survey of B-type asteroids: Compositional analysis,” vol. 2011, p. 526, Oct. 2011, [Online]. Available: https://www.sciencedirect.com/science/article/pii/S0019103511004519

[33]J. Hong, S. Romaine, and  the M. team, “Miniature lightweight x-ray optics (MiXO) for surface elemental composition mapping of asteroids and comets,” Jan. 06, 2016. doi: 10.1186/s40623-016-0409-1.

[34]K. David, P. Antti, K. Arto, and K. Tomáš, “Neural network for determining an asteroid mineral composition from reflectance spectra,” Oct. 2022, doi: 10.48550/arxiv.2210.01006.

[35]M. Badenas-Agusti et al., “cecilia: A Machine Learning-Based Pipeline for Measuring Metal Abundances of Helium-rich Polluted White Dwarfs,” Monthly Notices of the Royal Astronomical Society, vol. abs/2402.05176, Feb. 2024, doi: 10.1093/mnras/stae421.

[36]K. Matchev, K. I. Matcheva, and A. Roman, “Transverse Vector Decomposition Method for Analytical Inversion of Exoplanet Transit Spectra,” The astrophysical journal, vol. 939, no. 2, pp. 95–95, Mar. 2022, doi: 10.3847/1538-4357/ac82f3.

[37]J. K. Barstow, “The curse of clouds,” Astronomy & Geophysics, vol. 62, no. 1, Feb. 2021, doi: 10.1093/ASTROGEO/ATAB044.

[38]H. Miyamoto et al., “Reflectance spectra of Asteroids and Meteorites: their classifications and statistical comparisons,” vol. 1036, no. 1, p. 012003, June 2018, doi: 10.1088/1742-6596/1036/1/012003.

[39]M. J. Gaffey, T. H. Burbine, and R. P. Binzel, “Asteroid spectroscopy: Progress and perspectives,” Meteoritics, vol. 28, no. 2, pp. 161–187, June 1993, doi: 10.1111/J.1945-5100.1993.TB00755.X.

[40]C. M. Pieters and L. A. McFadden, “METEORITE AND ASTEROID REFLECTANCE SPECTROSCOPY: Clues to Early Solar System Processes,” Annual Review of Earth and Planetary Sciences, vol. 22, no. 1, pp. 457–497, Jan. 1994, doi: 10.1146/ANNUREV.EA.22.050194.002325.

[41]A. C. Levasseur-Regourd, “Inferring properties of dust within small bodies of the solar system through observations and simulations of the linear polarization of scattered solar light,” pp. 295–312, Jan. 2011, doi: 10.1007/978-94-007-1636-0_12.

[42]B. T. Gaensicke et al., “The bulk composition of exo-planets,” arXiv: Earth and Planetary Astrophysics, May 2015.

[43]H. O. Funsten, R. C. Elphic, B. L. Barraclough, D. J. McComas, K. R. Moore, and J. E. Nordholt, “Lunar and asteroid composition assessment using remote secondary ion mass spectrometry,” pp. 15–20, Dec. 1992.

[44]T. D. Swindle et al., “Isotopic Analysis and Evolved Gases,” Jan. 1996.

[45]L. A. Aguirre, “Detailed analysis of the chemical composition of stars harboring Earth-like planets,” Jan. 2019.

[46]M. Nikku, “Atmospheric Retrieval of Exoplanets,” Mar. 2022, doi: 10.48550/arxiv.1808.04824.

[47]D. J. Lawrence et al., “Improved modeling of Lunar Prospector neutron spectrometer data: Implications for hydrogen deposits at the lunar poles,” Journal of Geophysical Research, vol. 111, Aug. 2006, doi: 10.1029/2005JE002637.

[48]J. T. Clark et al., “The GALAH Survey: using galactic archaeology to refine our knowledge of TESS target stars,” Monthly Notices of the Royal Astronomical Society, vol. 504, no. 4, pp. 4968–4989, July 2021, doi: 10.1093/MNRAS/STAB1052.

[49]M. Tulej et al., “Towards In-Situ Geochemical Analysis of Planetary Rocks and Soils by Laser Ablation/Ionisation Time-of-Flight Mass Spectrometry,” Universe, vol. 8, no. 8, pp. 410–410, Aug. 2022, doi: 10.3390/universe8080410.

[50]Lorenzo and A. Miguel, “ExoPlex: a new Python library for detailed modeling of rocky exoplanet internal structure and mineralogy,” p. 25, Jan. 2018.

[51]M. Plotnykov and D. Valencia, “Observation uncertainty effects on the precision of interior planetary parameters,” Monthly Notices of the Royal Astronomical Society, Apr. 2024, doi: 10.1093/mnras/stae993.

[52]H. Sun, “Machine Learning Refinements to Metallicity-Dependent Isotopic   Abundances,” Mar. 2024, doi: 10.48550/arxiv.2403.02678.

[53]M. Plotnykov and D. Valencia, “Effects of observation uncertainty on interior parameters precision ,” July 2025, doi: 10.5194/epsc-dps2025-1755.

[54]J.-Y. Li, P. Helfenstein, B. J. Buratti, D. Takir, and B. E. Clark, “Asteroid Photometry,” arXiv: Earth and Planetary Astrophysics, Feb. 2015, doi: 10.2458/AZU_UAPRESS_9780816532131-CH007.

[55]P. Beck et al., “Hydrous Mineralogy of CM and CI Chondrites from Infrared Spectroscopy and Their Relationship with Low Albedo Asteroids,” no. 1533, p. 1586, Mar. 2010, [Online]. Available: https://www.sciencedirect.com/science/article/pii/S001670371000298X

[56]J. A. Grier and A. S. Rivkin, “Comparing Sample and Remote-Sensing Data—Understanding Surface Composition,” pp. 95–119, Jan. 2019, doi: 10.1016/B978-0-12-809279-8.00005-6.

[57]M. K. Shepard, “Introduction to Planetary Photometry,” Apr. 2017.

[58]M. Mahlke, B. Carry, and P.-A. Mattei, “Asteroid Taxonomy from Cluster Analysis of Spectrometry and Albedo,” Mar. 21, 2022. doi: 10.1051/0004-6361/202243587.

[59]S. Bagnulo, I. Belskaya, A. Cellino, and L. Kolokolova, “Polarimetry of small bodies and satellites of our Solar System,” European Physical Journal Plus, vol. 132, no. 9, p. 405, Sept. 2017, doi: 10.1140/EPJP/I2017-11690-6.

[60]C. T. Cox, J. Haynes, C. Duffey, C. Bennett, and J. Brisset, “Photothermal Spectroscopy for Planetary Sciences: A Characterization of Planetary Materials in the Mid-IR,” Nov. 21, 2024. [Online]. Available: https://arxiv.org/abs/2411.13759v1

[61]C. Cox, J. Haynes, C. Duffey, C. Bennett, and J. Brisset, “Photothermal Spectroscopy for Planetary Sciences: Mid-IR Absorption Made Easy,” Sept. 18, 2024. [Online]. Available: https://arxiv.org/abs/2409.11626v1

[62]T. Yokoyama et al., “The Chemical Composition of Ryugu: Prospects as a Reference Material for   Solar System Composition,” May 2024, doi: 10.48550/arxiv.2405.04500.

[63]K. Nakamura-Messenger et al., “The Case for Non-Cryogenic Comet Nucleus Sample Return,” Sept. 30, 2020. [Online]. Available: https://arxiv.org/abs/2009.14366v1
