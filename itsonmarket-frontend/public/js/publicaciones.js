var publicacionesData = window.publicacionesData || [];
var filtroActual = window.filtroActual || {
  busqueda: "",
  categoria: "",
  tipo: "",
  orden: "recientes",
};

window.publicacionesData = publicacionesData;
window.filtroActual = filtroActual;

/**
 * Inicializa la vista de publicaciones dependiendo de la ruta actual.
 * @function initPublicaciones
 * @returns {void}
 */
function initPublicaciones() {
  const path = location.hash.replace("#", "");

  if (path === "/publicaciones") {
    initListaPublicaciones();
  } else if (path === "/publicaciones/crear") {
    initCrearPublicacion();
  } else if (path.startsWith("/publicaciones/editar")) {
    initCrearPublicacion();
  } else if (path.startsWith("/publicaciones/")) {
    initDetallePublicacion();
  }
}

/**
 * Inicializa la lista de publicaciones y configura filtros, buscadores y eventos.
 * @function initListaPublicaciones
 * @async
 * @returns {Promise<void>}
 */
async function initListaPublicaciones() {
  const container = document.getElementById("publicaciones-container");
  const loading = document.getElementById("loadingState");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const filtroTipo = document.getElementById("filterTipo");
  const filtroOrden = document.getElementById("filterOrden");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        filtroActual.busqueda = e.target.value;
        renderPublicaciones();
      }, 300)
    );
  }

  if (filtroTipo) {
    filtroTipo.addEventListener("change", (e) => {
      filtroActual.tipo = e.target.value;
      renderPublicaciones();
    });
  }

  if (filtroOrden) {
    filtroOrden.addEventListener("change", (e) => {
      filtroActual.orden = e.target.value;
      renderPublicaciones();
    });
  }

  await cargarPublicaciones();
}

/**
 * Carga las publicaciones desde el backend y actualiza el estado visual.
 * @function cargarPublicaciones
 * @async
 * @returns {Promise<void>}
 */
