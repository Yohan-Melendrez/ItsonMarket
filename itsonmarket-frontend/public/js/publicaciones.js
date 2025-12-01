document.addEventListener("DOMContentLoaded", async () => {
    if (!location.hash.includes("publicaciones")) return;

    const token = localStorage.getItem("token");
    if (!token) {
        location.hash = "#/login";
        return;
    }

    const container = document.getElementById("publicaciones-container");

    try {
        const res = await fetch("/api/publicaciones", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = "<p>Error al cargar publicaciones.</p>";
            return;
        }

        // Renderizar tarjetas
        container.innerHTML = data.map(pub => `
            <div class="bg-white shadow p-4 rounded-xl">

                <img src="${pub.imagen || '/imgs/default.jpg'}"
                     class="h-40 w-full object-cover rounded-md" />

                <h2 class="text-xl font-semibold mt-3">${pub.titulo}</h2>

                <p class="text-gray-600 text-sm mt-1">
                    ${pub.descripcion.substring(0, 60)}...
                </p>

                <p class="text-blue-700 font-bold mt-3">
                    $${pub.precio}
                </p>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error del servidor.</p>";
    }
});
