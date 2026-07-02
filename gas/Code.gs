/**
 * ============================================================================
 *  ERP DASHBOARD · BACKEND (Google Apps Script)
 * ============================================================================
 *  Este script se despliega como "Aplicación web" y expone los datos de las
 *  4 pestañas del libro de Google Sheets como una API JSON de solo lectura,
 *  consumida por el frontend (GitHub Pages) mediante fetch().
 *
 *  Está adaptado a la estructura REAL del libro "VENTAS - GASTOS WAPIN":
 *    - "BANCA EN LINEA"   (puede tener un espacio extra al final, no importa)
 *    - "VENTAS 2026"      (el encabezado real está en la FILA 2, no en la 1)
 *    - "GASTOS 2026"      (el encabezado real está en la FILA 2, no en la 1)
 *    - "CONTROL DE PEDIDO"
 *
 *  El script busca cada columna por su nombre (con varias variantes
 *  aceptadas) en vez de por posición fija, así que puedes reordenar columnas
 *  sin romper el dashboard. Si agregas una columna nueva, simplemente no
 *  aparecerá en el dashboard hasta que la agregues también al mapa de abajo.
 *
 *  ENDPOINTS (todos por GET):
 *    ?action=getAll   -> Devuelve las 4 hojas en un solo payload (recomendado)
 *    ?action=getSheet&sheet=ventas   (o banca / gastos / pedidos)
 *    ?action=ping     -> Prueba rápida de conexión
 *
 *  DESPLIEGUE: ver README.md, sección "Paso 3".
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE HOJAS Y COLUMNAS
// ---------------------------------------------------------------------------
// Si el nombre real de tu pestaña difiere un poco (mayúsculas, espacios),
// no pasa nada: la búsqueda ignora mayúsculas/minúsculas y espacios extra.
// Si cambia por completo, actualiza "sheetName" aquí.

const SHEET_CONFIG = {

  ventas: {
    sheetName: 'VENTAS 2026',
    headerRow: 2, // el encabezado real está en la fila 2 (la fila 1 tiene un título combinado)
    columns: [
      { key: 'numero',       aliases: ['Nª', 'N°', 'No'] },
      { key: 'mes',          aliases: ['MES'] },
      { key: 'fecha',        aliases: ['Fecha'] },
      { key: 'cliente',      aliases: ['CLIENTE'] },
      { key: 'factura',      aliases: ['No° Factura', 'N Factura', 'Factura'] },
      { key: 'direccion',    aliases: ['Direccion', 'Dirección'] },
      { key: 'cantidad',     aliases: ['Cantidad'] },
      { key: 'referencia',   aliases: ['Referencia'] },
      { key: 'total',        aliases: ['Total'] },
      { key: 'unidadesNoEntregadas', aliases: ['U. no entregadas', 'Unidades no entregadas'] },
      { key: 'valor',        aliases: ['Valor'] },
      { key: 'terminoPago',  aliases: ['Termino de pago', 'Término de pago'] },
      { key: 'pagado',       aliases: ['PAGADO'] },
      { key: 'fechaPago',    aliases: ['FECHA DE PAGO'] },
      { key: 'metodoPago',   aliases: ['MÉTODO DE PAGO', 'METODO DE PAGO'] },
      { key: 'comentarios',  aliases: ['COMENTARIOS'] }
    ]
  },

  banca: {
    sheetName: 'BANCA EN LINEA',
    headerRow: 1,
    columns: [
      { key: 'fecha',        aliases: ['FECHA'] },
      { key: 'referencia',   aliases: ['REFERENCIA'] },
      { key: 'descripcion',  aliases: ['DESCRIPCIÓN', 'DESCRIPCION'] },
      { key: 'noCheque',     aliases: ['NO CHEQUE', 'N CHEQUE'] },
      { key: 'debito',       aliases: ['DEBITO', 'DÉBITO'] },
      { key: 'credito',      aliases: ['CREDITO', 'CRÉDITO'] },
      { key: 'saldo',        aliases: ['SALDO'] },
      { key: 'comentarios',  aliases: ['COMENTARIOS'] },
      { key: 'persona',      aliases: ['Persona'] },
      { key: 'facturas',     aliases: ['facturas', 'Facturas'] }
    ]
  },

  gastos: {
    sheetName: 'GASTOS 2026',
    headerRow: 2, // igual que ventas, la fila 1 puede venir vacía o con un título
    columns: [
      { key: 'fecha',        aliases: ['Fecha'] },
      { key: 'mes',          aliases: ['MES'] },
      { key: 'proveedor',    aliases: ['RAZON SOCIAL', 'RAZÓN SOCIAL'] },
      { key: 'factura',      aliases: ['No° factura', 'N factura', 'Factura'] },
      { key: 'concepto',     aliases: ['Referencia'] },
      { key: 'subtotal',     aliases: ['Sub-total', 'Subtotal'] },
      { key: 'itbms',        aliases: ['ITBMS'] },
      { key: 'total',        aliases: ['Total'] }
    ]
  },

  pedidos: {
    sheetName: 'CONTROL DE PEDIDO',
    headerRow: 1,
    columns: [
      { key: 'fecha',            aliases: ['Fecha del pedido'] },
      { key: 'cliente',          aliases: ['Cliente'] },
      { key: 'direccionEntrega', aliases: ['Dirección de entrega', 'Direccion de entrega'] },
      { key: 'producto',         aliases: ['Producto'] },
      { key: 'presentacion',     aliases: ['Presentación', 'Presentacion'] },
      { key: 'cantidad',         aliases: ['Cantidad'] },
      { key: 'precioUnitario',   aliases: ['Precio unitario'] },
      { key: 'total',            aliases: ['Total'] },
      { key: 'fechaEntrega',     aliases: ['Fecha de entrega'] },
      { key: 'estado',           aliases: ['Estado'] },
      { key: 'observaciones',    aliases: ['Observaciones'] }
    ]
  }
};

const CACHE_SECONDS = 60; // Cache de resultados para reducir lecturas a Sheets

// ---------------------------------------------------------------------------
// 2. ENTRY POINTS
// ---------------------------------------------------------------------------

function doGet(e) {
  try {
    const action = (e.parameter.action || 'getAll').toString();
    let payload;

    switch (action) {
      case 'getAll':
        payload = getAllSheetsData();
        break;
      case 'getSheet':
        payload = { data: getSheetData(e.parameter.sheet) };
        break;
      case 'ping':
        payload = { ok: true, timestamp: new Date().toISOString() };
        break;
      default:
        return jsonResponse({ error: 'Acción no reconocida: ' + action }, 400);
    }

    return jsonResponse({ success: true, ...payload });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

function doPost(e) {
  try {
    const params = e.parameter;
    const action = params.action;

    // Actualiza el estado de un pedido usando su número de FILA en la hoja
    // (ese número viene incluido en cada registro que devuelve getAll como "_row").
    if (action === 'updateOrderStatus') {
      const result = updateOrderStatus(Number(params.row), params.status);
      return jsonResponse({ success: true, result });
    }

    return jsonResponse({ success: false, error: 'Acción POST no reconocida' }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// ---------------------------------------------------------------------------
// 3. LECTURA DE DATOS
// ---------------------------------------------------------------------------

function getAllSheetsData() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('all_sheets_data');
  if (cached) return JSON.parse(cached);

  const data = {
    ventas: getSheetData('ventas'),
    banca: getSheetData('banca'),
    gastos: getSheetData('gastos'),
    pedidos: getSheetData('pedidos'),
    generatedAt: new Date().toISOString()
  };

  try {
    cache.put('all_sheets_data', JSON.stringify(data), CACHE_SECONDS);
  } catch (cacheErr) {
    // Si el payload supera ~100KB, CacheService falla silenciosamente: se ignora.
  }

  return data;
}

/**
 * Lee una hoja usando su configuración (nombre real + fila de encabezado +
 * columnas esperadas) y la convierte en un array de objetos.
 * @param {string} sheetKey - 'ventas' | 'banca' | 'gastos' | 'pedidos'
 */
