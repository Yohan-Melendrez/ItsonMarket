/**
 * Publicaciones Module - ItsonMarket
 */

// Variables globales del módulo
var publicacionesData = window.publicacionesData || [];
var filtroActual = window.filtroActual || {
    busqueda: '',
    categoria: '',
    tipo: '',
    orden: 'recientes'
};
//Se usa el window para evitar redeclaraciones
window.publicacionesData = publicacionesData;
window.filtroActual = filtroActual;

function initPublicaciones() {
    console.log("initPublicaciones() inicializado");

    const path = location.hash.replace("#", "");

    if (path === '/publicaciones') {
        initListaPublicaciones();
    } else if (path === '/publicaciones/crear') {
        initCrearPublicacion();
    } else if (path.startsWith('/publicaciones/')) {
        initDetallePublicacion();
    }
}

// ============= LISTA DE PUBLICACIONES =============
async function initListaPublicaciones() {
    const container = document.getElementById("publicaciones-container");
    const loading = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const filtroTipo = document.getElementById("filterTipo");
    const filtroOrden = document.getElementById("filterOrden");

    // Event listeners para filtros
    if (searchInput) {
        searchInput.addEventListener("input", debounce((e) => {
            filtroActual.busqueda = e.target.value;
            renderPublicaciones();
        }, 300));
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

    // Cargar publicaciones
    await cargarPublicaciones();
}

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
            headers['Authorization'] = `Bearer ${window.AuthState.token}`;
        }

        const res = await fetch("/api/publicaciones", { headers });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Error al cargar publicaciones");
        }

        // El backend devuelve {page, limit, total, pages, items}
        publicacionesData = Array.isArray(data) ? data : (data.items || data.publicaciones || []);

        if (loading) loading.classList.add("hidden");
        renderPublicaciones();

    } catch (err) {
        console.error("Error cargando publicaciones:", err);
        if (loading) loading.classList.add("hidden");
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
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

function renderPublicaciones() {
    const container = document.getElementById("publicaciones-container");
    const emptyState = document.getElementById("emptyState");
    const loading = document.getElementById("loadingState");

    if (!container) return;
    if (loading) loading.classList.add("hidden");

    // Filtrar por búsqueda y tipo
    let filtered = publicacionesData.filter(pub => {
        if (filtroActual.busqueda) {
            const busqueda = filtroActual.busqueda.toLowerCase();
            const match = pub.titulo?.toLowerCase().includes(busqueda) ||
                pub.descripcion?.toLowerCase().includes(busqueda);
            if (!match) return false;
        }
        if (filtroActual.tipo && pub.tipo_publicacion !== filtroActual.tipo) return false;
        return true;
    });

    // Ordenar según el valor del select
    switch (filtroActual.orden) {
        case 'precio':
            filtered.sort((a, b) => (a.precio || 0) - (b.precio || 0));
            break;
        case '-precio':
            filtered.sort((a, b) => (b.precio || 0) - (a.precio || 0));
            break;
        case '-vistas':
            filtered.sort((a, b) => (b.vistas || 0) - (a.vistas || 0));
            break;
        case 'fecha_publicacion':
            filtered.sort((a, b) => new Date(a.fecha_publicacion || 0) - new Date(b.fecha_publicacion || 0));
            break;
        case '-fecha_publicacion':
        default:
            filtered.sort((a, b) => new Date(b.fecha_publicacion || 0) - new Date(a.fecha_publicacion || 0));
    }

    // Mostrar empty state si no hay resultados
    if (filtered.length === 0) {
        container.innerHTML = "";
        if (emptyState) emptyState.classList.remove("hidden");
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    // Renderizar cards usando Web Components (Micro-Frontend)
    // Usamos el componente <publicacion-card> para modularizar
    container.innerHTML = filtered.map(pub => crearCardPublicacion(pub)).join("");

    // Los event listeners ahora están dentro del Web Component
    // Pero mantenemos compatibilidad con las cards tradicionales
    container.querySelectorAll('.publicacion-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            if (id) navigateTo(`/publicaciones/${id}`);
        });
    });
}

