/**
 * ============================================================================
 * UTILS.JS — Funciones puras de formateo y manipulación de datos
 * ============================================================================
 */
import { CONFIG } from './config.js';

export function formatCurrency(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat(CONFIG.LOCALE, {
    style: 'currency',
    currency: CONFIG.CURRENCY,
    maximumFractionDigits: 2
  }).format(n);
}

export function formatNumber(value, decimals = 0) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat(CONFIG.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n);
}

export function formatPercent(value, decimals = 1) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat(CONFIG.LOCALE, {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date);
}

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value) ? null : value;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

export function toISODate(value) {
  const d = toDate(value);
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function uniqueValues(rows, key) {
  const set = new Set();
  rows.forEach(r => { if (r[key] !== undefined && r[key] !== '') set.add(r[key]); });
  return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), CONFIG.LOCALE));
}

export function sumBy(rows, groupKey, valueKey) {
  const map = new Map();
  rows.forEach(r => {
    const key = r[groupKey] ?? 'Sin dato';
    const value = Number(r[valueKey]) || 0;
    map.set(key, (map.get(key) || 0) + value);
  });
  return map;
}

export function total(rows, key) {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

export function sumByMonth(rows, dateKey, valueKey) {
  const map = new Map();
  rows.forEach(r => {
    const d = toDate(r[dateKey]);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + (Number(r[valueKey]) || 0));
  });
  return new Map([...map.entries()].sort());
}

export function monthLabel(yyyyMm) {
  const [y, m] = yyyyMm.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat(CONFIG.LOCALE, { month: 'short', year: '2-digit' }).format(d);
}

export function chartPalette() {
  return ['#2F6FED', '#0EA5A0', '#7C5CFC', '#D97706', '#DC2626', '#16A34A', '#5C8FFF', '#F472B6'];
}

export function truncate(str, max = 24) {
  if (!str) return '';
  const s = String(str);
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export function smartCompare(a, b) {
  const na = Number(a), nb = Number(b);
  if (!isNaN(na) && !isNaN(nb) && a !== '' && b !== '') return na - nb;
  const da = toDate(a), db = toDate(b);
  if (da && db) return da - db;
  return String(a ?? '').localeCompare(String(b ?? ''), CONFIG.LOCALE);
}
