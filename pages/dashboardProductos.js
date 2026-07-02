/**
 * ============================================================================
 * DASHBOARD DE PRODUCTOS — Fuente: pestaña "CONTROL DE PEDIDO"
 * ============================================================================
 * Nota importante: la hoja "VENTAS 2026" no tiene una columna de producto
 * (es un registro de facturación general), así que este dashboard toma los
 * productos desde "Control de Pedido", que sí incluye Producto, Presentación,
 * Cantidad y Total. Si tu equipo quiere ver productos también dentro de
 * Ventas, lo más simple es agregar una columna "Producto" en esa hoja.
 */
import { store } from '../js/state.js';
import { applyGlobalFilters } from '../js/filters.js';
import { formatCurrency, formatNumber, chartPalette } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountFilterBar } from '../components/filterBar.js';
import { mountDataTable } from '../components/dataTable.js';
import { setPageTitle } from '../components/topbar.js';

export function renderProductos(container) {
  setPageTitle('Dashboard de productos', 'Desempeño de catálogo por unidades e ingresos (según Control de Pedido)');

  container.innerHTML = `
    <div class="filter-bar" id="filterBar"></div>
    <div class="section"><div class="kpi-grid" id="kpiGrid"></div></div>
    <div class="section">
      <div class="charts-grid">
        <div class="card">
          <div class="card__header"><div><div class="card__title">Ingresos por producto</div></div></div>
          <div class="card__body"><div style="height:340px"><canvas id="chartIngresos"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Unidades vendidas</div></div></div>
          <div class="card__body"><div style="height:340px"><canvas id="chartUnidades"></canvas></div></div>
        </div>
      </div>
    </div>
    <div class="section" id="tableSection"></div>
  `;

  mountFilterBar('filterBar', store.data.pedidos, () => renderProductos(container));
  update();

  function update() {
    const rows = applyGlobalFilters(store.data.pedidos);

    const porProducto = new Map();
    rows.forEach(r => {
      const p = r.producto || 'Sin producto';
      if (!porProducto.has(p)) porProducto.set(p, { producto: p, unidades: 0, ingresos: 0 });
      const entry = porProducto.get(p);
      entry.unidades += Number(r.cantidad) || 0;
      entry.ingresos += Number(r.total) || 0;
    });
    const productosArr = [...porProducto.values()];

    const totalProductos = productosArr.length;
    const totalIngresos = productosArr.reduce((a, p) => a + p.ingresos, 0);
    const totalUnidades = productosArr.reduce((a, p) => a + p.unidades, 0);
    const masVendido = [...productosArr].sort((a, b) => b.unidades - a.unidades)[0];

    document.getElementById('kpiGrid').innerHTML = [
      kpiCard({ label: 'Productos con pedidos', value: formatNumber(totalProductos), icon: 'box', tone: 'brand' }),
      kpiCard({ label: 'Ingresos totales', value: formatCurrency(totalIngresos), icon: 'money', tone: 'success' }),
      kpiCard({ label: 'Unidades vendidas', value: formatNumber(totalUnidades), icon: 'trend', tone: 'info' }),
      kpiCard({ label: 'Más vendido', value: masVendido ? masVendido.producto : '—', icon: 'tag', tone: 'warning' })
    ].join('');

    if (!rows.length) {
      document.getElementById('chartIngresos').closest('.card').querySelector('.card__body').innerHTML =
        '<div class="state-panel">La pestaña "Control de Pedido" todavía no tiene registros.</div>';
      document.getElementById('tableSection').innerHTML = '';
      return;
    }

    const topIngresos = [...productosArr].sort((a, b) => b.ingresos - a.ingresos).slice(0, 8);
    renderChart('chartIngresos', 'bar', {
      labels: topIngresos.map(p => p.producto),
      datasets: [{ label: 'Ingresos', data: topIngresos.map(p => p.ingresos), backgroundColor: chartPalette(), borderRadius: 6 }]
    }, { plugins: { legend: { display: false } } });

    const topUnidades = [...productosArr].sort((a, b) => b.unidades - a.unidades).slice(0, 8);
    renderChart('chartUnidades', 'bar', {
      labels: topUnidades.map(p => p.producto),
      datasets: [{ label: 'Unidades', data: topUnidades.map(p => p.unidades), backgroundColor: '#0EA5A0', borderRadius: 6 }]
    }, { indexAxis: 'y', plugins: { legend: { display: false } } });

    mountDataTable('tableSection', {
      title: 'Catálogo de productos',
      filename: 'productos',
      rows: productosArr,
      columns: [
        { key: 'producto', label: 'Producto' },
        { key: 'unidades', label: 'Unidades vendidas', format: v => formatNumber(v) },
        { key: 'ingresos', label: 'Ingresos generados', format: v => formatCurrency(v) }
      ]
    });
  }
}
