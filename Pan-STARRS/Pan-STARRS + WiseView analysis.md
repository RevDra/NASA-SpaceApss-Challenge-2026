# Integrating **Pan-STARRS and WiseView** Data

Pan-STARRS optical imaging and WiseView inspection of WISE time-series images provide complementary evidence for discovering and characterizing faint, moving astronomical sources. The survey below develops the proposed framework while distinguishing candidate selection, motion confirmation, spectral classification, and physical characterization.

## Abstract

Joint optical–infrared analysis combines Pan-STARRS1’s multiband imaging and astrometry with WISE’s sensitivity to cold objects and long temporal baseline. Epochal unWISE coadds extend motion searches approximately 1.3 magnitudes below single-exposure limits, while CatWISE and unTimely provide complementary motion and epoch-detection catalogs (Meisner et al., 2018; Marocco et al., 2021; Meisner et al., 2023). WiseView supports visual examination, including discovery of candidate comoving systems (Rothermich et al., 2024). Published searches demonstrate substantial discovery potential, but optical dropouts and apparent motion do not establish brown-dwarf identity independently of measurement validation and classification. The strongest framework combines epoch-aware association, calibrated photometry, quantitative astrometry, image inspection, spectroscopy, and completeness modeling.

## 1. Introduction

The central opportunity is not simply combining “static optical” and “dynamic infrared” observations: **both surveys contain temporal information**. Pan-STARRS1 DR2 includes individual-epoch detections and forced photometry, whereas its stacked products summarize the deeper sky (Chambers et al., 2016). Its multiepoch astrometry supports proper motions and parallaxes that help distinguish nearby ultracool dwarfs from background contaminants (Best et al., 2017).

WISE supplies all-sky observations in bands centered at 3.4, 4.6, 12, and 22 μm, with angular resolutions of 6.1, 6.4, 6.5, and 12 arcseconds, respectively (Wright et al., 2010). NEOWISE reactivation resumed observations at the two shortest wavelengths without significant degradation relative to the earlier post-cryogenic performance (Mainzer et al., 2014). Final full-depth unWISE maps incorporate observations spanning January 2010–July 2024, rather than an indefinitely continuing mission (Meisner et al., 2026).

The scientific scope extends beyond isolated brown dwarfs. Joint datasets reveal low-mass companions, young association members, metal-poor populations, and variable sources, but these applications require different selection and validation strategies (Deacon et al., 2014; Best et al., 2017; Burgasser et al., 2025; Paz et al., 2026).

## 2. Literature Review

### 2.1 Survey and Catalog Infrastructure

The literature separates observing missions, image-processing products, catalogs, and visualization software. Treating these as interchangeable obscures their different selection functions.

| Resource | Scientific Role | Principal Qualification | Citations |
|---|---|---|---|
| PS1 stacks and DR2 | Optical imaging and epoch measurements | DR2 supersedes earlier products | (Flewelling et al., 2020) |
| unWISE | Resolution-preserving coadded imaging | Not super-resolution imaging | (Lang, 2014) |
| unWISE catalog | Deep static infrared source measurements | Simultaneous crowded-field source modeling | (Schlafly et al., 2019) |
| CatWISE Preliminary | Joint position, flux, and motion fitting | Measurements use epoch coadds | (Eisenhardt et al., 2020) |
| CatWISE2020 | All-sky infrared motion catalog | Approximately 1.89 billion sources | (Marocco et al., 2021) |
| unTimely | Independent epochal source detections | Low detection thresholds require vetting | (Meisner et al., 2023) |
| WiseView | Configurable visual time-series inspection | Supports, rather than replaces, measurement | (Rothermich et al., 2024) |

**Figure 1:** Complementary roles of optical and infrared data products

Full-depth processing progressively incorporated first-year reactivation data, approximately three years of imaging, five-year products, and eight-year products (Meisner et al., 2016; Meisner et al., 2017; Meisner et al., 2019; Meisner et al., 2022). These releases should not be assigned identical depths or temporal coverage.

### 2.2 Discovery Evidence

Early PS1–2MASS–WISE integration identified a T8 dwarf with proper motion approximately 2.56 arcseconds per year (Liu et al., 2011). Initial PS1–WISE L/T-transition searches found seven objects at estimated distances of 9–15 pc (Best et al., 2013). The expanded search produced 130 ultracool discoveries, including 79 objects classified L6–T4.5 (Best et al., 2015).

Motion-selected searches provide a complementary route. The first NEOWISE-reactivation survey identified 20,548 high-proper-motion objects, including 1,006 new discoveries (Schneider et al., 2016). Backyard Worlds demonstrated visual discovery below single-exposure sensitivity using animations constructed from difference images (Kuchner et al., 2017).

These results establish multiple successful approaches—not one universally standard dropout pipeline.

## 3. Theoretical Foundations

### 3.1 Astrometry and Kinematics

Define total proper motion as

$\mu=\sqrt{(\mu_\alpha\cos\delta)^2+\mu_\delta^2}.$

A useful local astrometric model is

$\boldsymbol{\theta}(t)=
\boldsymbol{\theta}_0+
\boldsymbol{\mu}(t-t_0)+
\varpi\boldsymbol{P}(t)+
\boldsymbol{\epsilon}(t),$

where position, proper motion, parallax, and measurement residuals remain distinct quantities.

**Motion is not a direct distance measurement or spectral classification.** Spectroscopic follow-up of motion-selected candidates found M, L, and T dwarfs, including subdwarfs (Greco et al., 2019). High transverse velocities also occur among thick-disk and halo candidates (Luhman & Sheppard, 2014).

Independent astrometry is particularly valuable: Spitzer detections aligned with WISE trajectories helped distinguish genuine motion from WISE-specific false positives (Meisner et al., 2020).

### 3.2 Radiation and Atmospheric Colors

Wien’s law,

$\lambda_{\max}T=b,$

provides intuition about temperature, but brown-dwarf spectra require molecular and cloud physics. Methane absorption suppresses W1 relative to W2, supporting red-color selection (Castro et al., 2013). Water, methane, and ammonia shape Y-dwarf spectra (Lacy & Burrows, 2023).

W2 is therefore not universally a blackbody peak. Observations reveal nonequilibrium CO across approximately 250–750 K (Miles et al., 2020). Disequilibrium models explicitly vary temperature, gravity, and atmospheric mixing (Karalidi et al., 2021). Modified atmospheric temperature gradients improve some cold-dwarf spectral-energy-distribution fits, while conventional models retain substantial discrepancies (Leggett et al., 2021).

Nor are brown dwarfs universally invisible optically: PS1 detected 494 L dwarfs in its \(r\) band (Best et al., 2017).

### 3.3 Photometry and Signal Processing

For independent, comparable exposures,

$SNR_{stack} \approx \sqrt{N} * SNR_{single}$,
$\Delta m\approx1.25\log_{10}N.$

Typical WISE visits contain approximately 12 exposures over one day, recurring roughly every six months (Meisner et al., 2018). Epochal stacking gains approximately 1.3 magnitudes but averages away variability on timescales shorter than about one day (Meisner et al., 2018).

Difference imaging can be represented as

