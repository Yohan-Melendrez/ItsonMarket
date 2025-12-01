function renderNavbar() {
    const user = JSON.parse(localStorage.getItem("usuario"));

    const nav = document.getElementById("navbar");

    if (user) {
        // Logeado
        nav.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="/imgs/logo-itson.jpg" class="h-10" />
                <span class="font-semibold text-xl">Market</span>
            </div>

            <div class="flex items-center gap-6">
                <a href="#/" class="hover:text-blue-500">Inicio</a>
                <a href="#/publicaciones" class="hover:text-blue-500">Publicaciones</a>
                <a href="#/transacciones" class="hover:text-blue-500">Transacciones</a>
                <a href="#/chats" class="hover:text-blue-500">Chats</a>

                <button id="logoutBtn" class="px-3 py-1 rounded bg-red-500 text-white">
                    Cerrar sesión
                </button>
            </div>
        `;

        document.getElementById("logoutBtn").onclick = () => {
            localStorage.removeItem("usuario");
            location.hash = "/login";
            renderNavbar();
        };

    } else {
        // No logeado
        nav.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="/imgs/logo-itson.jpg" class="h-10" />
                <span class="font-semibold text-xl">Market</span>
            </div>

            <div class="flex items-center gap-6">
                <a href="#/" class="hover:text-blue-500">Inicio</a>
                <a href="#/login" class="hover:text-blue-500">Iniciar Sesión</a>
                <a href="#/register" class="hover:text-blue-500">Registrarse</a>
            </div>
        `;
    }
}

window.renderNavbar = renderNavbar;
