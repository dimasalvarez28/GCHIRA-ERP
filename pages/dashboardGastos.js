/**
 * ============================================================================
 * DASHBOARD DE GASTOS — Fuente: pestaña "GASTOS 2026"
 * ============================================================================
 * Campos reales: fecha, mes, proveedor (Razón Social), factura, concepto
 * (columna "Referencia", usada como descripción/categoría del gasto),
 * subtotal, itbms (impuesto) y total.
 */
import { store } from '../js/state.js';
import { applyGlobalFilters } from '../js/filters.js';
import { total, sumByMonth, monthLabel, sumBy, formatCurrency, formatNumber, formatDate, chartPalette } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountFilterBar } from '../components/filterBar.js';
import { mountDataTable } from '../components/dataTable.js';
import { setPageTitle } from '../components/topbar.js';

export function renderGastos(container) {
  setPageTitle('Dashboard de gastos', 'Control de egresos operativos por proveedor y concepto');

  container.innerHTML = `
    <div class="filter-bar" id="filterBar"></div>
    <div class="section"><div class="kpi-grid" id="kpiGrid"></div></div>
    <div class="section">
      <div class="charts-grid">
        <div class="card">
          <div class="card__header"><div><div class="card__title">Gastos por mes</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartGastosMes"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Gastos por concepto</div><div class="card__subtitle">Top 8 según columna "Referencia"</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartGastosConcepto"></canvas></div></div>
        </div>
      </div>
    </div>
    <div class="section" id="tableSection"></div>
  `;

  mountFilterBar('filterBar', store.data.gastos, () => renderGastos(container));
  update();

  function update() {
    const rows = applyGlobalFilters(store.data.gastos);
    const totalGastos = total(rows, 'total');
    const totalItbms = total(rows, 'itbms');
    const proveedores = new Set(rows.map(r => r.proveedor).filter(Boolean)).size;
    const promedio = rows.length ? totalGastos / rows.length : 0;

    document.getElementById('kpiGrid').innerHTML = [
      kpiCard({ label: 'Gastos totales', value: formatCurrency(totalGastos), icon: 'money', tone: 'danger' }),
      kpiCard({ label: 'ITBMS pagado', value: formatCurrency(totalItbms), icon: 'trend', tone: 'warning' }),
      kpiCard({ label: 'Gasto promedio', value: formatCurrency(promedio), icon: 'trend', tone: 'info' }),
      kpiCard({ label: 'Proveedores', value: formatNumber(proveedores), icon: 'users', tone: 'brand' })
    ].join('');

    const byMonth = sumByMonth(rows, 'fecha', 'total');
    const months = [...byMonth.keys()];
    renderChart('chartGastosMes', 'bar', {
      labels: months.map(monthLabel),
      datasets: [{ label: 'Gastos', data: months.map(m => byMonth.get(m)), backgroundColor: '#DC2626', borderRadius: 6 }]
    }, { plugins: { legend: { display: false } } });

    const byConcepto = sumBy(rows, 'concepto', 'total');
    const topConceptos = [...byConcepto.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    renderChart('chartGastosConcepto', 'pie', {
      labels: topConceptos.map(c => c[0]),
      datasets: [{ data: topConceptos.map(c => c[1]), backgroundColor: chartPalette(), borderWidth: 0 }]
    });

    mountDataTable('tableSection', {
      title: 'Detalle de gastos',
      filename: 'gastos_2026',
      rows,
      columns: [
        { key: 'fecha', label: 'Fecha', format: formatDate },
        { key: 'proveedor', label: 'Proveedor' },
        { key: 'concepto', label: 'Concepto' },
        { key: 'factura', label: 'N° Factura' },
        { key: 'subtotal', label: 'Subtotal', format: v => v ? formatCurrency(v) : '—' },
        { key: 'itbms', label: 'ITBMS', format: v => v ? formatCurrency(v) : '—' },
        { key: 'total', label: 'Total', format: v => formatCurrency(v) }
      ]
    });
  }
}
