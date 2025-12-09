/**
 * @file app.js
 * @desc Sistema de enrutamiento SPA y gestión de autenticación para ItsonMarket
 * @note Maneja rutas, autenticación, API calls y utilidades generales del frontend
 */

const app = document.getElementById("app");

const API_BASE = "/api";

const routes = {
  "/": {
    view: "/login.html",
    script: "/js/login.js",
    requiresAuth: false,
    guestOnly: true,
  },
  "/login": {
    view: "/login.html",
    script: "/js/login.js",
    requiresAuth: false,
    guestOnly: true,
  },
  "/register": {
    view: "/register.html",
    script: "/js/register.js",
    requiresAuth: false,
    guestOnly: true,
  },
  "/publicaciones": {
    view: "/views/publicaciones/lista.html",
    script: "/js/publicaciones.js",
    requiresAuth: false,
  },
  "/publicaciones/crear": {
    view: "/views/publicaciones/crear.html",
    script: "/js/publicaciones.js",
    requiresAuth: true,
  },
  "/publicaciones/editar/:id": {
    view: "/views/publicaciones/crear.html",
    script: "/js/publicaciones.js",
    requiresAuth: true,
  },
  "/publicaciones/:id": {
    view: "/views/publicaciones/detalle.html",
    script: "/js/publicaciones.js",
    requiresAuth: false,
  },
  "/perfil": {
    view: "/views/usuarios/perfil.html",
    script: "/js/usuarios.js",
    requiresAuth: true,
  },
  "/usuario/:id": {
    view: "/views/usuarios/perfil.html",
    script: "/js/usuarios.js",
    requiresAuth: false,
  },
  "/perfil/editar": {
    view: "/views/usuarios/editar.html",
    script: "/js/usuarios.js",
    requiresAuth: true,
  },
  "/transacciones": {
    view: "/views/transacciones/lista.html",
    script: "/js/transacciones.js",
    requiresAuth: true,
  },
  "/chats": {
    view: "/views/chats/chats.html",
    script: "/js/chats.js",
    requiresAuth: true,
  },
  "/chats/:id": {
    view: "/views/chats/chats.html",
    script: "/js/chats.js",
    requiresAuth: true,
  },
};

/**
 * @object AuthState
 * @desc Objeto global que gestiona el estado de autenticación del usuario
 * @property {String} token - Token JWT del usuario autenticado
 * @property {Object} user - Datos del usuario autenticado
 */
const AuthState = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),

  /**
   * @function isLoggedIn
   * @desc Verifica si el usuario está autenticado
   * @returns {Boolean} true si hay token y usuario
   */
  isLoggedIn() {
    return !!this.token && !!this.user;
  },

  /**
   * @function login
   * @desc Registra al usuario como autenticado
   * @param {String} token - Token JWT
   * @param {Object} user - Datos del usuario
   * @returns {void}
   */
  login(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("auth-changed"));
    updateNavbar();
  },

  /**
   * @function logout
   * @desc Desautentica al usuario y lo redirige al login
   * @returns {void}
   */
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    updateNavbar();
    navigateTo("/");
  },

  /**
   * @function getAuthHeaders
   * @desc Obtiene headers de autorización para requests
   * @returns {Object} Headers con token Bearer
   */
  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  },
};

/**
 * @function api
 * @desc Realiza requests HTTP a la API con autenticación automática
 * @param {String} endpoint - Ruta del endpoint (ej: /publicaciones)
 * @param {Object} options - Opciones de fetch (método, body, headers)
 * @returns {Promise<Object>} Respuesta JSON de la API
 * @throws {Error} Si la respuesta no es OK o falla la conexión
 */
async function api(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...AuthState.getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        AuthState.logout();
        showToast("Tu sesión ha expirado", "error");
      }
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * @function showToast
 * @desc Muestra una notificación temporal en la pantalla
 * @param {String} message - Mensaje a mostrar
 * @param {String} type - Tipo de notificación (success, error, warning, info)
 * @param {Number} duration - Duración en milisegundos
 * @returns {void}
 */
