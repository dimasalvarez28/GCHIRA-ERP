/**
 * ============================================================================
 * FILTERS.JS — Filtrado transversal por fecha, cliente y producto
 * ============================================================================
 * Estos filtros se aplican a cualquier dataset que tenga columnas de
 * fecha / cliente / producto. No todas las hojas tienen las 3 columnas
 * (por ejemplo "Ventas 2026" no tiene "producto"), así que si una columna
 * no existe en el dataset, ese filtro simplemente se ignora para esa hoja
 * en vez de dejar la tabla vacía.
 */
import { store } from './state.js';
import { toDate } from './utils.js';

const DATE_KEYS = ['fecha'];
const CLIENT_KEYS = ['cliente'];
const PRODUCT_KEYS = ['producto'];

function firstDefined(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
  }
  return undefined;
}

/** true si al menos una fila del dataset tiene ese campo con datos. */
function datasetHasField(rows, keys) {
  return rows.some(row => firstDefined(row, keys) !== undefined);
}

/** Aplica los filtros globales (fecha/cliente/producto) a un array de filas. */
export function applyGlobalFilters(rows) {
  const { dateFrom, dateTo, cliente, producto } = store.filters;
  const from = dateFrom ? toDate(dateFrom) : null;
  const to = dateTo ? toDate(dateTo) : null;

  const hasDate = (from || to) && datasetHasField(rows, DATE_KEYS);
  const hasClient = cliente && datasetHasField(rows, CLIENT_KEYS);
  const hasProduct = producto && datasetHasField(rows, PRODUCT_KEYS);

  if (!hasDate && !hasClient && !hasProduct) return rows;

  return rows.filter(row => {
    if (hasDate) {
      const d = toDate(firstDefined(row, DATE_KEYS));
      if (d) {
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
    }
    if (hasClient && firstDefined(row, CLIENT_KEYS) !== cliente) return false;
    if (hasProduct && firstDefined(row, PRODUCT_KEYS) !== producto) return false;
    return true;
  });
}

/** Devuelve true si hay algún filtro global activo. */
export function hasActiveFilters() {
  const { dateFrom, dateTo, cliente, producto } = store.filters;
  return Boolean(dateFrom || dateTo || cliente || producto);
}
