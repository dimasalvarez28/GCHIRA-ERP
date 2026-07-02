/**
 * ============================================================================
 * EXPORT.JS — Exportación de tablas a Excel (.xlsx) y PDF
 * ============================================================================
 * Requiere las librerías cargadas globalmente vía CDN en index.html:
 *   - SheetJS (XLSX)         -> window.XLSX
 *   - jsPDF + autotable      -> window.jspdf.jsPDF
 */
import { showToast } from '../components/toast.js';
import { CONFIG } from './config.js';

/**
 * Exporta un array de objetos a un archivo .xlsx
 * @param {Array<Object>} rows
 * @param {string} filename - sin extensión
 * @param {string} sheetName
 */
export function exportToExcel(rows, filename = 'reporte', sheetName = 'Datos') {
  if (!window.XLSX) {
    showToast('La librería de exportación a Excel no cargó correctamente.', 'error');
    return;
  }
  if (!rows || rows.length === 0) {
    showToast('No hay datos para exportar.', 'error');
    return;
  }

  const cleanRows = rows.map(stripInternalKeys);
  const worksheet = window.XLSX.utils.json_to_sheet(cleanRows);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  window.XLSX.writeFile(workbook, `${filename}.xlsx`);
  showToast('Excel exportado correctamente.', 'success');
}

/**
 * Exporta un array de objetos a PDF usando jsPDF + autoTable.
 * @param {Array<Object>} rows
 * @param {string} filename - sin extensión
 * @param {string} title - título mostrado en el documento
 */
export function exportToPDF(rows, filename = 'reporte', title = 'Reporte') {
  if (!window.jspdf) {
    showToast('La librería de exportación a PDF no cargó correctamente.', 'error');
    return;
  }
  if (!rows || rows.length === 0) {
    showToast('No hay datos para exportar.', 'error');
    return;
  }

  const cleanRows = rows.map(stripInternalKeys);
  const headers = Object.keys(cleanRows[0]);
  const body = cleanRows.map(row => headers.map(h => String(row[h] ?? '')));

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-PA')}`, 14, 22);

  doc.autoTable({
    head: [headers],
    body,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [47, 111, 237] },
    alternateRowStyles: { fillColor: [245, 246, 250] }
  });

  doc.save(`${filename}.pdf`);
  showToast('PDF exportado correctamente.', 'success');
}

function stripInternalKeys(row) {
  const { _row, ...rest } = row;
  return rest;
}

/**
 * Genera un PDF con formato de "Estado de Cuenta" para un cliente: encabezado
 * con el nombre de la empresa y del cliente, un resumen de totales, y el
 * detalle de facturas con su estado de pago.
 * @param {string} cliente
 * @param {Array<Object>} rows - facturas del cliente (columnas de "Ventas 2026")
 * @param {{totalFacturado:number, totalPagado:number, saldoPendiente:number}} totales
 */
export function exportStatementToPDF(cliente, rows, totales) {
  if (!window.jspdf) {
    showToast('La librería de exportación a PDF no cargó correctamente.', 'error');
    return;
  }
  if (!rows || rows.length === 0) {
    showToast('Este cliente no tiene facturas para generar un estado de cuenta.', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Encabezado ---
  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.text(CONFIG.COMPANY_NAME, 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text('Estado de Cuenta', 14, 25);

  doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-PA')}`, pageWidth - 14, 18, { align: 'right' });

  doc.setDrawColor(220);
  doc.line(14, 30, pageWidth - 14, 30);

  // --- Datos del cliente ---
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text('Cliente:', 14, 40);
  doc.setFontSize(12);
  doc.text(String(cliente), 40, 40);

  // --- Resumen de totales ---
  const summaryY = 50;
  const boxWidth = (pageWidth - 28 - 16) / 3;
  const summaryItems = [
    { label: 'Total facturado', value: formatCurrencyLocal(totales.totalFacturado) },
    { label: 'Total pagado', value: formatCurrencyLocal(totales.totalPagado) },
    { label: 'Saldo pendiente', value: formatCurrencyLocal(totales.saldoPendiente) }
  ];

  summaryItems.forEach((item, i) => {
    const x = 14 + i * (boxWidth + 8);
    doc.setDrawColor(225);
    doc.setFillColor(247, 248, 251);
    doc.roundedRect(x, summaryY, boxWidth, 20, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(item.label, x + 4, summaryY + 7);
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(item.value, x + 4, summaryY + 15);
  });

  // --- Tabla de facturas ---
  const body = rows.map(r => [
    r.fecha || '—',
    String(r.factura ?? '—'),
    r.direccion || '—',
    formatCurrencyLocal(r.total),
    /^pagado/i.test((r.pagado || '').toString().trim()) ? 'Pagado' : 'Pendiente',
    r.fechaPago || '—'
  ]);

  doc.autoTable({
    head: [['Fecha', 'N° Factura', 'Dirección', 'Total', 'Estado', 'Fecha de pago']],
    body,
    startY: summaryY + 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [47, 111, 237] },
    alternateRowStyles: { fillColor: [245, 246, 250] },
    columnStyles: { 3: { halign: 'right' } }
  });

  // --- Pie de página ---
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Este documento es un resumen generado automáticamente a partir de "${CONFIG.APP_NAME}".`, 14, finalY);

  const safeName = String(cliente).replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 40);
  doc.save(`estado_cuenta_${safeName}.pdf`);
  showToast('Estado de cuenta exportado correctamente.', 'success');
}

function formatCurrencyLocal(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat(CONFIG.LOCALE, { style: 'currency', currency: CONFIG.CURRENCY, maximumFractionDigits: 2 }).format(n);
}