$D=I_t-(I_{\rm ref}*K),$

with \(K\) matching image responses. Visual inspection and difference imaging are complementary: Backyard Worlds explicitly combines them (Kuchner et al., 2017).

## 4. Data Acquisition and Analysis

### 4.1 Pan-STARRS Retrieval and Calibration

PS1 observed north of declination −30° in five filters, with median angular resolution approximately 1.1 arcseconds (Best et al., 2017). Mean stacked five-sigma limits are approximately 23.3, 23.2, 23.1, 22.3, and 21.4 magnitudes in \(grizy\) (Chambers et al., 2016).

Its photometric system includes measured instrumental and atmospheric passbands tied to CALSPEC standards (Tonry et al., 2012). Early repeat-observation calibration achieved roughly 10-millimagnitude relative precision (Schlafly et al., 2012). Subsequent calibration established a bright-source single-measurement astrometric floor of approximately 16 mas (Magnier et al., 2020).

However, recalibration found spatial offsets exceeding 1% and crowded-plane errors reaching approximately 0.04 magnitudes (Xiao & Yuan, 2022; Xiao et al., 2023). Gaia-based corrections reduced median PS1 positional residuals from 13.5 to 9.0 mas for matched point sources (Lubow et al., 2020).

### 4.2 Recommended Processing Sequence

The following sequence separates published capabilities from proposed implementation choices.

| Stage | Recommended Analysis | Evidence-Based Rationale | Citations |
|---|---|---|---|
| Retrieve optical data | Preserve epochs, masks, variances | PS1 distributes ancillary stack products | (Flewelling et al., 2020) |
| Select photometry | Distinguish chip and warp measurements | Accuracy and depth differ | (Best et al., 2017) |
| Screen faint detections | Inspect image-level reality | Warp-limit noise detections occur | (Best et al., 2017) |
| Choose infrared product | Match product to temporal objective | Full-depth maps sacrifice temporal information | (Meisner et al., 2018) |
| Inspect animations | Record display and epoch settings | WiseView permits configurable inspection | (Rothermich et al., 2024) |
| Fit trajectories | Use quantitative multiepoch astrometry | Catalog motion accuracy depends on brightness | (Marocco et al., 2021) |
| Validate externally | Add independent infrared astrometry | UHS provides precise complementary motions | (Schneider et al., 2023) |

**Figure 2:** Reproducible stages for joint optical infrared source analysis

Fixed-radius matching is insufficient across long baselines: nearby dwarfs have been overlooked through blending and cross-survey association failures (Bihain et al., 2013). Earlier almost-contemporaneous PS1–WISE work explicitly recognized positional matching failures for the fastest sources (Best et al., 2013). Modern multisurvey compilations retain coordinates and observing epochs alongside photometry (Gagliuffi et al., 2019).

Exact WiseView URL meanings, sliding-window algorithms, and claims that PS1 stacks are median combinations are not established by the supplied excerpts; they require version-specific documentation.

### 4.3 Classification and Follow-up

Photometric typing achieved approximately one-subtype accuracy in a calibrated sample, but peculiar blue L dwarfs and red late-M dwarfs introduced classification biases (Skrzypek et al., 2016). Empirical PS1-based spectral-energy distributions and typical colors provide broader reference sequences (Best et al., 2017).

Parallax follow-up supplies distance constraints unavailable from blinking alone: UKIRT measured 348 L/T dwarfs with median parallax uncertainty 3.5 mas (Best et al., 2020). USNO observations achieved median parallax uncertainty 1.51 mas for 173 objects (Vrba et al., 2026).

Gaia provides the reference frame and exceptional precision for detectable sources, but not complete coverage of faint ultracool populations (Lindegren et al., 2020; Karpov et al., 2025). Gaia DR3 retains EDR3’s astrometry rather than providing a new independent astrometric realization (Vallenari et al., 2022).

## 5. Interpretation and Scientific Applications

### 5.1 Population-Specific Findings

| Population or Problem | Distinct Finding | Interpretive Consequence | Citations |
|---|---|---|---|
| Earliest WISE discoveries | Spectroscopy verified six Y dwarfs | Classification anchored beyond colors | (Kirkpatrick et al., 2011) |
| Diverse T dwarfs | 32% showed suppressed K-band flux | Standard spectra underrepresent diversity | (Mace et al., 2013) |
| Extremely cold candidates | W2 motion without firm W1 detection | Preserve one-band infrared candidates | (Meisner et al., 2020) |
| Backyard Worlds cold sample | 75 discoveries had quantitative motion confirmation | Visual discovery requires measurement | (Meisner et al., 2020) |
| Very cold individual objects | Extremely red colors suggested approximately 300 K | Temperature remained calibration-dependent | (Gagliuffi et al., 2020) |
| Young ultracool dwarfs | Low-gravity objects occupy distinct sequences | Field templates are insufficient | (Liu et al., 2016) |
| Young planetary analogs | Gravity and color lack one-to-one age correspondence | Redness does not establish youth | (Faherty et al., 2016) |
| Extremely red L/T objects | Spectroscopy identified low gravity | Unusual colors need physical validation | (Schneider et al., 2023) |
| Red L-dwarf searches | 47 of 50 candidates spectroscopically confirmed | Targeted selection can be productive | (Schneider et al., 2017) |
| Extreme T subdwarfs | Models failed to reproduce all spectral features | Metallicity inference retains uncertainty | (Schneider et al., 2020) |
| Kinematically extreme subdwarfs | Extreme reduced motion accompanied mild metal deficiency | Velocity is not metallicity | (Meisner et al., 2021) |
| Metallicity classification | New mild, ordinary, extreme T-subdwarf categories | Classification must accommodate composition | (Burgasser et al., 2025) |
| Wide companions | 89 new ultracool companion systems identified | Shared motion enables benchmark discovery | (Rothermich et al., 2024) |
| Brown-dwarf pairs | L1+T8 system separated approximately 341 au | Imaging reveals fragile multiple systems | (Faherty et al., 2020) |
| Spectral binaries | One candidate alternatively suggested variability | Composite spectra are not definitive | (Bravo et al., 2023) |
| Young moving groups | Most candidates still needed radial velocities | Membership needs fuller kinematics | (张周 et al., 2021) |

**Figure 3:** Population dependent findings shaping source classification and followup

### 5.2 Contamination and Variability

Optical absence does not prove low temperature. A quasar-candidate archive identified 63 brown dwarfs among 207 spectroscopic targets, demonstrating substantial overlap between selection spaces (Yang et al., 2024). JWST spectroscopy likewise identified brown dwarfs among high-redshift candidates (Tu et al., 2025). Subsequent imaging of two especially cold interlopers measured motions of 49 ± 8 and 24 ± 3 mas per year (Bradač et al., 2026).

Stationary red sources also exhibit infrared variability: narrow-line Seyfert 1 galaxies showed average multiyear amplitudes approximately 0.11 ± 0.07 magnitudes (Rakshit et al., 2018). VarWISE’s high-confidence catalog contains 457,080 variables (Paz et al., 2026). Optical fading combined with mid-infrared evolution also supported a failed-supernova interpretation for an Andromeda supergiant (De et al., 2026).

