/**
 * ItsonMarket Web Components
 * Implementación de Micro-Frontends usando Custom Elements
 * Estos componentes encapsulan funcionalidad reutilizable de la UI
 */

// ============= NAVBAR COMPONENT =============
/**
 * <navbar-component> - Barra de navegación reutilizable
 * Maneja autenticación, menú de usuario y navegación móvil
 */
class NavbarComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        
        // Escuchar cambios de autenticación
        window.addEventListener('auth-changed', () => this.updateAuthState());
    }

    disconnectedCallback() {
        window.removeEventListener('auth-changed', () => this.updateAuthState());
    }

    render() {
        const isLoggedIn = window.AuthState?.isLoggedIn() || false;
        const user = window.AuthState?.user || {};

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .navbar {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    padding: 0.75rem 1.5rem;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                .navbar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }

                .navbar-brand img {
                    height: 45px;
                    border-radius: 8px;
                }

                .navbar-menu {
                    display: flex;
                    list-style: none;
                    gap: 0.5rem;
                }

                .navbar-menu a {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    color: #a0aec0;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .navbar-menu a:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }

                .navbar-menu svg {
                    width: 20px;
                    height: 20px;
                }

                .navbar-user {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .navbar-user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .navbar-user-info:hover {
                    background: rgba(255,255,255,0.1);
                }

                .navbar-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #667eea;
                }

                .navbar-user-info span {
                    color: white;
                    font-weight: 500;
                }

                .navbar-user-info svg {
                    width: 16px;
                    height: 16px;
                    color: #a0aec0;
                }

                .dropdown {
                    position: relative;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    min-width: 200px;
                    padding: 0.5rem;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s;
                }

                .dropdown-menu.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: #374151;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    border: none;
                    background: none;
                    width: 100%;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .dropdown-item:hover {
                    background: #f3f4f6;
                }

                .dropdown-item.danger {
                    color: #ef4444;
                }

                .dropdown-item.danger:hover {
                    background: #fef2f2;
                }

                .dropdown-item svg {
                    width: 18px;
                    height: 18px;
                }

                .dropdown-divider {
                    height: 1px;
                    background: #e5e7eb;
                    margin: 0.5rem 0;
                }

                .btn {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    font-size: 0.9rem;
                }

                .btn-ghost {
                    background: transparent;
                    color: #a0aec0;
                }

                .btn-ghost:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .hidden {
                    display: none !important;
                }

                .mobile-toggle {
                    display: none;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .mobile-toggle svg {
                    width: 24px;
                    height: 24px;
                }

                @media (max-width: 768px) {
                    .navbar-menu {
                        display: none;
                    }

                    .mobile-toggle {
                        display: block;
                    }

                    .navbar-menu.mobile-open {
                        display: flex;
                        flex-direction: column;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: #1a1a2e;
                        padding: 1rem;
                    }
                }
            </style>

            <nav class="navbar">
                <div class="navbar-container">
                    <a href="#/publicaciones" class="navbar-brand">
                        <img src="/imgs/ItsonMarket.png" alt="ITSON Market">
                    </a>

                    <ul class="navbar-menu" id="mainMenu">
                        <li>
                            <a href="#/publicaciones">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Explorar
                            </a>
                        </li>
                        <li>
                            <a href="#/publicaciones/crear">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Publicar
                            </a>
                        </li>
                        <li>
                            <a href="#/transacciones">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Transacciones
                            </a>
                        </li>
                        <li>
                            <a href="#/chats">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Mensajes
                            </a>
                        </li>
                    </ul>

                    <!-- Usuario autenticado -->
                    <div class="navbar-user ${isLoggedIn ? '' : 'hidden'}" id="userMenu">
                        <div class="dropdown">
                            <div class="navbar-user-info" id="dropdownTrigger">
                                <img src="${user.foto || '/imgs/default-avatar.svg'}" alt="Avatar" class="navbar-avatar" id="userAvatar">
                                <span id="userName">${user.nombre || 'Usuario'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            
                            <div class="dropdown-menu" id="dropdownMenu">
                                <a href="#/perfil" class="dropdown-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Mi Perfil
                                </a>
                                <a href="#/perfil/editar" class="dropdown-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Configuración
                                </a>
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item danger" id="logoutBtn">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Links de auth (no logueado) -->
                    <div class="navbar-user ${isLoggedIn ? 'hidden' : ''}" id="authLinks">
                        <a href="#/login" class="btn btn-ghost">Iniciar Sesión</a>
                        <a href="#/register" class="btn btn-primary">Registrarse</a>
                    </div>

                    <button class="mobile-toggle" id="mobileToggle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>
        `;
    }

    setupEventListeners() {
        // Toggle dropdown
        const trigger = this.shadowRoot.getElementById('dropdownTrigger');
        const dropdown = this.shadowRoot.getElementById('dropdownMenu');
        
        if (trigger && dropdown) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', () => {
                dropdown.classList.remove('show');
            });
        }

        // Logout
        const logoutBtn = this.shadowRoot.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.AuthState) {
                    window.AuthState.logout();
                }
                this.updateAuthState();
            });
        }

        // Mobile toggle
        const mobileToggle = this.shadowRoot.getElementById('mobileToggle');
        const mainMenu = this.shadowRoot.getElementById('mainMenu');
        if (mobileToggle && mainMenu) {
            mobileToggle.addEventListener('click', () => {
                mainMenu.classList.toggle('mobile-open');
            });
        }
    }

    updateAuthState() {
        const isLoggedIn = window.AuthState?.isLoggedIn() || false;
        const user = window.AuthState?.user || {};

        const userMenu = this.shadowRoot.getElementById('userMenu');
        const authLinks = this.shadowRoot.getElementById('authLinks');
        const userAvatar = this.shadowRoot.getElementById('userAvatar');
        const userName = this.shadowRoot.getElementById('userName');

        if (isLoggedIn) {
            userMenu?.classList.remove('hidden');
            authLinks?.classList.add('hidden');
            if (userAvatar) userAvatar.src = user.foto || '/imgs/default-avatar.svg';
            if (userName) userName.textContent = user.nombre || 'Usuario';
        } else {
            userMenu?.classList.add('hidden');
            authLinks?.classList.remove('hidden');
        }
    }
}

// ============= PUBLICACION CARD COMPONENT =============
/**
 * <publicacion-card> - Tarjeta de publicación reutilizable
 * Atributos: pub-id, titulo, descripcion, precio, imagen, categoria, tipo, fecha, estado
 */
class PublicacionCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['pub-id', 'titulo', 'descripcion', 'precio', 'imagen', 'categoria', 'tipo', 'fecha', 'estado'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    render() {
        const id = this.getAttribute('pub-id') || '';
        const titulo = this.getAttribute('titulo') || 'Sin título';
        const descripcion = this.getAttribute('descripcion') || '';
        const precio = parseFloat(this.getAttribute('precio')) || 0;
        const imagen = this.getAttribute('imagen') || '/imgs/default-product.svg';
        const categoria = this.getAttribute('categoria') || 'Sin categoría';
        const tipo = this.getAttribute('tipo') || 'producto';
        const fecha = this.getAttribute('fecha') || '';
        const estado = this.getAttribute('estado') || 'activo';

        const precioFormateado = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(precio);

        const fechaFormateada = fecha ? this.formatRelativeTime(fecha) : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                }

                .image-container {
                    position: relative;
                    width: 100%;
                    height: 180px;
                    overflow: hidden;
                }

                .image-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }

                .card:hover .image-container img {
                    transform: scale(1.05);
                }

                .badge {
                    position: absolute;
                    top: 0.75rem;
                    left: 0.75rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .badge-servicio {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }

                .vendido-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .vendido-badge {
                    background: #ef4444;
                    color: white;
                    padding: 0.5rem 1.5rem;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .content {
                    padding: 1rem;
                }

                .categoria {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }

                .titulo {
                    margin: 0 0 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .descripcion {
                    font-size: 0.875rem;
                    color: #4b5563;
                    margin-bottom: 0.75rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .precio {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #667eea;
                }

                .fecha {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }
            </style>

            <div class="card" data-id="${id}">
                <div class="image-container">
                    <img src="${imagen}" alt="${titulo}" onerror="this.src='/imgs/default-product.svg'">
                    ${tipo === 'servicio' ? '<span class="badge badge-servicio">Servicio</span>' : ''}
                    ${estado === 'vendido' ? `
                        <div class="vendido-overlay">
                            <span class="vendido-badge">Vendido</span>
                        </div>
                    ` : ''}
                </div>
                <div class="content">
                    <p class="categoria">${categoria}</p>
                    <h3 class="titulo">${titulo}</h3>
                    <p class="descripcion">${descripcion}</p>
                    <div class="footer">
                        <span class="precio">${precioFormateado}</span>
                        <span class="fecha">${fechaFormateada}</span>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const card = this.shadowRoot.querySelector('.card');
        if (card) {
            card.addEventListener('click', () => {
                const id = this.getAttribute('pub-id');
                if (id && window.navigateTo) {
                    window.navigateTo(`/publicaciones/${id}`);
                }
            });
        }
    }

    formatRelativeTime(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) {
            return new Intl.DateTimeFormat('es-MX', {
                day: 'numeric',
                month: 'short'
            }).format(date);
        }
        if (days > 0) return `hace ${days}d`;
        if (hours > 0) return `hace ${hours}h`;
        if (minutes > 0) return `hace ${minutes}m`;
        return 'ahora';
    }
}

// ============= TRANSACCION CARD COMPONENT =============
/**
 * <transaccion-card> - Tarjeta de transacción reutilizable
 */
class TransaccionCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['trans-id', 'tipo', 'estado', 'titulo', 'imagen', 'monto', 'fecha', 
                'contraparte-nombre', 'contraparte-foto', 'calificacion', 'es-compra'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    render() {
        const id = this.getAttribute('trans-id') || '';
        const estado = this.getAttribute('estado') || 'pendiente';
        const titulo = this.getAttribute('titulo') || 'Publicación';
        const imagen = this.getAttribute('imagen') || '/imgs/default-product.svg';
        const monto = parseFloat(this.getAttribute('monto')) || 0;
        const fecha = this.getAttribute('fecha') || '';
        const contraparteNombre = this.getAttribute('contraparte-nombre') || 'Usuario';
        const contraparteFoto = this.getAttribute('contraparte-foto') || '/imgs/default-avatar.svg';
        const calificacion = this.getAttribute('calificacion') || '';
        const esCompra = this.getAttribute('es-compra') === 'true';

        const montoFormateado = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(monto);

        const fechaFormateada = fecha ? new Intl.DateTimeFormat('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(fecha)) : '';

        const estadoClasses = {
            'pendiente': 'badge-warning',
            'aceptada': 'badge-info',
            'en_proceso': 'badge-info',
            'completada': 'badge-success',
            'cancelada': 'badge-error'
        };

        const estadoLabels = {
            'pendiente': 'Pendiente',
            'aceptada': 'Aceptada',
            'en_proceso': 'En proceso',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };

        // Determinar acciones según estado y si es compra
        let accionesHtml = '';
        if (estado === 'completada' && esCompra) {
            if (!calificacion) {
                accionesHtml = `<button class="btn btn-outline btn-sm" id="btnCalificar">⭐ Calificar</button>`;
            } else {
                accionesHtml = `<span class="badge badge-success">Calificado ⭐${calificacion}</span>`;
            }
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1rem;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    display: flex;
                }

                .image-container {
                    width: 140px;
                    min-height: 140px;
                    background: #f3f4f6;
                    flex-shrink: 0;
                }

                .image-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .content {
                    flex: 1;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .info {
                    flex: 1;
                }

                .badges {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .badge-compra { background: #dbeafe; color: #1d4ed8; }
                .badge-venta { background: #fce7f3; color: #be185d; }
                .badge-warning { background: #fef3c7; color: #b45309; }
                .badge-info { background: #dbeafe; color: #1d4ed8; }
                .badge-success { background: #d1fae5; color: #047857; }
                .badge-error { background: #fee2e2; color: #dc2626; }

                .titulo {
                    margin: 0 0 0.25rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .fecha {
                    font-size: 0.85rem;
                    color: #6b7280;
                }

                .precio {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #667eea;
                    text-align: right;
                }

                .footer {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid #e5e7eb;
                }

                .avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .contraparte {
                    flex: 1;
                }

                .contraparte-label {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .contraparte-nombre {
                    font-weight: 500;
                    color: #1f2937;
                }

                .btn {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    font-size: 0.875rem;
                }

                .btn-outline {
                    background: transparent;
                    border: 2px solid #667eea;
                    color: #667eea;
                }

                .btn-outline:hover {
                    background: #667eea;
                    color: white;
                }

                .btn-sm {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.8rem;
                }

                @media (max-width: 640px) {
                    .card {
                        flex-direction: column;
                    }
                    
                    .image-container {
                        width: 100%;
                        height: 160px;
                    }
                }
            </style>

            <div class="card">
                <div class="image-container">
                    <img src="${imagen}" alt="${titulo}" onerror="this.src='/imgs/default-product.svg'">
                </div>
                <div class="content">
                    <div class="header">
                        <div class="info">
                            <div class="badges">
                                <span class="badge ${esCompra ? 'badge-compra' : 'badge-venta'}">
                                    ${esCompra ? 'Compra' : 'Venta'}
                                </span>
                                <span class="badge ${estadoClasses[estado] || 'badge-info'}">
                                    ${estadoLabels[estado] || estado}
                                </span>
                            </div>
                            <h3 class="titulo">${titulo}</h3>
                            <p class="fecha">${fechaFormateada}</p>
                        </div>
                        <div class="precio">${montoFormateado}</div>
                    </div>
                    <div class="footer">
                        <img src="${contraparteFoto}" alt="" class="avatar" onerror="this.src='/imgs/default-avatar.svg'">
                        <div class="contraparte">
                            <p class="contraparte-label">${esCompra ? 'Vendedor' : 'Comprador'}</p>
                            <p class="contraparte-nombre">${contraparteNombre}</p>
                        </div>
                        ${accionesHtml}
                    </div>
                </div>
            </div>
        `;

        // Event listener para calificar
        const btnCalificar = this.shadowRoot.getElementById('btnCalificar');
        if (btnCalificar) {
            btnCalificar.addEventListener('click', () => {
                if (window.abrirModalCalificar) {
                    window.abrirModalCalificar(id);
                }
            });
        }
    }
}

// ============= RATING STARS COMPONENT =============
/**
 * <rating-stars> - Componente de estrellas para calificación
 * Atributos: rating (1-5), readonly (true/false), size (sm/md/lg)
 */
class RatingStars extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._rating = 0;
    }

    static get observedAttributes() {
        return ['rating', 'readonly', 'size'];
    }

    get rating() {
        return this._rating;
    }

    set rating(val) {
        this._rating = parseInt(val) || 0;
        this.render();
    }

    connectedCallback() {
        this._rating = parseInt(this.getAttribute('rating')) || 0;
        this.render();
        if (this.getAttribute('readonly') !== 'true') {
            this.setupEventListeners();
        }
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'rating') {
            this._rating = parseInt(newVal) || 0;
        }
        if (this.shadowRoot) {
            this.render();
        }
    }

    render() {
        const readonly = this.getAttribute('readonly') === 'true';
        const size = this.getAttribute('size') || 'md';
        
        const sizes = {
            sm: '16px',
            md: '24px',
            lg: '32px'
        };

        const starSize = sizes[size] || sizes.md;

        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= this._rating;
            starsHtml += `
                <button class="star ${readonly ? 'readonly' : ''}" data-rating="${i}" ${readonly ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                         fill="${filled ? 'currentColor' : 'none'}" 
                         stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" 
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </button>
            `;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .star {
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    color: #d1d5db;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .star svg {
                    width: ${starSize};
                    height: ${starSize};
                }

                .star:not(.readonly):hover,
                .star:not(.readonly):hover ~ .star {
                    color: #fbbf24;
                }

                .star[data-rating="${this._rating}"],
                .star[data-rating="${this._rating}"] ~ .star {
                    color: #fbbf24;
                }

                .star.readonly {
                    cursor: default;
                }

                .star.filled {
                    color: #fbbf24;
                }
            </style>

            <div class="stars-container">
                ${starsHtml}
            </div>
        `;

        // Actualizar estrellas llenadas
        const stars = this.shadowRoot.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < this._rating) {
                star.classList.add('filled');
                star.style.color = '#fbbf24';
            }
        });
    }

    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (e) => {
            const star = e.target.closest('.star');
            if (star && !star.disabled) {
                const rating = parseInt(star.dataset.rating);
                this._rating = rating;
                this.setAttribute('rating', rating);
                this.render();
                
                // Emitir evento personalizado
                this.dispatchEvent(new CustomEvent('rating-change', {
                    detail: { rating },
                    bubbles: true,
                    composed: true
                }));
            }
        });
    }
}

// ============= LOADING SPINNER COMPONENT =============
/**
 * <loading-spinner> - Spinner de carga reutilizable
 * Atributos: size (sm/md/lg), text (texto opcional)
 */
class LoadingSpinner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['size', 'text'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    render() {
        const size = this.getAttribute('size') || 'md';
        const text = this.getAttribute('text') || '';

        const sizes = {
            sm: '24px',
            md: '40px',
            lg: '60px'
        };

        const spinnerSize = sizes[size] || sizes.md;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }

                .spinner {
                    width: ${spinnerSize};
                    height: ${spinnerSize};
                    border: 3px solid #e5e7eb;
                    border-top-color: #667eea;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                .text {
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>

            <div class="spinner"></div>
            ${text ? `<span class="text">${text}</span>` : ''}
        `;
    }
}

