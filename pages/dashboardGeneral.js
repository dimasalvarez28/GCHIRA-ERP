/**
 * ============================================================================
 * DASHBOARD GENERAL — Resumen ejecutivo de las 4 áreas del ERP
 * ============================================================================
 */
import { store } from '../js/state.js';
import { applyGlobalFilters } from '../js/filters.js';
import { total, sumByMonth, monthLabel, formatCurrency, formatNumber, chartPalette } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountFilterBar } from '../components/filterBar.js';
import { setPageTitle } from '../components/topbar.js';

export function renderGeneral(container) {
  setPageTitle('Resumen general', 'Vista consolidada de ventas, finanzas, gastos y pedidos');

  container.innerHTML = `
    <div class="filter-bar" id="filterBar"></div>
    <div class="section">
      <div class="kpi-grid" id="kpiGrid"></div>
    </div>
    <div class="section">
      <div class="charts-grid">
        <div class="card">
          <div class="card__header">
            <div><div class="card__title">Ventas vs. Gastos por mes</div><div class="card__subtitle">Comparativo mensual acumulado del año</div></div>
          </div>
          <div class="card__body"><div style="height:320px"><canvas id="chartVentasGastos"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Pedidos por estado</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartPedidosEstado"></canvas></div></div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="charts-grid--halves">
        <div class="card">
          <div class="card__header"><div><div class="card__title">Flujo bancario</div><div class="card__subtitle">Créditos vs. débitos por mes</div></div></div>
          <div class="card__body"><div style="height:280px"><canvas id="chartFlujoBanco"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Top 5 clientes</div><div class="card__subtitle">Por monto total de ventas</div></div></div>
          <div class="card__body"><div style="height:280px"><canvas id="chartTopClientes"></canvas></div></div>
        </div>
      </div>
    </div>
  `;

  mountFilterBar('filterBar', store.data.ventas, () => renderGeneral(container));
  update();

  function update() {
    const ventas = applyGlobalFilters(store.data.ventas);
    const gastos = applyGlobalFilters(store.data.gastos);
    const pedidos = applyGlobalFilters(store.data.pedidos);
    const banca = applyGlobalFilters(store.data.banca);

    const totalVentas = total(ventas, 'total');
    const totalGastos = total(gastos, 'total');
    const utilidad = totalVentas - totalGastos;
    const pedidosActivos = pedidos.filter(p => !/entregad|cancelad/i.test(p.estado || '')).length;

    document.getElementById('kpiGrid').innerHTML = [
      kpiCard({ label: 'Ventas totales', value: formatCurrency(totalVentas), icon: 'money', tone: 'brand' }),
      kpiCard({ label: 'Gastos totales', value: formatCurrency(totalGastos), icon: 'trend', tone: 'danger' }),
      kpiCard({ label: 'Utilidad estimada', value: formatCurrency(utilidad), icon: 'bank', tone: utilidad >= 0 ? 'success' : 'danger' }),
      kpiCard({ label: 'Pedidos en curso', value: formatNumber(pedidosActivos), icon: 'box', tone: 'info' })
    ].join('');

    const ventasByMonth = sumByMonth(ventas, 'fecha', 'total');
    const gastosByMonth = sumByMonth(gastos, 'fecha', 'total');
    const months = Array.from(new Set([...ventasByMonth.keys(), ...gastosByMonth.keys()])).sort();

    renderChart('chartVentasGastos', 'bar', {
      labels: months.map(monthLabel),
      datasets: [
        { label: 'Ventas', data: months.map(m => ventasByMonth.get(m) || 0), backgroundColor: '#2F6FED', borderRadius: 6 },
        { label: 'Gastos', data: months.map(m => gastosByMonth.get(m) || 0), backgroundColor: '#DC2626', borderRadius: 6 }
      ]
    });

    const estados = {};
    pedidos.forEach(p => { const e = p.estado || 'Sin estado'; estados[e] = (estados[e] || 0) + 1; });
    renderChart('chartPedidosEstado', 'doughnut', {
      labels: Object.keys(estados),
      datasets: [{ data: Object.values(estados), backgroundColor: chartPalette(), borderWidth: 0 }]
    }, { cutout: '65%' });

    const bancaByMonth = new Map();
    banca.forEach(b => {
      const d = new Date(b.fecha);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!bancaByMonth.has(key)) bancaByMonth.set(key, { ingreso: 0, egreso: 0 });
      bancaByMonth.get(key).ingreso += Number(b.credito) || 0;
      bancaByMonth.get(key).egreso += Number(b.debito) || 0;
    });
    const bMonths = Array.from(bancaByMonth.keys()).sort();
    renderChart('chartFlujoBanco', 'line', {
      labels: bMonths.map(monthLabel),
      datasets: [
        { label: 'Ingresos', data: bMonths.map(m => bancaByMonth.get(m).ingreso), borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,0.12)', fill: true, tension: 0.35 },
        { label: 'Egresos', data: bMonths.map(m => bancaByMonth.get(m).egreso), borderColor: '#DC2626', backgroundColor: 'rgba(220,38,38,0.12)', fill: true, tension: 0.35 }
      ]
    });

    const porCliente = new Map();
    ventas.forEach(v => porCliente.set(v.cliente, (porCliente.get(v.cliente) || 0) + (Number(v.total) || 0)));
    const topClientes = [...porCliente.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    renderChart('chartTopClientes', 'bar', {
      labels: topClientes.map(c => c[0] || 'Sin nombre'),
      datasets: [{ label: 'Ventas', data: topClientes.map(c => c[1]), backgroundColor: '#7C5CFC', borderRadius: 6 }]
    }, { indexAxis: 'y' });
  }
}
