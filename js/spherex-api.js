/**
 * SPHEREx Sky Viewer — SPHEREx API Module
 * Handles querying the IRSA archive for SPHEREx data products.
 */

const SPHERExAPI = (() => {

    // IRSA endpoints
    const SIA_ENDPOINT = 'https://irsa.ipac.caltech.edu/SIA';
    const TAP_ENDPOINT = 'https://irsa.ipac.caltech.edu/TAP/sync';
    const IBE_BASE = 'https://irsa.ipac.caltech.edu/ibe/data/spherex';

    // SPHEREx detector array wavelength ranges (µm)
    const DETECTOR_RANGES = [
        { id: 1, label: 'D1', minWave: 0.75, maxWave: 1.11, bands: '1–17', color: '#818cf8' },
        { id: 2, label: 'D2', minWave: 1.11, maxWave: 1.64, bands: '18–34', color: '#60a5fa' },
        { id: 3, label: 'D3', minWave: 1.64, maxWave: 2.42, bands: '35–51', color: '#34d399' },
        { id: 4, label: 'D4', minWave: 2.42, maxWave: 3.82, bands: '52–68', color: '#fbbf24' },
        { id: 5, label: 'D5', minWave: 3.82, maxWave: 4.42, bands: '69–85', color: '#f97316' },
        { id: 6, label: 'D6', minWave: 4.42, maxWave: 5.00, bands: '86–102', color: '#ef4444' }
    ];

    // SPHEREx 102-band approximate central wavelengths (µm)
    const BAND_WAVELENGTHS = generateBandWavelengths();

    function generateBandWavelengths() {
        const wavelengths = [];
        // Approximate wavelengths for 102 bands spread across 0.75 – 5.0 µm
        // 6 detectors, ~17 bands each
        const ranges = [
            [0.75, 1.11, 17],
            [1.11, 1.64, 17],
            [1.64, 2.42, 17],
            [2.42, 3.82, 17],
            [3.82, 4.42, 17],
            [4.42, 5.00, 17]
        ];
        let band = 1;
        for (const [wmin, wmax, n] of ranges) {
            for (let i = 0; i < n; i++) {
                wavelengths.push({
                    band: band++,
                    wavelength: wmin + (wmax - wmin) * (i + 0.5) / n,
                    detector: ranges.indexOf([wmin, wmax, n]) + 1
                });
            }
        }
        return wavelengths;
    }

    /**
     * Query IRSA SIA v2 for SPHEREx images at given coordinates.
     * Returns metadata about available images.
     */
    async function querySIA(ra, dec, radius = 0.01, collections = ['spherex_dr1', 'spherex_qr3']) {
        const collectionParam = collections.join(',');
        const url = `${SIA_ENDPOINT}?` +
            `COLLECTION=${encodeURIComponent(collectionParam)}` +
            `&POS=${ra},${dec},${radius}` +
            `&RESPONSEFORMAT=JSON`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`SIA query failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return parseSIAResponse(data);
    }

    /**
     * Parse SIA v2 JSON response into structured image records.
     */
    function parseSIAResponse(data) {
        if (!data || !data.data) return [];

        const columns = data.columns || [];
        const colIndex = {};
        columns.forEach((col, i) => {
            colIndex[col.name || col] = i;
        });

        return data.data.map(row => {
            const getVal = (name) => {
                const idx = colIndex[name];
                return idx !== undefined ? row[idx] : null;
            };

            return {
                accessUrl: getVal('access_url') || getVal('sia_url'),
                collection: getVal('obs_collection') || getVal('collection'),
                obsId: getVal('obs_id'),
                dataProductType: getVal('dataproduct_type'),
                facilityName: getVal('facility_name'),
                instrumentName: getVal('instrument_name'),
                obsDate: getVal('t_min') || getVal('t_exptime'),
                tMin: getVal('t_min'),
                tMax: getVal('t_max'),
                sRa: getVal('s_ra'),
                sDec: getVal('s_dec'),
                sFov: getVal('s_fov'),
                emMin: getVal('em_min'),
                emMax: getVal('em_max'),
                calLevel: getVal('calib_level'),
                contentType: getVal('access_format'),
                fileSize: getVal('access_estsize'),
                planId: getVal('planid') || extractPlanId(getVal('obs_id') || getVal('access_url') || ''),
                detector: extractDetector(getVal('obs_id') || getVal('access_url') || '')
            };
        }).filter(r => r.accessUrl);
    }

    /**
     * Extract planning period ID from obs_id or URL.
     */
    function extractPlanId(str) {
        const match = str.match(/(\d{4}W\d+_\d+[A-Z]?)/);
        return match ? match[1] : null;
    }

    /**
     * Extract detector number from obs_id or URL.
     */
    function extractDetector(str) {
        const match = str.match(/(\d)D(\d)/);
        if (match) return parseInt(match[2]);
        const match2 = str.match(/det(\d)/i);
        if (match2) return parseInt(match2[1]);
        return null;
    }

    /**
     * Build a cutout URL for a SPHEREx image.
     */
    function buildCutoutUrl(accessUrl, ra, dec, size = 0.1) {
        const separator = accessUrl.includes('?') ? '&' : '?';
        return `${accessUrl}${separator}center=${ra},${dec}&size=${size}`;
    }

    /**
     * Group images by observation epoch (planning period).
     * Each group represents a distinct time the sky was observed.
     */
    function groupByEpoch(images) {
        const groups = {};

        for (const img of images) {
            const key = img.planId || img.obsId || img.accessUrl;
            if (!groups[key]) {
                groups[key] = {
                    planId: img.planId,
                    obsDate: img.tMin,
                    collection: img.collection,
                    images: []
                };
            }
            groups[key].images.push(img);
        }

        // Sort by observation date
        return Object.values(groups).sort((a, b) => {
            if (a.obsDate && b.obsDate) return a.obsDate - b.obsDate;
            return 0;
        });
    }

    /**
     * Group images by detector array.
     */
    function groupByDetector(images) {
        const groups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        for (const img of images) {
            const det = img.detector || 1;
            if (groups[det]) {
                groups[det].push(img);
            }
        }
        return groups;
    }

    /**
     * Query IRSA TAP for more detailed metadata about SPHEREx observations.
     */
    async function queryTAP(ra, dec, radius = 0.01, collection = 'spherex_dr1') {
        const adql = `SELECT * FROM ${collection}.level2 WHERE ` +
            `CONTAINS(POINT('ICRS', s_ra, s_dec), CIRCLE('ICRS', ${ra}, ${dec}, ${radius})) = 1 ` +
            `ORDER BY t_min`;

        const params = new URLSearchParams({
            REQUEST: 'doQuery',
            LANG: 'ADQL',
            QUERY: adql,
            FORMAT: 'json'
        });

        try {
            const response = await fetch(`${TAP_ENDPOINT}?${params.toString()}`);
            if (!response.ok) return [];
            return await response.json();
        } catch {
            return [];
        }
    }

    /**
     * Build a HiPS-compatible image URL for a cutout preview.
     * Falls back to generating a preview via Aladin/IRSA.
     */
    function buildPreviewUrl(ra, dec, size = 0.1, width = 512, height = 512) {
        // Use IRSA's image service for preview
        return `https://irsa.ipac.caltech.edu/applications/finderchart/servlet/api?` +
            `mode=getImage&locstr=${ra}+${dec}&survey=SPHEREx&subsetsize=${size}` +
            `&imagetype=image&orientation=north&reproject=true&width=${width}&height=${height}`;
    }

    /**
     * Generate mock epoch data for demonstration when live API is unavailable.
     * In production, this would be replaced by actual SIA queries.
     */
    function generateDemoEpochs(ra, dec, numEpochs = 6) {
        const epochs = [];
        const baseDate = new Date('2025-05-02');

        for (let i = 0; i < numEpochs; i++) {
            const epochDate = new Date(baseDate);
            epochDate.setDate(epochDate.getDate() + (i * 90)); // ~3 months apart

            const planWeek = 18 + Math.floor(i * 13);
            const planId = `2025W${planWeek}_${i + 1}B`;

            epochs.push({
                index: i,
                planId: planId,
                date: epochDate.toISOString().split('T')[0],
                dateLabel: epochDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                collection: i < 3 ? 'DR1' : 'QR3',
                detectors: [1, 2, 3, 4, 5, 6],
                ra: ra,
                dec: dec,
                // Simulated per-detector metadata
                metadata: {
                    nBands: 17,
                    exposure: (25 + Math.random() * 10).toFixed(1),
                    contamination: Math.random() > 0.85 ? 'FLAG: scattered light' : 'clean',
                    snr: (5 + Math.random() * 20).toFixed(1)
                }
            });
        }
        return epochs;
    }

    /**
     * Generate simulated spectral data for a source.
     * Models a blackbody + molecular features for demonstration.
     */
    function generateDemoSpectrum(ra, dec, objectType = 'star') {
        const spectrum = [];

        for (const band of BAND_WAVELENGTHS) {
            const wl = band.wavelength;
            let flux;

            // Simple blackbody-like spectrum
            const T = objectType === 'browndwarf' ? 1500 :
                      objectType === 'variable' ? 3500 :
                      5000;

            // Planck function approximation (relative units)
            const hc_kT = 14388 / (wl * T); // hc/λkT in µm·K units
            flux = Math.pow(wl, -5) / (Math.exp(hc_kT) - 1);

            // Normalize
            flux = flux * 1e15;

            // Add molecular absorption features for brown dwarfs
            if (objectType === 'browndwarf') {
                // H2O absorption at ~1.4 µm and ~1.9 µm
                if (Math.abs(wl - 1.4) < 0.15) flux *= 0.5;
                if (Math.abs(wl - 1.9) < 0.15) flux *= 0.4;
                // CH4 at ~2.3 µm and ~3.3 µm
                if (Math.abs(wl - 2.3) < 0.2) flux *= 0.6;
                if (Math.abs(wl - 3.3) < 0.3) flux *= 0.3;
                // CO2 at ~4.3 µm
                if (Math.abs(wl - 4.3) < 0.2) flux *= 0.5;
            }

            // Add noise
            flux *= (0.9 + Math.random() * 0.2);

            spectrum.push({
                band: band.band,
                wavelength: wl,
                flux: flux,
                fluxErr: flux * (0.05 + Math.random() * 0.1)
            });
        }

        return spectrum;
    }

    return {
        SIA_ENDPOINT,
        TAP_ENDPOINT,
        IBE_BASE,
        DETECTOR_RANGES,
        BAND_WAVELENGTHS,
        querySIA,
        buildCutoutUrl,
        groupByEpoch,
        groupByDetector,
        queryTAP,
        buildPreviewUrl,
        generateDemoEpochs,
        generateDemoSpectrum
    };
})();
