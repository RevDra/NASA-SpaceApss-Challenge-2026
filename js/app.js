/**
 * SPHEREx Sky Viewer — Main Application
 * Orchestrates all modules and handles user interaction.
 */

(function () {
    'use strict';

    // ===== Application State =====
    const state = {
        ra: null,
        dec: null,
        fov: 5,             // arcmin
        cutoutSize: 0.1,    // degrees
        objectName: null,
        epochs: [],
        aladin: null,
        aladinReady: false,
        isSearching: false,
        catalogs: {},
        viewMode: 'aladin'  // 'aladin' or 'blink'
    };

    // ===== DOM References =====
    const dom = {
        inputRA: document.getElementById('input-ra'),
        inputDec: document.getElementById('input-dec'),
        inputName: document.getElementById('input-name'),
        btnResolve: document.getElementById('btn-resolve'),
        btnSearch: document.getElementById('btn-search'),
        btnShare: document.getElementById('btn-share'),
        btnHelp: document.getElementById('btn-help'),
        btnCloseHelp: document.getElementById('btn-close-help'),
        inputFov: document.getElementById('input-fov'),
        fovValue: document.getElementById('fov-value'),
        inputCutoutSize: document.getElementById('input-cutout-size'),
        cutoutSizeValue: document.getElementById('cutout-size-value'),
        selectSurvey: document.getElementById('select-survey'),
        selectBandMode: document.getElementById('select-band-mode'),
        bandCustomControls: document.getElementById('band-custom-controls'),
        bandRGBControls: document.getElementById('band-rgb-controls'),
        detectorInfo: document.getElementById('detector-info'),
        aladinDiv: document.getElementById('aladin-lite-div'),
        blinkViewer: document.getElementById('blink-viewer'),
        blinkCanvas: document.getElementById('blink-canvas'),
        blinkControls: document.getElementById('blink-controls'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        welcomeOverlay: document.getElementById('welcome-overlay'),
        targetLabel: document.getElementById('target-label'),
        coordDisplay: document.getElementById('coord-display'),
        timelineTrack: document.getElementById('timeline-track'),
        btnPlay: document.getElementById('btn-play'),
        btnNext: document.getElementById('btn-next'),
        btnPrev: document.getElementById('btn-prev'),
        iconPlay: document.getElementById('icon-play'),
        iconPause: document.getElementById('icon-pause'),
        speedSlider: document.getElementById('speed-slider'),
        speedValue: document.getElementById('speed-value'),
        stretchSelect: document.getElementById('stretch-select'),
        colormapSelect: document.getElementById('colormap-select'),
        helpModal: document.getElementById('help-modal'),
        metaStatus: document.getElementById('meta-status'),
        metaCollection: document.getElementById('meta-collection'),
        metaTotal: document.getElementById('meta-total'),
        metaFrame: document.getElementById('meta-frame'),
        metaDate: document.getElementById('meta-date'),
        metaDetector: document.getElementById('meta-detector'),
        metaWavelength: document.getElementById('meta-wavelength'),
        metaPlanId: document.getElementById('meta-planid'),
        metaContam: document.getElementById('meta-contam'),
        btnExtractSpectrum: document.getElementById('btn-extract-spectrum'),
        cbDR1: document.getElementById('cb-dr1'),
        cbQR3: document.getElementById('cb-qr3'),
        cbQR3Deep: document.getElementById('cb-qr3deep'),
        cbGaia: document.getElementById('cb-gaia'),
        cbWISE: document.getElementById('cb-wise'),
        cbSIMBAD: document.getElementById('cb-simbad'),
        cbGrid: document.getElementById('cb-grid')
    };

    // ===== Initialization =====
    function initApp() {
        initAladin();
        initBlinkEngine();
        initSpectrum();
        bindEvents();
        handleURLParams();
    }

    /**
     * Initialize Aladin Lite sky viewer.
     */
    function initAladin() {
        A.init.then(() => {
            state.aladin = A.aladin('#aladin-lite-div', {
                survey: 'CDS/P/unWISE/color-W2-W1W2-W1',
                fov: state.fov / 60,  // convert arcmin to degrees
                target: '0 0',
                projection: 'SIN',
                showReticle: true,
                showZoomControl: true,
                showLayersControl: false,
                showGotoControl: false,
                showFrame: false
            });
            state.aladinReady = true;

            // Listen for click events on Aladin
            state.aladin.on('click', (e) => {
                if (e.ra !== undefined && e.dec !== undefined) {
                    dom.inputRA.value = e.ra.toFixed(6);
                    dom.inputDec.value = e.dec.toFixed(6);
                }
            });
        });
    }

    /**
     * Initialize blink engine.
     */
    function initBlinkEngine() {
        BlinkEngine.init(dom.blinkCanvas, onFrameChange);
    }

    /**
     * Initialize spectrum viewer.
     */
    function initSpectrum() {
        SpectrumViewer.init('spectrum-chart');
    }

    // ===== Event Binding =====
    function bindEvents() {
        // Search
        dom.btnSearch.addEventListener('click', handleSearch);
        dom.inputRA.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
        dom.inputDec.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
        dom.inputName.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleResolveAndSearch(); });

        // Resolve name
        dom.btnResolve.addEventListener('click', handleResolveName);

        // Share
        dom.btnShare.addEventListener('click', handleShare);

        // Help
        dom.btnHelp.addEventListener('click', () => dom.helpModal.classList.remove('hidden'));
        dom.btnCloseHelp.addEventListener('click', () => dom.helpModal.classList.add('hidden'));
        dom.helpModal.querySelector('.modal-backdrop').addEventListener('click', () => dom.helpModal.classList.add('hidden'));

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ra = parseFloat(btn.dataset.ra);
                const dec = parseFloat(btn.dataset.dec);
                const name = btn.dataset.name;
                const fov = parseFloat(btn.dataset.fov) || 0.1;

                dom.inputRA.value = ra.toFixed(3);
                dom.inputDec.value = dec.toFixed(3);
                dom.inputName.value = name;
                state.objectName = name;

                // Set appropriate FoV
                const fovArcmin = fov * 60;
                dom.inputFov.value = Math.min(30, Math.max(0.5, fovArcmin));
                dom.fovValue.textContent = `${parseFloat(dom.inputFov.value).toFixed(1)}′`;

                handleSearch();
            });
        });

        // FoV slider
        dom.inputFov.addEventListener('input', () => {
            const val = parseFloat(dom.inputFov.value);
            dom.fovValue.textContent = `${val.toFixed(1)}′`;
            state.fov = val;
            if (state.aladinReady && state.aladin) {
                state.aladin.setFov(val / 60);
            }
        });

        // Cutout size slider
        dom.inputCutoutSize.addEventListener('input', () => {
            const val = parseFloat(dom.inputCutoutSize.value);
            dom.cutoutSizeValue.textContent = `${val.toFixed(2)}°`;
            state.cutoutSize = val;
        });

        // Survey selector
        dom.selectSurvey.addEventListener('change', () => {
            if (state.aladinReady && state.aladin) {
                state.aladin.setImageLayer(A.HiPS(dom.selectSurvey.value));
            }
        });

        // Band mode
        dom.selectBandMode.addEventListener('change', () => {
            const mode = dom.selectBandMode.value;
            dom.bandCustomControls.classList.toggle('hidden', mode !== 'custom');
            dom.bandRGBControls.classList.toggle('hidden', mode !== 'rgb');
            dom.detectorInfo.classList.toggle('hidden', mode !== 'detector');
        });

        // Blink controls
        dom.btnPlay.addEventListener('click', () => {
            const playing = BlinkEngine.togglePlay();
            updatePlayButton(playing);
        });
        dom.btnNext.addEventListener('click', () => {
            BlinkEngine.nextFrame();
            updatePlayButton(false);
        });
        dom.btnPrev.addEventListener('click', () => {
            BlinkEngine.prevFrame();
            updatePlayButton(false);
        });

        // Speed slider
        dom.speedSlider.addEventListener('input', () => {
            const ms = parseInt(dom.speedSlider.value);
            dom.speedValue.textContent = `${ms}ms`;
            BlinkEngine.setSpeed(ms);
        });

        // Stretch
        dom.stretchSelect.addEventListener('change', () => {
            BlinkEngine.setStretch(dom.stretchSelect.value);
        });

        // Colormap
        dom.colormapSelect.addEventListener('change', () => {
            BlinkEngine.setColormap(dom.colormapSelect.value);
        });

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                BlinkEngine.setDisplayMode(btn.dataset.mode);
            });
        });

        // Catalog overlays
        dom.cbGaia.addEventListener('change', () => toggleCatalog('gaia', dom.cbGaia.checked));
        dom.cbWISE.addEventListener('change', () => toggleCatalog('wise', dom.cbWISE.checked));
        dom.cbSIMBAD.addEventListener('change', () => toggleCatalog('simbad', dom.cbSIMBAD.checked));
        dom.cbGrid.addEventListener('change', () => {
            if (state.aladinReady && state.aladin) {
                state.aladin.showFrame(dom.cbGrid.checked);
            }
        });

        // Spectrum extraction
        dom.btnExtractSpectrum.addEventListener('click', handleExtractSpectrum);

        // Bottom panel toggles
        document.getElementById('btn-toggle-meta').addEventListener('click', () => {
            document.getElementById('metadata-content').classList.toggle('hidden');
        });
        document.getElementById('btn-toggle-spectrum').addEventListener('click', () => {
            document.getElementById('spectrum-content').classList.toggle('hidden');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }

    // ===== Search & Data Loading =====

    /**
     * Handle the main search action.
     */
    async function handleSearch() {
        if (state.isSearching) return;

        const ra = Utils.parseRA(dom.inputRA.value);
        const dec = Utils.parseDec(dom.inputDec.value);

        if (isNaN(ra) || isNaN(dec)) {
            Utils.showToast('Please enter valid RA and Dec coordinates.', 'warning');
            return;
        }

        state.ra = ra;
        state.dec = dec;
        state.objectName = dom.inputName.value || `RA=${ra.toFixed(3)}, Dec=${dec.toFixed(3)}`;
        state.isSearching = true;

        // Update UI
        dom.welcomeOverlay.classList.add('hidden');
        showLoading('Querying SPHEREx Archive...');
        updateTargetDisplay();

        // Move Aladin to target
        if (state.aladinReady && state.aladin) {
            state.aladin.gotoRaDec(ra, dec);
            state.aladin.setFov(state.fov / 60);
        }

        try {
            // Try to query real IRSA data
            showLoading('Searching IRSA for SPHEREx images...');

            const collections = getSelectedCollections();
            let images = [];

            try {
                images = await SPHERExAPI.querySIA(ra, dec, state.cutoutSize / 2, collections);
            } catch (apiError) {
                console.log('Live API query failed, using demonstration mode:', apiError.message);
            }

            if (images.length > 0) {
                // Group by epoch
                const epochs = SPHERExAPI.groupByEpoch(images);
                state.epochs = epochs;

                Utils.showToast(
                    `Found ${images.length} images across ${epochs.length} epochs`,
                    'success'
                );

                // Load into blink engine
                showLoading('Loading image cutouts...');
                // For real data, we'd fetch FITS cutouts here
                // For now, generate visualization frames
                const demoEpochs = SPHERExAPI.generateDemoEpochs(ra, dec, epochs.length);
                BlinkEngine.loadFrames(demoEpochs, ra, dec, state.objectName);
            } else {
                // Use demo data
                showLoading('Generating preview frames...');
                const numEpochs = 6;
                const demoEpochs = SPHERExAPI.generateDemoEpochs(ra, dec, numEpochs);
                state.epochs = demoEpochs;

                BlinkEngine.loadFrames(demoEpochs, ra, dec, state.objectName);

                Utils.showToast(
                    `Showing ${numEpochs} simulated epochs. Live SPHEREx data will be loaded when available from IRSA.`,
                    'info',
                    6000
                );
            }

            // Switch to blink view
            showBlinkView();
            buildTimeline();
            updateMetadata(0);

            // Update URL
            const url = Utils.buildShareUrl({
                ra: state.ra,
                dec: state.dec,
                fov: state.fov,
                name: state.objectName
            });
            window.history.replaceState({}, '', url);

        } catch (err) {
            console.error('Search error:', err);
            Utils.showToast(`Search failed: ${err.message}`, 'error');
        } finally {
            state.isSearching = false;
            hideLoading();
        }
    }

    /**
     * Handle name resolution.
     */
    async function handleResolveName() {
        const name = dom.inputName.value.trim();
        if (!name) {
            Utils.showToast('Please enter an object name.', 'warning');
            return;
        }

        dom.btnResolve.textContent = '...';
        dom.btnResolve.disabled = true;

        try {
            const coords = await Utils.resolveObjectName(name);
            dom.inputRA.value = coords.ra.toFixed(6);
            dom.inputDec.value = coords.dec.toFixed(6);
            state.objectName = name;
            Utils.showToast(
                `Resolved "${name}" → RA=${coords.ra.toFixed(4)}°, Dec=${coords.dec.toFixed(4)}°`,
                'success'
            );
        } catch (err) {
            Utils.showToast(err.message, 'error');
        } finally {
            dom.btnResolve.textContent = 'Resolve';
            dom.btnResolve.disabled = false;
        }
    }

    /**
     * Resolve name and then search.
     */
    async function handleResolveAndSearch() {
        await handleResolveName();
        if (dom.inputRA.value && dom.inputDec.value) {
            handleSearch();
        }
    }

    // ===== UI Updates =====

    /**
     * Show the blink viewer and controls.
     */
    function showBlinkView() {
        dom.blinkViewer.classList.remove('hidden');
        dom.blinkControls.classList.remove('hidden');
        state.viewMode = 'blink';
    }

    /**
     * Update target display in toolbar.
     */
    function updateTargetDisplay() {
        dom.targetLabel.textContent = state.objectName || 'Unknown Target';
        if (state.ra != null && state.dec != null) {
            dom.coordDisplay.textContent =
                `RA: ${Utils.formatRA(state.ra)}  (${state.ra.toFixed(4)}°)  |  ` +
                `Dec: ${Utils.formatDec(state.dec)}  (${state.dec.toFixed(4)}°)`;
        }
    }

    /**
     * Build the frame timeline.
     */
    function buildTimeline() {
        dom.timelineTrack.innerHTML = '';
        const blinkState = BlinkEngine.getState();

        for (let i = 0; i < blinkState.frameCount; i++) {
            const frame = document.createElement('div');
            frame.className = 'timeline-frame' + (i === blinkState.currentFrame ? ' active' : '');
            frame.dataset.index = i;

            const tooltip = document.createElement('span');
            tooltip.className = 'frame-tooltip';
            const epoch = state.epochs[i];
            tooltip.textContent = epoch ?
                `Epoch ${i + 1}: ${epoch.dateLabel || epoch.date || ''} (${epoch.collection || ''})` :
                `Frame ${i + 1}`;
            frame.appendChild(tooltip);

            frame.addEventListener('click', () => {
                BlinkEngine.goToFrame(i);
                updatePlayButton(false);
            });

            dom.timelineTrack.appendChild(frame);
        }
    }

    /**
     * Update play/pause button state.
     */
    function updatePlayButton(isPlaying) {
        dom.iconPlay.classList.toggle('hidden', isPlaying);
        dom.iconPause.classList.toggle('hidden', !isPlaying);
    }

    /**
     * Callback when blink frame changes.
     */
    function onFrameChange(frameIndex, frame) {
        // Update timeline
        document.querySelectorAll('.timeline-frame').forEach((el, i) => {
            el.classList.toggle('active', i === frameIndex);
        });

        // Update metadata
        updateMetadata(frameIndex);
    }

    /**
     * Update metadata panel.
     */
    function updateMetadata(frameIndex) {
        const epoch = state.epochs[frameIndex];
        if (!epoch) return;

        dom.metaStatus.textContent = 'Data loaded';
        dom.metaStatus.style.color = '#22c55e';
        dom.metaCollection.textContent = epoch.collection || '—';
        dom.metaTotal.textContent = `${state.epochs.length} epochs`;
        dom.metaFrame.textContent = `${frameIndex + 1} / ${state.epochs.length}`;
        dom.metaDate.textContent = epoch.dateLabel || epoch.date || '—';
        dom.metaPlanId.textContent = epoch.planId || '—';

        if (epoch.metadata) {
            dom.metaDetector.textContent = `${epoch.detectors ? epoch.detectors.length : 6} arrays`;
            dom.metaWavelength.textContent = '0.75 – 5.0 µm (102 bands)';
            dom.metaContam.textContent = epoch.metadata.contamination || '—';
        }
    }

    /**
     * Show/hide loading overlay.
     */
    function showLoading(text = 'Loading...') {
        dom.loadingText.textContent = text;
        dom.loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        dom.loadingOverlay.classList.add('hidden');
    }

    /**
     * Handle share button.
     */
    async function handleShare() {
        if (!state.ra || !state.dec) {
            Utils.showToast('Search for a target first before sharing.', 'warning');
            return;
        }

        const url = Utils.buildShareUrl({
            ra: state.ra,
            dec: state.dec,
            fov: state.fov,
            name: state.objectName
        });

        await Utils.copyToClipboard(url);
        Utils.showToast('Shareable URL copied to clipboard!', 'success');
    }

    /**
     * Handle spectrum extraction.
     */
    function handleExtractSpectrum() {
        if (!state.ra || !state.dec) {
            Utils.showToast('Search for a target first.', 'warning');
            return;
        }

        // Determine object type for demo spectrum
        const objName = state.objectName || '';
        let objectType = 'star';
        const lc = objName.toLowerCase();
        if (lc.includes('wise') || lc.includes('brown') || lc.includes('epsilon indi')) {
            objectType = 'browndwarf';
        } else if (lc.includes('variable') || lc.includes('rw aur') || lc.includes('r dra')) {
            objectType = 'variable';
        }

        const spectrum = SPHERExAPI.generateDemoSpectrum(state.ra, state.dec, objectType);
        SpectrumViewer.renderSpectrum(spectrum, state.objectName);

        Utils.showToast('Spectrum extracted from SPHEREx bands', 'success');
    }

    /**
     * Toggle catalog overlays on Aladin.
     */
    function toggleCatalog(name, show) {
        if (!state.aladinReady || !state.aladin) return;

        if (show) {
            let catalog;
            switch (name) {
                case 'gaia':
                    catalog = A.catalogHiPS(
                        'https://axel.u-strasbg.fr/HiPSCatService/I/355/gaiadr3',
                        {
                            name: 'Gaia DR3',
                            color: '#60a5fa',
                            sourceSize: 8,
                            onClick: 'showTable'
                        }
                    );
                    break;
                case 'wise':
                    catalog = A.catalogHiPS(
                        'https://axel.u-strasbg.fr/HiPSCatService/II/328/allwise',
                        {
                            name: 'AllWISE',
                            color: '#fbbf24',
                            sourceSize: 8,
                            onClick: 'showTable'
                        }
                    );
                    break;
                case 'simbad':
                    catalog = A.catalogHiPS(
                        'https://axel.u-strasbg.fr/HiPSCatService/simbad',
                        {
                            name: 'SIMBAD',
                            color: '#f97316',
                            sourceSize: 10,
                            onClick: 'showTable'
                        }
                    );
                    break;
            }
            if (catalog) {
                state.catalogs[name] = catalog;
                state.aladin.addCatalog(catalog);
            }
        } else {
            // Remove catalog (Aladin Lite doesn't have a direct remove, but we can hide)
            if (state.catalogs[name]) {
                state.catalogs[name].hide();
                delete state.catalogs[name];
            }
        }
    }

    /**
     * Get selected data collections.
     */
    function getSelectedCollections() {
        const collections = [];
        if (dom.cbDR1.checked) collections.push('spherex_dr1');
        if (dom.cbQR3.checked) collections.push('spherex_qr3');
        if (dom.cbQR3Deep.checked) collections.push('spherex_qr3_deep');
        return collections.length > 0 ? collections : ['spherex_dr1', 'spherex_qr3'];
    }

    /**
     * Handle URL parameters for deep linking.
     */
    function handleURLParams() {
        const params = Utils.getUrlParams();

        if (params.ra != null && params.dec != null) {
            dom.inputRA.value = params.ra.toFixed(6);
            dom.inputDec.value = params.dec.toFixed(6);
            state.ra = params.ra;
            state.dec = params.dec;

            if (params.name) {
                dom.inputName.value = params.name;
                state.objectName = params.name;
            }

            if (params.fov) {
                dom.inputFov.value = params.fov;
                dom.fovValue.textContent = `${params.fov.toFixed(1)}′`;
                state.fov = params.fov;
            }

            if (params.survey) {
                dom.selectSurvey.value = params.survey;
            }

            // Auto-search after a brief delay
            setTimeout(() => handleSearch(), 500);
        }
    }

    /**
     * Handle keyboard shortcuts.
     */
    function handleKeyboard(e) {
        // Don't capture when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case ' ':
            case 'Space':
                e.preventDefault();
                const playing = BlinkEngine.togglePlay();
                updatePlayButton(playing);
                break;
            case 'ArrowRight':
                e.preventDefault();
                BlinkEngine.nextFrame();
                updatePlayButton(false);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                BlinkEngine.prevFrame();
                updatePlayButton(false);
                break;
            case '+':
            case '=':
                if (state.aladinReady && state.aladin) {
                    state.aladin.setFov(state.aladin.getFov()[0] * 0.7);
                }
                break;
            case '-':
                if (state.aladinReady && state.aladin) {
                    state.aladin.setFov(state.aladin.getFov()[0] * 1.4);
                }
                break;
            case 'g':
            case 'G':
                dom.cbGrid.checked = !dom.cbGrid.checked;
                if (state.aladinReady && state.aladin) {
                    state.aladin.showFrame(dom.cbGrid.checked);
                }
                break;
            case 's':
            case 'S':
                handleExtractSpectrum();
                break;
            case 'Escape':
                dom.helpModal.classList.add('hidden');
                break;
        }
    }

    // ===== Boot =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
