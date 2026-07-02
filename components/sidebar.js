/**
 * ============================================================================
 * SIDEBAR — Menú lateral de navegación
 * ============================================================================
 */
import { CONFIG } from '../js/config.js';
import { store, subscribe } from '../js/state.js';

export const ROUTES = [
  {
    group: 'Panel',
    items: [
      { id: 'general', label: 'Resumen general', icon: iconHome() }
    ]
  },
  {
    group: 'Dashboards',
    items: [
      { id: 'ventas', label: 'Ventas', icon: iconCart() },
      { id: 'financiero', label: 'Financiero', icon: iconBank() },
      { id: 'gastos', label: 'Gastos', icon: iconReceipt() },
      { id: 'pedidos', label: 'Pedidos', icon: iconBox() },
      { id: 'clientes', label: 'Clientes', icon: iconUsers() },
      { id: 'productos', label: 'Productos', icon: iconTag() },
      { id: 'estadoCuenta', label: 'Estados de cuenta', icon: iconReceipt() }
    ]
  }
];

export function mountSidebar() {
  const el = document.getElementById('sidebar');
  if (!el) return;

  el.innerHTML = `
    <div class="sidebar__brand">
      <div class="sidebar__brand-mark">${CONFIG.APP_SHORT}</div>
      <div class="sidebar__brand-text">${CONFIG.APP_NAME}<small>ERP Dashboard</small></div>
    </div>
    <nav>
      ${ROUTES.map(group => `
        <div class="nav-group">
          <div class="nav-group__label">${group.group}</div>
          ${group.items.map(item => `
            <a href="#${item.id}" class="nav-link" data-route="${item.id}">
              <span class="nav-link__icon">${item.icon}</span>
              <span class="nav-link__label">${item.label}</span>
            </a>`).join('')}
        </div>`).join('')}
    </nav>
    <div class="sidebar__footer">
      <button class="sidebar-toggle" id="sidebarToggle" title="Colapsar menú">
        ${iconCollapse()}
      </button>
    </div>
  `;

  syncActiveLink();
  subscribe(() => syncActiveLink());

  document.getElementById('sidebarToggle').addEventListener('click', () => {
    const shell = document.getElementById('appShell');
    const collapsed = shell.classList.toggle('sidebar-collapsed');
    localStorage.setItem(CONFIG.STORAGE_KEYS.SIDEBAR, collapsed ? '1' : '0');
  });

  if (localStorage.getItem(CONFIG.STORAGE_KEYS.SIDEBAR) === '1') {
    document.getElementById('appShell').classList.add('sidebar-collapsed');
  }
}

function syncActiveLink() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.route === store.route);
  });
}

function iconHome() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>'; }
function iconCart() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'; }
function iconBank() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-4 7 4M4 10v11M20 10v11"/></svg>'; }
function iconReceipt() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 1z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>'; }
function iconBox() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12l8.73-5.04M12 22.08V12"/></svg>'; }
function iconUsers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'; }
function iconTag() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41 11 22.99l-8-8 8.59-8.58H20a1 1 0 0 1 1 1v6.41z"/><circle cx="16" cy="7" r="1.5"/></svg>'; }
function iconCollapse() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l-6-6 6-6M20 12H4"/></svg>'; }