function showToast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icons = {
    success:
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',
    error:
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',
    warning:
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
    info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
  };

  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      ${icons[type] || icons.info}
    </svg>
    <span>${message}</span>
    <button type="button" class="toast-close" onclick="this.parentElement.remove()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * @function updateNavbar
 * @desc Actualiza la barra de navegación según el estado de autenticación
 * @returns {void}
 */
function updateNavbar() {
  const navUserMenu = document.getElementById("nav-user-menu");
  const navAuthLinks = document.getElementById("nav-auth-links");
  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");

  if (AuthState.isLoggedIn()) {
    if (navUserMenu) navUserMenu.classList.remove("hidden");
    if (navAuthLinks) navAuthLinks.classList.add("hidden");
    if (userAvatar)
      userAvatar.src = AuthState.user.foto || "/imgs/default-avatar.svg";
    if (userName) userName.textContent = AuthState.user.nombre || "Usuario";
  } else {
    if (navUserMenu) navUserMenu.classList.add("hidden");
    if (navAuthLinks) navAuthLinks.classList.remove("hidden");
  }
}

/**
 * @function toggleUserDropdown
 * @desc Alterna la visibilidad del menú desplegable de usuario
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
 * @desc Alterna la visibilidad del menú móvil
 * @returns {void}
 */
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.classList.toggle("hidden");
  }
}

/**
 * @function removeOldScripts
 * @desc Elimina scripts dinámicos anteriores del DOM
 * @returns {void}
 */
function removeOldScripts() {
  document.querySelectorAll("script[data-dynamic]").forEach((s) => s.remove());
}

/**
 * @function loadScript
 * @desc Carga dinámicamente un archivo JavaScript e invoca su función init
 * @param {String} path - Ruta del archivo JavaScript
 * @param {Object} params - Parámetros a pasar a la función init
 * @returns {Promise<void>}
 */
function loadScript(path, params = {}) {
  if (!path) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = path + "?t=" + Date.now();
    script.dataset.dynamic = "true";

    window.routeParams = params;

    script.onload = () => {
      if (path.includes("register.js") && typeof initRegister === "function") {
        initRegister();
      }
      if (path.includes("login.js") && typeof initLogin === "function") {
        initLogin();
      }
      if (
        path.includes("publicaciones.js") &&
        typeof initPublicaciones === "function"
      ) {
        initPublicaciones();
      }
      if (path.includes("usuarios.js") && typeof initUsuarios === "function") {
        initUsuarios();
      }
      if (
        path.includes("transacciones.js") &&
        typeof initTransacciones === "function"
      ) {
        initTransacciones();
      }
      if (path.includes("chats.js") && typeof initChats === "function") {
        initChats();
      }

      resolve();
    };

    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * @function matchRoute
 * @desc Encuentra la ruta coincidente y extrae parámetros dinámicos
 * @param {String} path - Ruta a verificar
 * @returns {Object|null} Objeto con route y params, o null si no encuentra
 */
function matchRoute(path) {
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }

  for (const [pattern, route] of Object.entries(routes)) {
    if (pattern.includes(":")) {
      const regex = new RegExp(
        "^" + pattern.replace(/:([^/]+)/g, "([^/]+)") + "$"
      );
      const match = path.match(regex);

      if (match) {
        const paramNames = (pattern.match(/:([^/]+)/g) || []).map((p) =>
          p.slice(1)
        );
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { route, params };
      }
    }
  }

  return null;
}

/**
 * @function navigateTo
 * @desc Navega a una ruta actualizar el hash del URL
 * @param {String} path - Ruta destino
 * @returns {void}
 */
function navigateTo(path) {
  window.location.hash = "#" + path;
}

/**
 * @function loadRoute
 * @desc Carga la vista y script correspondiente a la ruta actual
 * @returns {Promise<void>}
 */
