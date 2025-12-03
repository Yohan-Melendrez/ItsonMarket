/**
 * Navbar Module - ItsonMarket
 * Este archivo se puede usar para funcionalidad adicional del navbar
 * La lógica principal está en app.js (updateNavbar, toggleUserDropdown, etc.)
 */

function renderNavbar() {
    // La funcionalidad principal ahora está en app.js
    // Esta función se mantiene por compatibilidad
    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }
}

// Logout handler
function handleLogout() {
    if (window.AuthState) {
        window.AuthState.logout();
    } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("usuario");
        window.location.hash = "/";
    }
}

// Exponer globalmente
window.renderNavbar = renderNavbar;
window.handleLogout = handleLogout;

