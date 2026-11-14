/**
 * SPHEREx Sky Viewer — Utility Functions
 * Coordinate parsing, formatting, and helper utilities.
 */

const Utils = (() => {

    /**
     * Parse Right Ascension from various formats to decimal degrees.
     * Accepts: decimal degrees, hours:min:sec, HhMmSs format
     */
    function parseRA(input) {
        if (!input || typeof input !== 'string') return NaN;
        input = input.trim();

        // Try pure decimal
        const decimal = parseFloat(input);
        if (!isNaN(decimal) && /^-?[\d.]+$/.test(input)) {
            return decimal;
        }

        // Try sexagesimal: "17h57m48.5s" or "17:57:48.5" or "17 57 48.5"
        let match = input.match(/^(\d+)[h:\s]+(\d+)[m:\s]+([0-9.]+)s?$/i);
        if (match) {
            const h = parseFloat(match[1]);
            const m = parseFloat(match[2]);
            const s = parseFloat(match[3]);
            return (h + m / 60 + s / 3600) * 15; // hours to degrees
        }

        // Try "17h57m48.5s" compact
        match = input.match(/^(\d+)h\s*(\d+)m\s*([0-9.]+)s?$/i);
        if (match) {
            const h = parseFloat(match[1]);
            const m = parseFloat(match[2]);
            const s = parseFloat(match[3]);
            return (h + m / 60 + s / 3600) * 15;
        }

        return NaN;
    }

    /**
     * Parse Declination from various formats to decimal degrees.
     * Accepts: decimal degrees, deg:min:sec, DdMmSs format
     */
    function parseDec(input) {
        if (!input || typeof input !== 'string') return NaN;
        input = input.trim();

        // Try pure decimal
        const decimal = parseFloat(input);
        if (!isNaN(decimal) && /^[+-]?[\d.]+$/.test(input)) {
            return decimal;
        }

        // Try sexagesimal: "+04d41m36s" or "-07:14:42.53" or "+04 41 36"
        let match = input.match(/^([+-]?)(\d+)[d°:\s]+(\d+)[m':\s]+([0-9.]+)[s"]*$/i);
        if (match) {
            const sign = match[1] === '-' ? -1 : 1;
            const d = parseFloat(match[2]);
            const m = parseFloat(match[3]);
            const s = parseFloat(match[4]);
            return sign * (d + m / 60 + s / 3600);
        }

        return NaN;
    }

    /**
     * Format RA in decimal degrees to sexagesimal string.
     */
    function formatRA(deg) {
        const totalHours = deg / 15;
        const h = Math.floor(totalHours);
        const remainMin = (totalHours - h) * 60;
        const m = Math.floor(remainMin);
        const s = ((remainMin - m) * 60).toFixed(2);
        return `${h}h${String(m).padStart(2, '0')}m${String(s).padStart(5, '0')}s`;
    }

    /**
     * Format Dec in decimal degrees to sexagesimal string.
     */
    function formatDec(deg) {
        const sign = deg < 0 ? '-' : '+';
        const absDeg = Math.abs(deg);
        const d = Math.floor(absDeg);
        const remainMin = (absDeg - d) * 60;
        const m = Math.floor(remainMin);
        const s = ((remainMin - m) * 60).toFixed(1);
        return `${sign}${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}′${String(s).padStart(4, '0')}″`;
    }

    /**
     * Resolve an astronomical object name to coordinates using SIMBAD/CDS.
     */
    async function resolveObjectName(name) {
        const url = `https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-ox/SNVA?${encodeURIComponent(name)}`;
        const response = await fetch(url);
        const text = await response.text();

        // Parse XML response for coordinates
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const jpos = xml.querySelector('jpos');
        if (!jpos) {
            throw new Error(`Object "${name}" not found in SIMBAD/NED/VizieR`);
        }

        const coords = jpos.textContent.trim().split(/\s+/);
        if (coords.length >= 2) {
            const ra = parseRA(coords[0]);
            const dec = parseDec(coords[1]);
            if (!isNaN(ra) && !isNaN(dec)) {
                // Try to get a better RA/Dec from explicit fields
                const raEl = xml.querySelector('jradeg');
                const decEl = xml.querySelector('jdedeg');
                if (raEl && decEl) {
                    return {
                        ra: parseFloat(raEl.textContent),
                        dec: parseFloat(decEl.textContent)
                    };
                }
                return { ra, dec };
            }
        }
        throw new Error(`Could not parse coordinates for "${name}"`);
    }

    /**
     * Show a toast notification.
     */
    function showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Debounce a function.
     */
    function debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    }

    /**
     * Get URL search parameters.
     */
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            ra: params.get('ra') ? parseFloat(params.get('ra')) : null,
            dec: params.get('dec') ? parseFloat(params.get('dec')) : null,
            fov: params.get('fov') ? parseFloat(params.get('fov')) : null,
            name: params.get('name') || null,
            survey: params.get('survey') || null
        };
    }

    /**
     * Build a shareable URL with current state.
     */
    function buildShareUrl(state) {
        const url = new URL(window.location.href.split('?')[0]);
        if (state.ra != null) url.searchParams.set('ra', state.ra.toFixed(6));
        if (state.dec != null) url.searchParams.set('dec', state.dec.toFixed(6));
        if (state.fov != null) url.searchParams.set('fov', state.fov.toFixed(1));
        if (state.name) url.searchParams.set('name', state.name);
        return url.toString();
    }

    /**
     * Copy text to clipboard.
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            el.remove();
            return true;
        }
    }

    return {
        parseRA,
        parseDec,
        formatRA,
        formatDec,
        resolveObjectName,
        showToast,
        debounce,
        getUrlParams,
        buildShareUrl,
        copyToClipboard
    };
})();
