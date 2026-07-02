/**
 * ============================================================================
 * THEME.JS — Tema claro / oscuro con persistencia en localStorage
 * ============================================================================
 */
import { CONFIG } from './config.js';

export function initTheme() {
  const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
  updateMetaThemeColor(theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}

export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function updateMetaThemeColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0E17' : '#F3F5FA');
}
