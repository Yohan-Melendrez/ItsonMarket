/**
 * @function initLogin
 * @desc Inicializa la vista de login, valida inputs, gestiona envío del formulario y controla UI de carga y errores.
 * @returns {void}
 */
function initLogin() {
  const form = document.getElementById("loginForm");
  const id = document.getElementById("itson_id");
  const pass = document.getElementById("password");
  const errId = document.getElementById("err-id");
  const errPass = document.getElementById("err-pass");
  const errGeneral = document.getElementById("login-error");
  const btn = document.getElementById("btn-login");
  const btnTexto = document.getElementById("btnLoginText");
  const btnLoading = document.getElementById("btnLoginLoader");

  if (!form || !id || !pass || !btn) {
    return;
  }

  if (form.dataset.initialized === "true") {
    return;
  }
  form.dataset.initialized = "true";

  /**
   * @function showError
   * @desc Muestra un mensaje de error en un elemento.
   * @param {HTMLElement} el - Elemento donde mostrar el error.
   * @param {String} msg - Mensaje a mostrar.
   * @returns {void}
   */
  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  /**
   * @function hideError
   * @desc Oculta un mensaje de error en un elemento.
   * @param {HTMLElement} el - Elemento a limpiar.
   * @returns {void}
   */
  function hideError(el) {
    if (!el) return;
    el.textContent = "";
    el.classList.add("hidden");
  }

  /**
   * @function setLoading
   * @desc Cambia el estado del botón entre modo cargando y normal.
   * @param {Boolean} loading - Indica si mostrar el estado de carga.
   * @returns {void}
   */
  function setLoading(loading) {
    btn.disabled = loading;
    if (btnTexto) btnTexto.classList.toggle("hidden", loading);
    if (btnLoading) btnLoading.classList.toggle("hidden", !loading);
  }

  /**
   * @function validar
   * @desc Valida el formulario: formato ITSON ID y contraseña mínima. Actualiza mensajes y habilita/deshabilita el botón.
   * @returns {Boolean} true si los datos son válidos.
   */
  function validar() {
    let ok = true;

    hideError(errId);
    hideError(errPass);
    hideError(errGeneral);

    const regexItson = /^00000\d{6}$/;
    const idValue = id.value.trim();

    if (!idValue) {
      showError(errId, "El ID de ITSON es requerido");
      ok = false;
    } else if (!regexItson.test(idValue)) {
      showError(errId, "Formato inválido. Ejemplo: 00000123456");
      ok = false;
    }

    const passValue = pass.value;
    if (!passValue) {
      showError(errPass, "La contraseña es requerida");
      ok = false;
    } else if (passValue.length < 6) {
      showError(errPass, "La contraseña debe tener mínimo 6 caracteres");
      ok = false;
    }

    btn.disabled = !ok;
    return ok;
  }

  /**
   * @event input
   * @desc Valida en tiempo real los campos ID y contraseña.
   */
  id.addEventListener("input", validar);
  pass.addEventListener("input", validar);

  /**
   * @event submit
   * @desc Envía los datos al backend, maneja errores, guarda sesión y redirige.
   */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validar()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itson_id: id.value.trim(),
          contrasena: pass.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(
          errGeneral,
          data.error || data.message || "Credenciales incorrectas"
        );
        setLoading(false);
        return;
      }

      if (window.AuthState) {
        window.AuthState.login(data.token, data.usuario);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.usuario));
      }

      if (window.showToast) {
        showToast(`¡Bienvenido, ${data.usuario.nombre}!`, "success");
      }

      setTimeout(() => {
        window.location.hash = "/publicaciones";
      }, 300);
    } catch (err) {
      showError(errGeneral, "Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  });

  /**
   * @function togglePasswordVisibility
   * @desc Alterna la visibilidad del campo de contraseña y cambia el ícono.
   * @returns {void}
   */
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword && pass) {
    togglePassword.addEventListener("click", () => {
      const type = pass.type === "password" ? "text" : "password";
      pass.type = type;

      const eyeIcon = document.getElementById("eyeIcon");
      if (eyeIcon) {
        if (type === "text") {
          eyeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    `;
        } else {
          eyeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    `;
        }
      }
    });
  }

  validar();
}

/**
 * @event DOMContentLoaded
 * @desc Inicializa el formulario si el DOM está listo.
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLogin);
} else {
  initLogin();
}