async function loadRoute() {
  const path = location.hash.replace("#", "") || "/";
  const matched = matchRoute(path);

  const isAuthPage = path === "/" || path === "/login" || path === "/register";
  if (isAuthPage) {
    document.body.classList.add("auth-page-active");
  } else {
    document.body.classList.remove("auth-page-active");
  }

  if (!matched) {
    app.innerHTML = `
      <div class="main-content">
        <div class="container text-center error-page-container">
          <h1 class="error-page-code">404</h1>
          <h2 class="error-page-title">Página no encontrada</h2>
          <p class="error-page-message">La página que buscas no existe o ha sido movida.</p>
          <a href="#/" class="btn btn-primary">Volver al inicio</a>
        </div>
      </div>
    `;
    removeOldScripts();
    return;
  }

  const { route, params } = matched;

  if (route.requiresAuth && !AuthState.isLoggedIn()) {
    showToast("Inicia sesión para continuar", "warning");
    navigateTo("/login");
    return;
  }

  if (route.guestOnly && AuthState.isLoggedIn()) {
    navigateTo("/publicaciones");
    return;
  }

  app.classList.add("fade-exit");
  await new Promise((r) => setTimeout(r, 150));
  app.classList.remove("fade-exit");
  app.classList.add("fade-exit-active");
  await new Promise((r) => setTimeout(r, 150));

  app.innerHTML = "";
  app.classList.remove("fade-exit-active");

  if (route.view) {
    try {
      const res = await fetch(route.view);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      app.innerHTML = await res.text();
    } catch (error) {
      app.innerHTML = `
        <div class="main-content">
          <div class="container text-center error-page-container">
            <h2 class="error-page-title">Error al cargar la página</h2>
            <p class="error-page-message">Intenta recargar la página.</p>
            <button onclick="location.reload()" class="btn btn-primary mt-4">Recargar</button>
          </div>
        </div>
      `;
      return;
    }
  }

  removeOldScripts();
  await loadScript(route.script, params);

  app.classList.add("fade-enter");
  requestAnimationFrame(() => app.classList.add("fade-enter-active"));

  setTimeout(() => {
    app.classList.remove("fade-enter", "fade-enter-active");
  }, 250);

  window.scrollTo(0, 0);
}

/**
 * @function formatCurrency
 * @desc Formatea un número como moneda mexicana
 * @param {Number} amount - Cantidad a formatear
 * @returns {String} Cantidad formateada (ej: $1,200.00)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

/**
 * @function formatDate
 * @desc Formatea una fecha a formato local
 * @param {String|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {String} Fecha formateada
 */
function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

/**
 * @function formatRelativeTime
 * @desc Convierte una fecha a tiempo relativo (ej: hace 2 horas)
 * @param {String|Date} date - Fecha a convertir
 * @returns {String} Tiempo relativo
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(date);
  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} min`;
  return "ahora";
}

/**
 * @function debounce
 * @desc Crea una función que retrasa la ejecución
 * @param {Function} func - Función a ejecutar
 * @param {Number} wait - Milisegundos de espera
 * @returns {Function} Función con debounce aplicado
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * @function togglePasswordVisibility
 * @desc Alterna la visibilidad de contraseña en un input
 * @param {String} inputId - ID del elemento input
 * @param {HTMLElement} button - Botón que dispara la acción
 * @returns {void}
 */
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";

  const svg = button.querySelector("svg");
  if (svg) {
    svg.innerHTML = isPassword
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
  }
}

window.addEventListener("hashchange", loadRoute);
window.addEventListener("load", () => {
  updateNavbar();
  loadRoute();
});

window.AuthState = AuthState;
window.api = api;
window.showToast = showToast;
window.navigateTo = navigateTo;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatRelativeTime = formatRelativeTime;
window.debounce = debounce;
window.togglePasswordVisibility = togglePasswordVisibility;
window.toggleUserDropdown = toggleUserDropdown;
window.toggleMobileMenu = toggleMobileMenu;
