const app = document.getElementById("app");
const landing = document.getElementById("landing");

const routes = {
  "/": {
    view: null,
    script: null,
  },
  "/login": {
    view: "/login.html",
    script: "/js/login.js",
  },
  "/register": {
    view: "/register.html",
    script: "/js/register.js",
  },
  "/publicaciones": {
    view: "/views/publicaciones/lista.html",
    script: "/js/publicaciones.js",
  },
  "/publicaciones/crear": {
    view: "/views/publicaciones/crear.html",
    script: "/js/publicaciones.js",
  },
  "/perfil": {
    view: "/views/usuarios/perfil.html",
    script: "/js/usuarios.js",        
  },
  "/transacciones": {
    view: "/views/transacciones/lista.html",
    script: "/js/transacciones.js",   
  },
  "/chats": {
    view: "/views/chats/lista.html",
    script: "/js/chats.js",           
  },
};

function removeOldScripts() {
  document.querySelectorAll("script[data-dynamic]").forEach((s) => s.remove());
}

function loadScript(path) {
  if (!path) return;

  const script = document.createElement("script");
  script.src = path;
  script.dataset.dynamic = "true";

  script.onload = () => {
    console.log("Script cargado:", path);

    if (path.includes("register.js") && typeof initRegister === "function")
      initRegister();

    if (path.includes("login.js") && typeof initLogin === "function")
      initLogin();
  };

  document.body.appendChild(script);
}



async function loadRoute() {
  const path = location.hash.replace("#", "") || "/";
  const route = routes[path];

  if (!route) {
    app.innerHTML = `<h1 class="text-3xl">404 — Página no encontrada</h1>`;
    removeOldScripts();
    return;
  }

  // ANIMACIÓN DE SALIDA
  app.classList.add("fade-exit");
  await new Promise(r => setTimeout(r, 180));
  app.classList.remove("fade-exit");
  app.classList.add("fade-exit-active");
  await new Promise(r => setTimeout(r, 180));

  // LIMPIAR
  app.innerHTML = "";
  app.classList.remove("fade-exit-active");

  // OCULTAR LANDING
  if (landing) landing.style.display = path === "/" ? "flex" : "none";

  // CARGAR VISTA
  if (route.view) {
  const res = await fetch(route.view);
  app.innerHTML = await res.text();

  await new Promise(r => setTimeout(r, 10)); 
}


  removeOldScripts();
  loadScript(route.script);

  // ANIMACIÓN DE ENTRADA
  app.classList.add("fade-enter");
  setTimeout(() => app.classList.add("fade-enter-active"), 10);

  setTimeout(() => {
    app.classList.remove("fade-enter");
    app.classList.remove("fade-enter-active");
  }, 250);
}

window.addEventListener("hashchange", loadRoute);
window.addEventListener("load", loadRoute);
