/**
 * ============================================================================
 * CHARTS.JS — Fábrica y registro de gráficos Chart.js
 * ============================================================================
 * Centraliza la creación de gráficos: aplica tema (colores según claro/oscuro),
 * destruye instancias previas al re-renderizar y define defaults consistentes.
 */
import { chartPalette } from './utils.js';
import { currentTheme } from './theme.js';

const registry = new Map();

function themeColors() {
  const dark = currentTheme() === 'dark';
  return {
    text: dark ? '#AEB4C6' : '#4B5468',
    grid: dark ? '#1E2438' : '#EDEFF5',
    tooltipBg: dark ? '#171D2E' : '#101828',
    tooltipText: '#FFFFFF'
  };
}

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;

/**
 * Crea (o reemplaza) un gráfico Chart.js en el canvas indicado.
 * @param {string} canvasId - id del <canvas>.
 * @param {string} type - 'line' | 'bar' | 'doughnut' | 'pie' | 'radar' | ...
 * @param {object} data - dataset de Chart.js.
 * @param {object} extraOptions - opciones adicionales a fusionar.
 */
export function renderChart(canvasId, type, data, extraOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  if (registry.has(canvasId)) {
    registry.get(canvasId).destroy();
  }

  const colors = themeColors();
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: colors.text, usePointStyle: true, boxWidth: 8, padding: 16 }
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4
      }
    },
    scales: (type === 'doughnut' || type === 'pie' || type === 'radar')
      ? {}
      : {
          x: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text } },
          y: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text }, beginAtZero: true }
        }
  };

  const chart = new Chart(canvas.getContext('2d'), {
    type,
    data,
    options: deepMerge(baseOptions, extraOptions)
  });

  registry.set(canvasId, chart);
  return chart;
}

/** Vuelve a dibujar todos los gráficos activos (por ejemplo, al cambiar de tema). */
export function refreshAllChartsTheme() {
  registry.forEach(chart => {
    const colors = themeColors();
    if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = colors.text;
    if (chart.options.scales?.x) {
      chart.options.scales.x.ticks.color = colors.text;
      chart.options.scales.x.grid.color = colors.grid;
    }
    if (chart.options.scales?.y) {
      chart.options.scales.y.ticks.color = colors.text;
      chart.options.scales.y.grid.color = colors.grid;
    }
    chart.update();
  });
}

/** Libera todos los gráficos (llamar al desmontar una página). */
export function destroyAllCharts() {
  registry.forEach(chart => chart.destroy());
  registry.clear();
}

export function palette() {
  return chartPalette();
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}