// ============= TOAST NOTIFICATION COMPONENT =============
/**
 * <toast-notification> - Notificación toast
 * Atributos: type (success/error/warning/info), message, duration
 */
class ToastNotification extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['type', 'message', 'duration'];
    }

    connectedCallback() {
        this.render();
        this.show();
    }

    render() {
        const type = this.getAttribute('type') || 'info';
        const message = this.getAttribute('message') || '';

        const colors = {
            success: { bg: '#d1fae5', border: '#10b981', text: '#047857' },
            error: { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' },
            warning: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' },
            info: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' }
        };

        const color = colors[type] || colors.info;

        const icons = {
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
        };

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .toast {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    background: ${color.bg};
                    border-left: 4px solid ${color.border};
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    color: ${color.text};
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                }

                .toast.show {
                    opacity: 1;
                    transform: translateX(0);
                }

                .icon {
                    flex-shrink: 0;
                }

                .icon svg {
                    width: 20px;
                    height: 20px;
                }

                .message {
                    flex: 1;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .close-btn {
                    background: none;
                    border: none;
                    padding: 0.25rem;
                    cursor: pointer;
                    color: inherit;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }

                .close-btn:hover {
                    opacity: 1;
                }

                .close-btn svg {
                    width: 16px;
                    height: 16px;
                }
            </style>

            <div class="toast" id="toast">
                <span class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        ${icons[type] || icons.info}
                    </svg>
                </span>
                <span class="message">${message}</span>
                <button class="close-btn" id="closeBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

        const closeBtn = this.shadowRoot.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
    }

    show() {
        const toast = this.shadowRoot.getElementById('toast');
        const duration = parseInt(this.getAttribute('duration')) || 4000;

        requestAnimationFrame(() => {
            toast?.classList.add('show');
        });

        setTimeout(() => this.hide(), duration);
    }

    hide() {
        const toast = this.shadowRoot.getElementById('toast');
        toast?.classList.remove('show');
        
        setTimeout(() => this.remove(), 300);
    }
}

// ============= EMPTY STATE COMPONENT =============
/**
 * <empty-state> - Estado vacío reutilizable
 * Atributos: icon (svg path), title, description, action-text, action-href
 */
class EmptyState extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon', 'title', 'description', 'action-text', 'action-href'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title') || 'Sin resultados';
        const description = this.getAttribute('description') || '';
        const actionText = this.getAttribute('action-text') || '';
        const actionHref = this.getAttribute('action-href') || '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1.5rem;
                }

                .icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 1.5rem;
                    color: #d1d5db;
                }

                .icon svg {
                    width: 100%;
                    height: 100%;
                }

                .title {
                    margin: 0 0 0.5rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #374151;
                }

                .description {
                    margin: 0 0 1.5rem;
                    color: #6b7280;
                    font-size: 0.95rem;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
            </style>

            <div class="empty-state">
                <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 class="title">${title}</h3>
                ${description ? `<p class="description">${description}</p>` : ''}
                ${actionText && actionHref ? `<a href="${actionHref}" class="btn">${actionText}</a>` : ''}
            </div>
        `;
    }
}

// ============= REGISTRAR TODOS LOS COMPONENTES =============
customElements.define('navbar-component', NavbarComponent);
customElements.define('publicacion-card', PublicacionCard);
customElements.define('transaccion-card', TransaccionCard);
customElements.define('rating-stars', RatingStars);
customElements.define('loading-spinner', LoadingSpinner);
customElements.define('toast-notification', ToastNotification);
customElements.define('empty-state', EmptyState);

// Función helper global para mostrar toasts usando el componente
window.showComponentToast = function(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('toast-notification');
    toast.setAttribute('type', type);
    toast.setAttribute('message', message);
    toast.setAttribute('duration', duration);
    container.appendChild(toast);
};

console.log('✅ Web Components cargados: navbar-component, publicacion-card, transaccion-card, rating-stars, loading-spinner, toast-notification, empty-state');
