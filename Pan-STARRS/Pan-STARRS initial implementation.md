---
jupytext:
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.17.2
kernelspec:
  display_name: Python 3 (ipykernel)
  language: python
  name: python3
---

# Introduction to Pan-STARRS and WiseView Data

## 1. Learning Goals

- Understand the astronomical and physical foundations of Pan-STARRS and WISE/NEOWISE data.
- Query and retrieve Pan-STARRS multi-band image cutouts programmatically.
- Construct WiseView URLs to visualize time-domain kinematics (proper motion).
- Explore the mathematical principles behind image stacking and signal-to-noise ratio.

## 2. Astronomical & Physical Overview

**Pan-STARRS** is an optical/near-infrared survey observing the sky in 5 filters (*g, r, i, z, y*). It excels at capturing static, high-resolution maps of the universe and detecting hot bodies (like main-sequence stars) based on **Blackbody Radiation** (Wien's Law).

**WiseView** is a specialized visualization tool for data from the WISE/NEOWISE mission. It operates in the mid-infrared spectrum (W1, W2 bands), which is crucial for identifying cool objects like **Brown Dwarfs** that emit thermal radiation rather than visible light. WiseView uses time-series blinking to reveal **Proper Motion**—the angular change in a star's position over time.

By combining the spatial resolution of [Pan-STARRS](https://ps1images.stsci.edu/cgi-bin/ps1cutouts) with the kinematic time-domain data of [WiseView](http://byw.tools/wiseview), astronomers can confirm both the physical properties and the dynamic nature of celestial objects.


## 3. Requirements

The following packages are used in this notebook to handle coordinates, images, and visualization.

```{code-cell} ipython3
# %pip install numpy matplotlib astropy requests IPython

```

## 4. Imports

```{code-cell} ipython3
import numpy as np
import matplotlib.pyplot as plt
import requests
from io import BytesIO
from PIL import Image

from astropy.coordinates import SkyCoord
from astropy import units as u
from IPython.display import IFrame, display, HTML

```

## 5. Defining the Target: Astronomy Foundation

Every object on the celestial sphere is defined by its Equatorial Coordinates: Right Ascension (RA) and Declination (Dec). We will use the coordinates `133.823642, -7.228450`.

```{code-cell} ipython3
ra_deg = 133.8236418893577
dec_deg = -7.22845036453723

# Convert to an Astropy SkyCoord object
coord = SkyCoord(ra=ra_deg*u.deg, dec=dec_deg*u.deg, frame='icrs')
print(f"Target coordinates: {coord.to_string('hmsdms')}")

```

## 6. Accessing Pan-STARRS Data

Pan-STARRS data can be retrieved via the STScI MAST API. We will query for an image cutout at our target coordinates in the `g`, `r`, `i`, `z`, and `y` bands. Pan-STARRS stacking combines multiple exposures to increase the Signal-to-Noise Ratio (SNR). Mathematically, if you stack $N$ images, the background noise increases by $\sqrt{N}$, while the signal increases by $N$. Thus, the overall $SNR \propto \sqrt{N}$.


```{code-cell} ipython3
def get_panstarrs_url(ra, dec, size=240, filters="griyzy"):
    """
    Query the Pan-STARRS image access API to get a cutout URL.
    """
    base_url = "[https://ps1images.stsci.edu/cgi-bin/ps1filenames.py](https://ps1images.stsci.edu/cgi-bin/ps1filenames.py)"
    params = {
        "ra": ra,
        "dec": dec,
        "size": size,
        "filters": filters,
        "type": "stack" # We request stacked images for better SNR
    }
    response = requests.get(base_url, params=params)
    response.raise_for_status()
    
    # Parse the text response to find the FITS/JPEG URLs
    records = response.text.strip().split('\n')
    image_urls = {}
    for r in records[1:]:
        parts = r.split()
        if len(parts) > 7:
            filt = parts[4]
            filename = parts[7]
            # Construct standard JPEG view URL
            image_urls[filt] = f"[https://ps1images.stsci.edu/cgi-bin/fitscut.cgi?red=](https://ps1images.stsci.edu/cgi-bin/fitscut.cgi?red=){filename}&format=jpeg&size={size}"
            
    return image_urls

# Fetch URLs for our target
urls = get_panstarrs_url(ra_deg, dec_deg)
print(f"Retrieved {len(urls)} filter URLs.")

```

Let's visualize the *i-band* (near-infrared) stacked image from Pan-STARRS:

```{code-cell} ipython3
if 'i' in urls:
    response = requests.get(urls['i'])
    img = Image.open(BytesIO(response.content))
    
    plt.figure(figsize=(6,6))
    plt.imshow(img, cmap='gray')
    plt.title("Pan-STARRS Stacked Image (i-band)")
    plt.axis('off')
    plt.show()

```

## 7. Mathematics of Difference Imaging (Pixel Math)

To detect moving objects, astronomers use **Difference Imaging**. This involves subtracting an older image (Epoch 1) from a newer image (Epoch 2).

Let $P_1(x,y)$ and $P_2(x,y)$ be the pixel intensities. If a star is stationary, $P_2(x,y) - P_1(x,y) \approx 0$. If an object moves, it creates a positive-negative dipole signature.

```{code-cell} ipython3
# Simulating 1D Difference Imaging
x = np.linspace(0, 100, 100)
# Gaussian profiles representing a star at two different times
epoch1 = 10 * np.exp(-((x - 40)**2) / 10) 
epoch2 = 10 * np.exp(-((x - 45)**2) / 10) # Star moved 5 pixels

difference = epoch2 - epoch1

plt.plot(x, epoch1, label='Epoch 1', linestyle='--')
plt.plot(x, epoch2, label='Epoch 2', linestyle='--')
plt.plot(x, difference, label='Difference (E2 - E1)', color='red')
plt.title("Mathematical Principle of Difference Imaging")
plt.xlabel("Pixel Coordinate")
plt.ylabel("Flux Intensity")
plt.legend()
plt.show()

```

## 8. Visualizing Kinematics with WiseView

Instead of static difference imaging, WiseView dynamically blinks the images. Let's programmatically construct the URL to visualize our target in WiseView, focusing on the infrared bands (Band 2 / W2) with a 500ms blink speed.

```{code-cell} ipython3
fov = 170
band = 2 # 1: W1, 2: W2, 3: W1+W2
speed = 500 # ms

wiseview_url = (
    f"[http://byw.tools/wiseview#ra=](http://byw.tools/wiseview#ra=){ra_deg}&dec={dec_deg}"
    f"&size={fov}&band={band}&speed={speed}"
    f"&minbright=-17.2352&maxbright=500.0&window=0.37671"
    f"&diff_window=1&linear=1&invert=1"
)

print(f"WiseView Link: {wiseview_url}")

```

You can click the link above or view it directly in the embedded frame below to observe the proper motion in the mid-infrared spectrum.

```{code-cell} ipython3
# Display WiseView in an IFrame
IFrame(src=wiseview_url, width='100%', height=600)

```

## Acknowledgements

* [Pan-STARRS1 Science Consortium](https://panstarrs.stsci.edu/)
* [WiseView / Backyard Worlds: Planet 9](http://byw.tools/wiseview)
* NASA WISE/NEOWISE Missions

## About this notebook

* **Topic:** Mathematical, Physical, and Astronomical integration of PS1 and WiseView.
* **Runtime:** approximately 15 seconds