Thus, motion analysis and variability analysis should remain separate, complementary branches.

### 5.3 Automation and Completeness

An unTimely-based search found 258 previously unpublished moving objects, including at least 33 promising T-dwarf candidates (Karpov et al., 2025). Image-time-series segmentation recovered 94% of its specified nearby benchmark sample within the highest-ranked 0.01% of sky regions—not 94% completeness for all brown dwarfs (Caselden et al., 2026). Image-based PS1 detection recovered candidates missing catalog counterparts or key-band measurements (Liu et al., 2026). Tree-based classification can explicitly handle missing photometric features (Zhang & 李, 2025).

Population conclusions nevertheless depend on selection. A 20 pc census remained incomplete for ≥T8 objects and temperatures below 600 K (Kirkpatrick et al., 2021). Parallax-selected work found a statistically significant L/T color gap contrary to a particular model prediction (Best et al., 2020). Mass-function slopes near 0.6 recur, but inferred age distributions remain method-dependent (Kirkpatrick et al., 2019; Best et al., 2024).

## 6. Conclusion

Integrating Pan-STARRS and WiseView is a powerful discovery and triage strategy, not a self-sufficient proof of brown-dwarf identity. Its strongest implementation combines image-level validation, epoch-aware matching, quantitative motion fitting, calibrated spectral-energy distributions, and targeted follow-up.

### 6.1 Remaining Research Priorities

| Priority | Unresolved Issue | Productive Next Step | Citations |
|---|---|---|---|
| Coldest-object census | Incomplete population below approximately 400 K | Deeper motion searches and parallaxes | (Kirkpatrick et al., 2021) |
| Atmospheric interpretation | Clouds and disequilibrium remain partly degenerate | Broader wavelength spectroscopy | (Lacy & Burrows, 2023) |
| Physical parameters | Atmospheric and evolutionary estimates disagree | Benchmark-calibrated SED inference | (Sanghi et al., 2023) |
| Gravity diagnostics | Near-infrared colors have complex dependencies | Combine absolute W2 and longer wavelengths | (Leggett et al., 2025; Leggett & Tremblin, 2025) |
| Spectroscopic scaling | Numerous moving candidates remain unclassified | Motion-aware survey spectroscopy | (Schneider et al., 2026; Gagné et al., 2026) |

**Figure 4:** Research priorities for reliable multisurvey ultracool dwarf science

Panchromatic retrieval already demonstrates biases from restricted wavelength coverage (Vasist et al., 2025). Complementary optical–infrared products, including probabilistic Legacy Survey photometry, provide an established foundation for better joint modeling (Dey et al., 2019).

The enduring principle is straightforward: **colors identify possibilities, astrometry tests motion and distance, and follow-up establishes physical interpretation.**
 
_These search results were found and analyzed using Consensus, an AI-powered search engine for research. Try it at https://consensus.app. © 2026 Consensus NLP, Inc. Personal, non-commercial use only; redistribution requires copyright holders’ consent._
 
## References
 
Best, W. M. J., Magnier, E. A., Liu, M. C., Aller, K. M., Zhang, Z., Burgett, W. S., Chambers, K. C., Draper, P., Flewelling, H., Kaiser, N., Kudritzki, R. P., Metcalfe, N., Tonry, J. L., Wainscoat, R. J., & Waters, C. (2017). Photometry and Proper Motions of M, L, and T Dwarfs from the Pan-STARRS1 3π Survey. *The Astrophysical Journal Supplement Series, 234*, 1-1. https://doi.org/10.3847/1538-4365/aa9982
 
Best, W. M. J., Liu, M. C., Magnier, E. A., Bowler, B. P., Aller, K. M., Zhang, Z., Kotson, M. C., Burgett, W. S., Chambers, K. C., Draper, P. W., Flewelling, H., Hodapp, K. W., Kaiser, N., Metcalfe, N., Wainscoat, R. J., & Waters, C. (2017). A Search for L/T Transition Dwarfs with Pan-STARRS1 and WISE. III. Young L Dwarf Discoveries and Proper Motion Catalogs in Taurus and Scorpius–Centaurus. *The Astrophysical Journal, 837*, 95-95. https://doi.org/10.3847/1538-4357/aa5df0
 
Best, W. M. J., Liu, M. C., Magnier, E. A., Aller, K. M., Deacon, N. R., Dupuy, T. J., Redstone, J., Burgett, W. S., Chambers, K. C., Hodapp, K. W., Kaiser, N., Kudritzki, R., Morgan, J., Price, P. A., Tonry, J. L., & Wainscoat, R. J. (2013). A SEARCH FOR L/T TRANSITION DWARFS WITH Pan-STARRS1 ANDWISE: DISCOVERY OF SEVEN NEARBY OBJECTS INCLUDING TWO CANDIDATE SPECTROSCOPIC VARIABLES. *The Astrophysical Journal, 777*, 84-84. https://doi.org/10.1088/0004-637x/777/2/84
 
Best, W. M. J., Liu, M. C., Magnier, E. A., Deacon, N. R., Aller, K. M., Redstone, J., Burgett, W. S., Chambers, K. C., Draper, P., Flewelling, H., Hodapp, K. W., Kaiser, N., Metcalfe, N., Tonry, J. L., Wainscoat, R. J., & Waters, C. (2015). A SEARCH FOR L/T TRANSITION DWARFS WITH PAN-STARRS1 AND WISE . II. L/T TRANSITION ATMOSPHERES AND YOUNG DISCOVERIES. *The Astrophysical Journal, 814*, 118-118. https://doi.org/10.1088/0004-637x/814/2/118
 
Best, W. M. J., Liu, M. C., Magnier, E. A., & Dupuy, T. J. (2020). The Hawaii Infrared Parallax Program. IV. A Comprehensive Parallax Survey of L0–T8 Dwarfs with UKIRT. *The Astronomical Journal, 159*, 257-257. https://doi.org/10.3847/1538-3881/ab84f4
 
Best, W. M. J., Liu, M. C., Magnier, E. A., & Dupuy, T. J. (2020). A Volume-limited Sample of Ultracool Dwarfs. I. Construction, Space Density, and a Gap in the L/T Transition. *The Astronomical Journal, 161*, 42-42. https://doi.org/10.3847/1538-3881/abc893
 
Best, W. M. J., Sanghi, A., Liu, M. C., Magnier, E. A., & Dupuy, T. J. (2024). A Volume-limited Sample of Ultracool Dwarfs. II. The Substellar Age and Mass Functions in the Solar Neighborhood. *The Astrophysical Journal, 967*, 115-115. https://doi.org/10.3847/1538-4357/ad39ef
 
Bihain, G., Scholz, R. ‐., Storm, J., & Schnurr, O. (2013). An overlooked brown dwarf neighbour (T7.5 atd~ 5 pc) of the Sun and two additional T dwarfs at about 10 pc. *Astronomy and Astrophysics, 557*, A43-A43. https://doi.org/10.1051/0004-6361/201322141
 
