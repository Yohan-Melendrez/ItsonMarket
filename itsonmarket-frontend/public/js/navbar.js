/**
 * @function renderNavbar
 * @desc Actualiza visualmente la barra de navegación si la función global updateNavbar existe.
 * @returns {void}
 */
function renderNavbar() {
  if (typeof updateNavbar === "function") {
    updateNavbar();
  }
}

/**
 * @function handleLogout
 * @desc Cierra la sesión del usuario eliminando credenciales y redirige al login.
 * @returns {void}
 */
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

/**
 * Expone funciones globalmente para acceso desde HTML.
 * @global
 */
window.renderNavbar = renderNavbar;
window.handleLogout = handleLogout;
