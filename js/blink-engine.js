/**
 * SPHEREx Sky Viewer — Blink Engine
 * Handles image rendering, animation, stretching, and comparison modes.
 */

const BlinkEngine = (() => {
    // State
    let canvas = null;
    let ctx = null;
    let frames = [];          // Array of { imageData, metadata }
    let currentFrame = 0;
    let isPlaying = false;
    let animationTimer = null;
    let blinkSpeed = 700;     // ms per frame
    let stretchMode = 'asinh';
    let colormapName = 'grayscale';
    let displayMode = 'blink'; // blink, difference, stack
    let onFrameChange = null;  // callback

    /**
     * Initialize the blink engine with a canvas element.
     */
    function init(canvasEl, frameChangeCb) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        onFrameChange = frameChangeCb;
    }

    /**
     * Generate synthetic sky image data for an epoch.
     * Creates a realistic star field with proper motion simulation.
     */
    function generateSkyFrame(ra, dec, epoch, objectName, size = 256) {
        const data = new Float32Array(size * size);

        // Seed based on coordinates for consistent star placement
        const seed = Math.abs(Math.sin(ra * 127.1 + dec * 311.7)) * 43758.5453;
        const rng = createSeededRandom(seed);

        // Background noise
        for (let i = 0; i < size * size; i++) {
            data[i] = rng() * 15 + 5; // background level ~5-20
        }

        // Add static stars (don't move between epochs)
        const numStars = 40 + Math.floor(rng() * 30);
        for (let s = 0; s < numStars; s++) {
            const sx = rng() * size;
            const sy = rng() * size;
            const brightness = 50 + rng() * 200;
            const spread = 1.5 + rng() * 2;
            addPointSource(data, size, sx, sy, brightness, spread);
        }

        // Add the target object with proper motion / variability
        const cx = size / 2;
        const cy = size / 2;

        const objectTypes = detectObjectType(objectName);

        if (objectTypes.moving) {
            // Moving object: shift position based on epoch
            const pmRA = objectTypes.pmRA || 0;   // pixels/epoch
            const pmDec = objectTypes.pmDec || 0;
            const ox = cx + pmRA * epoch.index;
            const oy = cy - pmDec * epoch.index;  // inverted Y
            const brightness = objectTypes.brightness || 150;
            addPointSource(data, size, ox, oy, brightness, 2.2);
        }

        if (objectTypes.variable) {
            // Variable star: change brightness
            const phase = (epoch.index * 0.4 + 0.1) % 1.0;
            let brightness;
            if (objectTypes.mira) {
                // Mira-type: large amplitude, smooth variation
                brightness = 60 + 180 * Math.pow(Math.sin(phase * Math.PI), 2);
            } else {
                // Irregular variable
                brightness = 100 + 120 * Math.sin(phase * Math.PI * 2 + 0.5);
            }
            addPointSource(data, size, cx, cy, Math.max(30, brightness), 2.5);
        }

        if (!objectTypes.moving && !objectTypes.variable) {
            // Default: static bright source at center
            addPointSource(data, size, cx, cy, 200, 2.5);
        }

        // Add a faint galaxy or nebulosity
        if (rng() > 0.5) {
            const gx = rng() * size;
            const gy = rng() * size;
            addExtendedSource(data, size, gx, gy, 30, 8 + rng() * 6, rng);
        }

        // Add read noise
        for (let i = 0; i < size * size; i++) {
            data[i] += (rng() - 0.5) * 8;
            data[i] = Math.max(0, data[i]);
        }

        return data;
    }

    /**
     * Detect object type from name for simulation purposes.
     */
    function detectObjectType(name) {
        if (!name) return {};
        const n = name.toLowerCase();

        if (n.includes('barnard')) {
            return { moving: true, pmRA: -1.5, pmDec: 5.0, brightness: 140, label: 'High proper motion star' };
        }
        if (n.includes('epsilon indi') || n.includes('eps ind')) {
            return { moving: true, pmRA: 2.0, pmDec: -1.2, brightness: 100, label: 'Brown dwarf binary' };
        }
        if (n.includes('wise 0855') || n.includes('0855')) {
            return { moving: true, pmRA: -3.5, pmDec: 1.0, brightness: 60, label: 'Cold brown dwarf' };
        }
        if (n.includes('rw aur')) {
            return { variable: true, brightness: 160, label: 'T Tauri variable' };
        }
        if (n.includes('r dra') || n.includes('r draconis')) {
            return { variable: true, mira: true, brightness: 200, label: 'Mira variable' };
        }

        return {};
    }

    /**
     * Add a point source (star) with Gaussian PSF.
     */
    function addPointSource(data, size, cx, cy, brightness, sigma) {
        const r = Math.ceil(sigma * 4);
        const x0 = Math.max(0, Math.floor(cx - r));
        const x1 = Math.min(size - 1, Math.ceil(cx + r));
        const y0 = Math.max(0, Math.floor(cy - r));
        const y1 = Math.min(size - 1, Math.ceil(cy + r));

        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const dx = x - cx;
                const dy = y - cy;
                const d2 = dx * dx + dy * dy;
                const val = brightness * Math.exp(-d2 / (2 * sigma * sigma));
                data[y * size + x] += val;
            }
        }
    }

    /**
     * Add an extended source (galaxy / nebula).
     */
    function addExtendedSource(data, size, cx, cy, brightness, sigma, rng) {
        const r = Math.ceil(sigma * 3);
        const x0 = Math.max(0, Math.floor(cx - r));
        const x1 = Math.min(size - 1, Math.ceil(cx + r));
        const y0 = Math.max(0, Math.floor(cy - r));
        const y1 = Math.min(size - 1, Math.ceil(cy + r));

        const angle = rng() * Math.PI;
        const ellipticity = 0.3 + rng() * 0.5;

        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                let dx = x - cx;
                let dy = y - cy;
                // Rotate
                const rx = dx * Math.cos(angle) + dy * Math.sin(angle);
                const ry = -dx * Math.sin(angle) + dy * Math.cos(angle);
                const d2 = rx * rx + (ry / ellipticity) * (ry / ellipticity);
                const val = brightness * Math.exp(-d2 / (2 * sigma * sigma));
                data[y * size + x] += val;
            }
        }
    }

    /**
     * Seeded pseudo-random number generator.
     */
    function createSeededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    /**
     * Apply stretch function to normalize data for display.
     */
    function applyStretch(data, mode = 'asinh') {
        const len = data.length;
        const sorted = Float32Array.from(data).sort();
        const lo = sorted[Math.floor(len * 0.01)];   // 1st percentile
        const hi = sorted[Math.floor(len * 0.995)];   // 99.5th percentile

        const result = new Float32Array(len);
        const range = hi - lo || 1;

        for (let i = 0; i < len; i++) {
            let val = (data[i] - lo) / range;
            val = Math.max(0, Math.min(1, val));

            switch (mode) {
                case 'linear':
                    break;
                case 'log':
                    val = Math.log1p(val * 100) / Math.log1p(100);
                    break;
                case 'sqrt':
                    val = Math.sqrt(val);
                    break;
                case 'asinh':
                    val = Math.asinh(val * 10) / Math.asinh(10);
                    break;
                case 'histogram':
                    // Simple histogram equalization approximation
                    val = Math.pow(val, 0.5);
                    break;
            }

            result[i] = val * 255;
        }

        return result;
    }

    /**
     * Render stretched float data to canvas using colormap.
     */
    function renderToCanvas(stretchedData, width, height, cmap = 'grayscale') {
        canvas.width = width;
        canvas.height = height;
        const imageData = ctx.createImageData(width, height);
        const pixels = imageData.data;
        const lut = Colormaps.get(cmap);

        for (let i = 0; i < width * height; i++) {
            const val = Math.max(0, Math.min(255, Math.round(stretchedData[i])));
            pixels[i * 4]     = lut[val * 3];
            pixels[i * 4 + 1] = lut[val * 3 + 1];
            pixels[i * 4 + 2] = lut[val * 3 + 2];
            pixels[i * 4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Load frames from epoch data.
     */
    function loadFrames(epochs, ra, dec, objectName) {
        frames = [];
        const size = 256;

        for (const epoch of epochs) {
            const rawData = generateSkyFrame(ra, dec, epoch, objectName, size);
            frames.push({
                rawData: rawData,
                width: size,
                height: size,
                metadata: epoch
            });
        }

        currentFrame = 0;
        renderCurrentFrame();
    }

    /**
     * Render the current frame based on display mode.
     */
    function renderCurrentFrame() {
        if (frames.length === 0) return;

        let dataToRender;
        const frame = frames[currentFrame];

        switch (displayMode) {
            case 'blink':
                dataToRender = frame.rawData;
                break;

            case 'difference':
                // Show difference between current and previous frame
                const prevIdx = (currentFrame - 1 + frames.length) % frames.length;
                const prevFrame = frames[prevIdx];
                const diffData = new Float32Array(frame.rawData.length);
                for (let i = 0; i < diffData.length; i++) {
                    diffData[i] = Math.abs(frame.rawData[i] - prevFrame.rawData[i]) * 3;
                }
                dataToRender = diffData;
                break;

            case 'stack':
                // Average all frames
                const stackData = new Float32Array(frame.rawData.length);
                for (const f of frames) {
                    for (let i = 0; i < stackData.length; i++) {
                        stackData[i] += f.rawData[i];
                    }
                }
                for (let i = 0; i < stackData.length; i++) {
                    stackData[i] /= frames.length;
                }
                dataToRender = stackData;
                break;
        }

        const stretched = applyStretch(dataToRender, stretchMode);
        renderToCanvas(stretched, frame.width, frame.height, colormapName);

        // Update epoch label
        const label = document.getElementById('blink-epoch-label');
        if (label && frame.metadata) {
            const meta = frame.metadata;
            let text = `Epoch ${currentFrame + 1}/${frames.length}`;
            if (meta.dateLabel) text += ` • ${meta.dateLabel}`;
            if (meta.collection) text += ` • ${meta.collection}`;
            if (displayMode === 'difference') text += ' [DIFF]';
            if (displayMode === 'stack') text += ' [STACKED]';
            label.textContent = text;
        }

        // Callback
        if (onFrameChange) {
            onFrameChange(currentFrame, frame);
        }
    }

    /**
     * Start blink animation.
     */
    function play() {
        if (frames.length < 2) return;
        if (isPlaying) return;
        isPlaying = true;
        animationTimer = setInterval(() => {
            currentFrame = (currentFrame + 1) % frames.length;
            renderCurrentFrame();
        }, blinkSpeed);
    }

    /**
     * Stop blink animation.
     */
    function pause() {
        isPlaying = false;
        if (animationTimer) {
            clearInterval(animationTimer);
            animationTimer = null;
        }
    }

    /**
     * Toggle play/pause.
     */
    function togglePlay() {
        if (isPlaying) pause();
        else play();
        return isPlaying;
    }

    /**
     * Go to next frame.
     */
    function nextFrame() {
        if (frames.length === 0) return;
        pause();
        currentFrame = (currentFrame + 1) % frames.length;
        renderCurrentFrame();
    }

    /**
     * Go to previous frame.
     */
    function prevFrame() {
        if (frames.length === 0) return;
        pause();
        currentFrame = (currentFrame - 1 + frames.length) % frames.length;
        renderCurrentFrame();
    }

    /**
     * Jump to a specific frame.
     */
    function goToFrame(index) {
        if (index >= 0 && index < frames.length) {
            pause();
            currentFrame = index;
            renderCurrentFrame();
        }
    }

    /**
     * Set blink speed.
     */
    function setSpeed(ms) {
        blinkSpeed = ms;
        if (isPlaying) {
            pause();
            play();
        }
    }

    /**
     * Set stretch mode.
     */
    function setStretch(mode) {
        stretchMode = mode;
        renderCurrentFrame();
    }

    /**
     * Set colormap.
     */
    function setColormap(name) {
        colormapName = name;
        renderCurrentFrame();
    }

    /**
     * Set display mode.
     */
    function setDisplayMode(mode) {
        displayMode = mode;
        renderCurrentFrame();
    }

    /**
     * Get current state.
     */
    function getState() {
        return {
            frameCount: frames.length,
            currentFrame,
            isPlaying,
            blinkSpeed,
            stretchMode,
            colormapName,
            displayMode
        };
    }

    return {
        init,
        loadFrames,
        renderCurrentFrame,
        play,
        pause,
        togglePlay,
        nextFrame,
        prevFrame,
        goToFrame,
        setSpeed,
        setStretch,
        setColormap,
        setDisplayMode,
        getState
    };
})();