Bradač, M., Willott, C. J., Asada, Y., Albert, L., Rihtaršič, G., Harshan, A., Judež, J., Martis, N. S., Ferrara, A., Hainline, K., A., Allingham, J. F. V., Bromm, V., Chisholm, J., Coe, D., Desprez, G., Diego, J. M., Faisst, A. L., Fujimoto, S., . . . Windhorst, R. A. (2026). Two Exciting High-redshift Galaxy Candidates Turn Out to Be Two Exciting Brown Dwarfs. *The Astrophysical Journal Letters, 1010*, L13-L13. https://doi.org/10.3847/2041-8213/ae9085
 
Bravo, A., Schneider, A. C., Gagliuffi, D. C. B., Burgasser, A. J., Meisner, A., Kirkpatrick, D. J., Faherty, J. K., Kuchner, M. J., Caselden, D., Sainio, A., & Hamlet, L. K. (2023). An Investigation of New Brown Dwarf Spectral Binary Candidates From the Backyard Worlds: Planet 9 Citizen Science Initiative. *The Astronomical Journal, 166*, 226-226. https://doi.org/10.3847/1538-3881/acffc1
 
Burgasser, A. J., Schneider, A. C., Meisner, A., Caselden, D., Hsu, C.-C., Gerasimov, R., Aganze, C., Softich, E., Karpoor, P. R., Theissen, C. A., Brooks, H., Bickle, T. P., Gagné, J., Artigau, É., Marsset, M., Rothermich, A. J., Faherty, J. K., Kirkpatrick, D. J., Kuchner, M. J., . . . Wędracki, Z. (2025). New Cold Subdwarf Discoveries from Backyard Worlds and a Metallicity Classification System for T Subdwarfs. *The Astrophysical Journal, 982*, 79-79. https://doi.org/10.3847/1538-4357/adb39f
 
Caselden, D., Kirkpatrick, D. J., Lack, L., White, A., Marocco, F., Meisner, A., Colin, G., Baller, B. R., Ammar, K., Bickle, T. P., Brooks, H., Casewell, S. L., Eisenhardt, P., Elachi, C. A., Faherty, J. K., Fowler, J. W., Gagliuffi, D. C. B., Gagné, J., Gelino, C. R., . . . Zurek, D. R. (2026). Astronomical Image Time Series Segmentation for Faint, Fast Object Detection. *The Astronomical Journal, 171*, 303-303. https://doi.org/10.3847/1538-3881/ae593c
 
Castro, P. J., Gizis, J. E., Harris, H. C., Mace, G. N., Kirkpatrick, D. J., McLean, I. S., Pattarakijwanich, P., & Skrutskie, M. F. (2013). DISCOVERY OF FOUR HIGH PROPER MOTION L DWARFS, INCLUDING A 10 pc L DWARF AT THE L/T TRANSITION,. *The Astrophysical Journal, 776*, 126-126. https://doi.org/10.1088/0004-637x/776/2/126
 
Chambers, K. C., Magnier, E. A., Metcalfe, N., Flewelling, H., Huber, M. E., Waters, C. Z., Denneau, L., Draper, P. W., Farrow, D. J., Finkbeiner, D. P., Holmberg, C., Koppenhoefer, J., Price, P. A., Rest, A., Saglia, R. P., Schlafly, E. F., Smartt, S. J., W., S., Wainscoat, R. J., . . . Wyse, R. F. Ġ. (2016). The Pan-STARRS1 Surveys. *arXiv (Cornell University), 223*, 2257776. https://doi.org/10.48550/arxiv.1612.05560
 
De, K., MacLeod, M., Jencson, J. E., Lovegrove, E., Antoni, A., Kara, E., Kasliwal, M. M., Lau, R. M., Loeb, A., Masterson, M., Meisner, A., Panagiotou, C., Quataert, E., & Simcoe, R. A. (2026). Disappearance of a massive star in the Andromeda Galaxy due to formation of a black hole. *Science, 391*, 689-693. https://doi.org/10.1126/science.adt4853
 
Deacon, N. R., Liu, M. C., Magnier, E. A., Aller, K. M., Best, W. M. J., Dupuy, T., Bowler, B. P., Mann, A. W., Redstone, J. A., Burgett, W. S., Chambers, K. C., Draper, P. W., Flewelling, H., Hodapp, K. W., Kaiser, N., Kudritzki, R.-P., Morgan, J., Metcalfe, N., Price, P. A., . . . Wainscoat, R. J. (2014). WIDE COOL AND ULTRACOOL COMPANIONS TO NEARBY STARS FROM Pan-STARRS 1. *The Astrophysical Journal, 792*, 119-119. https://doi.org/10.1088/0004-637x/792/2/119
 
Dey, A., Schlegel, D. J., Lang, D., Blum, R., Burleigh, K., Fan, X., Findlay, J. R., Finkbeiner, D. P., Herrera, D., Juneau, S., Landriau, M., Levi, M. E., McGreer, I. D., Meisner, A., Myers, A. D., Moustakas, J., Nugent, P., Patej, A., Schlafly, E. F., . . . Zhou, Z. (2019). Overview of the DESI Legacy Imaging Surveys. *The Astronomical Journal, 157*, 168-168. https://doi.org/10.3847/1538-3881/ab089d
 
Eisenhardt, P. R. M., Marocco, F., Fowler, J. W., Meisner, A., Kirkpatrick, D. J., Garcia, N., Jarrett, T. H., Koontz, R., Marchese, E. J., Stanford, A. S., Caselden, D., Cushing, M. C., Cutri, R. M., Faherty, J. K., Gelino, C. R., Gonzalez, A. H., Mainzer, A. K., Mobasher, B., Schlegel, D. J., . . . Wright, E. L. (2020). The CatWISE Preliminary Catalog: Motions from WISE and NEOWISE Data. *The Astrophysical Journal Supplement Series, 247*, 69-69. https://doi.org/10.3847/1538-4365/ab7f2a
 
Faherty, J. K., Riedel, A. R., Cruz, K. L., Gagné, J., Filippazzo, J., Lambrides, E., Fica, H. D., Weinberger, A. J., Thorstensen, J. R., Tinney, C. G., Baldassare, V., Lemonier, E., & Rice, E. L. (2016). POPULATION PROPERTIES OF BROWN DWARF ANALOGS TO EXOPLANETS*. *The Astrophysical Journal Supplement Series, 225*, 10-10. https://doi.org/10.3847/0067-0049/225/1/10
 
Faherty, J. K., Goodman, S., Caselden, D., Colin, G., Kuchner, M. J., Meisner, A., Gagné, J., Schneider, A. C., Gonzales, E. C., Gagliuffi, D. C. B., Logsdon, S. E., Allers, K., & Burgasser, A. J. (2020). WISE 2150-7520AB: A Very Low-mass, Wide Comoving Brown Dwarf System Discovered through the Citizen Science Project Backyard Worlds: Planet 9*. *The Astrophysical Journal, 889*, 176-176. https://doi.org/10.3847/1538-4357/ab5303
 
