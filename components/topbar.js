/**
 * ============================================================================
 * TOPBAR — Barra superior: búsqueda global, tema, refresco y usuario
 * ============================================================================
 */
import { CONFIG } from '../js/config.js';
import { toggleTheme, currentTheme } from '../js/theme.js';
import { refreshAllChartsTheme } from '../js/charts.js';
import { openSearch } from '../js/search.js';
import { initials } from '../js/utils.js';

export function mountTopbar({ onRefresh, userName = 'Equipo NovaERP', userRole = 'Administrador' } = {}) {
  const el = document.getElementById('topbar');
  if (!el) return;

  el.innerHTML = `
    <button class="icon-btn hidden-desktop" id="mobileMenuBtn" title="Menú">
      ${iconMenu()}
    </button>
    <div class="topbar__search" id="topbarSearch" role="button" tabindex="0">
      ${iconSearch()}
      <input type="text" placeholder="Buscar clientes, productos, pedidos…" readonly />
      <kbd>Ctrl K</kbd>
    </div>
    <div class="topbar__actions">
      <button class="icon-btn" id="refreshBtn" title="Actualizar datos">${iconRefresh()}</button>
      <button class="theme-toggle" id="themeToggle" title="Cambiar tema">
        <span class="theme-toggle__thumb">${currentTheme() === 'dark' ? iconMoon() : iconSun()}</span>
      </button>
      <button class="icon-btn" title="Notificaciones">
        ${iconBell()}
        <span class="icon-btn__badge"></span>
      </button>
      <div class="user-chip">
        <div class="user-chip__avatar">${initials(userName)}</div>
        <div>
          <div class="user-chip__name">${userName}</div>
          <div class="user-chip__role">${userRole}</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('topbarSearch').addEventListener('click', openSearch);
  document.getElementById('topbarSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') openSearch();
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    toggleTheme();
    document.getElementById('themeToggle').querySelector('.theme-toggle__thumb').innerHTML =
      currentTheme() === 'dark' ? iconMoon() : iconSun();
    refreshAllChartsTheme();
  });

  document.getElementById('refreshBtn').addEventListener('click', () => onRefresh && onRefresh());

  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('appShell').classList.toggle('sidebar-open');
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
}

export function setPageTitle(title, subtitle) {
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle || '';
  document.title = `${title} · ${CONFIG.APP_NAME}`;
}

function iconSearch() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'; }
function iconRefresh() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'; }
function iconBell() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'; }
function iconSun() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'; }
function iconMoon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'; }
function iconMenu() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>'; }