async function cargarPublicaciones() {
  const container = document.getElementById("publicaciones-container");
  const loading = document.getElementById("loadingState");
  const emptyState = document.getElementById("emptyState");

  if (loading) loading.classList.remove("hidden");
  if (container) container.innerHTML = "";
  if (emptyState) emptyState.classList.add("hidden");

  try {
    const headers = {};
    if (window.AuthState?.token) {
      headers["Authorization"] = `Bearer ${window.AuthState.token}`;
    }

    const res = await fetch("/api/publicaciones", { headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al cargar publicaciones");
    }

    publicacionesData = Array.isArray(data)
      ? data
      : data.items || data.publicaciones || [];

    if (loading) loading.classList.add("hidden");
    renderPublicaciones();
  } catch (err) {
    if (loading) loading.classList.add("hidden");
    if (container) {
      container.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3>Error al cargar</h3>
                    <p>No pudimos cargar las publicaciones. Intenta de nuevo.</p>
                    <button onclick="cargarPublicaciones()" class="btn btn-primary">Reintentar</button>
                </div>
            `;
    }
  }
}

/**
 * Renderiza las publicaciones filtradas en pantalla.
 * @function renderPublicaciones
 * @returns {void}
 */
function renderPublicaciones() {
  const container = document.getElementById("publicaciones-container");
  const emptyState = document.getElementById("emptyState");
  const loading = document.getElementById("loadingState");

  if (!container) return;
  if (loading) loading.classList.add("hidden");

  let filtered = publicacionesData.filter((pub) => {
    if (filtroActual.busqueda) {
      const busqueda = filtroActual.busqueda.toLowerCase();
      const match =
        pub.titulo?.toLowerCase().includes(busqueda) ||
        pub.descripcion?.toLowerCase().includes(busqueda);
      if (!match) return false;
    }
    if (filtroActual.tipo && pub.tipo_publicacion !== filtroActual.tipo)
      return false;
    return true;
  });

  switch (filtroActual.orden) {
    case "precio":
      filtered.sort((a, b) => (a.precio || 0) - (b.precio || 0));
      break;
    case "-precio":
      filtered.sort((a, b) => (b.precio || 0) - (a.precio || 0));
      break;
    case "-vistas":
      filtered.sort((a, b) => (b.vistas || 0) - (a.vistas || 0));
      break;
    case "fecha_publicacion":
      filtered.sort(
        (a, b) =>
          new Date(a.fecha_publicacion || 0) -
          new Date(b.fecha_publicacion || 0)
      );
      break;
    case "-fecha_publicacion":
    default:
      filtered.sort(
        (a, b) =>
          new Date(b.fecha_publicacion || 0) -
          new Date(a.fecha_publicacion || 0)
      );
  }

  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  container.innerHTML = filtered
    .map((pub) => crearCardPublicacion(pub))
    .join("");

  container.querySelectorAll(".publicacion-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      if (id) navigateTo(`/publicaciones/${id}`);
    });
  });
}

/**
 * Crea la estructura HTML de una tarjeta de publicación.
 * @function crearCardPublicacion
 * @param {Object} pub - Objeto con los datos de la publicación.
 * @returns {string} HTML generado para la tarjeta.
 */
function crearCardPublicacion(pub) {
  const imagen =
    pub.detalles?.imagenes?.[0] ||
    pub.imagenes?.[0] ||
    "/imgs/default-product.svg";
  const precio = formatCurrency
    ? formatCurrency(pub.precio || 0)
    : `$${pub.precio || 0}`;
  const fecha = formatRelativeTime
    ? formatRelativeTime(pub.fecha_publicacion || pub.createdAt)
    : "";

  return `
        <div class="publicacion-card card" data-id="${pub._id}">
            <div class="publicacion-card-imagen">
                <img src="${imagen}" alt="${pub.titulo}" 
                     onerror="this.src='/imgs/default-product.svg'">
                ${
                  pub.tipo_publicacion === "servicio"
                    ? '<span class="badge badge-accent publicacion-badge">Servicio</span>'
                    : ""
                }
                ${
                  pub.estado === "vendido"
                    ? '<div class="publicacion-vendido"><span class="badge badge-error">Vendido</span></div>'
                    : ""
                }
            </div>
            <div class="publicacion-card-body">
                <p class="publicacion-categoria">
                    ${pub.categoria || "Sin categoria"}
                </p>
                <h3 class="publicacion-titulo">
                    ${pub.titulo}
                </h3>
                <p class="publicacion-descripcion">
                    ${pub.descripcion || ""}
                </p>
                <div class="publicacion-footer">
                    <span class="publicacion-precio">
                        ${precio}
                    </span>
                    <span class="publicacion-fecha">${fecha}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Inicializa la vista para crear o editar una publicación.
 * Configura validaciones, manejo de imágenes y estilos dinámicos.
 * @function initCrearPublicacion
 * @returns {void}
 */
function initCrearPublicacion() {
  const form = document.getElementById("createPublicacionForm");
  if (!form) return;

  const tipoProductoCard = document.getElementById("tipoProductoCard");
  const tipoServicioCard = document.getElementById("tipoServicioCard");
  const tipoProducto = document.getElementById("tipoProducto");
  const tipoServicio = document.getElementById("tipoServicio");
  const camposProducto = document.getElementById("camposProducto");
  const camposServicio = document.getElementById("camposServicio");
  const inputImagenes = document.getElementById("imagenesInput");
  const previewContainer = document.getElementById("imagenesPreview");
  const dropArea = document.getElementById("dropAreaImages");
  const btn = document.getElementById("btnPublicar");
  const btnTexto = document.getElementById("btnPublicarText");
  const btnLoading = document.getElementById("btnPublicarLoader");
  const tituloInput = document.getElementById("titulo");
  const tituloCount = document.getElementById("tituloCount");
  const descripcionInput = document.getElementById("descripcion");
  const descripcionCount = document.getElementById("descripcionCount");

  let imagenesBase64 = [];
  const editarId = window.routeParams?.id;
  let isEditing = false;

  if (editarId) {
    isEditing = true;
    (async function cargarParaEditar() {
      try {
        const headers = {};
        if (window.AuthState?.token)
          headers["Authorization"] = `Bearer ${window.AuthState.token}`;
        const res = await fetch(`/api/publicaciones/${editarId}`, { headers });
        const pub = await res.json();
        if (!res.ok)
          throw new Error(pub.message || "No se pudo cargar la publicacion");

        document.getElementById("titulo").value = pub.titulo || "";
        document.getElementById("descripcion").value = pub.descripcion || "";
        if (pub.categoria)
          document.getElementById("categoria").value = pub.categoria;
        if (pub.precio !== undefined && document.getElementById("precio"))
          document.getElementById("precio").value = pub.precio;

        if (pub.tipo_publicacion === "servicio") {
          const tipoServicio = document.getElementById("tipoServicio");
          if (tipoServicio) tipoServicio.checked = true;
        } else {
          const tipoProducto = document.getElementById("tipoProducto");
          if (tipoProducto) tipoProducto.checked = true;
        }

        const detalles = pub.detalles || {};
        if (detalles.marca)
          document.getElementById("marca").value = detalles.marca;
        if (detalles.edicion)
          document.getElementById("edicion").value = detalles.edicion;
        if (detalles.modalidad)
          document.getElementById("modalidad").value = detalles.modalidad;
        if (detalles.experiencia)
          document.getElementById("experiencia").value = detalles.experiencia;
        if (detalles.duracion)
          document.getElementById("duracion").value = detalles.duracion;
        if (detalles.unidad_tarifa)
          document.getElementById("unidad_tarifa").value =
            detalles.unidad_tarifa;

        imagenesBase64 = Array.isArray(detalles.imagenes)
          ? detalles.imagenes.slice()
          : [];
        renderImagePreviews();

        updateTipoStyles();

        const btnTexto = document.getElementById("btnPublicarText");
        if (btnTexto) btnTexto.textContent = "Guardar cambios";
      } catch (err) {
        showToast(err.message || "No se pudo cargar la publicación", "error");
        navigateTo("/publicaciones");
      }
    })();
  }

  if (tituloInput && tituloCount) {
    tituloInput.addEventListener("input", () => {
      tituloCount.textContent = tituloInput.value.length;
    });
  }
  if (descripcionInput && descripcionCount) {
    descripcionInput.addEventListener("input", () => {
      descripcionCount.textContent = descripcionInput.value.length;
    });
  }

  /**
   * Actualiza estilos visuales dependiendo si el usuario eligió producto o servicio.
   * @function updateTipoStyles
   * @returns {void}
   */
  function updateTipoStyles() {
    if (tipoProducto?.checked) {
      tipoProductoCard.style.borderColor = "var(--primary)";
      tipoProductoCard.style.background = "var(--gray-50)";
      tipoServicioCard.style.borderColor = "var(--gray-200)";
      tipoServicioCard.style.background = "white";
      if (camposProducto) camposProducto.classList.remove("hidden");
      if (camposServicio) camposServicio.classList.add("hidden");
    } else {
      tipoServicioCard.style.borderColor = "var(--primary)";
      tipoServicioCard.style.background = "var(--gray-50)";
      tipoProductoCard.style.borderColor = "var(--gray-200)";
      tipoProductoCard.style.background = "white";
      if (camposProducto) camposProducto.classList.add("hidden");
      if (camposServicio) camposServicio.classList.remove("hidden");
    }
  }

  if (tipoProducto && tipoServicio) {
    tipoProducto.addEventListener("change", updateTipoStyles);
    tipoServicio.addEventListener("change", updateTipoStyles);
    updateTipoStyles(); // Estado inicial
  }

  // Manejo de imágenes
  if (dropArea && inputImagenes) {
    dropArea.addEventListener("click", () => inputImagenes.click());

    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    });

    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("dragover");
    });

    dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dropArea.classList.remove("dragover");
      handleImageFiles(e.dataTransfer.files);
    });

    inputImagenes.addEventListener("change", () => {
      handleImageFiles(inputImagenes.files);
    });
  }

  /**
   * Maneja la carga y validación de imágenes arrastradas o seleccionadas.
   * @function handleImageFiles
   * @param {FileList} files - Archivos seleccionados.
   * @returns {void}
   */
  function handleImageFiles(files) {
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast("Solo se permiten imágenes", "error");
        return;
      }
      if (file.size > maxSize) {
        showToast("La imagen no debe superar 5MB", "error");
        return;
      }
      if (imagenesBase64.length >= maxFiles) {
        showToast(`Máximo ${maxFiles} imágenes`, "warning");
        return;
      }

      // Convertir a Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        imagenesBase64.push(e.target.result);
        renderImagePreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Renderiza las imágenes seleccionadas en el formulario de creación/edición.
   * @function renderImagePreviews
   * @returns {void}
   */
  function renderImagePreviews() {
    if (!previewContainer) return;

    previewContainer.innerHTML = imagenesBase64
      .map(
        (base64, index) => `
            <div class="image-preview-wrapper">
                <img src="${base64}" alt="Preview" class="image-preview-img">
                <button type="button" class="btn btn-icon image-preview-remove"
                        onclick="removeImageAtIndex(${index})">
                    ✕
                </button>
            </div>
        `
      )
      .join("");
  }

  /**
   * Elimina una imagen seleccionada del arreglo de previews.
   * @function removeImageAtIndex
   * @param {number} index - Posición de la imagen en el arreglo.
   * @returns {void}
   */
  window.removeImageAtIndex = function (index) {
    imagenesBase64.splice(index, 1);
    renderImagePreviews();
  };

  // Submit form (crear o editar)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!window.AuthState?.isLoggedIn()) {
      showToast("Inicia sesión para publicar", "warning");
      navigateTo("/login");
      return;
    }

    // Validaciones
    const titulo = document.getElementById("titulo")?.value?.trim();
    const descripcion = document.getElementById("descripcion")?.value?.trim();
    const categoria = document.getElementById("categoria")?.value;
    const precio = document.getElementById("precio")?.value;
    const tipoPublicacion =
      document.querySelector('input[name="tipo_publicacion"]:checked')?.value ||
      "producto";

    if (!titulo) {
      showToast("El título es requerido", "error");
      return;
    }
    if (!descripcion) {
      showToast("La descripción es requerida", "error");
      return;
    }
    if (!categoria) {
      showToast("Selecciona una categoría", "error");
      return;
    }
    if (!precio || parseFloat(precio) < 0) {
      showToast("El precio es requerido", "error");
      return;
    }

    // Construir objeto de datos
    const data = {
      tipo_publicacion: tipoPublicacion,
      vendedor_id: window.AuthState.user._id || window.AuthState.user.id,
      titulo: titulo,
      descripcion: descripcion,
      categoria: categoria,
      precio: parseFloat(precio),
      detalles: {
        imagenes: imagenesBase64,
      },
    };

    // Campos adicionales según tipo
    if (tipoPublicacion === "producto") {
      const marca = document.getElementById("marca")?.value?.trim();
      const edicion = document.getElementById("edicion")?.value?.trim();
      if (marca) data.detalles.marca = marca;
      if (edicion) data.detalles.edicion = edicion;
    } else {
      const modalidad = document.getElementById("modalidad")?.value;
      const experiencia = document.getElementById("experiencia")?.value?.trim();
      const duracion = document.getElementById("duracion")?.value?.trim();
      const unidadTarifa = document.getElementById("unidad_tarifa")?.value;
      if (modalidad) data.detalles.modalidad = modalidad;
      if (experiencia) data.detalles.experiencia = experiencia;
      if (duracion) data.detalles.duracion = duracion;
      if (unidadTarifa) data.detalles.unidad_tarifa = unidadTarifa;
    }

    // Mostrar loading
    if (btn) btn.disabled = true;
    if (btnTexto) btnTexto.classList.add("hidden");
    if (btnLoading) btnLoading.classList.remove("hidden");

    try {
      let res, result;
      if (isEditing && editarId) {
        // Editar publicación existente
        res = await fetch(`/api/publicaciones/${editarId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.AuthState.token}`,
          },
          body: JSON.stringify(data),
        });
        result = await res.json();
        if (!res.ok) {
          throw new Error(
            result.message || result.error || "Error al actualizar publicación"
          );
        }
        showToast("¡Publicación actualizada!", "success");
        navigateTo(`/publicaciones/${editarId}`);
      } else {
        // Crear nueva publicación
        res = await fetch("/api/publicaciones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.AuthState.token}`,
          },
          body: JSON.stringify(data),
        });
        result = await res.json();
        if (!res.ok) {
          throw new Error(
            result.message || result.error || "Error al crear publicación"
          );
        }
        showToast("¡Publicación creada exitosamente!", "success");
        navigateTo("/publicaciones");
      }
    } catch (err) {
      showToast(
        err.message ||
          (isEditing
            ? "Error al actualizar la publicación"
            : "Error al crear la publicación"),
        "error"
      );
      if (btn) btn.disabled = false;
      if (btnTexto) btnTexto.classList.remove("hidden");
      if (btnLoading) btnLoading.classList.add("hidden");
    }
  });
}