Flewelling, H. A., Magnier, E. A., Chambers, K. C., Heasley, J. N., Holmberg, C., Huber, M. E., Sweeney, W., Waters, C. Z., Calamida, A., Casertano, S., Chen, X., Farrow, D. J., Hasinger, G., Henderson, R., Long, K. S., Metcalfe, N., Narayan, G., Nieto-Santisteban, M. A., Norberg, P., . . . Shiao, B. (2020). The Pan-STARRS1 Database and Data Products. *The Astrophysical Journal Supplement Series, 251*, 7-7. https://doi.org/10.3847/1538-4365/abb82d
 
Gagliuffi, D. C. B., Burgasser, A. J., Schmidt, S. J., Theissen, C. A., Gagné, J., Gillon, M., Sahlmann, J., Faherty, J. K., Gelino, C. R., Cruz, K. L., Skrzypek, N., & Looper, D. L. (2019). The Ultracool SpeXtroscopic Survey. I. Volume-limited Spectroscopic Sample and Luminosity Function of M7−L5 Ultracool Dwarfs. *The Astrophysical Journal, 883*, 205-205. https://doi.org/10.3847/1538-4357/ab253d
 
Gagliuffi, D. B. C., Faherty, J. K., Schneider, A. C., Meisner, A., Caselden, D., Colin, G., Goodman, S., Kirkpatrick, D. J., Kuchner, M. J., Gagné, J., Logsdon, S. E., Burgasser, A. J., Allers, K., Debes, J., Wisniewski, J., Rothermich, A. J., Andersen, N. S., Thévenot, M., & Walla, J. (2020). WISEA J083011.95+283716.0: A Missing Link Planetary-mass Object. *The Astrophysical Journal, 895*, 145-145. https://doi.org/10.3847/1538-4357/ab8d25
 
Gagné, J., Faherty, J. K., Ruiz Diaz, A., Coulombe, L.-P., Bickle, T. P., Schneider, A. C., Kirkpatrick, D. J., Kuchner, M. J., Meisner, A., Caselden, D., Burgasser, A. J., Casewell, S. L., Honaker, E. J., Kiwy, F., Marocco, F., Gagliuffi, D. C. B., Andersen, N. S., Ruiz Arroyo, L., Baller, B. R., . . . Zitouni, S. (2026). A SPHEREx Pipeline and Spectral Library for Ultracool Dwarfs. *The Astrophysical Journal, 1009*, 15-15. https://doi.org/10.3847/1538-4357/ae8aed
 
Greco, J., Schneider, A. C., Cushing, M. C., Kirkpatrick, D. J., & Burgasser, A. J. (2019). Spectroscopic Follow-up of Discoveries from the NEOWISE Proper Motion Survey. *The Astronomical Journal, 158*, 182-182. https://doi.org/10.3847/1538-3881/ab3ebe
 
Karalidi, T., Marley, M. S., Fortney, J. J., Morley, C. V., Saumon, D., Lupu, R., Visscher, C., & Freedman, R. (2021). The Sonora Substellar Atmosphere Models. II. Cholla: A Grid of Cloud-free, Solar Metallicity Models in Chemical Disequilibrium for the JWST Era. *The Astrophysical Journal, 923*, 269-269. https://doi.org/10.3847/1538-4357/ac3140
 
Karpov, S. V., Malkov, Y. O., & Avdeeva, A. (2025). New ultracool dwarf candidates from multi-epoch WISE data. *Astronomy and Astrophysics, 695*, A195-A195. https://doi.org/10.1051/0004-6361/202452011
 
Kirkpatrick, D. J., Cushing, M. C., Gelino, C. R., Griffith, R. L., Skrutskie, M. F., Marsh, K. A., Wright, E. L., Mainzer, A., Eisenhardt, P., McLean, I. S., Thompson, M., Bauer, J. M., Benford, D. J., Bridge, C., Lake, S. E., Petty, S. M., Stanford, S. A., Tsai, C., Bailey, V. P., . . . Vacca, W. D. (2011). THE FIRST HUNDRED BROWN DWARFS DISCOVERED BY THE WIDE-FIELD INFRARED SURVEY EXPLORER ( WISE ). *The Astrophysical Journal Supplement Series, 197*, 19-19. https://doi.org/10.1088/0067-0049/197/2/19
 
Kirkpatrick, D. J., Gelino, C. R., Faherty, J. K., Meisner, A., Caselden, D., Schneider, A. C., Marocco, F., Cayago, A. J., Smart, R. L., Eisenhardt, P. R., Kuchner, M. J., Wright, E. L., Cushing, M. C., Allers, K., Gagliuffi, D. B. C., Burgasser, A. J., Gagné, J., Logsdon, S. E., Martin, E. C., . . . Wędracki, Z. (2021). The Field Substellar Mass Function Based on the Full-sky 20 pc Census of 525 L, T, and Y Dwarfs. *The Astrophysical Journal Supplement Series, 253*, 7-7. https://doi.org/10.3847/1538-4365/abd107
 
Kirkpatrick, D. J., Martin, E. C., Smart, R. L., Cayago, A. J., Beichman, C., Marocco, F., Gelino, C. R., Faherty, J. K., Cushing, M. C., Schneider, A. C., Mace, G. N., Tinney, C. G., Wright, E. L., Lowrance, P., Ingalls, J. G., Vrba, F. J., Munn, J. A., Dahm, S. E., & McLean, I. S. (2019). Preliminary Trigonometric Parallaxes of 184 Late-T and Y Dwarfs and an Analysis of the Field Substellar Mass Function into the “Planetary” Mass Regime. *The Astrophysical Journal Supplement Series, 240*, 19-19. https://doi.org/10.3847/1538-4365/aaf6af
 
Kuchner, M. J., Faherty, J. K., Schneider, A. C., Meisner, A., Filippazzo, J., Gagné, J., Trouille, L. E., Silverberg, S. M., Castro, R., Fletcher, B., Mokaev, K., & Stajic, T. (2017). The First Brown Dwarf Discovered by the Backyard Worlds: Planet 9 Citizen Science Project. *The Astrophysical Journal Letters, 841*, L19-L19. https://doi.org/10.3847/2041-8213/aa7200
 
Lacy, B. I., & Burrows, A. S. (2023). Self-consistent Models of Y Dwarf Atmospheres with Water Clouds and Disequilibrium Chemistry. *The Astrophysical Journal, 950*, 8-8. https://doi.org/10.3847/1538-4357/acc8cb
 
Lang, D. (2014). unWISE: UNBLURRED COADDS OF THEWISEIMAGING. *The Astronomical Journal, 147*, 108-108. https://doi.org/10.1088/0004-6256/147/5/108
 
Leggett, S. K., Tremblin, P., Phillips, M. W., Dupuy, T. J., Marley, M. S., Morley, C. V., Schneider, A. C., Caselden, D., Colin, G., & Logsdon, S. E. (2021). Measuring and Replicating the 1–20 μm Energy Distributions of the Coldest Brown Dwarfs: Rotating, Turbulent, and Nonadiabatic Atmospheres. *The Astrophysical Journal, 918*, 11-11. https://doi.org/10.3847/1538-4357/ac0cfe
 
Leggett, S. K., Phillips, M. W., & Tremblin, P. (2025). Exploration of the Near-infrared Colors of Cold Y Dwarfs from the Ground and Space. *The Astrophysical Journal, 991*, 193-193. https://doi.org/10.3847/1538-4357/adf21f
 