function crearCardPublicacion(pub) {
    // Las imágenes están en detalles.imagenes según el modelo
    const imagen = pub.detalles?.imagenes?.[0] || pub.imagenes?.[0] || '/imgs/default-product.svg';
    const precio = formatCurrency ? formatCurrency(pub.precio || 0) : `$${pub.precio || 0}`;
    const fecha = formatRelativeTime ? formatRelativeTime(pub.fecha_publicacion || pub.createdAt) : '';

    // Opción 1: Usar Web Component <publicacion-card> (Micro-Frontend)
    // Descomenta esto para usar el componente encapsulado:
    /*
    return `
        <publicacion-card
            pub-id="${pub._id}"
            titulo="${pub.titulo || ''}"
            descripcion="${(pub.descripcion || '').replace(/"/g, '&quot;')}"
            precio="${pub.precio || 0}"
            imagen="${imagen}"
            categoria="${pub.categoria || 'Sin categoría'}"
            tipo="${pub.tipo_publicacion || 'producto'}"
            fecha="${pub.fecha_publicacion || pub.createdAt || ''}"
            estado="${pub.estado || 'activo'}">
        </publicacion-card>
    `;
    */

    // Opción 2: Card tradicional (mantiene estilos globales)
    return `
        <div class="publicacion-card card" data-id="${pub._id}" style="cursor: pointer; padding: 0; overflow: hidden;">
            <div style="position: relative;">
                <img src="${imagen}" alt="${pub.titulo}" 
                     style="width: 100%; height: 180px; object-fit: cover;"
                     onerror="this.src='/imgs/default-product.svg'">
                ${pub.tipo_publicacion === 'servicio' ?
            '<span class="badge badge-accent" style="position: absolute; top: 0.75rem; left: 0.75rem;">Servicio</span>' :
            ''}
                ${pub.estado === 'vendido' ?
            '<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;"><span class="badge" style="background: var(--error); color: white; font-size: 1rem;">Vendido</span></div>' :
            ''}
            </div>
            <div style="padding: 1rem;">
                <p style="font-size: 0.8rem; color: var(--gray-500); margin-bottom: 0.25rem;">
                    ${pub.categoria || 'Sin categoría'}
                </p>
                <h3 style="margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; 
                           overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${pub.titulo}
                </h3>
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.75rem;
                          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${pub.descripcion || ''}
                </p>
                <div class="flex items-center justify-between">
                    <span style="font-size: 1.125rem; font-weight: 700; color: var(--primary);">
                        ${precio}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--gray-400);">${fecha}</span>
                </div>
            </div>
        </div>
    `;
}

// ============= CREAR PUBLICACIÓN =============
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

    // Contador de caracteres
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

    // Toggle tipo de publicación con estilos visuales
    function updateTipoStyles() {
        if (tipoProducto?.checked) {
            tipoProductoCard.style.borderColor = 'var(--primary)';
            tipoProductoCard.style.background = 'var(--gray-50)';
            tipoServicioCard.style.borderColor = 'var(--gray-200)';
            tipoServicioCard.style.background = 'white';
            if (camposProducto) camposProducto.classList.remove("hidden");
            if (camposServicio) camposServicio.classList.add("hidden");
        } else {
            tipoServicioCard.style.borderColor = 'var(--primary)';
            tipoServicioCard.style.background = 'var(--gray-50)';
            tipoProductoCard.style.borderColor = 'var(--gray-200)';
            tipoProductoCard.style.background = 'white';
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

    function handleImageFiles(files) {
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024; // 5MB

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast('Solo se permiten imágenes', 'error');
                return;
            }
            if (file.size > maxSize) {
                showToast('La imagen no debe superar 5MB', 'error');
                return;
            }
            if (imagenesBase64.length >= maxFiles) {
                showToast(`Máximo ${maxFiles} imágenes`, 'warning');
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

    function renderImagePreviews() {
        if (!previewContainer) return;

        previewContainer.innerHTML = imagenesBase64.map((base64, index) => `
            <div class="image-preview" style="position: relative; display: inline-block;">
                <img src="${base64}" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-md);">
                <button type="button" class="btn btn-icon" 
                        style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; background: var(--error); color: white; font-size: 12px; padding: 0; min-width: auto;"
                        onclick="removeImageAtIndex(${index})">
                    ✕
                </button>
            </div>
        `).join("");
    }

    window.removeImageAtIndex = function (index) {
        imagenesBase64.splice(index, 1);
        renderImagePreviews();
    };

    // Submit form
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!window.AuthState?.isLoggedIn()) {
            showToast('Inicia sesión para publicar', 'warning');
            navigateTo('/login');
            return;
        }

        // Validaciones
        const titulo = document.getElementById("titulo")?.value?.trim();
        const descripcion = document.getElementById("descripcion")?.value?.trim();
        const categoria = document.getElementById("categoria")?.value;
        const precio = document.getElementById("precio")?.value;
        const tipoPublicacion = document.querySelector('input[name="tipo_publicacion"]:checked')?.value || 'producto';

        if (!titulo) {
            showToast('El título es requerido', 'error');
            return;
        }
        if (!descripcion) {
            showToast('La descripción es requerida', 'error');
            return;
        }
        if (!categoria) {
            showToast('Selecciona una categoría', 'error');
            return;
        }
        if (!precio || parseFloat(precio) < 0) {
            showToast('El precio es requerido', 'error');
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
                imagenes: imagenesBase64
            }
        };

        // Campos adicionales según tipo
        if (tipoPublicacion === 'producto') {
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
            const res = await fetch("/api/publicaciones", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.AuthState.token}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || result.error || "Error al crear publicación");
            }

            showToast('¡Publicación creada exitosamente!', 'success');
            navigateTo('/publicaciones');

        } catch (err) {
            console.error("Error creando publicación:", err);
            showToast(err.message || 'Error al crear la publicación', 'error');
            if (btn) btn.disabled = false;
            if (btnTexto) btnTexto.classList.remove("hidden");
            if (btnLoading) btnLoading.classList.add("hidden");
        }
    });
}

