/**
 * ============================================================================
 * DASHBOARD DE ESTADOS DE CUENTA — Fuente: pestaña "VENTAS 2026"
 * ============================================================================
 * Permite elegir un cliente y ver su historial completo de facturación:
 * total facturado, total pagado, saldo pendiente, y el detalle factura por
 * factura con saldo acumulado. Incluye exportación a un PDF con formato de
 * estado de cuenta (no una tabla genérica) y a Excel.
 */
import { store, setFilters } from '../js/state.js';
import { total, formatCurrency, formatNumber, formatDate, toDate, uniqueValues, sumByMonth, monthLabel } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountDataTable } from '../components/dataTable.js';
import { exportStatementToPDF, exportToExcel } from '../js/export.js';
import { setPageTitle } from '../components/topbar.js';

function isPagado(row) {
  return /^pagado/i.test((row.pagado || '').toString().trim());
}

export function renderEstadoCuenta(container) {
  setPageTitle('Estados de cuenta', 'Historial de facturación y saldo pendiente por cliente');

  const clientes = uniqueValues(store.data.ventas, 'cliente');
  // Si el usuario venía de un filtro/búsqueda con cliente ya elegido, úsalo de entrada.
  let selectedClient = clientes.includes(store.filters.cliente) ? store.filters.cliente : (clientes[0] || '');

  container.innerHTML = `
    <div class="filter-bar" id="clientBar">
      <div class="filter-field" style="min-width:280px">
        <label for="clientSelect">Cliente</label>
        <select id="clientSelect" class="field-control"></select>
      </div>
      <div class="filter-bar__actions">
        <button class="btn btn--ghost btn--sm" id="exportExcelBtn">Excel</button>
        <button class="btn btn--primary btn--sm" id="exportPdfBtn">Descargar estado de cuenta (PDF)</button>
      </div>
    </div>
    <div id="statementBody"></div>
  `;

  const select = container.querySelector('#clientSelect');
  select.innerHTML = clientes.length
    ? clientes.map(c => `<option value="${c}" ${c === selectedClient ? 'selected' : ''}>${c}</option>`).join('')
    : `<option value="">No hay clientes en "Ventas 2026"</option>`;

  select.addEventListener('change', () => {
    selectedClient = select.value;
    setFilters({ cliente: selectedClient });
    update();
  });

  container.querySelector('#exportExcelBtn').addEventListener('click', () => {
    const rows = getClientRows(selectedClient);
    exportToExcel(rows, `estado_cuenta_${safe(selectedClient)}`, 'Estado de cuenta');
  });

  container.querySelector('#exportPdfBtn').addEventListener('click', () => {
    const rows = getClientRows(selectedClient);
    const totales = computeTotales(rows);
    exportStatementToPDF(selectedClient, rows, totales);
  });

  update();

  function update() {
    const rows = getClientRows(selectedClient);
    const body = container.querySelector('#statementBody');

    if (!rows.length) {
      body.innerHTML = `<div class="state-panel">Este cliente no tiene facturas registradas en "Ventas 2026".</div>`;
      return;
    }

    const totales = computeTotales(rows);

    body.innerHTML = `
      <div class="section"><div class="kpi-grid" id="kpiGrid"></div></div>
      <div class="section">
        <div class="charts-grid--halves">
          <div class="card">
            <div class="card__header"><div><div class="card__title">Saldo pendiente en el tiempo</div><div class="card__subtitle">Acumulado de facturas menos pagos</div></div></div>
            <div class="card__body"><div style="height:280px"><canvas id="chartSaldoCliente"></canvas></div></div>
          </div>
          <div class="card">
            <div class="card__header"><div><div class="card__title">Facturado por mes</div></div></div>
            <div class="card__body"><div style="height:280px"><canvas id="chartFacturadoMes"></canvas></div></div>
          </div>
        </div>
      </div>
      <div class="section" id="tableSection"></div>
    `;

    container.querySelector('#kpiGrid').innerHTML = [
      kpiCard({ label: 'Total facturado', value: formatCurrency(totales.totalFacturado), icon: 'money', tone: 'brand' }),
      kpiCard({ label: 'Total pagado', value: formatCurrency(totales.totalPagado), icon: 'trend', tone: 'success' }),
      kpiCard({ label: 'Saldo pendiente', value: formatCurrency(totales.saldoPendiente), icon: 'alert', tone: totales.saldoPendiente > 0 ? 'warning' : 'success' }),
      kpiCard({ label: 'Facturas emitidas', value: formatNumber(rows.length), icon: 'box', tone: 'info' })
    ].join('');

    // --- Saldo acumulado en el tiempo (línea) ---
    const ordenadas = [...rows].sort((a, b) => (toDate(a.fecha) || 0) - (toDate(b.fecha) || 0));
    let acumulado = 0;
    const labels = [], data = [];
    ordenadas.forEach(r => {
      acumulado += (Number(r.total) || 0) - (isPagado(r) ? (Number(r.total) || 0) : 0);
      labels.push(formatDate(r.fecha));
      data.push(acumulado);
    });
    renderChart('chartSaldoCliente', 'line', {
      labels,
      datasets: [{ label: 'Saldo pendiente', data, borderColor: '#D97706', backgroundColor: 'rgba(217,119,6,0.14)', fill: true, tension: 0.25, pointRadius: 0 }]
    }, { plugins: { legend: { display: false } } });

    // --- Facturado por mes (barras) ---
    const byMonth = sumByMonth(rows, 'fecha', 'total');
    const months = [...byMonth.keys()];
    renderChart('chartFacturadoMes', 'bar', {
      labels: months.map(monthLabel),
      datasets: [{ label: 'Facturado', data: months.map(m => byMonth.get(m)), backgroundColor: '#2F6FED', borderRadius: 6 }]
    }, { plugins: { legend: { display: false } } });

    // --- Tabla con saldo acumulado por factura ---
    let running = 0;
    const rowsWithSaldo = ordenadas.map(r => {
      const monto = Number(r.total) || 0;
      running += isPagado(r) ? 0 : monto;
      return { ...r, saldoAcumulado: running };
    });

    mountDataTable('tableSection', {
      title: `Detalle de facturas — ${selectedClient}`,
      filename: `estado_cuenta_${safe(selectedClient)}`,
      rows: rowsWithSaldo,
      columns: [
        { key: 'fecha', label: 'Fecha', format: formatDate },
        { key: 'factura', label: 'N° Factura' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'total', label: 'Total', format: v => formatCurrency(v) },
        { key: 'pagado', label: 'Estado', badge: (v, row) => `<span class="badge ${isPagado(row) ? 'badge--success' : 'badge--warning'}">${isPagado(row) ? 'Pagado' : 'Pendiente'}</span>` },
        { key: 'fechaPago', label: 'Fecha de pago', format: v => v ? formatDate(v) : '—' },
        { key: 'saldoAcumulado', label: 'Saldo acumulado', format: v => formatCurrency(v) }
      ]
    });
  }
}

function getClientRows(cliente) {
  if (!cliente) return [];
  return store.data.ventas.filter(r => r.cliente === cliente);
}

function computeTotales(rows) {
  const totalFacturado = total(rows, 'total');
  const totalPagado = rows.filter(isPagado).reduce((a, r) => a + (Number(r.total) || 0), 0);
  return {
    totalFacturado,
    totalPagado,
    saldoPendiente: totalFacturado - totalPagado
  };
}

function safe(str) {
  return String(str || 'cliente').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 40);
}