Leggett, S. K., & Tremblin, P. (2025). Redshifting the Study of Cold Brown Dwarfs and Exoplanets: The Mid-infrared Wavelength Region as an Indicator of Surface Gravity and Mass. *The Astrophysical Journal, 979*, 145-145. https://doi.org/10.3847/1538-4357/ad8fa6
 
Lindegren, L., Klioner, S. A., Hernández, J., Bombrun, A., Ramos-Lerate, M., Steidelmüller, H., Bastian, U., Biermann, M., De Torres, A., Gerlach, E., Geyer, R., Hilger, T., Hobbs, D., Lammers, U., McMillan, P. J., Stephenson, C. A., Castañeda, J., Davidson, M., Fabricius, C., . . . Vecchiato, A. (2020). Gaia Early Data Release 3. *Astronomy and Astrophysics, 649*, A2-A2. https://doi.org/10.1051/0004-6361/202039709
 
Liu, M. C., Deacon, N. R., Magnier, E. A., Dupuy, T. J., Aller, K. M., Bowler, B. P., Redstone, J., Goldman, B., Burgett, W. S., Chambers, K. C., Hodapp, K. W., Kaiser, N., Kudritzki, R. P., Morgan, J., Price, P. A., Tonry, J. L., & Wainscoat, R. J. (2011). A SEARCH FOR HIGH PROPER MOTION T DWARFS WITH Pan-STARRS1 + 2MASS + WISE. *The Astrophysical Journal Letters, 740*, L32-L32. https://doi.org/10.1088/2041-8205/740/2/l32
 
Liu, M. C., Dupuy, T. J., & Allers, K. (2016). THE HAWAII INFRARED PARALLAX PROGRAM. II. YOUNG ULTRACOOL FIELD DWARFS* †. *The Astrophysical Journal, 833*, 96-96. https://doi.org/10.3847/1538-4357/833/1/96
 
Liu, Y., Liu, M., Wang, K., & Bu, Y. (2026). An Image-based Search for L and T Dwarf Candidates in Pan-STARRS with Object Detection. *The Astrophysical Journal Supplement Series, 285*, 71-71. https://doi.org/10.3847/1538-4365/ae8849
 
Lubow, S. H., White, R. L., & Shiao, B. (2020). Improvements to Pan-STARRS1 Astrometry Using Gaia. *The Astronomical Journal, 161*, 6-6. https://doi.org/10.3847/1538-3881/abc267
 
Luhman, K. L., & Sheppard, S. S. (2014). CHARACTERIZATION OF HIGH PROPER MOTION OBJECTS FROM THEWIDE-FIELD INFRARED SURVEY EXPLORER. *The Astrophysical Journal, 787*, 126-126. https://doi.org/10.1088/0004-637x/787/2/126
 
Mace, G. N., Kirkpatrick, D. J., Cushing, M. C., Gelino, C. R., Griffith, R. L., Skrutskie, M. F., Marsh, K. A., Wright, E. L., Eisenhardt, P. R., McLean, I. S., Thompson, M., Mix, K., Bailey, V. P., Beichman, C. A., Bloom, J. S., Burgasser, A. J., Fortney, J. J., Hinz, P. M., Knox, R. P., . . . Stock, N. D. (2013). A STUDY OF THE DIVERSE T DWARF POPULATION REVEALED BY WISE. *The Astrophysical Journal Supplement Series, 205*, 6-6. https://doi.org/10.1088/0067-0049/205/1/6
 
Magnier, E. A., Schlafly, E. F., Finkbeiner, D. P., Tonry, J. L., Goldman, B., Röser, S., Schilbach, E., Casertano, S., Chambers, K. C., Flewelling, H., Huber, M. E., Price, P. A., Sweeney, W. E., Waters, C. Z., Denneau, L., Draper, P. W., Hodapp, K. W., Jedicke, R., Kaiser, N., . . . Wainscoat, R. J. (2020). Pan-STARRS Photometric and Astrometric Calibration. *The Astrophysical Journal Supplement Series, 251*, 6-6. https://doi.org/10.3847/1538-4365/abb82a
 
Mainzer, A., Bauer, J. M., Cutri, R. M., Grav, T., Masiero, J. R., Beck, R., Clarkson, P., Conrow, T., Dailey, J., Eisenhardt, P., Fabinsky, B., Fajardo-Acosta, S. B., Fowler, J. W., Gelino, C. R., Grillmair, C. J., Heinrichsen, I., Kendall, M., Kirkpatrick, D. J., Liu, F., . . . Yan, L. (2014). INITIAL PERFORMANCE OF THE NEOWISE REACTIVATION MISSION. *The Astrophysical Journal, 792*, 30-30. https://doi.org/10.1088/0004-637x/792/1/30
 
Marocco, F., Eisenhardt, P., Fowler, J. W., Kirkpatrick, D. J., Meisner, A., Schlafly, E. F., Stanford, S. A., Garcia, N., Caselden, D., Cushing, M. C., Cutri, R. M., Faherty, J. K., Gelino, C. R., Gonzalez, A. H., Jarrett, T. H., Koontz, R., Mainzer, A. K., Marchese, E. J., Mobasher, B., . . . Wright, E. L. (2021). The CatWISE2020 Catalog. *The Astrophysical Journal Supplement Series, 253*, 8-8. https://doi.org/10.3847/1538-4365/abd805
 
Meisner, A. M., Lang, D., & Schlegel, D. J. (2018). Time-resolved WISE/NEOWISE Coadds. *The Astronomical Journal, 156*, 69-69. https://doi.org/10.3847/1538-3881/aacbcd
 
Meisner, A., Caselden, D., Schlafly, E. F., & Kiwy, F. (2023). unTimely: a Full-sky, Time-domain unWISE Catalog. *The Astronomical Journal, 165*, 36-36. https://doi.org/10.3847/1538-3881/aca2ab
 
Meisner, A., Lang, D., Schlafly, E. F., Schlegel, D. J., & Napolitano, L. G. (2026). Full-depth unWISE Coadds through the End of the NEOWISE Mission. *Research Notes of the AAS, 10*, 24-24. https://doi.org/10.3847/2515-5172/ae3dd8
 
Meisner, A., Lang, D., & Schlegel, D. J. (2016). FULL-DEPTH COADDS OF THE WISE AND FIRST-YEAR NEOWISE-REACTIVATION IMAGES. *The Astronomical Journal, 153*, 38-38. https://doi.org/10.3847/1538-3881/153/1/38
 
Meisner, A. M., Lang, D., & Schlegel, D. J. (2017). Deep Full-sky Coadds from Three Years of WISE and NEOWISE Observations. *The Astronomical Journal, 154*, 161-161. https://doi.org/10.3847/1538-3881/aa894e
 
Meisner, A., Lang, D., Schlafly, E. F., & Schlegel, D. J. (2019). unWISE Coadds: The Five-year Data Set. *Publications of the Astronomical Society of the Pacific, 131*, 124504-124504. https://doi.org/10.1088/1538-3873/ab3df4
 
