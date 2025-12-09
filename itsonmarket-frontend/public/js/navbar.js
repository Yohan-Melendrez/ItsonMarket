/**
 * @function renderNavbar
 * @desc Actualiza visualmente la barra de navegación llamando al método del Web Component.
 * @returns {void}
 */
function renderNavbar() {
  const navbar = document.querySelector("navbar-component");
  if (navbar && typeof navbar.updateAuthState === "function") {
    navbar.updateAuthState();
  }
}

/**
 * @function updateNavbar
 * @desc Alias para renderNavbar, mantiene compatibilidad.
 * @returns {void}
 */
function updateNavbar() {
  renderNavbar();
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
    renderNavbar();
  }
}

/**
 * @function toggleUserDropdown
 * @desc Alterna la visibilidad del menú desplegable del usuario.
 * @returns {void}
 */
function toggleUserDropdown() {
  const dropdown = document.getElementById("user-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
}

/**
 * @function toggleMobileMenu
 * @desc Alterna la visibilidad del menú móvil.
 * @returns {void}
 */
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.classList.toggle("hidden");
  }
}

document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("user-dropdown");
  const trigger = document.getElementById("dropdown-trigger");
  if (
    dropdown &&
    trigger &&
    !trigger.contains(e.target) &&
    !dropdown.contains(e.target)
  ) {
    dropdown.classList.add("hidden");
  }
});

/**
 * Expone funciones globalmente para acceso desde HTML.
 * @global
 */
window.renderNavbar = renderNavbar;
window.updateNavbar = updateNavbar;
window.handleLogout = handleLogout;
window.toggleUserDropdown = toggleUserDropdown;
window.toggleMobileMenu = toggleMobileMenu;
