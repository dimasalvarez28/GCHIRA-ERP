/**
 * ============================================================================
 * SEARCH.JS — Búsqueda global (command palette, Ctrl/Cmd + K)
 * ============================================================================
 * Busca simultáneamente en ventas y pedidos, y permite saltar directo al
 * dashboard correspondiente aplicando el filtro de cliente.
 */
import { store, setFilters } from './state.js';
import { debounce, formatCurrency, formatDate } from './utils.js';

let overlayEl = null;

export function openSearch() {
  if (!overlayEl) buildOverlay();
  overlayEl.classList.remove('hidden');
  const input = overlayEl.querySelector('input');
  input.value = '';
  input.focus();
  renderResults('');
}

export function closeSearch() {
  overlayEl?.classList.add('hidden');
}

function buildOverlay() {
  overlayEl = document.createElement('div');
  overlayEl.className = 'search-overlay hidden';
  overlayEl.innerHTML = `
    <div class="search-palette">
      <div class="search-palette__input-wrap">
        ${iconSearch()}
        <input type="text" placeholder="Buscar cliente, factura o producto…" />
      </div>
      <div class="search-results" id="searchResults"></div>
    </div>`;
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener('click', e => { if (e.target === overlayEl) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  const input = overlayEl.querySelector('input');
  input.addEventListener('input', debounce(() => renderResults(input.value.trim().toLowerCase()), 150));
}

function renderResults(query) {
  const resultsEl = overlayEl.querySelector('#searchResults');
  if (!query) {
    resultsEl.innerHTML = `<div class="search-result-group__label">Escribe para buscar en ventas y pedidos</div>`;
    return;
  }

  const ventasMatches = (store.data.ventas || []).filter(r =>
    matches(r.cliente, query) || matches(r.factura, query) || matches(r.direccion, query)
  ).slice(0, 5);

  const pedidosMatches = (store.data.pedidos || []).filter(r =>
    matches(r.cliente, query) || matches(r.producto, query)
  ).slice(0, 5);

  if (ventasMatches.length === 0 && pedidosMatches.length === 0) {
    resultsEl.innerHTML = `<div class="search-result-group__label">Sin resultados para "${escapeHtml(query)}"</div>`;
    return;
  }

  resultsEl.innerHTML = `
    ${ventasMatches.length ? `
      <div class="search-result-group">
        <div class="search-result-group__label">Ventas</div>
        ${ventasMatches.map(r => `
          <div class="search-result-item" data-goto="ventas" data-cliente="${escAttr(r.cliente)}">
            <span>${escapeHtml(r.cliente || '—')} · Factura ${escapeHtml(r.factura || '')}</span>
            <span class="search-result-item__meta">${formatCurrency(r.total)} · ${formatDate(r.fecha)}</span>
          </div>`).join('')}
      </div>` : ''}
    ${pedidosMatches.length ? `
      <div class="search-result-group">
        <div class="search-result-group__label">Pedidos</div>
        ${pedidosMatches.map(r => `
          <div class="search-result-item" data-goto="pedidos" data-cliente="${escAttr(r.cliente)}">
            <span>${escapeHtml(r.cliente || '—')} · ${escapeHtml(r.producto || '')}</span>
            <span class="search-result-item__meta">${escapeHtml(r.estado || '')}</span>
          </div>`).join('')}
      </div>` : ''}
  `;

  resultsEl.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.goto;
      const cliente = item.dataset.cliente;
      if (cliente) setFilters({ cliente });
      closeSearch();
      window.location.hash = `#${route}`;
    });
  });
}

function matches(value, query) {
  return String(value ?? '').toLowerCase().includes(query);
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
function escAttr(str) { return escapeHtml(str).replace(/"/g, '&quot;'); }
function iconSearch() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'; }