Meisner, A., Lang, D., Schlafly, E. F., & Schlegel, D. J. (2022). Eight-year Full-depth unWISE Coadds. *Research Notes of the AAS, 6*, 62-62. https://doi.org/10.3847/2515-5172/ac616b
 
Meisner, A., Caselden, D., Kirkpatrick, D. J., Marocco, F., Gelino, C. R., Cushing, M. C., Eisenhardt, P. R. M., Wright, E. L., Faherty, J. K., Koontz, R., Marchese, E. J., Khalil, M., Fowler, J. W., & Schlafly, E. F. (2020). Expanding the Y Dwarf Census with Spitzer Follow-up of the Coldest CatWISE Solar Neighborhood Discoveries. *The Astrophysical Journal, 889*, 74-74. https://doi.org/10.3847/1538-4357/ab6215
 
Meisner, A., Faherty, J. K., Kirkpatrick, D. J., Schneider, A. C., Caselden, D., Gagné, J., Kuchner, M. J., Burgasser, A. J., Casewell, S. L., Debes, J. H., Artigau, É., Gagliuffi, D. B. C., Logsdon, S. E., Kiman, R., Allers, K., Hsu, C.-C., Wisniewski, J. P., Allen, M. B., Beaulieu, P., . . . Theissen, C. A. (2020). Spitzer Follow-up of Extremely Cold Brown Dwarfs Discovered by the Backyard Worlds: Planet 9 Citizen Science Project. *The Astrophysical Journal, 899*, 123-123. https://doi.org/10.3847/1538-4357/aba633
 
Meisner, A., Schneider, A. C., Burgasser, A. J., Marocco, F., Line, M. R., Faherty, J. K., Kirkpatrick, D. J., Caselden, D., Kuchner, M. J., Gelino, C. R., Gagné, J., Theissen, C. A., Gerasimov, R., Aganze, C., Hsu, C.-C., Wisniewski, J. P., Casewell, S. L., Gagliuffi, D. C. B., Logsdon, S. E., . . . Cushing, M. C. (2021). New Candidate Extreme T Subdwarfs from the Backyard Worlds: Planet 9 Citizen Science Project. *The Astrophysical Journal, 915*, 120-120. https://doi.org/10.3847/1538-4357/ac013c
 
Miles, B., Skemer, A. J. I., Morley, C. V., Marley, M. S., Fortney, J. J., Allers, K., Faherty, J. K., Geballe, T. R., Visscher, C., Schneider, A. C., Lupu, R., Freedman, R., & Bjoraker, G. L. (2020). Observations of Disequilibrium CO Chemistry in the Coldest Brown Dwarfs. *The Astronomical Journal, 160*, 63-63. https://doi.org/10.3847/1538-3881/ab9114
 
Paz, M., Kirkpatrick, D. J., Uttamchandani, R., Raen, T., & Cutri, R. M. (2026). VarWISE: Infrared Variability via NEOWISE Single-exposure Photometry. *The Astrophysical Journal Supplement Series, 284*, 41-41. https://doi.org/10.3847/1538-4365/ae562f
 
Rakshit, S., Johnson, A., Stalin, C. S., Gandhi, P., & Hoenig, S. (2018). WISEview of narrow-line Seyfert 1 galaxies: mid-infrared colour and variability. *Monthly Notices of the Royal Astronomical Society, 483*, 2362-2370. https://doi.org/10.1093/mnras/sty3261
 
Rothermich, A. J., Faherty, J. K., Gagliuffi, D. C. B., Schneider, A. C., Kirkpatrick, D. J., Meisner, A., Burgasser, A. J., Kuchner, M. J., Allers, K., Gagné, J., Caselden, D., Calamari, E., Popinchalk, M., Suárez, G., Gerasimov, R., Aganze, C., Softich, E., Hsu, C.-C., Karpoor, P. R., . . . Wędracki, Z. (2024). 89 New Ultracool Dwarf Comoving Companions Identified with the Backyard Worlds: Planet 9 Citizen Science Project. *The Astronomical Journal, 167*, 253-253. https://doi.org/10.3847/1538-3881/ad324e
 
Sanghi, A., Liu, M. C., Best, W. M. J., Dupuy, T. J., Siverd, R. J., Zhang, Z., Hurt, S. A., Magnier, E. A., Aller, K. M., & Deacon, N. R. (2023). The Hawaii Infrared Parallax Program. VI. The Fundamental Properties of 1000+ Ultracool Dwarfs and Planetary-mass Objects Using Optical to Mid-infrared Spectral Energy Distributions and Comparison to BT-Settl and ATMO 2020 Model Atmospheres. *The Astrophysical Journal, 959*, 63-63. https://doi.org/10.3847/1538-4357/acff66
 
Schlafly, E. F., Meisner, A., & Green, G. M. (2019). The unWISE Catalog: Two Billion Infrared Sources from Five Years of WISE Imaging. *The Astrophysical Journal Supplement Series, 240*, 30-30. https://doi.org/10.3847/1538-4365/aafbea
 
Schlafly, E. F., Finkbeiner, D. P., Jurić, M., Magnier, E. A., Burgett, W. S., Chambers, K. C., Grav, T., Hodapp, K. W., Kaiser, N., Kudritzki, R. P., Martin, N. F., Morgan, J., Price, P. A., Rix, H., Stubbs, C. W., Tonry, J. L., & Wainscoat, R. J. (2012). PHOTOMETRIC CALIBRATION OF THE FIRST 1.5 YEARS OF THE PAN-STARRS1 SURVEY. *The Astrophysical Journal, 756*, 158-158. https://doi.org/10.1088/0004-637x/756/2/158
 
Schneider, A. C., Greco, J., Cushing, M. C., Kirkpatrick, D. J., Mainzer, A., Gelino, C. R., Fajardo-Acosta, S. B., & Bauer, J. (2016). A PROPER MOTION SURVEY USING THE FIRST SKY PASS OF NEOWISE-REACTIVATION DATA. *The Astrophysical Journal, 817*, 112-112. https://doi.org/10.3847/0004-637x/817/2/112
 
Schneider, A. C., Munn, J. A., Vrba, F. J., Bruursema, J., Dahm, S. E., Williams, S. J., Liu, M. C., & Dorland, B. N. (2023). Astrometry and Photometry for ≈1000 L, T, and Y Dwarfs from the UKIRT Hemisphere Survey. *The Astronomical Journal, 166*, 103-103. https://doi.org/10.3847/1538-3881/ace9bf
 
Schneider, A. C., Burgasser, A. J., Bruursema, J., Munn, J. A., Vrba, F. J., Caselden, D., Kabatnik, M., Rothermich, A. J., Sainio, A., Bickle, T. P., Dahm, S. E., Meisner, A., Kirkpatrick, D. J., Suárez, G., Gagné, J., Faherty, J. K., Vos, J. M., Kuchner, M. J., Williams, S. J., . . . Casewell, S. L. (2023). Redder than Red: Discovery of an Exceptionally Red L/T Transition Dwarf. *The Astrophysical Journal Letters, 943*, L16-L16. https://doi.org/10.3847/2041-8213/acb0cd
 
