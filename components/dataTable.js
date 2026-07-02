/**
 * ============================================================================
 * DATA TABLE — Tabla genérica con orden, paginación y exportación
 * ============================================================================
 * Componente reutilizado por todos los dashboards. Recibe columnas + filas
 * y se encarga de render, sort, paginación y los botones de exportar.
 *
 * columns: [{ key: 'cliente', label: 'Cliente', format?: fn, badge?: fn }]
 */
import { CONFIG } from '../js/config.js';
import { smartCompare } from '../js/utils.js';
import { exportToExcel, exportToPDF } from '../js/export.js';

export function mountDataTable(containerId, { columns, rows, title, filename, pageSize = CONFIG.ROWS_PER_PAGE }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let state = { sortKey: columns[0]?.key, sortDir: 'desc', page: 1 };

  function render() {
    const sorted = [...rows].sort((a, b) => {
      const cmp = smartCompare(a[state.sortKey], b[state.sortKey]);
      return state.sortDir === 'asc' ? cmp : -cmp;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * pageSize;
    const pageRows = sorted.slice(start, start + pageSize);

    container.innerHTML = `
      <div class="card">
        <div class="card__header">
          <div>
            <div class="card__title">${title}</div>
            <div class="card__subtitle">${rows.length} registro${rows.length === 1 ? '' : 's'}</div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn--ghost btn--sm" data-action="export-excel">
              ${iconXls()} Excel
            </button>
            <button class="btn btn--ghost btn--sm" data-action="export-pdf">
              ${iconPdf()} PDF
            </button>
          </div>
        </div>
        <div class="card__body">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  ${columns.map(col => `
                    <th data-key="${col.key}" class="${state.sortKey === col.key ? 'sorted' : ''}">
                      ${col.label}
                      <span class="sort-icon">${state.sortKey === col.key ? (state.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${pageRows.length ? pageRows.map(row => `
                  <tr>
                    ${columns.map(col => `<td>${col.badge ? col.badge(row[col.key], row) : (col.format ? col.format(row[col.key], row) : (row[col.key] ?? '—'))}</td>`).join('')}
                  </tr>`).join('') : `<tr><td colspan="${columns.length}" style="text-align:center;color:var(--text-muted);padding:32px;">Sin resultados para los filtros actuales</td></tr>`}
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span>Página ${state.page} de ${totalPages}</span>
            <div class="pagination">
              <button data-page="prev" ${state.page === 1 ? 'disabled' : ''}>‹</button>
              ${paginationButtons(state.page, totalPages)}
              <button data-page="next" ${state.page === totalPages ? 'disabled' : ''}>›</button>
            </div>
          </div>
        </div>
      </div>`;

    // --- Eventos ---
    container.querySelectorAll('th[data-key]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = key;
          state.sortDir = 'asc';
        }
        render();
      });
    });

    container.querySelector('[data-action="export-excel"]').addEventListener('click', () => {
      exportToExcel(sorted, filename, title);
    });
    container.querySelector('[data-action="export-pdf"]').addEventListener('click', () => {
      exportToPDF(sorted, filename, title);
    });

    const prevBtn = container.querySelector('[data-page="prev"]');
    const nextBtn = container.querySelector('[data-page="next"]');
    if (prevBtn) prevBtn.addEventListener('click', () => { state.page--; render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { state.page++; render(); });
    container.querySelectorAll('[data-page-num]').forEach(btn => {
      btn.addEventListener('click', () => { state.page = Number(btn.dataset.pageNum); render(); });
    });
  }

  render();
}

function paginationButtons(current, total) {
  const pages = [];
  const max = 5;
  let start = Math.max(1, current - Math.floor(max / 2));
  let end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  for (let i = start; i <= end; i++) {
    pages.push(`<button data-page-num="${i}" class="${i === current ? 'active' : ''}">${i}</button>`);
  }
  return pages.join('');
}

function iconXls() {
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
}
function iconPdf() {
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
}
