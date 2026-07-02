/**
 * ============================================================================
 * API.JS — Capa de comunicación con el backend de Google Apps Script
 * ============================================================================
 * Toda llamada de red de la app pasa por aquí. Mantiene la lógica de fetch,
 * manejo de errores y caché en memoria en un solo lugar.
 */
import { CONFIG } from './config.js';

let memoryCache = null;
let memoryCacheAt = 0;
const MEMORY_TTL = 30 * 1000; // 30s: evita refetch accidental en navegación rápida

/**
 * Obtiene las 4 hojas del ERP desde Apps Script.
 * @param {boolean} force - ignora la caché en memoria y fuerza refetch.
 */
export async function fetchAllData(force = false) {
  const now = Date.now();
  if (!force && memoryCache && now - memoryCacheAt < MEMORY_TTL) {
    return memoryCache;
  }

  if (!CONFIG.API_URL || CONFIG.API_URL.includes('TU_ID_DE_IMPLEMENTACION')) {
    throw new ApiError(
      'Backend no configurado. Define CONFIG.API_URL en js/config.js con la URL /exec de tu Apps Script.'
    );
  }

  let response;
  try {
    response = await fetch(`${CONFIG.API_URL}?action=getAll`, { method: 'GET' });
  } catch (networkErr) {
    throw new ApiError('No se pudo contactar al backend. Verifica tu conexión o la URL configurada.');
  }

  if (!response.ok) {
    throw new ApiError(`El backend respondió con error HTTP ${response.status}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new ApiError(json.error || 'Error desconocido del backend');
  }

  memoryCache = json;
  memoryCacheAt = now;
  return json;
}

/** Envía una actualización de estado de pedido al backend. */
export async function updateOrderStatus(orderId, status) {
  const body = new URLSearchParams({ action: 'updateOrderStatus', id: orderId, status });
  const response = await fetch(CONFIG.API_URL, { method: 'POST', body });
  const json = await response.json();
  if (!json.success) throw new ApiError(json.error || 'No se pudo actualizar el pedido');
  memoryCache = null; // invalida caché para forzar refetch en la próxima carga
  return json.result;
}

export function invalidateCache() {
  memoryCache = null;
}

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiError';
  }
}