Schneider, A. C., Windsor, J., Cushing, M. C., Kirkpatrick, D. J., & Shkolnik, E. L. (2017). A 2MASS/AllWISE Search for Extremely Red L Dwarfs: The Discovery of Several Likely L Type Members of β Pic, AB Dor, Tuc-Hor, Argus, and the Hyades. *The Astronomical Journal, 153*, 196-196. https://doi.org/10.3847/1538-3881/aa6624
 
Schneider, A. C., Burgasser, A. J., Gerasimov, R., Marocco, F., Gagné, J., Goodman, S., Beaulieu, P., Pendrill, W., Rothermich, A. J., Sainio, A., Kuchner, M. J., Caselden, D., Meisner, A., Faherty, J. K., Mamajek, E. E., Hsu, C.-C., Greco, J. J., Cushing, M. C., Kirkpatrick, D. J., . . . Debes, J. H. (2020). WISEA J041451.67–585456.7 and WISEA J181006.18–101000.5: The First Extreme T-type Subdwarfs?. *The Astrophysical Journal, 898*, 77-77. https://doi.org/10.3847/1538-4357/ab9a40
 
Schneider, A. C., Kuchner, M. J., Faherty, J. K., Meisner, A., Kirkpatrick, D. J., Burgasser, A. J., Gagliuffi, D. C. B., Bickle, T. P., Caselden, D., Casewell, S. L., Gagné, J., Honaker, E. J., Kiwy, F., Marocco, F., Rothermich, A. J., Andersen, N. S., Ruiz Arroyo, L., Baller, B. R., Beaulieu, P., . . . Zitouni, S. (2026). Three Thousand Motion-confirmed L and T Dwarf Candidates from the Backyard Worlds: Planet 9 Citizen Science Project. *The Astronomical Journal, 171*, 341-341. https://doi.org/10.3847/1538-3881/ae5b60
 
Skrzypek, N., Warren, S. J., & Faherty, J. K. (2016). Photometric brown-dwarf classification. *Astronomy and Astrophysics, 589*, A49-A49. https://doi.org/10.1051/0004-6361/201527359
 
Tonry, J. L., Stubbs, C. W., Lykke, K. R., Doherty, P., Shivvers, I. S., Burgett, W. S., Chambers, K. C., Hodapp, K. W., Kaiser, N., Kudritzki, R., Magnier, E. A., Morgan, J., Price, P. A., & Wainscoat, R. J. (2012). THE Pan-STARRS1 PHOTOMETRIC SYSTEM. *The Astrophysical Journal, 750*, 99-99. https://doi.org/10.1088/0004-637x/750/2/99
 
Tu, Z., Wang, S. M., Chen, X., & Liu, J. (2025). Three Brown Dwarfs Masquerading as High-redshift Galaxies in JWST Observations. *The Astrophysical Journal, 980*, 230-230. https://doi.org/10.3847/1538-4357/adaf9f
 
Vallenari, A., Brown, A. G. A., Prusti, T., De Bruijne, J. H. J., Arenou, F., Babusiaux, C., Biermann, M., Creevey, O. L., Ducourant, C., Evans, D. W., Eyer, L., Guerra, R., Hutton, A., Jordi, C., Klioner, S. A., Lammers, U., Lindegren, L., Luri, X., Mignard, F., . . . Zwitter, T. (2022). Gaia Data Release 3. *Astronomy and Astrophysics, 674*, A1-A1. https://doi.org/10.1051/0004-6361/202243940
 
Vasist, M., Mollière, P., Kühnle, H., Patapis, P., Absil, O., Louppe, G., Lagage, P.-O., Waters, L. B. F. M., Güdel, M., Henning, T. K., Vandenbussche, B., Barrado, D., Decin, L., Pye, J. P., Tremblin, P., & Whiteford, N. (2025). Panchromatic characterization of the Y0 brown dwarf WISEP J173835.52+273258.9 using JWST/MIRI. *Astronomy and Astrophysics, 703*, A70-A70. https://doi.org/10.1051/0004-6361/202554282
 
Vrba, F. J., Schneider, A. C., Munn, J. A., Henden, A. A., Luginbuhl, C. B., Dahn, C. C., Guetter, H. H., Canzian, B., Tilleman, T., Dahm, S. E., Williams, S. J., Bruursema, J., Kirkpatrick, D. J., & Burgasser, A. J. (2026). Parallaxes, Proper Motions, and Near-infrared Photometry for 173 L and T Dwarfs from the US Naval Observatory Infrared Astrometry Program. *The Astrophysical Journal, 999*, 24-24. https://doi.org/10.3847/1538-4357/ae3963
 
Wright, E. L., Eisenhardt, P., Mainzer, A., Ressler, M. E., Cutri, R. M., Jarrett, T. H., Kirkpatrick, D. J., Padgett, D. L., McMillan, R. S., Skrutskie, M. F., Stanford, S. A., Cohen, M., Walker, R. G., Mather, J. C., Leisawitz, D., Gautier, T. N., McLean, I. S., Benford, D. J., Lonsdale, C. J., . . . Tsai, C. (2010). THE WIDE-FIELD INFRARED SURVEY EXPLORER (WISE): MISSION DESCRIPTION AND INITIAL ON-ORBIT PERFORMANCE. *The Astronomical Journal, 140*, 1868-1881. https://doi.org/10.1088/0004-6256/140/6/1868
 
Xiao, K., & Yuan, H. (2022). Validation and Improvement of the Pan-STARRS Photometric Calibration with the Stellar Color Regression Method. *The Astronomical Journal, 163*, 185-185. https://doi.org/10.3847/1538-3881/ac540a
 
Xiao, K., Yuan, H., Huang, B., Zhang, R., Yang, L., & Xu, S. (2023). Improvement of Pan-STARRS Photometric Calibration with LAMOST and Gaia. *The Astrophysical Journal Supplement Series, 268*, 53-53. https://doi.org/10.3847/1538-4365/acee73
 
Yang, D.-M., Schindler, J., Nanni, R., Hennawi, J. F., Bañados, E., Fan, X., Gloudemans, A. J., Mazzucchelli, C., Röttgering, H. J. A., Venemans, B. P., Wang, F., & Yang, J. (2024). High-z quasar candidate archive: a spectroscopic catalogue of quasars and contaminants in various quasar searches. *Monthly Notices of the Royal Astronomical Society, 528*, 2679-2710. https://doi.org/10.1093/mnras/stae094
 
Zhang, Z., & 李, Y. 燕. L. (2025). Ultracool dwarf Science with MachIne LEarning (USMILE). I. Scalable Tree-based Models for Photometric Spectral Classification and New Discoveries from LSST Data Preview 1 and Euclid Quick Data Release 1. *The Astronomical Journal, 170*, 360-360. https://doi.org/10.3847/1538-3881/ae100b
 
张周, Z. Z. 健., Liu, M. C., Best, W. M. J., Dupuy, T. J., & Siverd, R. J. (2021). The Hawaii Infrared Parallax Program. V. New T-dwarf Members and Candidate Members of Nearby Young Moving Groups. *The Astrophysical Journal, 911*, 7-7. https://doi.org/10.3847/1538-4357/abe3fa
