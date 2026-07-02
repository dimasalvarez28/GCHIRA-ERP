/**
 * ============================================================================
 * CONFIG.JS — Configuración global de la aplicación
 * ============================================================================
 * Único lugar donde se define la URL del backend y constantes globales.
 * Reemplaza API_URL con la URL /exec que obtienes al implementar el
 * Google Apps Script como "Aplicación web" (ver /gas/Code.gs).
 */

export const CONFIG = {
  // URL de tu Web App de Google Apps Script (termina en /exec)
  API_URL: 'https://script.google.com/macros/s/AKfycbwhZ12DpO9Oaj_6VLUHbXt6kyKowwWjl9U9gIAkoYKSBB_iauFzN8UHx1FDfXJa7nr9RQ/exec',

  APP_NAME: 'NovaERP',
  APP_SHORT: 'NX',

  // Refresco automático de datos (ms). 0 = desactivado.
  AUTO_REFRESH_MS: 5 * 60 * 1000,

  // Moneda y locale usados en formateo
  LOCALE: 'es-PA',
  CURRENCY: 'USD',

  // Paginación por defecto de tablas
  ROWS_PER_PAGE: 8,

  // Nombres de las claves normalizadas por hoja (deben coincidir con
  // normalizeKey() en Code.gs; se documentan aquí como referencia rápida)
  SHEETS: {
    VENTAS: 'ventas',
    BANCA: 'banca',
    GASTOS: 'gastos',
    PEDIDOS: 'pedidos'
  },

  STORAGE_KEYS: {
    THEME: 'novaerp_theme',
    SIDEBAR: 'novaerp_sidebar_collapsed'
  }
};
