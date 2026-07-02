/**
 * ============================================================================
 * DASHBOARD DE PEDIDOS — Fuente: pestaña "CONTROL DE PEDIDO"
 * ============================================================================
 * Campos reales: fecha, cliente, direccionEntrega, producto, presentacion,
 * cantidad, precioUnitario, total, fechaEntrega, estado, observaciones.
 * (Esta pestaña puede estar vacía hasta que tu equipo empiece a registrar
 * pedidos; el dashboard funciona igual y simplemente mostrará "sin datos".)
 */
import { store } from '../js/state.js';
import { applyGlobalFilters } from '../js/filters.js';
import { total, formatCurrency, formatNumber, formatDate, chartPalette } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountFilterBar } from '../components/filterBar.js';
import { mountDataTable } from '../components/dataTable.js';
import { setPageTitle } from '../components/topbar.js';

const ESTADO_BADGE = {
  pendiente: 'badge--warning',
  proceso: 'badge--info',
  enviado: 'badge--info',
  entregado: 'badge--success',
  cancelado: 'badge--danger'
};

export function renderPedidos(container) {
  setPageTitle('Dashboard de pedidos', 'Seguimiento del ciclo de vida de pedidos');

  container.innerHTML = `
    <div class="filter-bar" id="filterBar"></div>
    <div class="section"><div class="kpi-grid" id="kpiGrid"></div></div>
    <div class="section">
      <div class="charts-grid">
        <div class="card">
          <div class="card__header"><div><div class="card__title">Pedidos por estado</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartEstados"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Pedidos por producto</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartProductoPedidos"></canvas></div></div>
        </div>
      </div>
    </div>
    <div class="section" id="tableSection"></div>
  `;

  mountFilterBar('filterBar', store.data.pedidos, () => renderPedidos(container));
  update();

  function update() {
    const rows = applyGlobalFilters(store.data.pedidos);
    const entregados = rows.filter(r => /entregad/i.test(r.estado || '')).length;
    const pendientes = rows.filter(r => /pendiente/i.test(r.estado || '')).length;
    const valorTotal = total(rows, 'total');

    document.getElementById('kpiGrid').innerHTML = [
      kpiCard({ label: 'Pedidos totales', value: formatNumber(rows.length), icon: 'box', tone: 'brand' }),
      kpiCard({ label: 'Entregados', value: formatNumber(entregados), icon: 'trend', tone: 'success' }),
      kpiCard({ label: 'Pendientes', value: formatNumber(pendientes), icon: 'clock', tone: 'warning' }),
      kpiCard({ label: 'Valor total', value: formatCurrency(valorTotal), icon: 'money', tone: 'info' })
    ].join('');

    const estados = {};
    rows.forEach(r => { const e = r.estado || 'Sin estado'; estados[e] = (estados[e] || 0) + 1; });
    renderChart('chartEstados', 'doughnut', {
      labels: Object.keys(estados),
      datasets: [{ data: Object.values(estados), backgroundColor: chartPalette(), borderWidth: 0 }]
    }, { cutout: '60%' });

    const porProducto = {};
    rows.forEach(r => { const p = r.producto || 'Sin producto'; porProducto[p] = (porProducto[p] || 0) + (Number(r.cantidad) || 1); });
    const top = Object.entries(porProducto).sort((a, b) => b[1] - a[1]).slice(0, 8);
    renderChart('chartProductoPedidos', 'bar', {
      labels: top.map(t => t[0]),
      datasets: [{ label: 'Pedidos', data: top.map(t => t[1]), backgroundColor: '#5C8FFF', borderRadius: 6 }]
    }, { indexAxis: 'y', plugins: { legend: { display: false } } });

    mountDataTable('tableSection', {
      title: 'Control de pedidos',
      filename: 'control_pedidos',
      rows,
      columns: [
        { key: 'fecha', label: 'Fecha del pedido', format: formatDate },
        { key: 'cliente', label: 'Cliente' },
        { key: 'producto', label: 'Producto' },
        { key: 'presentacion', label: 'Presentación' },
        { key: 'cantidad', label: 'Cant.', format: v => formatNumber(v) },
        { key: 'total', label: 'Total', format: v => formatCurrency(v) },
        { key: 'estado', label: 'Estado', badge: v => `<span class="badge ${ESTADO_BADGE[(v || '').toLowerCase()] || 'badge--neutral'}">${v || '—'}</span>` },
        { key: 'fechaEntrega', label: 'Entrega', format: formatDate }
      ]
    });
  }
}