function getSheetData(sheetKey) {
  const config = SHEET_CONFIG[sheetKey];
  if (!config) throw new Error('Configuración de hoja no encontrada: ' + sheetKey);

  const sheet = findSheetByName(config.sheetName);
  if (!sheet) {
    const disponibles = SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName()).join(', ');
    throw new Error(
      `No se encontró la pestaña "${config.sheetName}". Pestañas disponibles en este archivo: ${disponibles}`
    );
  }

  const range = sheet.getDataRange();
  const displayValues = range.getDisplayValues(); // texto formateado (moneda/fecha legibles)
  const rawValues = range.getValues();             // valores crudos (fechas/números reales)

  const headerRowIndex = config.headerRow - 1; // 0-based
  if (displayValues.length <= headerRowIndex) return [];

  const headerRow = displayValues[headerRowIndex];
  const columnIndexMap = mapColumnsToIndexes(headerRow, config.columns);

  const rows = [];
  for (let i = headerRowIndex + 1; i < displayValues.length; i++) {
    const rowDisplay = displayValues[i];
    const rowRaw = rawValues[i];

    if (rowDisplay.every(cell => cell === '')) continue; // fila vacía

    const obj = {};
    config.columns.forEach(col => {
      const colIndex = columnIndexMap[col.key];
      if (colIndex === undefined) { obj[col.key] = ''; return; }

      const rawCell = rowRaw[colIndex];
      const displayCell = rowDisplay[colIndex];

      if (rawCell instanceof Date) {
        obj[col.key] = Utilities.formatDate(rawCell, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (typeof rawCell === 'number') {
        obj[col.key] = rawCell;
      } else {
        obj[col.key] = displayCell;
      }
    });

    obj._row = i + 1; // número real de fila en la hoja (útil para futuras escrituras)
    rows.push(obj);
  }

  return rows;
}

/**
 * Empareja cada columna esperada (por sus alias) con el índice real donde
 * aparece en la fila de encabezados de la hoja. Ignora mayúsculas/minúsculas,
 * acentos, tildes y espacios extra al comparar.
 */
function mapColumnsToIndexes(headerRow, expectedColumns) {
  const normalizedHeaders = headerRow.map(normalizeHeader);
  const indexMap = {};

  expectedColumns.forEach(col => {
    for (const alias of col.aliases) {
      const normalizedAlias = normalizeHeader(alias);
      const foundIndex = normalizedHeaders.indexOf(normalizedAlias);
      if (foundIndex !== -1) {
        indexMap[col.key] = foundIndex;
        return;
      }
    }
    // Si no se encontró ninguna variante, la columna simplemente no existe
    // en esta hoja y quedará vacía ('') en cada registro — no rompe la app.
  });

  return indexMap;
}

/** Normaliza un encabezado para compararlo sin importar tildes/mayúsculas/espacios. */
function normalizeHeader(str) {
  return str
    .toString()
    .trim()
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[°ºª.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Busca una hoja por nombre ignorando mayúsculas/minúsculas y espacios extra. */
function findSheetByName(targetName) {
  const target = normalizeHeader(targetName);
  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  return sheets.find(s => normalizeHeader(s.getName()) === target) || null;
}

// ---------------------------------------------------------------------------
// 4. ESCRITURA (opcional / extensible)
// ---------------------------------------------------------------------------

/**
 * Actualiza la columna "Estado" de un pedido dado su número de FILA real
 * en la hoja "CONTROL DE PEDIDO" (ese número se obtiene del campo "_row"
 * que ya trae cada registro devuelto por getAll).
 */
function updateOrderStatus(rowNumber, newStatus) {
  if (!rowNumber) throw new Error('Falta el número de fila del pedido a actualizar');

  const config = SHEET_CONFIG.pedidos;
  const sheet = findSheetByName(config.sheetName);
  if (!sheet) throw new Error('No se encontró la pestaña de pedidos');

  const headerRow = sheet.getRange(config.headerRow, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const columnIndexMap = mapColumnsToIndexes(headerRow, config.columns);
  const estadoCol = columnIndexMap['estado'];
  if (estadoCol === undefined) throw new Error('La hoja de pedidos no tiene columna "Estado"');

  sheet.getRange(rowNumber, estadoCol + 1).setValue(newStatus);
  CacheService.getScriptCache().remove('all_sheets_data');
  return { updated: true, row: rowNumber };
}

// ---------------------------------------------------------------------------
// 5. HELPERS
// ---------------------------------------------------------------------------

function jsonResponse(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
