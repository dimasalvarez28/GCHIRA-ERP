/**
 * ============================================================================
 * KPI CARD — Tarjeta de indicador clave (icono, valor, variación)
 * ============================================================================
 */

const ICONS = {
  money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12l8.73-5.04M12 22.08V12"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-4 7 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>'
};

/**
 * Construye el HTML de una tarjeta KPI.
 * @param {{label:string, value:string, icon:string, tone:string, delta?:number, deltaLabel?:string}} opts
 */
export function kpiCard({ label, value, icon = 'trend', tone = 'brand', delta, deltaLabel }) {
  const deltaHtml = (delta === undefined || delta === null) ? '' : `
    <span class="kpi-card__delta ${delta >= 0 ? 'kpi-card__delta--up' : 'kpi-card__delta--down'}">
      ${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(1)}% ${deltaLabel || ''}
    </span>`;

  return `
    <article class="kpi-card">
      <div class="kpi-card__top">
        <div class="kpi-card__icon kpi-card__icon--${tone}">${ICONS[icon] || ICONS.trend}</div>
        ${deltaHtml}
      </div>
      <div class="kpi-card__value">${value}</div>
      <div class="kpi-card__label">${label}</div>
    </article>`;
}
