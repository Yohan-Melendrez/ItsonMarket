/**
 * Inicializa el formulario de registro, validaciones, carga de imagen,
 * manejo de errores y envío al backend.
 * @function initRegister
 * @returns {void}
 */
function initRegister() {
  const form = document.getElementById("registerForm");
  if (!form) {
    return;
  }

  if (form.dataset.initialized === "true") {
    return;
  }
  form.dataset.initialized = "true";

  const fields = {
    itsonId: document.getElementById("itsonId"),
    nombre: document.getElementById("nombre"),
    correo: document.getElementById("correo"),
    pass1: document.getElementById("pass1"),
    pass2: document.getElementById("pass2"),
    carrera: document.getElementById("carrera"),
    telefono: document.getElementById("telefono"),
    terminos: document.getElementById("terminos"),
    drop: document.getElementById("dropArea"),
    file: document.getElementById("fileInput"),
    preview: document.getElementById("preview"),
    previewContainer: document.getElementById("previewContainer"),
    removeImage: document.getElementById("removeImage"),
  };

  const errors = {
    itsonId: document.getElementById("err-itsonId"),
    nombre: document.getElementById("err-nombre"),
    correo: document.getElementById("err-correo"),
    pass1: document.getElementById("err-pass1"),
    pass2: document.getElementById("err-pass2"),
    carrera: document.getElementById("err-carrera"),
    telefono: document.getElementById("err-telefono"),
    terminos: document.getElementById("err-terminos"),
  };

  const btn = document.getElementById("btnRegister");
  const btnTexto = document.getElementById("btnRegisterText");
  const btnLoading = document.getElementById("btnRegisterLoader");
  const errGeneral = document.getElementById("register-error");

  /**
   * Muestra un mensaje de error para un campo específico.
   * @function showError
   * @param {string} key - Nombre del campo.
   * @param {string} msg - Mensaje de error.
   * @returns {void}
   */
  function showError(key, msg) {
    if (errors[key]) {
      errors[key].textContent = msg;
      errors[key].classList.add("show");
    }
    if (fields[key]) {
      fields[key].classList.add("input-error");
    }
  }

  /**
   * Oculta el mensaje de error de un campo específico.
   * @function hideError
   * @param {string} key - Nombre del campo.
   * @returns {void}
   */
  function hideError(key) {
    if (errors[key]) {
      errors[key].textContent = "";
      errors[key].classList.remove("show");
    }
    if (fields[key]) {
      fields[key].classList.remove("input-error");
    }
  }

  /**
   * Oculta todos los mensajes de error del formulario.
   * @function hideAllErrors
   * @returns {void}
   */
  function hideAllErrors() {
    Object.keys(errors).forEach((key) => hideError(key));
  }

  /**
   * Activa o desactiva el estado de carga del botón de registro.
   * @function setLoading
   * @param {boolean} loading - Indica si debe mostrarse el loader.
   * @returns {void}
   */
  function setLoading(loading) {
    if (btn) btn.disabled = loading;
    if (btnTexto) btnTexto.classList.toggle("hidden", loading);
    if (btnLoading) btnLoading.classList.toggle("hidden", !loading);
  }

  /**
   * Valida todos los campos del formulario de registro.
   * Actualiza errores visuales y habilita o deshabilita el botón.
   * @function validar
   * @returns {boolean} true si el formulario es válido.
   */
  function validar() {
    let ok = true;

    const valId = fields.itsonId.value.trim();
    if (!valId) {
      ok = false;
    } else if (!valId.startsWith("00000")) {
      showError("itsonId", "El ID debe comenzar con 5 ceros (00000).");
      ok = false;
    } else if (valId.length !== 11) {
      showError("itsonId", "El ID debe tener 11 dígitos.");
      ok = false;
    } else {
      hideError("itsonId");
    }

    if (fields.nombre.value.trim().length < 3) {
      if (fields.nombre.value.trim() !== "")
        showError("nombre", "Nombre muy corto.");
      if (fields.nombre.value.trim() === "") ok = false;
    } else {
      hideError("nombre");
    }
    if (fields.nombre.value.trim() === "") ok = false;

    const valCorreo = fields.correo.value.trim();
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@potros\.itson\.edu\.mx$/;
    if (valCorreo !== "" && !regexCorreo.test(valCorreo)) {
      showError("correo", "Debe ser correo @potros.itson.edu.mx");
      ok = false;
    } else {
      hideError("correo");
    }
    if (valCorreo === "") ok = false;

    const valPass = fields.pass1.value;
    const tieneMayus = /[A-Z]/.test(valPass);
    const tieneEspecial = /[!@#$%^&*.,]/.test(valPass);

    if (valPass !== "") {
      if (valPass.length < 8) {
        showError("pass1", "Mínimo 8 caracteres.");
        ok = false;
      } else if (!tieneMayus) {
        showError("pass1", "Falta una letra Mayúscula.");
        ok = false;
      } else if (!tieneEspecial) {
        showError("pass1", "Falta un carácter especial (. # @ $).");
        ok = false;
      } else {
        hideError("pass1");
      }
    } else {
      ok = false;
    }

    if (fields.pass2.value !== "" && fields.pass2.value !== valPass) {
      showError("pass2", "Las contraseñas no coinciden.");
      ok = false;
    } else {
      hideError("pass2");
    }
    if (fields.pass2.value === "") ok = false;

    if (fields.carrera.value === "") {
      ok = false;
    } else {
      hideError("carrera");
    }

    const valTel = fields.telefono.value.trim();
    if (valTel !== "" && !/^\d{10}$/.test(valTel)) {
      showError("telefono", "Deben ser 10 dígitos exactos.");
      ok = false;
    } else {
      hideError("telefono");
    }
    if (valTel === "") ok = false;

    if (fields.terminos) {
      if (!fields.terminos.checked) {
        ok = false;
      } else {
        hideError("terminos");
      }
    }

    if (btn) btn.disabled = !ok;

    return ok;
  }

  Object.values(fields).forEach((input) => {
    if (!input) return;
    input.addEventListener("input", validar);
    input.addEventListener("change", validar);
    input.addEventListener("blur", function () {
      validar();
      if (this.value.trim() === "" && this.type !== "file") {
      }
    });
  });

  form.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", validar);
    el.addEventListener("change", validar);
  });

  if (fields.drop && fields.file) {
    fields.drop.addEventListener("click", () => fields.file.click());

    fields.drop.addEventListener("dragover", (e) => {
      e.preventDefault();
      fields.drop.classList.add("dragover");
    });

    fields.drop.addEventListener("dragleave", () => {
      fields.drop.classList.remove("dragover");
    });

    fields.drop.addEventListener("drop", (e) => {
      e.preventDefault();
      fields.drop.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleImageFile(file);
      }
    });

    fields.file.addEventListener("change", () => {
      const file = fields.file.files[0];
      if (file) handleImageFile(file);
    });
  }

  /**
   * Maneja la carga de una imagen seleccionada o arrastrada,
   * valida tamaño y muestra la previsualización.
   * @function handleImageFile
   * @param {File} file - Archivo de imagen seleccionado.
   * @returns {void}
   */
  function handleImageFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      if (window.showToast) {
        showToast("La imagen no debe superar 5MB", "error");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (fields.preview) {
        fields.preview.src = reader.result;
      }
      if (fields.previewContainer) {
        fields.previewContainer.classList.remove("hidden");
      }
      if (fields.drop) {
        fields.drop.style.display = "none";
      }
    };
    reader.readAsDataURL(file);
  }

  if (fields.removeImage) {
    fields.removeImage.addEventListener("click", () => {
      if (fields.preview) {
        fields.preview.src = "";
      }
      if (fields.file) {
        fields.file.value = "";
      }
      if (fields.previewContainer) {
        fields.previewContainer.classList.add("hidden");
      }
      if (fields.drop) {
        fields.drop.style.display = "";
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validar()) return;

    setLoading(true);

    const data = {
      itson_id: fields.itsonId.value.trim(),
      nombre: fields.nombre.value.trim(),
      correo_institucional: fields.correo.value.trim(),
      contrasena: fields.pass1.value,
      carrera: fields.carrera.value.trim(),
      telefono: fields.telefono.value.trim(),
    };

    if (
      fields.preview &&
      fields.preview.src &&
      fields.preview.src.startsWith("data:image")
    ) {
      data.foto = fields.preview.src;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (errGeneral) {
          errGeneral.textContent =
            json.message || json.error || "Error al registrar";
          errGeneral.classList.remove("hidden");
        }
        setLoading(false);
        return;
      }

      if (window.AuthState) {
        window.AuthState.login(json.token, json.usuario);
      } else {
        localStorage.setItem("token", json.token);
        localStorage.setItem("user", JSON.stringify(json.usuario));
      }

      if (window.showToast) {
        showToast("¡Cuenta creada exitosamente!", "success");
      }

      setTimeout(() => {
        window.location.hash = "/publicaciones";
      }, 300);
    } catch (err) {
      if (errGeneral) {
        errGeneral.textContent = "Error de conexión. Intenta de nuevo.";
        errGeneral.classList.remove("hidden");
      }
      setLoading(false);
    }
  });

  validar();
}

/**
 * Alterna la visibilidad de un campo de contraseña cambiando el ícono apropiado.
 * @function togglePassword
 * @param {string} inputId - ID del input de contraseña.
 * @param {HTMLElement} btn - Botón que contiene el ícono SVG.
 * @returns {void}
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const iconSvg = btn.querySelector("svg");

  const eyeOpen = `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`;

  const eyeClosed = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.454 10.454 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />`;

  if (input.type === "password") {
    input.type = "text";
    iconSvg.innerHTML = eyeOpen;
  } else {
    input.type = "password";
    iconSvg.innerHTML = eyeClosed;
  }
}

/**
 * Inicializa el proceso cuando el DOM ya está listo.
 * @event DOMContentLoaded
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRegister);
} else {
  initRegister();
}
