function initLogin() {
    console.log("initLogin() cargado");

    const id = document.getElementById("itson_id");
    const pass = document.getElementById("password");
    const errId = document.getElementById("err-id");
    const errPass = document.getElementById("err-pass");
    const btn = document.getElementById("btn-login");

    function showError(el, msg) {
        el.textContent = msg;
        el.classList.remove("hidden");
    }

    function hideError(el) {
        el.textContent = "";
        el.classList.add("hidden");
    }

    function validar() {
        let ok = true;

        hideError(errId);
        hideError(errPass);

        const regexItson = /^00000\d{6}$/;

        if (!regexItson.test(id.value.trim())) {
            showError(errId, "Formato inválido. Ejemplo: 00000123456");
            ok = false;
        }

        if (pass.value.trim().length < 8) {
            showError(errPass, "La contraseña debe tener mínimo 8 caracteres");
            ok = false;
        }

        btn.disabled = !ok;
        btn.classList.toggle("opacity-50", !ok);
        return ok;
    }

    id.addEventListener("input", validar);
    pass.addEventListener("input", validar);

    btn.addEventListener("click", async () => {
    if (!validar()) return;

    console.log(" Enviando al backend:", {
        itson_id: id.value.trim(),
        contrasena: pass.value.trim()
    });

    console.log("ID length:", id.value.trim().length);

    btn.textContent = "Ingresando...";
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 400));

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                itson_id: id.value.trim(),
                contrasena: pass.value.trim(),
            }),
        });

        const data = await res.json();


            if (!res.ok) {
                showError(errPass, data.error || "Credenciales incorrectas");
                btn.textContent = "Iniciar Sesión";
                btn.disabled = false;
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            document.querySelector(".fade-target").style.opacity = "0";

            setTimeout(() => {
                window.location.hash = "/publicaciones";
            }, 300);

        } catch (err) {
            console.error(err);
            showError(errPass, "Error de conexión");
            btn.textContent = "Iniciar Sesión";
            btn.disabled = false;
        }
    });

    validar();
}
