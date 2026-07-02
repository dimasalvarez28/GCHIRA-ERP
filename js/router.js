/**
 * ============================================================================
 * ROUTER.JS — Enrutador SPA basado en hash (#ventas, #pedidos, etc.)
 * ============================================================================
 */
import { store, setState } from './state.js';
import { destroyAllCharts } from './charts.js';
import { renderGeneral } from '../pages/dashboardGeneral.js';
import { renderVentas } from '../pages/dashboardVentas.js';
import { renderFinanciero } from '../pages/dashboardFinanciero.js';
import { renderGastos } from '../pages/dashboardGastos.js';
import { renderPedidos } from '../pages/dashboardPedidos.js';
import { renderClientes } from '../pages/dashboardClientes.js';
import { renderProductos } from '../pages/dashboardProductos.js';

const PAGES = {
  general: renderGeneral,
  ventas: renderVentas,
  financiero: renderFinanciero,
  gastos: renderGastos,
  pedidos: renderPedidos,
  clientes: renderClientes,
  productos: renderProductos
};

export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}

function resolveRoute() {
  const hash = window.location.hash.replace('#', '') || 'general';
  const routeId = PAGES[hash] ? hash : 'general';

  setState({ route: routeId });
  destroyAllCharts();

  const container = document.getElementById('pageContent');
  container.classList.add('route-fade');
  PAGES[routeId](container);
  requestAnimationFrame(() => container.classList.remove('route-fade'));

  document.getElementById('appShell').classList.remove('sidebar-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function navigateTo(routeId) {
  window.location.hash = `#${routeId}`;
}
