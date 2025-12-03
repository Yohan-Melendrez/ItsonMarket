/**
 * ItsonMarket - Single Page Application Router
 * Sistema de navegación y estado de la aplicación
 */

const app = document.getElementById("app");

// ============= API Configuration =============
const API_BASE = '/api';

// ============= Routes Configuration =============
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

// ============= Auth State Management =============
const AuthState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  
  isLoggedIn() {
    return !!this.token && !!this.user;
  },
  
  login(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateNavbar();
  },
  
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavbar();
    navigateTo('/');
  },
  
  getAuthHeaders() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }
};

// ============= API Helper =============
async function api(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...AuthState.getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };
  
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      if (response.status === 401) {
        AuthState.logout();
        showToast('Tu sesión ha expirado', 'error');
      }
      throw new Error(data.message || `Error ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============= Toast Notifications =============
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',
    error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',
    warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
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
  
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============= Navbar Management =============
function updateNavbar() {
  const navUserMenu = document.getElementById('nav-user-menu');
  const navAuthLinks = document.getElementById('nav-auth-links');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  
  if (AuthState.isLoggedIn()) {
    if (navUserMenu) navUserMenu.classList.remove('hidden');
    if (navAuthLinks) navAuthLinks.classList.add('hidden');
    if (userAvatar) userAvatar.src = AuthState.user.foto || '/imgs/default-avatar.svg';
    if (userName) userName.textContent = AuthState.user.nombre || 'Usuario';
  } else {
    if (navUserMenu) navUserMenu.classList.add('hidden');
    if (navAuthLinks) navAuthLinks.classList.remove('hidden');
  }
}

// Toggle dropdown
function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-dropdown');
  const trigger = document.getElementById('dropdown-trigger');
  if (dropdown && trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

// ============= Script Management =============
function removeOldScripts() {
  document.querySelectorAll("script[data-dynamic]").forEach((s) => s.remove());
}

function loadScript(path, params = {}) {
  if (!path) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = path + '?t=' + Date.now(); // Cache busting
    script.dataset.dynamic = "true";
    
    // Pass route params to script
    window.routeParams = params;
    
    script.onload = () => {
      console.log("Script cargado:", path);
      
      // Init functions based on script
      if (path.includes("register.js") && typeof initRegister === "function") {
        initRegister();
      }
      if (path.includes("login.js") && typeof initLogin === "function") {
        initLogin();
      }
      if (path.includes("publicaciones.js") && typeof initPublicaciones === "function") {
        initPublicaciones();
      }
      if (path.includes("usuarios.js") && typeof initUsuarios === "function") {
        initUsuarios();
      }
      if (path.includes("transacciones.js") && typeof initTransacciones === "function") {
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

// ============= Route Matching =============
function matchRoute(path) {
  // Exact match first
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }
  
  // Dynamic route matching
  for (const [pattern, route] of Object.entries(routes)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:([^/]+)/g, '([^/]+)') + '$');
      const match = path.match(regex);
      
      if (match) {
        const paramNames = (pattern.match(/:([^/]+)/g) || []).map(p => p.slice(1));
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

// ============= Navigation =============
function navigateTo(path) {
  window.location.hash = '#' + path;
}

async function loadRoute() {
  const path = location.hash.replace("#", "") || "/";
  const matched = matchRoute(path);
  
  // Manejar visibilidad del navbar para páginas de auth
  const isAuthPage = path === "/" || path === "/login" || path === "/register";
  if (isAuthPage) {
    document.body.classList.add('auth-page-active');
  } else {
    document.body.classList.remove('auth-page-active');
  }
  
  if (!matched) {
    app.innerHTML = `
      <div class="main-content">
        <div class="container text-center" style="padding: 4rem 1rem;">
          <h1 style="font-size: 6rem; font-weight: 800; color: var(--gray-200); margin: 0;">404</h1>
          <h2 style="margin: 1rem 0;">Página no encontrada</h2>
          <p style="color: var(--gray-500); margin-bottom: 2rem;">La página que buscas no existe o ha sido movida.</p>
          <a href="#/" class="btn btn-primary">Volver al inicio</a>
        </div>
      </div>
    `;
    removeOldScripts();
    return;
  }
  
  const { route, params } = matched;
  
  // Auth checks
  if (route.requiresAuth && !AuthState.isLoggedIn()) {
    showToast('Inicia sesión para continuar', 'warning');
    navigateTo('/login');
    return;
  }
  
  if (route.guestOnly && AuthState.isLoggedIn()) {
    navigateTo('/publicaciones');
    return;
  }
  
  // Exit animation
  app.classList.add("fade-exit");
  await new Promise(r => setTimeout(r, 150));
  app.classList.remove("fade-exit");
  app.classList.add("fade-exit-active");
  await new Promise(r => setTimeout(r, 150));
  
  // Clear content
  app.innerHTML = "";
  app.classList.remove("fade-exit-active");
  
  // Load view
  if (route.view) {
    try {
      const res = await fetch(route.view);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      app.innerHTML = await res.text();
    } catch (error) {
      console.error('Error loading view:', error);
      app.innerHTML = `
        <div class="main-content">
          <div class="container text-center" style="padding: 4rem 1rem;">
            <h2>Error al cargar la página</h2>
            <p style="color: var(--gray-500);">Intenta recargar la página.</p>
            <button onclick="location.reload()" class="btn btn-primary mt-4">Recargar</button>
          </div>
        </div>
      `;
      return;
    }
  }
  
  // Load scripts
  removeOldScripts();
  await loadScript(route.script, params);
  
  // Enter animation
  app.classList.add("fade-enter");
  requestAnimationFrame(() => app.classList.add("fade-enter-active"));
  
  setTimeout(() => {
    app.classList.remove("fade-enter", "fade-enter-active");
  }, 250);
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// ============= Utility Functions =============
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
}

function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  }).format(new Date(date));
}

function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) return formatDate(date);
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} min`;
  return 'ahora';
}

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

// Password visibility toggle
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  
  // Update icon
  const svg = button.querySelector('svg');
  if (svg) {
    svg.innerHTML = isPassword 
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
  }
}

// ============= Initialize =============
window.addEventListener("hashchange", loadRoute);
window.addEventListener("load", () => {
  updateNavbar();
  loadRoute();
});

// Expose globally needed functions
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
