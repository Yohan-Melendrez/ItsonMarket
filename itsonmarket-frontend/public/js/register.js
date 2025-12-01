function initRegister() {
    console.log("initRegister() ejecutado: vista cargada correctamente");

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
    const form = document.getElementById("registerForm");

    // --- Helpers ---
    function showError(key, msg) {
        errors[key].textContent = msg;
        errors[key].style.display = "block";
        if (fields[key]) {
            fields[key].classList.add("border-red-500");
            fields[key].classList.remove("border-green-500");
        }
    }

    function hideError(key) {
        errors[key].textContent = "";
        errors[key].style.display = "none";
        if (fields[key]) {
            fields[key].classList.remove("border-red-500");
            fields[key].classList.add("border-green-500");
        }
    }

    function validar() {
        let ok = true;

        Object.keys(errors).forEach(k => hideError(k));

        // ITSON ID
        const regexItson = /^00000\d{6}$/;
        if (!regexItson.test(fields.itsonId.value.trim())) {
            showError("itsonId", "El ITSON ID debe ser como: 00000247037");
            ok = false;
        }

        if (fields.nombre.value.trim().length < 3) {
            showError("nombre", "Nombre demasiado corto");
            ok = false;
        }

        const regexCorreo = /^[a-zA-Z0-9._%+-]+@potros\.itson\.edu\.mx$/;
        if (!regexCorreo.test(fields.correo.value.trim())) {
            showError("correo", "Debe ser correo @potros.itson.edu.mx");
            ok = false;
        }

        const pass = fields.pass1.value.trim();
        const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regexPass.test(pass)) {
            showError("pass1", "Contraseña débil (may/min, número y símbolo)");
            ok = false;
        }

        if (fields.pass1.value !== fields.pass2.value) {
            showError("pass2", "Las contraseñas no coinciden");
            ok = false;
        }

        if (fields.carrera.value.trim() === "") {
            showError("carrera", "Selecciona una carrera");
            ok = false;
        }

        if (fields.telefono.value.trim().length !== 10) {
            showError("telefono", "Debe tener 10 dígitos");
            ok = false;
        }

        if (!fields.terminos.checked) {
            showError("terminos", "Debes aceptar los términos");
            ok = false;
        }

        btn.disabled = !ok;
        btn.classList.toggle("opacity-50", !ok);
        btn.classList.toggle("cursor-not-allowed", !ok);

        return ok;
    }

    // Validación en tiempo real
    document.querySelectorAll("input,select").forEach(el => {
        el.addEventListener("input", validar);
        el.addEventListener("change", validar);
    });

    // Imagen
    fields.drop.addEventListener("click", () => fields.file.click());
    fields.file.addEventListener("change", () => {
        const f = fields.file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            fields.preview.src = reader.result;
            fields.preview.classList.remove("hidden");
        };
        reader.readAsDataURL(f);
    });

    // Submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validar()) return;

        const data = {
            itson_id: fields.itsonId.value.trim(),
            nombre: fields.nombre.value.trim(),
            correo_institucional: fields.correo.value.trim(),
            contrasena: fields.pass1.value.trim(),
            carrera: fields.carrera.value.trim(),
            telefono: fields.telefono.value.trim(),
        };

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) return alert(json.message);

            localStorage.setItem("token", json.token);
            localStorage.setItem("usuario", JSON.stringify(json.usuario));

            window.location.hash = "/publicaciones";
        } catch (err) {
            alert("Error de conexión");
        }
    });

    validar();
}
