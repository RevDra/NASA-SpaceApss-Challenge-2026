/**
 * SPHEREx Sky Viewer — Spectrum Module
 * Handles spectrum extraction and chart rendering.
 */

const SpectrumViewer = (() => {
    let chart = null;
    let chartCanvas = null;

    /**
     * Initialize the spectrum viewer.
     */
    function init(canvasId) {
        chartCanvas = document.getElementById(canvasId);
    }

    /**
     * Render a spectrum using Chart.js.
     */
    function renderSpectrum(spectrumData, objectName = 'Unknown') {
        if (!chartCanvas) return;

        // Hide placeholder
        const placeholder = document.getElementById('spectrum-placeholder');
        if (placeholder) placeholder.classList.add('hidden');
        chartCanvas.classList.remove('hidden');

        const wavelengths = spectrumData.map(d => d.wavelength.toFixed(3));
        const fluxes = spectrumData.map(d => d.flux);
        const errors = spectrumData.map(d => d.fluxErr);

        // Color each point by its detector
        const pointColors = spectrumData.map(d => {
            const wl = d.wavelength;
            if (wl < 1.11) return '#818cf8';      // D1
            if (wl < 1.64) return '#60a5fa';      // D2
            if (wl < 2.42) return '#34d399';      // D3
            if (wl < 3.82) return '#fbbf24';      // D4
            if (wl < 4.42) return '#f97316';      // D5
            return '#ef4444';                      // D6
        });

        // Destroy existing chart
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(chartCanvas, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: `${objectName} — SPHEREx Spectrum`,
                        data: spectrumData.map(d => ({ x: d.wavelength, y: d.flux })),
                        showLine: true,
                        borderColor: '#3b82f6',
                        borderWidth: 1.5,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: pointColors,
                        pointBorderColor: 'transparent',
                        tension: 0.3
                    },
                    {
                        label: 'Error bars',
                        data: spectrumData.map(d => ({
                            x: d.wavelength,
                            y: d.flux + d.fluxErr
                        })),
                        showLine: true,
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        borderWidth: 0.5,
                        borderDash: [2, 2],
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Error bars (low)',
                        data: spectrumData.map(d => ({
                            x: d.wavelength,
                            y: d.flux - d.fluxErr
                        })),
                        showLine: true,
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        borderWidth: 0.5,
                        borderDash: [2, 2],
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 32, 53, 0.95)',
                        borderColor: '#2a3555',
                        borderWidth: 1,
                        titleColor: '#e8ecf4',
                        bodyColor: '#94a3b8',
                        titleFont: { size: 12, family: 'monospace' },
                        bodyFont: { size: 11, family: 'monospace' },
                        callbacks: {
                            title: function(items) {
                                if (items[0]) {
                                    return `λ = ${items[0].parsed.x.toFixed(3)} µm`;
                                }
                            },
                            label: function(item) {
                                if (item.datasetIndex === 0) {
                                    const band = spectrumData[item.dataIndex];
                                    return [
                                        `Flux: ${item.parsed.y.toFixed(3)} MJy/sr`,
                                        `Band: ${band.band}/102`
                                    ];
                                }
                                return null;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Wavelength (µm)',
                            color: '#94a3b8',
                            font: { size: 11 }
                        },
                        ticks: { color: '#64748b', font: { size: 10 } },
                        grid: { color: 'rgba(42, 53, 85, 0.5)' },
                        min: 0.7,
                        max: 5.1
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Flux (MJy/sr)',
                            color: '#94a3b8',
                            font: { size: 11 }
                        },
                        ticks: { color: '#64748b', font: { size: 10 } },
                        grid: { color: 'rgba(42, 53, 85, 0.5)' },
                        beginAtZero: true
                    }
                }
            }
        });

        // Add detector range annotations
        addDetectorAnnotations();
    }

    /**
     * Add colored detector range indicators at the top.
     */
    function addDetectorAnnotations() {
        // This is handled via the point colors in the scatter plot
    }

    /**
     * Clear the spectrum chart.
     */
    function clear() {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        if (chartCanvas) chartCanvas.classList.add('hidden');
        const placeholder = document.getElementById('spectrum-placeholder');
        if (placeholder) placeholder.classList.remove('hidden');
    }

    return { init, renderSpectrum, clear };
})();