var publicacionActual = null;

/** Inicializa la vista de detalle de una publicación.
 * @function initDetallePublicacion
 * @async
 * @returns {Promise<void>}
 */
async function initDetallePublicacion() {
  const params = window.routeParams || {};
  const id = params.id;

  if (!id) {
    showToast("Publicación no encontrada", "error");
    navigateTo("/publicaciones");
    return;
  }

  const loading = document.getElementById("loadingState");
  const contenido = document.getElementById("detalleContent");
  const errorState = document.getElementById("errorState");
  const imagenPrincipal = document.getElementById("mainImage");
  const galeriaThumbs = document.getElementById("thumbnails");
  const titulo = document.getElementById("detalleTitulo");
  const descripcion = document.getElementById("detalleDescripcion");
  const precio = document.getElementById("detallePrecio");
  const categoria = document.getElementById("detalleCategoria");
  const vistas = document.getElementById("detalleVistas");
  const fecha = document.getElementById("detalleFecha");
  const vendedorNombre = document.getElementById("vendedorNombre");
  const vendedorAvatar = document.getElementById("vendedorAvatar");
  const vendedorRating = document.getElementById("vendedorRating");
  const vendedorCarrera = document.getElementById("vendedorCarrera");
  const btnContactar = document.getElementById("btnContactar");
  const tipoBadge = document.getElementById("tipoBadge");
  const botonesVisitante = document.getElementById("botonesVisitante");
  const botonesDueno = document.getElementById("botonesDueno");
  const btnMarcarVenta = document.getElementById("btnMarcarVenta");
  const btnEditarPub = document.getElementById("btnEditarPub");

  try {
    const headers = {};
    if (window.AuthState?.token) {
      headers["Authorization"] = `Bearer ${window.AuthState.token}`;
    }

    const res = await fetch(`/api/publicaciones/${id}`, { headers });
    const pub = await res.json();

    if (!res.ok) {
      throw new Error(pub.message || "Publicación no encontrada");
    }

    publicacionActual = pub;

    if (loading) loading.classList.add("hidden");
    if (contenido) contenido.classList.remove("hidden");

    if (titulo) titulo.textContent = pub.titulo;
    if (descripcion) descripcion.textContent = pub.descripcion;
    if (precio) precio.textContent = formatCurrency(pub.precio || 0);
    if (categoria) categoria.textContent = pub.categoria || "Sin categoría";
    if (vistas) vistas.textContent = `${pub.vistas || 0} vistas`;
    if (fecha)
      fecha.textContent = `Publicado ${formatRelativeTime(
        pub.fecha_publicacion || pub.createdAt
      )}`;

    if (tipoBadge) {
      tipoBadge.textContent =
        pub.tipo_publicacion === "servicio" ? "Servicio" : "Producto";
      tipoBadge.className = `badge ${
        pub.tipo_publicacion === "servicio" ? "badge-info" : "badge-primary"
      }`;
    }

    const imagenes = pub.detalles?.imagenes?.length
      ? pub.detalles.imagenes
      : ["/imgs/default-product.svg"];
    if (imagenPrincipal) {
      imagenPrincipal.src = imagenes[0];
      imagenPrincipal.onerror = () =>
        (imagenPrincipal.src = "/imgs/default-product.svg");
    }

    if (galeriaThumbs) {
      if (imagenes.length > 1) {
        galeriaThumbs.style.display = "flex";
        galeriaThumbs.innerHTML = imagenes
          .map(
            (img, i) => `
                    <img src="${img}" alt="Imagen ${i + 1}" 
                         onclick="cambiarImagen('${img}', this)"
                         class="gallery-thumb ${i === 0 ? "active" : ""}">
                `
          )
          .join("");
      } else {
        galeriaThumbs.style.display = "none";
      }
    }

    let vendedor = {};
    const vendedorId = pub.vendedor_id;
    if (vendedorId) {
      try {
        const resVendedor = await fetch(`/api/usuarios/${vendedorId}`, {
          headers,
        });
        if (resVendedor.ok) {
          vendedor = await resVendedor.json();
        }
      } catch (e) {}
    }

    const vendedorLink = document.getElementById("vendedorLink");
    const vendedorIdFinal = vendedor._id || vendedorId;
    if (vendedorLink && vendedorIdFinal) {
      vendedorLink.href = `#/usuario/${vendedorIdFinal}`;
    }

    if (vendedorNombre)
      vendedorNombre.textContent = vendedor.nombre || "Usuario";
    if (vendedorAvatar) {
      vendedorAvatar.src = vendedor.foto || "/imgs/default-avatar.svg";
      vendedorAvatar.onerror = () =>
        (vendedorAvatar.src = "/imgs/default-avatar.svg");
    }
    if (vendedorRating) {
      const rep = parseFloat(vendedor.reputacion);
      vendedorRating.innerHTML = `
                <span class="vendor-rating-star">★</span>
                <span class="vendor-rating-value">${
                  isNaN(rep) ? "Nuevo" : rep.toFixed(1)
                }</span>
            `;
    }
    if (vendedorCarrera) vendedorCarrera.textContent = vendedor.carrera || "";

    const usuarioActualId =
      window.AuthState?.user?._id || window.AuthState?.user?.id;

    const soyElDueno =
      usuarioActualId &&
      (usuarioActualId === vendedor._id || usuarioActualId === vendedorId);

    if (soyElDueno) {
      if (botonesVisitante) botonesVisitante.classList.add("hidden");
      if (botonesDueno) botonesDueno.classList.remove("hidden");

      if (btnEditarPub) {
        btnEditarPub.href = `#/publicaciones/editar/${pub._id}`;
      }

      if (btnMarcarVenta) {
        btnMarcarVenta.addEventListener("click", () => {
          abrirModalVenta();
        });
      }
    } else {
      if (botonesVisitante) botonesVisitante.classList.remove("hidden");
      if (botonesDueno) botonesDueno.classList.add("hidden");

      if (btnContactar) {
        btnContactar.addEventListener("click", () => {
          if (!window.AuthState?.isLoggedIn()) {
            showToast("Inicia sesión para contactar", "warning");
            navigateTo("/login");
            return;
          }
          const idVendedor = vendedor._id || vendedorId;
          iniciarChatConVendedor(idVendedor, pub._id);
        });
      }
    }

    initFormMarcarVenta();
  } catch (err) {
    if (loading) loading.classList.add("hidden");
    if (errorState) errorState.classList.remove("hidden");
  }
}