// ============= DETALLE PUBLICACIÓN =============
var publicacionActual = null; // Para guardar la publicación actual

async function initDetallePublicacion() {
    const params = window.routeParams || {};
    const id = params.id;

    if (!id) {
        showToast('Publicación no encontrada', 'error');
        navigateTo('/publicaciones');
        return;
    }

    // IDs que coinciden con detalle.html
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
            headers['Authorization'] = `Bearer ${window.AuthState.token}`;
        }

        const res = await fetch(`/api/publicaciones/${id}`, { headers });
        const pub = await res.json();

        if (!res.ok) {
            throw new Error(pub.message || "Publicación no encontrada");
        }

        // Guardar publicación actual para uso posterior
        publicacionActual = pub;

        // Ocultar loading
        if (loading) loading.classList.add("hidden");
        if (contenido) contenido.classList.remove("hidden");

        // Llenar datos
        if (titulo) titulo.textContent = pub.titulo;
        if (descripcion) descripcion.textContent = pub.descripcion;
        if (precio) precio.textContent = formatCurrency(pub.precio || 0);
        if (categoria) categoria.textContent = pub.categoria || 'Sin categoría';
        if (vistas) vistas.textContent = `${pub.vistas || 0} vistas`;
        if (fecha) fecha.textContent = `Publicado ${formatRelativeTime(pub.fecha_publicacion || pub.createdAt)}`;

        // Badge de tipo
        if (tipoBadge) {
            tipoBadge.textContent = pub.tipo_publicacion === 'servicio' ? 'Servicio' : 'Producto';
            tipoBadge.className = `badge ${pub.tipo_publicacion === 'servicio' ? 'badge-info' : 'badge-primary'}`;
        }

        // Imagen principal - buscar en detalles.imagenes según el modelo
        const imagenes = pub.detalles?.imagenes?.length ? pub.detalles.imagenes : ['/imgs/default-product.svg'];
        if (imagenPrincipal) {
            imagenPrincipal.src = imagenes[0];
            imagenPrincipal.onerror = () => imagenPrincipal.src = '/imgs/default-product.svg';
        }

        // Galería de thumbnails - solo mostrar si hay más de 1 imagen
        if (galeriaThumbs) {
            if (imagenes.length > 1) {
                galeriaThumbs.style.display = 'flex';
                galeriaThumbs.innerHTML = imagenes.map((img, i) => `
                    <img src="${img}" alt="Imagen ${i + 1}" 
                         onclick="cambiarImagen('${img}', this)"
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; 
                                cursor: pointer; border: 2px solid ${i === 0 ? 'var(--primary)' : 'transparent'};">
                `).join("");
            } else {
                galeriaThumbs.style.display = 'none';
            }
        }

        // Cargar datos del vendedor por separado
        let vendedor = {};
        const vendedorId = pub.vendedor_id;
        if (vendedorId) {
            try {
                const resVendedor = await fetch(`/api/usuarios/${vendedorId}`, { headers });
                if (resVendedor.ok) {
                    vendedor = await resVendedor.json();
                }
            } catch (e) {
                console.log("No se pudo cargar vendedor:", e);
            }
        }

        // Link al perfil del vendedor
        const vendedorLink = document.getElementById("vendedorLink");
        const vendedorIdFinal = vendedor._id || vendedorId;
        if (vendedorLink && vendedorIdFinal) {
            vendedorLink.href = `#/usuario/${vendedorIdFinal}`;
        }

        if (vendedorNombre) vendedorNombre.textContent = vendedor.nombre || 'Usuario';
        if (vendedorAvatar) {
            vendedorAvatar.src = vendedor.foto || '/imgs/default-avatar.svg';
            vendedorAvatar.onerror = () => vendedorAvatar.src = '/imgs/default-avatar.svg';
        }
        if (vendedorRating) {
            const rep = parseFloat(vendedor.reputacion);
            vendedorRating.innerHTML = `
                <span style="color: var(--warning); font-size: 1.1rem;">★</span>
                <span style="font-weight: 600;">${isNaN(rep) ? 'Nuevo' : rep.toFixed(1)}</span>
            `;
        }
        if (vendedorCarrera) vendedorCarrera.textContent = vendedor.carrera || '';

        // Obtener ID del usuario actual de forma segura
        const usuarioActualId = window.AuthState?.user?._id || window.AuthState?.user?.id;

        // Verificar si soy el dueño
        const soyElDueno = usuarioActualId && (usuarioActualId === vendedor._id || usuarioActualId === vendedorId);

        // Mostrar botones según sea dueño o visitante
        if (soyElDueno) {
            // Soy el dueño: mostrar botones de gestión
            if (botonesVisitante) botonesVisitante.classList.add('hidden');
            if (botonesDueno) botonesDueno.classList.remove('hidden');
            
            // Configurar botón editar
            if (btnEditarPub) {
                btnEditarPub.href = `#/publicaciones/editar/${pub._id}`;
            }
            
            // Configurar botón marcar venta
            if (btnMarcarVenta) {
                btnMarcarVenta.addEventListener('click', () => {
                    abrirModalVenta();
                });
            }
        } else {
            // Soy visitante: mostrar botones de contacto
            if (botonesVisitante) botonesVisitante.classList.remove('hidden');
            if (botonesDueno) botonesDueno.classList.add('hidden');
            
            if (btnContactar) {
                btnContactar.addEventListener('click', () => {
                    if (!window.AuthState?.isLoggedIn()) {
                        showToast('Inicia sesión para contactar', 'warning');
                        navigateTo('/login');
                        return;
                    }
                    const idVendedor = vendedor._id || vendedorId;
                    iniciarChatConVendedor(idVendedor, pub._id);
                });
            }
        }

        // Configurar formulario de marcar venta
        initFormMarcarVenta();

    } catch (err) {
        console.error("Error cargando detalle:", err);
        if (loading) loading.classList.add("hidden");
        if (errorState) errorState.classList.remove("hidden");
    }
}

