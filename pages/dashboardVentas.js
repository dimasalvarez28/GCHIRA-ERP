/**
 * ============================================================================
 * DASHBOARD DE VENTAS — Fuente: pestaña "VENTAS 2026"
 * ============================================================================
 * Campos reales disponibles por venta: fecha, cliente, factura, direccion,
 * cantidad, total, terminoPago, pagado, fechaPago, metodoPago, comentarios.
 * (Esta hoja no tiene una columna de "producto" — para eso existe el
 * dashboard de Productos, que usa la hoja "Control de Pedido".)
 */
import { store } from '../js/state.js';
import { applyGlobalFilters } from '../js/filters.js';
import { total, sumByMonth, monthLabel, formatCurrency, formatNumber, formatDate } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountFilterBar } from '../components/filterBar.js';
import { mountDataTable } from '../components/dataTable.js';
import { setPageTitle } from '../components/topbar.js';

function isPagado(row) {
  return /^pagado/i.test((row.pagado || '').toString().trim());
}

export function renderVentas(container) {
  setPageTitle('Dashboard de ventas', 'Facturación, cobranza y evolución de ingresos');

  container.innerHTML = `
    <div class="filter-bar" id="filterBar"></div>
    <div class="section"><div class="kpi-grid" id="kpiGrid"></div></div>
    <div class="section">
      <div class="charts-grid">
        <div class="card">
          <div class="card__header"><div><div class="card__title">Evolución mensual de ventas</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartVentasMes"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Estado de cobro</div><div class="card__subtitle">Facturas pagadas vs. pendientes</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartEstadoPago"></canvas></div></div>
        </div>
      </div>
    </div>
    <div class="section" id="tableSection"></div>
  `;

  mountFilterBar('filterBar', store.data.ventas, () => renderVentas(container));
  update();

  function update() {
    const rows = applyGlobalFilters(store.data.ventas);

    const totalVentas = total(rows, 'total');
    const facturasEmitidas = rows.length;
    const ticketPromedio = rows.length ? totalVentas / rows.length : 0;
    const facturasPendientes = rows.filter(r => !isPagado(r)).length;

    document.getElementById('kpiGrid').innerHTML = [
      kpiCard({ label: 'Ventas totales', value: formatCurrency(totalVentas), icon: 'money', tone: 'brand' }),
      kpiCard({ label: 'Facturas emitidas', value: formatNumber(facturasEmitidas), icon: 'box', tone: 'info' }),
      kpiCard({ label: 'Ticket promedio', value: formatCurrency(ticketPromedio), icon: 'trend', tone: 'success' }),
      kpiCard({ label: 'Facturas pendientes de pago', value: formatNumber(facturasPendientes), icon: 'alert', tone: facturasPendientes ? 'warning' : 'success' })
    ].join('');

    const byMonth = sumByMonth(rows, 'fecha', 'total');
    const months = [...byMonth.keys()];
    renderChart('chartVentasMes', 'line', {
      labels: months.map(monthLabel),
      datasets: [{ label: 'Ventas', data: months.map(m => byMonth.get(m)), borderColor: '#2F6FED', backgroundColor: 'rgba(47,111,237,0.14)', fill: true, tension: 0.35 }]
    });

    const pagadas = rows.filter(isPagado).length;
    const pendientes = rows.length - pagadas;
    renderChart('chartEstadoPago', 'doughnut', {
      labels: ['Pagadas', 'Pendientes'],
      datasets: [{ data: [pagadas, pendientes], backgroundColor: ['#16A34A', '#D97706'], borderWidth: 0 }]
    }, { cutout: '65%' });

    mountDataTable('tableSection', {
      title: 'Detalle de facturación',
      filename: 'ventas_2026',
      rows,
      columns: [
        { key: 'fecha', label: 'Fecha', format: formatDate },
        { key: 'cliente', label: 'Cliente' },
        { key: 'factura', label: 'N° Factura' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'cantidad', label: 'Cant.', format: v => formatNumber(v) },
        { key: 'total', label: 'Total', format: v => formatCurrency(v) },
        { key: 'pagado', label: 'Estado', badge: (v, row) => `<span class="badge ${isPagado(row) ? 'badge--success' : 'badge--warning'}">${isPagado(row) ? 'Pagado' : 'Pendiente'}</span>` },
        { key: 'metodoPago', label: 'Método de pago' }
      ]
    });
  }
}
