/**
 * ============================================================================
 * STATE.JS — Estado global de la aplicación (patrón store simple)
 * ============================================================================
 * Un único objeto reactivo minimalista: guarda los datos crudos del backend,
 * los filtros activos y expone un pequeño sistema de suscripción para que
 * las páginas se re-rendericen cuando el estado cambia.
 */

const listeners = new Set();

export const store = {
  data: { ventas: [], banca: [], gastos: [], pedidos: [] },
  loading: true,
  error: null,
  lastUpdated: null,

  filters: {
    dateFrom: '',
    dateTo: '',
    cliente: '',
    producto: ''
  },

  route: 'general'
};

export function setState(partial) {
  Object.assign(store, partial);
  listeners.forEach(fn => fn(store));
}

export function setFilters(partial) {
  Object.assign(store.filters, partial);
  listeners.forEach(fn => fn(store));
}

export function resetFilters() {
  store.filters = { dateFrom: '', dateTo: '', cliente: '', producto: '' };
  listeners.forEach(fn => fn(store));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
