/**
 * ============================================================================
 * FILTER BAR — Filtros por fecha, cliente y producto (transversales)
 * ============================================================================
 */
import { store, setFilters, resetFilters } from '../js/state.js';
import { uniqueValues } from '../js/utils.js';

/**
 * Monta la barra de filtros dentro de containerId.
 * @param {string} containerId
 * @param {Array<Object>} sourceRows - filas usadas para poblar los <select> de cliente/producto
 * @param {Function} onChange - callback ejecutado cada vez que cambian los filtros
 */
export function mountFilterBar(containerId, sourceRows, onChange) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const clientes = uniqueValues(sourceRows, 'cliente');
  const productos = uniqueValues(sourceRows, 'producto');

  el.innerHTML = `
    <div class="filter-field">
      <label for="filterFrom">Desde</label>
      <input type="date" id="filterFrom" class="field-control" value="${store.filters.dateFrom}" />
    </div>
    <div class="filter-field">
      <label for="filterTo">Hasta</label>
      <input type="date" id="filterTo" class="field-control" value="${store.filters.dateTo}" />
    </div>
    ${clientes.length ? `
    <div class="filter-field">
      <label for="filterCliente">Cliente</label>
      <select id="filterCliente" class="field-control">
        <option value="">Todos</option>
        ${clientes.map(c => `<option value="${c}" ${store.filters.cliente === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>` : ''}
    ${productos.length ? `
    <div class="filter-field">
      <label for="filterProducto">Producto</label>
      <select id="filterProducto" class="field-control">
        <option value="">Todos</option>
        ${productos.map(p => `<option value="${p}" ${store.filters.producto === p ? 'selected' : ''}>${p}</option>`).join('')}
      </select>
    </div>` : ''}
    <div class="filter-bar__actions">
      <button class="btn btn--outline btn--sm" id="filterClear">Limpiar filtros</button>
    </div>
  `;

  el.querySelector('#filterFrom').addEventListener('change', e => { setFilters({ dateFrom: e.target.value }); onChange(); });
  el.querySelector('#filterTo').addEventListener('change', e => { setFilters({ dateTo: e.target.value }); onChange(); });
  el.querySelector('#filterCliente')?.addEventListener('change', e => { setFilters({ cliente: e.target.value }); onChange(); });
  el.querySelector('#filterProducto')?.addEventListener('change', e => { setFilters({ producto: e.target.value }); onChange(); });
  el.querySelector('#filterClear').addEventListener('click', () => { resetFilters(); onChange(); mountFilterBar(containerId, sourceRows, onChange); });
}
