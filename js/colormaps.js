/**
 * SPHEREx Sky Viewer — Colormap Module
 * Provides scientific colormaps for image rendering.
 */

const Colormaps = (() => {

    // Colormap lookup tables (256 entries each, RGB)
    const maps = {};

    /**
     * Generate grayscale colormap.
     */
    function generateGrayscale() {
        const lut = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            lut[i * 3] = i;
            lut[i * 3 + 1] = i;
            lut[i * 3 + 2] = i;
        }
        return lut;
    }

    /**
     * Interpolate between color stops to create a colormap.
     */
    function interpolateColormap(stops) {
        const lut = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = i / 255;
            // Find surrounding stops
            let lo = stops[0], hi = stops[stops.length - 1];
            for (let j = 0; j < stops.length - 1; j++) {
                if (t >= stops[j][0] && t <= stops[j + 1][0]) {
                    lo = stops[j];
                    hi = stops[j + 1];
                    break;
                }
            }
            const range = hi[0] - lo[0];
            const f = range > 0 ? (t - lo[0]) / range : 0;
            lut[i * 3]     = Math.round(lo[1] + (hi[1] - lo[1]) * f);
            lut[i * 3 + 1] = Math.round(lo[2] + (hi[2] - lo[2]) * f);
            lut[i * 3 + 2] = Math.round(lo[3] + (hi[3] - lo[3]) * f);
        }
        return lut;
    }

    // Viridis colormap stops
    maps.viridis = interpolateColormap([
        [0.00, 68, 1, 84],
        [0.13, 72, 36, 117],
        [0.25, 64, 67, 135],
        [0.38, 52, 95, 141],
        [0.50, 41, 123, 142],
        [0.63, 33, 152, 133],
        [0.75, 67, 179, 107],
        [0.88, 134, 204, 63],
        [1.00, 253, 231, 37]
    ]);

    // Inferno colormap stops
    maps.inferno = interpolateColormap([
        [0.00, 0, 0, 4],
        [0.13, 31, 12, 72],
        [0.25, 85, 15, 109],
        [0.38, 136, 34, 106],
        [0.50, 186, 54, 85],
        [0.63, 227, 89, 51],
        [0.75, 249, 140, 10],
        [0.88, 249, 200, 45],
        [1.00, 252, 255, 164]
    ]);

    // Magma colormap stops
    maps.magma = interpolateColormap([
        [0.00, 0, 0, 4],
        [0.13, 28, 16, 68],
        [0.25, 79, 18, 123],
        [0.38, 129, 37, 129],
        [0.50, 181, 54, 122],
        [0.63, 229, 80, 100],
        [0.75, 251, 135, 97],
        [0.88, 254, 194, 140],
        [1.00, 252, 253, 191]
    ]);

    // Plasma colormap stops
    maps.plasma = interpolateColormap([
        [0.00, 13, 8, 135],
        [0.13, 75, 3, 161],
        [0.25, 126, 3, 168],
        [0.38, 168, 34, 150],
        [0.50, 204, 71, 120],
        [0.63, 232, 109, 83],
        [0.75, 248, 150, 43],
        [0.88, 249, 199, 25],
        [1.00, 240, 249, 33]
    ]);

    // Hot colormap stops
    maps.hot = interpolateColormap([
        [0.00, 0, 0, 0],
        [0.33, 230, 0, 0],
        [0.67, 255, 210, 0],
        [1.00, 255, 255, 255]
    ]);

    // Cool colormap stops
    maps.cool = interpolateColormap([
        [0.00, 0, 255, 255],
        [0.50, 128, 0, 255],
        [1.00, 255, 0, 255]
    ]);

    maps.grayscale = generateGrayscale();

    /**
     * Get a colormap by name.
     */
    function get(name) {
        return maps[name] || maps.grayscale;
    }

    /**
     * Apply colormap to a value (0-255) and return [r, g, b].
     */
    function apply(name, value) {
        const lut = get(name);
        const idx = Math.max(0, Math.min(255, Math.round(value)));
        return [lut[idx * 3], lut[idx * 3 + 1], lut[idx * 3 + 2]];
    }

    /**
     * Get list of available colormap names.
     */
    function list() {
        return Object.keys(maps);
    }

    return { get, apply, list };
})();
