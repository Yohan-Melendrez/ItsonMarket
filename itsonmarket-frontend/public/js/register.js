/**
 * Register Module - ItsonMarket
 */

function initRegister() {
    console.log("initRegister() inicializado");

    const form = document.getElementById("registerForm");
    if (!form) {
        console.error("Formulario de registro no encontrado");
        return;
    }

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

    // --- Helpers ---
    function showError(key, msg) {
        if (!errors[key]) return;
        errors[key].textContent = msg;
        errors[key].classList.remove("hidden");
        if (fields[key] && fields[key].classList) {
            fields[key].classList.add("input-error");
            fields[key].classList.remove("input-success");
        }
    }

    function hideError(key) {
        if (!errors[key]) return;
        errors[key].textContent = "";
        errors[key].classList.add("hidden");
        if (fields[key] && fields[key].classList && fields[key].value) {
            fields[key].classList.remove("input-error");
            fields[key].classList.add("input-success");
        }
    }

    function hideAllErrors() {
        Object.keys(errors).forEach(k => {
            if (errors[k]) {
                errors[k].textContent = "";
                errors[k].classList.add("hidden");
            }
        });
        if (errGeneral) errGeneral.classList.add("hidden");
    }

    function setLoading(loading) {
        if (btn) btn.disabled = loading;
        if (btnTexto) btnTexto.classList.toggle("hidden", loading);
        if (btnLoading) btnLoading.classList.toggle("hidden", !loading);
    }

    function validar() {
        let ok = true;

        hideAllErrors();

        // ITSON ID
        const regexItson = /^00000\d{6}$/;
        const itsonValue = fields.itsonId?.value?.trim() || '';
        if (!itsonValue) {
            showError("itsonId", "El ITSON ID es requerido");
            ok = false;
        } else if (!regexItson.test(itsonValue)) {
            showError("itsonId", "Formato inválido. Ejemplo: 00000247037");
            ok = false;
        } else {
            hideError("itsonId");
        }

        // Nombre
        const nombreValue = fields.nombre?.value?.trim() || '';
        if (!nombreValue) {
            showError("nombre", "El nombre es requerido");
            ok = false;
        } else if (nombreValue.length < 3) {
            showError("nombre", "El nombre debe tener al menos 3 caracteres");
            ok = false;
        } else {
            hideError("nombre");
        }

        // Correo
        const regexCorreo = /^[a-zA-Z0-9._%+-]+@potros\.itson\.edu\.mx$/;
        const correoValue = fields.correo?.value?.trim() || '';
        if (!correoValue) {
            showError("correo", "El correo institucional es requerido");
            ok = false;
        } else if (!regexCorreo.test(correoValue)) {
            showError("correo", "Debe ser un correo @potros.itson.edu.mx");
            ok = false;
        } else {
            hideError("correo");
        }

        // Contraseña
        const pass = fields.pass1?.value || '';
        const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!pass) {
            showError("pass1", "La contraseña es requerida");
            ok = false;
        } else if (!regexPass.test(pass)) {
            showError("pass1", "Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo");
            ok = false;
        } else {
            hideError("pass1");
        }

        // Confirmar contraseña
        const pass2 = fields.pass2?.value || '';
        if (!pass2) {
            showError("pass2", "Confirma tu contraseña");
            ok = false;
        } else if (pass !== pass2) {
            showError("pass2", "Las contraseñas no coinciden");
            ok = false;
        } else {
            hideError("pass2");
        }

        // Carrera
        const carreraValue = fields.carrera?.value?.trim() || '';
        if (!carreraValue) {
            showError("carrera", "Selecciona una carrera");
            ok = false;
        } else {
            hideError("carrera");
        }

        // Teléfono
        const telefonoValue = fields.telefono?.value?.trim() || '';
        const regexTelefono = /^\d{10}$/;
        if (!telefonoValue) {
            showError("telefono", "El teléfono es requerido");
            ok = false;
        } else if (!regexTelefono.test(telefonoValue)) {
            showError("telefono", "Debe tener exactamente 10 dígitos");
            ok = false;
        } else {
            hideError("telefono");
        }

        // Términos
        if (fields.terminos && !fields.terminos.checked) {
            showError("terminos", "Debes aceptar los términos y condiciones");
            ok = false;
        } else {
            hideError("terminos");
        }

        if (btn) btn.disabled = !ok;
        return ok;
    }

    // Validación en tiempo real
    form.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", validar);
        el.addEventListener("change", validar);
    });

    // Manejo de imagen de avatar
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
            if (file && file.type.startsWith('image/')) {
                handleImageFile(file);
            }
        });
        
        fields.file.addEventListener("change", () => {
            const file = fields.file.files[0];
            if (file) handleImageFile(file);
        });
    }

    function handleImageFile(file) {
        if (file.size > 5 * 1024 * 1024) {
            if (window.showToast) {
                showToast('La imagen no debe superar 5MB', 'error');
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
                fields.drop.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    // Botón para remover imagen
    if (fields.removeImage) {
        fields.removeImage.addEventListener("click", () => {
            if (fields.preview) {
                fields.preview.src = '';
            }
            if (fields.file) {
                fields.file.value = '';
            }
            if (fields.previewContainer) {
                fields.previewContainer.classList.add("hidden");
            }
            if (fields.drop) {
                fields.drop.style.display = '';
            }
        });
    }

    // Submit handler
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

        // Incluir foto si se seleccionó una
        if (fields.preview && fields.preview.src && fields.preview.src.startsWith('data:image')) {
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
                    errGeneral.textContent = json.message || json.error || "Error al registrar";
                    errGeneral.classList.remove("hidden");
                }
                setLoading(false);
                return;
            }

            // Guardar sesión
            if (window.AuthState) {
                window.AuthState.login(json.token, json.usuario);
            } else {
                localStorage.setItem("token", json.token);
                localStorage.setItem("user", JSON.stringify(json.usuario));
            }

            // Mensaje de éxito
            if (window.showToast) {
                showToast('¡Cuenta creada exitosamente!', 'success');
            }

            // Redirigir
            setTimeout(() => {
                window.location.hash = "/publicaciones";
            }, 300);

        } catch (err) {
            console.error("Error de registro:", err);
            if (errGeneral) {
                errGeneral.textContent = "Error de conexión. Intenta de nuevo.";
                errGeneral.classList.remove("hidden");
            }
            setLoading(false);
        }
    });

    // Validación inicial
    validar();
}

// Inicializar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegister);
} else {
    initRegister();
}
