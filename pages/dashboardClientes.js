/**
 * ============================================================================
 * DASHBOARD DE CLIENTES — Analítica derivada de "Ventas 2026"
 * ============================================================================
 */
import { store } from '../js/state.js';
import { applyGlobalFilters } from '../js/filters.js';
import { formatCurrency, formatNumber, chartPalette } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountFilterBar } from '../components/filterBar.js';
import { mountDataTable } from '../components/dataTable.js';
import { setPageTitle } from '../components/topbar.js';

export function renderClientes(container) {
  setPageTitle('Dashboard de clientes', 'Comportamiento de compra y valor por cliente');

  container.innerHTML = `
    <div class="filter-bar" id="filterBar"></div>
    <div class="section"><div class="kpi-grid" id="kpiGrid"></div></div>
    <div class="section">
      <div class="charts-grid">
        <div class="card">
          <div class="card__header"><div><div class="card__title">Top 10 clientes por ventas</div></div></div>
          <div class="card__body"><div style="height:340px"><canvas id="chartTopClientes"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Distribución de compras</div></div></div>
          <div class="card__body"><div style="height:340px"><canvas id="chartDistribucion"></canvas></div></div>
        </div>
      </div>
    </div>
    <div class="section" id="tableSection"></div>
  `;

  mountFilterBar('filterBar', store.data.ventas, () => renderClientes(container));
  update();

  function update() {
    const rows = applyGlobalFilters(store.data.ventas);

    const porCliente = new Map();
    rows.forEach(r => {
      const c = r.cliente || 'Sin nombre';
      if (!porCliente.has(c)) porCliente.set(c, { cliente: c, compras: 0, total: 0 });
      const entry = porCliente.get(c);
      entry.compras += 1;
      entry.total += Number(r.total) || 0;
    });
    const clientesArr = [...porCliente.values()];

    const clientesUnicos = clientesArr.length;
    const totalVentas = clientesArr.reduce((a, c) => a + c.total, 0);
    const ticketPromedio = clientesUnicos ? totalVentas / clientesUnicos : 0;
    const mejorCliente = clientesArr.sort((a, b) => b.total - a.total)[0];

    document.getElementById('kpiGrid').innerHTML = [
      kpiCard({ label: 'Clientes activos', value: formatNumber(clientesUnicos), icon: 'users', tone: 'brand' }),
      kpiCard({ label: 'Valor total generado', value: formatCurrency(totalVentas), icon: 'money', tone: 'success' }),
      kpiCard({ label: 'Valor promedio / cliente', value: formatCurrency(ticketPromedio), icon: 'trend', tone: 'info' }),
      kpiCard({ label: 'Mejor cliente', value: mejorCliente ? mejorCliente.cliente : '—', icon: 'box', tone: 'warning' })
    ].join('');

    const top10 = [...clientesArr].sort((a, b) => b.total - a.total).slice(0, 10);
    renderChart('chartTopClientes', 'bar', {
      labels: top10.map(c => c.cliente),
      datasets: [{ label: 'Ventas', data: top10.map(c => c.total), backgroundColor: '#2F6FED', borderRadius: 6 }]
    }, { indexAxis: 'y', plugins: { legend: { display: false } } });

    const top6 = [...clientesArr].sort((a, b) => b.total - a.total).slice(0, 6);
    const otros = clientesArr.slice(6).reduce((a, c) => a + c.total, 0);
    const dist = [...top6.map(c => [c.cliente, c.total])];
    if (otros > 0) dist.push(['Otros', otros]);
    renderChart('chartDistribucion', 'doughnut', {
      labels: dist.map(d => d[0]),
      datasets: [{ data: dist.map(d => d[1]), backgroundColor: chartPalette(), borderWidth: 0 }]
    }, { cutout: '60%' });

    mountDataTable('tableSection', {
      title: 'Ranking de clientes',
      filename: 'clientes',
      rows: clientesArr,
      columns: [
        { key: 'cliente', label: 'Cliente' },
        { key: 'compras', label: 'N° compras', format: v => formatNumber(v) },
        { key: 'total', label: 'Total comprado', format: v => formatCurrency(v) }
      ]
    });
  }
}
