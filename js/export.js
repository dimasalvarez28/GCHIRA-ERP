/**
 * ============================================================================
 * EXPORT.JS — Exportación de tablas a Excel (.xlsx) y PDF
 * ============================================================================
 * Requiere las librerías cargadas globalmente vía CDN en index.html:
 *   - SheetJS (XLSX)         -> window.XLSX
 *   - jsPDF + autotable      -> window.jspdf.jsPDF
 */
import { showToast } from '../components/toast.js';

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