/**
 * Abre el modal para marcar una publicación como vendida.
 * @function abrirModalVenta
 * @returns {void}
 */
function abrirModalVenta() {
  const modal = document.getElementById("modalMarcarVenta");
  if (modal) {
    modal.classList.remove("hidden");
    const input = document.getElementById("compradorItsonId");
    if (input) input.value = "";
    const infoCompradorEl = document.getElementById("infoComprador");
    if (infoCompradorEl) infoCompradorEl.classList.add("hidden");
    const infoNoRegEl = document.getElementById("infoCompradorNoRegistrado");
    if (infoNoRegEl) infoNoRegEl.classList.add("hidden");
    const ventaErrorEl = document.getElementById("ventaError");
    if (ventaErrorEl) ventaErrorEl.classList.add("hidden");
  }
}

/**
 * Cierra el modal de marcar venta.
 * @function cerrarModalVenta
 * @returns {void}
 */
window.cerrarModalVenta = function () {
  const modal = document.getElementById("modalMarcarVenta");
  if (modal) modal.classList.add("hidden");
};

/**
 * Inicializa el formulario de marcar venta, permitiendo buscar comprador por ITSON ID
 * y registrar la transacción.
 * @function initFormMarcarVenta
 * @returns {void}
 */
function initFormMarcarVenta() {
  const form = document.getElementById("formMarcarVenta");
  const inputId = document.getElementById("compradorItsonId");
  const infoComprador = document.getElementById("infoComprador");
  const infoNoRegistrado = document.getElementById("infoCompradorNoRegistrado");

  if (!form || !inputId) return;

  let compradorEncontrado = null;
  let timeoutBusqueda = null;

  inputId.addEventListener("input", () => {
    const itsonId = inputId.value.trim();

    if (infoComprador) infoComprador.classList.add("hidden");
    if (infoNoRegistrado) infoNoRegistrado.classList.add("hidden");
    compradorEncontrado = null;

    if (
      itsonId.length >= 1 &&
      itsonId.length <= 11 &&
      /^\d{1,11}$/.test(itsonId)
    ) {
      clearTimeout(timeoutBusqueda);
      timeoutBusqueda = setTimeout(() => buscarComprador(itsonId), 500);
    }
  });

  async function buscarComprador(itsonId) {
    const itsonIdNormalizado = itsonId.padStart(11, "0");

    try {
      const res = await fetch(
        `/api/usuarios/buscar?itson_id=${itsonIdNormalizado}`,
        {
          headers: {
            Authorization: `Bearer ${window.AuthState.token}`,
          },
        }
      );

      const data = await res.json();

      if (
        res.ok &&
        data &&
        (Array.isArray(data) ? data.length > 0 : data._id)
      ) {
        const usuario = Array.isArray(data) ? data[0] : data;
        compradorEncontrado = usuario;

        document.getElementById("compradorAvatar").src =
          usuario.foto || "/imgs/default-avatar.svg";
        document.getElementById("compradorNombre").textContent =
          usuario.nombre || "Usuario";
        document.getElementById("compradorCarrera").textContent =
          usuario.carrera || "";

        if (infoComprador) infoComprador.classList.remove("hidden");
        if (infoNoRegistrado) infoNoRegistrado.classList.add("hidden");
      } else {
        compradorEncontrado = null;
        if (infoComprador) infoComprador.classList.add("hidden");
        if (infoNoRegistrado) infoNoRegistrado.classList.remove("hidden");
      }
    } catch (err) {
      if (infoComprador) infoComprador.classList.add("hidden");
      if (infoNoRegistrado) infoNoRegistrado.classList.remove("hidden");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const itsonId = inputId.value.trim();
    const ventaError = document.getElementById("ventaError");
    const btn = document.getElementById("btnConfirmarVenta");
    const btnTexto = document.getElementById("btnVentaTexto");
    const btnLoading = document.getElementById("btnVentaLoading");

    if (
      !itsonId ||
      itsonId.length < 1 ||
      itsonId.length > 11 ||
      !/^\d{1,11}$/.test(itsonId)
    ) {
      if (ventaError) {
        ventaError.textContent = "Ingresa un ITSON ID válido";
        ventaError.classList.remove("hidden");
      }
      return;
    }

    const miItsonId = window.AuthState.user?.itson_id;
    if (miItsonId === itsonId) {
      if (ventaError) {
        ventaError.textContent = "No puedes registrar una venta a ti mismo";
        ventaError.classList.remove("hidden");
      }
      return;
    }

    if (btn) btn.disabled = true;
    if (btnTexto) btnTexto.classList.add("hidden");
    if (btnLoading) btnLoading.classList.remove("hidden");
    if (ventaError) ventaError.classList.add("hidden");

    try {
      const res = await fetch("/api/transacciones/marcar-venta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.AuthState.token}`,
        },
        body: JSON.stringify({
          publicacion_id: publicacionActual._id,
          comprador_itson_id: itsonId,
          comprador_id: compradorEncontrado?._id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar la venta");
      }

      showToast("¡Venta registrada exitosamente!", "success");
      cerrarModalVenta();

      if (compradorEncontrado) {
        showToast(
          "Se notificará al comprador para que califique la transacción",
          "info"
        );
      }
    } catch (err) {
      if (ventaError) {
        ventaError.textContent = err.message || "Error al registrar la venta";
        ventaError.classList.remove("hidden");
      }
    } finally {
      if (btn) btn.disabled = false;
      if (btnTexto) btnTexto.classList.remove("hidden");
      if (btnLoading) btnLoading.classList.add("hidden");
    }
  });
}

/**
 * Cambia la imagen principal del detalle de publicación según el thumbnail seleccionado.
 * @function cambiarImagen
 * @param {string} src - URL de la nueva imagen.
 * @param {HTMLElement} thumb - Elemento thumbnail seleccionado.
 * @returns {void}
 */
window.cambiarImagen = function (src, thumb) {
  const imagenPrincipal = document.getElementById("mainImage");
  if (imagenPrincipal) imagenPrincipal.src = src;

  const thumbs = document.getElementById("thumbnails");
  if (thumbs) {
    thumbs.querySelectorAll("img").forEach((t) => {
      t.classList.remove("active");
    });
  }
  if (thumb) thumb.classList.add("active");
};

/**
 * Inicia un chat con el vendedor de una publicación.
 * Crea el chat si no existe.
 * @function iniciarChatConVendedor
 * @async
 * @param {string} vendedorId - ID del vendedor.
 * @param {string} publicacionId - ID de la publicación asociada.
 * @returns {Promise<void>}
 */
async function iniciarChatConVendedor(vendedorId, publicacionId) {
  try {
    const miUsuario = window.AuthState.user;
    const miId = miUsuario._id || miUsuario.id;

    if (!miId || !vendedorId) {
      showToast("Error de identificación de usuarios", "error");
      return;
    }

    const res = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.AuthState.token}`,
      },
      body: JSON.stringify({
        participantes: [miId, vendedorId],
        publicacion_id: publicacionId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al iniciar chat");
    }

    navigateTo(`/chats/${data._id || data.chat?._id}`);
  } catch (err) {
    showToast(err.message || "Error al iniciar conversación", "error");
  }
}

/**
 * Expone funciones globalmente para acceso desde HTML.
 * @global
 */
window.initPublicaciones = initPublicaciones;
window.cargarPublicaciones = cargarPublicaciones;
