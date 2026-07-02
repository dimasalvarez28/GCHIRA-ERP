/**
 * ============================================================================
 * TOAST.JS — Notificaciones flotantes no intrusivas
 * ============================================================================
 */
let container = null;

function getContainer() {
  if (!container) {
    container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }
  return container;
}

/**
 * Muestra una notificación temporal.
 * @param {string} message
 * @param {'info'|'success'|'error'} type
 */
export function showToast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  getContainer().appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    el.style.transition = 'all 200ms ease';
    setTimeout(() => el.remove(), 220);
  }, 3200);
}
