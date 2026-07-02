/**
 * ============================================================================
 * MAIN.JS — Punto de entrada de la aplicación
 * ============================================================================
 * Orquesta: tema, carga de datos desde Apps Script, montaje de sidebar/topbar
 * y arranque del router. Cualquier error de conexión se muestra de forma
 * clara en pantalla en lugar de dejar el dashboard en blanco.
 */
import { CONFIG } from './config.js';
import { initTheme } from './theme.js';
import { fetchAllData } from './api.js';
import { setState, store } from './state.js';
import { mountSidebar } from '../components/sidebar.js';
import { mountTopbar } from '../components/topbar.js';
import { showToast } from '../components/toast.js';
import { initRouter } from './router.js';

initTheme();

async function bootstrap() {
  const content = document.getElementById('pageContent');
  content.innerHTML = loadingPanel();

  mountSidebar();
  mountTopbar({ onRefresh: () => loadData(true) });

  await loadData(false);
  initRouter();

  if (CONFIG.AUTO_REFRESH_MS > 0) {
    setInterval(() => loadData(true, true), CONFIG.AUTO_REFRESH_MS);
  }
}

async function loadData(force, silent = false) {
  try {
    setState({ loading: true, error: null });
    const json = await fetchAllData(force);
    setState({
      data: {
        ventas: json.ventas || [],
        banca: json.banca || [],
        gastos: json.gastos || [],
        pedidos: json.pedidos || []
      },
      loading: false,
      lastUpdated: new Date()
    });
    if (force) {
      showToast('Datos actualizados desde Google Sheets.', 'success');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  } catch (err) {
    setState({ loading: false, error: err.message });
    if (!silent) {
      document.getElementById('pageContent').innerHTML = errorPanel(err.message);
    } else {
      showToast('No se pudo refrescar los datos: ' + err.message, 'error');
    }
  }
}

function loadingPanel() {
  return `
    <div class="state-panel">
      <div class="spinner"></div>
      <p>Conectando con Google Sheets…</p>
    </div>`;
}

function errorPanel(message) {
  return `
    <div class="state-panel">
      <div class="kpi-card__icon kpi-card__icon--danger" style="width:52px;height:52px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <path d="M12 9v4M12 17h.01"/>
        </svg>
      </div>
      <h3 style="margin-top:8px">No se pudieron cargar los datos</h3>
      <p style="max-width:420px">${message}</p>
      <button class="btn btn--primary" id="retryBtn" style="margin-top:8px">Reintentar</button>
    </div>`;
}

document.addEventListener('click', e => {
  if (e.target && e.target.id === 'retryBtn') loadData(true);
});

bootstrap();
