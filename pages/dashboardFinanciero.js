/**
 * ============================================================================
 * DASHBOARD FINANCIERO — Fuente: pestaña "BANCA EN LINEA"
 * ============================================================================
 * Es un estado de cuenta bancario real: cada fila trae DEBITO (dinero que
 * sale), CREDITO (dinero que entra) y SALDO (saldo de la cuenta después de
 * ese movimiento). Usamos directamente la columna "saldo" para la gráfica
 * de evolución, en vez de recalcularla, porque ya viene del banco.
 */
import { store } from '../js/state.js';
import { applyGlobalFilters } from '../js/filters.js';
import { total, sumByMonth, monthLabel, formatCurrency, formatNumber, formatDate, toDate } from '../js/utils.js';
import { renderChart } from '../js/charts.js';
import { kpiCard } from '../components/kpiCard.js';
import { mountFilterBar } from '../components/filterBar.js';
import { mountDataTable } from '../components/dataTable.js';
import { setPageTitle } from '../components/topbar.js';

export function renderFinanciero(container) {
  setPageTitle('Dashboard financiero', 'Movimientos de banca en línea: ingresos, egresos y saldo');

  container.innerHTML = `
    <div class="filter-bar" id="filterBar"></div>
    <div class="section"><div class="kpi-grid" id="kpiGrid"></div></div>
    <div class="section">
      <div class="charts-grid">
        <div class="card">
          <div class="card__header"><div><div class="card__title">Saldo de la cuenta</div><div class="card__subtitle">Según el estado de cuenta del banco</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartSaldo"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card__header"><div><div class="card__title">Débitos vs. créditos por mes</div></div></div>
          <div class="card__body"><div style="height:320px"><canvas id="chartDebitoCredito"></canvas></div></div>
        </div>
      </div>
    </div>
    <div class="section" id="tableSection"></div>
  `;

  mountFilterBar('filterBar', store.data.banca, () => renderFinanciero(container));
  update();

  function update() {
    const rows = applyGlobalFilters(store.data.banca);
    const totalCredito = total(rows, 'credito');
    const totalDebito = total(rows, 'debito');

    const ordenadas = [...rows].sort((a, b) => (toDate(a.fecha) || 0) - (toDate(b.fecha) || 0));
    const ultimoSaldo = ordenadas.length ? Number(ordenadas[ordenadas.length - 1].saldo) || 0 : 0;

    document.getElementById('kpiGrid').innerHTML = [
      kpiCard({ label: 'Ingresos (créditos)', value: formatCurrency(totalCredito), icon: 'trend', tone: 'success' }),
      kpiCard({ label: 'Egresos (débitos)', value: formatCurrency(totalDebito), icon: 'money', tone: 'danger' }),
      kpiCard({ label: 'Saldo actual', value: formatCurrency(ultimoSaldo), icon: 'bank', tone: 'brand' }),
      kpiCard({ label: 'Movimientos', value: formatNumber(rows.length), icon: 'box', tone: 'info' })
    ].join('');

    renderChart('chartSaldo', 'line', {
      labels: ordenadas.map(r => formatDate(r.fecha)),
      datasets: [{ label: 'Saldo', data: ordenadas.map(r => Number(r.saldo) || 0), borderColor: '#0EA5A0', backgroundColor: 'rgba(14,165,160,0.14)', fill: true, tension: 0.25, pointRadius: 0 }]
    });

    const debitoByMonth = sumByMonth(rows, 'fecha', 'debito');
    const creditoByMonth = sumByMonth(rows, 'fecha', 'credito');
    const months = Array.from(new Set([...debitoByMonth.keys(), ...creditoByMonth.keys()])).sort();
    renderChart('chartDebitoCredito', 'bar', {
      labels: months.map(monthLabel),
      datasets: [
        { label: 'Créditos (ingresos)', data: months.map(m => creditoByMonth.get(m) || 0), backgroundColor: '#16A34A', borderRadius: 6 },
        { label: 'Débitos (egresos)', data: months.map(m => debitoByMonth.get(m) || 0), backgroundColor: '#DC2626', borderRadius: 6 }
      ]
    });

    mountDataTable('tableSection', {
      title: 'Movimientos bancarios',
      filename: 'banca_en_linea',
      rows,
      columns: [
        { key: 'fecha', label: 'Fecha', format: formatDate },
        { key: 'referencia', label: 'Referencia' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'debito', label: 'Débito', format: v => v ? formatCurrency(v) : '—' },
        { key: 'credito', label: 'Crédito', format: v => v ? formatCurrency(v) : '—' },
        { key: 'saldo', label: 'Saldo', format: v => formatCurrency(v) },
        { key: 'persona', label: 'Persona' }
      ]
    });
  }
}
