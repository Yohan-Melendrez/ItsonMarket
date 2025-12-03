function renderNavbar() {
    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }
}

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