// Abrir modal de marcar venta
function abrirModalVenta() {
    const modal = document.getElementById("modalMarcarVenta");
    if (modal) {
        modal.classList.remove("hidden");
        // Limpiar campos
        document.getElementById("compradorItsonId").value = '';
        document.getElementById("infoComprador").classList.add("hidden");
        document.getElementById("infoCompradorNoRegistrado").classList.add("hidden");
        document.getElementById("ventaError").classList.add("hidden");
    }
}

// Cerrar modal de venta
window.cerrarModalVenta = function() {
    const modal = document.getElementById("modalMarcarVenta");
    if (modal) modal.classList.add("hidden");
};

// Inicializar formulario de marcar venta
function initFormMarcarVenta() {
    const form = document.getElementById("formMarcarVenta");
    const inputId = document.getElementById("compradorItsonId");
    const infoComprador = document.getElementById("infoComprador");
    const infoNoRegistrado = document.getElementById("infoCompradorNoRegistrado");
    
    if (!form || !inputId) return;

    let compradorEncontrado = null;
    let timeoutBusqueda = null;

    // Buscar usuario mientras escribe
    inputId.addEventListener("input", () => {
        const itsonId = inputId.value.trim();
        
        // Ocultar info previa
        if (infoComprador) infoComprador.classList.add("hidden");
        if (infoNoRegistrado) infoNoRegistrado.classList.add("hidden");
        compradorEncontrado = null;

        // Solo buscar si tiene al menos 1 dígito y máximo 11
        if (itsonId.length >= 1 && itsonId.length <= 11 && /^\d{1,11}$/.test(itsonId)) {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(() => buscarComprador(itsonId), 500);
        }
    });

    // Buscar comprador por ITSON ID
    async function buscarComprador(itsonId) {
        // Normalizar a 11 dígitos con ceros al inicio
        const itsonIdNormalizado = itsonId.padStart(11, '0');
        console.log('Buscando ITSON ID:', itsonId, '-> normalizado:', itsonIdNormalizado);
        
        try {
            // Buscar con el ID normalizado a 11 caracteres
            const res = await fetch(`/api/usuarios/buscar?itson_id=${itsonIdNormalizado}`, {
                headers: {
                    'Authorization': `Bearer ${window.AuthState.token}`
                }
            });
            
            const data = await res.json();
            
            if (res.ok && data && (Array.isArray(data) ? data.length > 0 : data._id)) {
                // Usuario encontrado
                const usuario = Array.isArray(data) ? data[0] : data;
                compradorEncontrado = usuario;
                
                document.getElementById("compradorAvatar").src = usuario.foto || '/imgs/default-avatar.svg';
                document.getElementById("compradorNombre").textContent = usuario.nombre || 'Usuario';
                document.getElementById("compradorCarrera").textContent = usuario.carrera || '';
                
                if (infoComprador) infoComprador.classList.remove("hidden");
                if (infoNoRegistrado) infoNoRegistrado.classList.add("hidden");
            } else {
                // Usuario no registrado
                compradorEncontrado = null;
                if (infoComprador) infoComprador.classList.add("hidden");
                if (infoNoRegistrado) infoNoRegistrado.classList.remove("hidden");
            }
        } catch (err) {
            console.log("Error buscando usuario:", err);
            // Mostrar como no registrado si hay error
            if (infoComprador) infoComprador.classList.add("hidden");
            if (infoNoRegistrado) infoNoRegistrado.classList.remove("hidden");
        }
    }

    // Submit del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const itsonId = inputId.value.trim();
        const ventaError = document.getElementById("ventaError");
        const btn = document.getElementById("btnConfirmarVenta");
        const btnTexto = document.getElementById("btnVentaTexto");
        const btnLoading = document.getElementById("btnVentaLoading");

        // Validar (1-11 dígitos)
        if (!itsonId || itsonId.length < 1 || itsonId.length > 11 || !/^\d{1,11}$/.test(itsonId)) {
            if (ventaError) {
                ventaError.textContent = "Ingresa un ITSON ID válido";
                ventaError.classList.remove("hidden");
            }
            return;
        }

        // No permitir venderse a sí mismo
        const miItsonId = window.AuthState.user?.itson_id;
        if (miItsonId === itsonId) {
            if (ventaError) {
                ventaError.textContent = "No puedes registrar una venta a ti mismo";
                ventaError.classList.remove("hidden");
            }
            return;
        }

        // Loading
        if (btn) btn.disabled = true;
        if (btnTexto) btnTexto.classList.add("hidden");
        if (btnLoading) btnLoading.classList.remove("hidden");
        if (ventaError) ventaError.classList.add("hidden");

        try {
            const res = await fetch("/api/transacciones/marcar-venta", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.AuthState.token}`
                },
                body: JSON.stringify({
                    publicacion_id: publicacionActual._id,
                    comprador_itson_id: itsonId,
                    comprador_id: compradorEncontrado?._id || null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al registrar la venta");
            }

            showToast('¡Venta registrada exitosamente!', 'success');
            cerrarModalVenta();
            
            // Recargar la página o mostrar mensaje
            if (compradorEncontrado) {
                showToast('Se notificará al comprador para que califique la transacción', 'info');
            }

        } catch (err) {
            console.error("Error registrando venta:", err);
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

// Función para cambiar imagen en galería
window.cambiarImagen = function (src, thumb) {
    const imagenPrincipal = document.getElementById("mainImage");
    if (imagenPrincipal) imagenPrincipal.src = src;

    // Actualizar bordes de thumbnails
    const thumbs = document.getElementById("thumbnails");
    if (thumbs) {
        thumbs.querySelectorAll('img').forEach(t => {
            t.style.borderColor = 'transparent';
        });
    }
    if (thumb) thumb.style.borderColor = 'var(--primary)';
};

// Iniciar chat con vendedor
async function iniciarChatConVendedor(vendedorId, publicacionId) {
    try {
        const miUsuario = window.AuthState.user;
        const miId = miUsuario._id || miUsuario.id;

        // Validar que tengamos ambos IDs
        if (!miId || !vendedorId) {
            showToast('Error de identificación de usuarios', 'error');
            return;
        }

        const res = await fetch("/api/chats", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: JSON.stringify({
                participantes: [miId, vendedorId], 
                publicacion_id: publicacionId
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Error al iniciar chat");
        }

        navigateTo(`/chats/${data._id || data.chat?._id}`);
    } catch (err) {
        console.error("Error iniciando chat:", err);
        showToast(err.message || 'Error al iniciar conversación', 'error');
    }
}

// Exponer funciones globalmente
window.initPublicaciones = initPublicaciones;
window.cargarPublicaciones = cargarPublicaciones;
