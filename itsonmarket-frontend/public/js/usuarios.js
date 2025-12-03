function initUsuarios() {
    const path = location.hash.replace("#", "");
    
    if (path === '/perfil') {
        initPerfil();
    } else if (path === '/perfil/editar') {
        initEditarPerfil();
    } else if (path.startsWith('/usuario/')) {
        const pathParts = path.split('/');
        const userId = window.routeParams?.id || pathParts[2];
        if (userId) {
            initPerfilUsuario(userId);
        } else {
            showToast('Usuario no encontrado', 'error');
            navigateTo('/publicaciones');
        }
    }
}

async function initPerfilUsuario(userId) {
    if (!userId) {
        showToast('Usuario no encontrado', 'error');
        navigateTo('/publicaciones');
        return;
    }

    const perfilAvatar = document.getElementById("perfilAvatar");
    const perfilNombre = document.getElementById("perfilNombre");
    const perfilCorreo = document.getElementById("perfilCorreo");
    const perfilCarreraBadge = document.getElementById("perfilCarreraBadge");
    const statPublicaciones = document.getElementById("statPublicaciones");
    const statTransacciones = document.getElementById("statTransacciones");
    const statReputacion = document.getElementById("statReputacion");
    const infoItsonId = document.getElementById("infoItsonId");
    const infoTelefono = document.getElementById("infoTelefono");
    const infoCarrera = document.getElementById("infoCarrera");
    const infoCorreo = document.getElementById("infoCorreo");
    const btnEditar = document.getElementById("btnEditarPerfil");

    if (btnEditar) btnEditar.style.display = 'none';

    try {
        const headers = {};
        if (window.AuthState?.token) {
            headers['Authorization'] = `Bearer ${window.AuthState.token}`;
        }

        const res = await fetch(`/api/usuarios/${userId}`, { headers });

        if (!res.ok) throw new Error("Usuario no encontrado");

        const usuario = await res.json();

        // Llenar datos
        if (perfilAvatar) {
            perfilAvatar.src = usuario.foto || '/imgs/default-avatar.svg';
            perfilAvatar.onerror = () => perfilAvatar.src = '/imgs/default-avatar.svg';
        }
        if (perfilNombre) perfilNombre.textContent = usuario.nombre || 'Usuario';
        if (perfilCorreo) perfilCorreo.textContent = usuario.correo_institucional || '';
        if (perfilCarreraBadge) perfilCarreraBadge.textContent = usuario.carrera || 'Sin carrera';
        if (statReputacion) {
            const rep = parseFloat(usuario.reputacion);
            statReputacion.textContent = isNaN(rep) ? 'Sin reseñas' : rep.toFixed(1);
        }
        if (infoItsonId) infoItsonId.textContent = usuario.itson_id || '-';
        if (infoTelefono) infoTelefono.textContent = usuario.telefono || '-';
        if (infoCarrera) infoCarrera.textContent = getCarreraNombre(usuario.carrera) || '-';
        if (infoCorreo) infoCorreo.textContent = usuario.correo_institucional || '-';

        // Cargar estadísticas
        await cargarEstadisticas(userId);

        // Configurar tabs para ver publicaciones de este usuario
        const tabs = document.querySelectorAll('.tab');
        const tabInfo = document.getElementById('tabInfo');
        const tabPublicaciones = document.getElementById('tabPublicaciones');
        const tabResenas = document.getElementById('tabResenas');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tabInfo) tabInfo.classList.toggle('hidden', tabName !== 'info');
                if (tabPublicaciones) tabPublicaciones.classList.toggle('hidden', tabName !== 'publicaciones');
                if (tabResenas) tabResenas.classList.toggle('hidden', tabName !== 'resenas');
                
                if (tabName === 'publicaciones') {
                    cargarPublicacionesUsuario(userId);
                }
            });
        });

    } catch (err) {
        showToast('Usuario no encontrado', 'error');
        navigateTo('/publicaciones');
    }
}

// Cargar publicaciones de un usuario específico
async function cargarPublicacionesUsuario(userId) {
    const container = document.getElementById('publicacionesList');
    if (!container) return;

    container.innerHTML = '<div class="text-center p-8"><div class="spinner"></div></div>';

    try {
        const res = await fetch(`/api/publicaciones/vendedor/${userId}`);
        const data = await res.json();
        const publicaciones = data.items || data.publicaciones || (Array.isArray(data) ? data : []);

        if (publicaciones.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Este usuario no tiene publicaciones</p>
                </div>
            `;
            return;
        }

        container.innerHTML = publicaciones.map(pub => `
            <a href="#/publicaciones/${pub._id}" class="card publicacion-mini-card">
                <div class="publicacion-mini-content">
                    <img src="${pub.detalles?.imagenes?.[0] || '/imgs/default-product.svg'}" 
                         alt="${pub.titulo}" 
                         class="publicacion-mini-imagen" />
                    <div class="publicacion-mini-info">
                        <h4>${pub.titulo}</h4>
                        <p class="publicacion-mini-precio">${formatCurrency(pub.precio)}</p>
                    </div>
                </div>
            </a>
        `).join('');

    } catch (err) {
        container.innerHTML = '<p class="text-center text-muted">Error al cargar publicaciones</p>';
    }
}

async function initPerfil() {
    if (!window.AuthState?.isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    const userId = window.AuthState.user?._id;
    if (!userId) return;

    const perfilAvatar = document.getElementById("perfilAvatar");
    const perfilNombre = document.getElementById("perfilNombre");
    const perfilCorreo = document.getElementById("perfilCorreo");
    const perfilCarreraBadge = document.getElementById("perfilCarreraBadge");
    const statPublicaciones = document.getElementById("statPublicaciones");
    const statTransacciones = document.getElementById("statTransacciones");
    const statReputacion = document.getElementById("statReputacion");
    const infoItsonId = document.getElementById("infoItsonId");
    const infoTelefono = document.getElementById("infoTelefono");
    const infoCarrera = document.getElementById("infoCarrera");
    const infoCorreo = document.getElementById("infoCorreo");

    // Tabs
    const tabs = document.querySelectorAll('.tab');
    const tabInfo = document.getElementById('tabInfo');
    const tabPublicaciones = document.getElementById('tabPublicaciones');
    const tabResenas = document.getElementById('tabResenas');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Actualizar tabs activas
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Mostrar contenido correspondiente
            if (tabInfo) tabInfo.classList.toggle('hidden', tabName !== 'info');
            if (tabPublicaciones) tabPublicaciones.classList.toggle('hidden', tabName !== 'publicaciones');
            if (tabResenas) tabResenas.classList.toggle('hidden', tabName !== 'resenas');
            
            // Cargar contenido si es necesario
            if (tabName === 'publicaciones') {
                cargarMisPublicaciones();
            } else if (tabName === 'resenas') {
                cargarMisResenas();
            }
        });
    });

    // Cargar datos del usuario
    try {
        const res = await fetch(`/api/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        if (!res.ok) throw new Error("Error al cargar perfil");

        const usuario = await res.json();

        // Llenar datos
        if (perfilAvatar) {
            perfilAvatar.src = usuario.foto || '/imgs/default-avatar.svg';
            perfilAvatar.onerror = () => perfilAvatar.src = '/imgs/default-avatar.svg';
        }
        if (perfilNombre) perfilNombre.textContent = usuario.nombre || 'Usuario';
        if (perfilCorreo) perfilCorreo.textContent = usuario.correo_institucional || '';
        if (perfilCarreraBadge) perfilCarreraBadge.textContent = usuario.carrera || 'Sin carrera';
        if (statReputacion) {
            const rep = parseFloat(usuario.reputacion);
            statReputacion.textContent = isNaN(rep) ? 'Sin reseñas' : rep.toFixed(1);
        }
        if (infoItsonId) infoItsonId.textContent = usuario.itson_id || '-';
        if (infoTelefono) infoTelefono.textContent = usuario.telefono || '-';
        if (infoCarrera) infoCarrera.textContent = getCarreraNombre(usuario.carrera) || '-';
        if (infoCorreo) infoCorreo.textContent = usuario.correo_institucional || '-';

        // Cargar estadísticas
        await cargarEstadisticas(userId);

    } catch (err) {
        showToast('Error al cargar el perfil', 'error');
    }
}

async function cargarEstadisticas(userId) {
    const statPublicaciones = document.getElementById("statPublicaciones");
    const statTransacciones = document.getElementById("statTransacciones");

    try {
        const headers = {};
        if (window.AuthState?.token) {
            headers['Authorization'] = `Bearer ${window.AuthState.token}`;
        }

        // Cargar publicaciones del usuario
        const resPub = await fetch(`/api/publicaciones/vendedor/${userId}`, { headers });
        const publicaciones = await resPub.json();
        if (statPublicaciones) {
            const count = publicaciones.total || (publicaciones.items?.length) || (Array.isArray(publicaciones) ? publicaciones.length : 0);
            statPublicaciones.textContent = count;
        }

        // Cargar transacciones - usar endpoint que filtra por vendedor
        const resTrans = await fetch(`/api/transacciones?vendedor_id=${userId}`, { headers });
        const transData = await resTrans.json();
        if (statTransacciones) {
            const transacciones = transData.data || transData.transacciones || (Array.isArray(transData) ? transData : []);
            statTransacciones.textContent = transacciones.length;
        }
    } catch (err) {
    }
}

async function cargarMisPublicaciones() {
    const container = document.getElementById("misPublicacionesGrid");
    const sinPublicaciones = document.getElementById("sinPublicaciones");
    const userId = window.AuthState.user?._id;

    if (!container) return;

    container.innerHTML = '<div class="spinner spinner-grid"></div>';

    try {
        // Usar endpoint específico para vendedor que incluye todas las publicaciones (visibles o no)
        const res = await fetch(`/api/publicaciones/vendedor/${userId}`, {
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        const data = await res.json();
        // La respuesta tiene formato { items: [], total, page, ... }
        const publicaciones = data.items || data.publicaciones || (Array.isArray(data) ? data : []);

        if (publicaciones.length === 0) {
            container.innerHTML = '';
            if (sinPublicaciones) sinPublicaciones.classList.remove('hidden');
            return;
        }

        if (sinPublicaciones) sinPublicaciones.classList.add('hidden');

        container.innerHTML = publicaciones.map(pub => `
            <div class="card user-pub-card">
                <div class="user-pub-image-wrapper">
                    <img src="${pub.detalles?.imagenes?.[0] || '/imgs/default-product.svg'}" alt="${pub.titulo}"
                         class="user-pub-image"
                         onerror="this.src='/imgs/default-product.svg'">
                    <span class="badge ${pub.estado === 'disponible' ? 'badge-success' : 'badge-error'} user-pub-badge">
                        ${pub.estado === 'disponible' ? 'Activo' : 'Vendido'}
                    </span>
                </div>
                <div class="user-pub-body">
                    <h4 class="user-pub-title">${pub.titulo}</h4>
                    <p class="user-pub-price">
                        ${formatCurrency(pub.precio || 0)}
                    </p>
                    <div class="flex gap-2 mt-3">
                        <a href="#/publicaciones/${pub._id}" class="btn btn-sm btn-outline flex-1">
                            Ver
                        </a>
                        <button onclick="eliminarPublicacion('${pub._id}')" 
                                class="btn btn-sm btn-delete">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        container.innerHTML = '<p class="empty-state-message">Error al cargar publicaciones</p>';
    }
}

async function cargarMisResenas() {
    const container = document.getElementById("resenasLista");
    const sinResenas = document.getElementById("sinResenas");
    const userId = window.AuthState.user?._id;

    if (!container) return;

    container.innerHTML = '<div class="spinner spinner-centered"></div>';

    try {
        // Obtener transacciones donde este usuario fue vendedor y extraer calificaciones
        const headers = {};
        if (window.AuthState?.token) headers['Authorization'] = `Bearer ${window.AuthState.token}`;

        const res = await fetch(`/api/transacciones?vendedor_id=${userId}`, { headers });
        const payload = await res.json();
        const transacciones = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);

        // Filtrar solo transacciones que tengan calificacion
        const resenas = transacciones.filter(t => t.calificacion && t.calificacion.puntuacion).map(t => ({
            autor: t.comprador_id || { nombre: t.comprador_itson_id },
            calificacion: t.calificacion.puntuacion,
            comentario: t.calificacion.comentario,
            fecha: t.calificacion.fecha || t.fecha_transaccion
        }));

        if (resenas.length === 0) {
            container.innerHTML = '';
            if (sinResenas) sinResenas.classList.remove('hidden');
            return;
        }

        if (sinResenas) sinResenas.classList.add('hidden');

        container.innerHTML = resenas.map(r => `
            <div class="card review-card">
                <div class="flex items-start gap-4">
                    <img src="${r.autor?.foto || '/imgs/default-avatar.svg'}" alt=""
                         class="review-avatar">
                    <div class="review-content">
                        <div class="flex items-center justify-between">
                            <h4 class="review-author">${r.autor?.nombre || r.autor?.itson_id || 'Usuario'}</h4>
                            <div class="flex items-center gap-1 review-stars">
                                ${Array(5).fill(0).map((_, i) => `
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
                                         fill="${i < r.calificacion ? 'currentColor' : 'none'}" 
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                `).join('')}
                            </div>
                        </div>
                        <p class="review-comment">${r.comentario || ''}</p>
                        <span class="review-date">
                            ${formatRelativeTime(r.fecha)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        container.innerHTML = '<p class="empty-state-message">Error al cargar reseñas</p>';
    }
}

function initEditarPerfil() {
    if (!window.AuthState?.isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    const form = document.getElementById("editarPerfilForm");
    const avatarPreview = document.getElementById("avatarPreview");
    const avatarInput = document.getElementById("avatarInput");
    const editNombre = document.getElementById("editNombre");
    const editItsonId = document.getElementById("editItsonId");
    const editCorreo = document.getElementById("editCorreo");
    const editTelefono = document.getElementById("editTelefono");
    const editCarrera = document.getElementById("editCarrera");
    const btnGuardar = document.getElementById("btnGuardar");
    const btnGuardarTexto = document.getElementById("btnGuardarTexto");
    const btnGuardarLoading = document.getElementById("btnGuardarLoading");
    const editarError = document.getElementById("editarError");
    const editarSuccess = document.getElementById("editarSuccess");
    const btnEliminarCuenta = document.getElementById("btnEliminarCuenta");

    const usuario = window.AuthState.user || {};

    // Llenar datos actuales
    if (avatarPreview) avatarPreview.src = usuario.foto || '/imgs/default-avatar.svg';
    if (editNombre) editNombre.value = usuario.nombre || '';
    if (editItsonId) editItsonId.value = usuario.itson_id || '';
    if (editCorreo) editCorreo.value = usuario.correo_institucional || '';
    if (editTelefono) editTelefono.value = usuario.telefono || '';
    if (editCarrera) editCarrera.value = usuario.carrera || '';

    // Avatar upload
    let nuevaFotoBase64 = null;
    if (avatarInput) {
        avatarInput.addEventListener("change", () => {
            const file = avatarInput.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast('La imagen no debe superar 5MB', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    nuevaFotoBase64 = reader.result;
                    if (avatarPreview) avatarPreview.src = nuevaFotoBase64;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Submit form
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (editarError) editarError.classList.add('hidden');
            if (editarSuccess) editarSuccess.classList.add('hidden');

            // Validar contraseñas si se quieren cambiar
            const passActual = document.getElementById("editPasswordActual")?.value;
            const passNueva = document.getElementById("editPasswordNueva")?.value;
            const passConfirmar = document.getElementById("editPasswordConfirmar")?.value;

            if (passNueva || passConfirmar) {
                if (!passActual) {
                    if (editarError) {
                        editarError.textContent = 'Ingresa tu contraseña actual para cambiarla';
                        editarError.classList.remove('hidden');
                    }
                    return;
                }
                if (passNueva !== passConfirmar) {
                    if (editarError) {
                        editarError.textContent = 'Las contraseñas nuevas no coinciden';
                        editarError.classList.remove('hidden');
                    }
                    return;
                }
                if (passNueva.length < 6) {
                    if (editarError) {
                        editarError.textContent = 'La nueva contraseña debe tener al menos 6 caracteres';
                        editarError.classList.remove('hidden');
                    }
                    return;
                }
            }

            // Loading state
            if (btnGuardar) btnGuardar.disabled = true;
            if (btnGuardarTexto) btnGuardarTexto.classList.add('hidden');
            if (btnGuardarLoading) btnGuardarLoading.classList.remove('hidden');

            // Preparar datos como JSON
            const data = {
                nombre: editNombre?.value || '',
                telefono: editTelefono?.value || '',
                carrera: editCarrera?.value || '',
            };
            
            // Agregar foto si se seleccionó una nueva
            if (nuevaFotoBase64) {
                data.foto = nuevaFotoBase64;
            }
            
            // Si se quiere cambiar contraseña
            if (passNueva) {
                data.contrasena_actual = passActual;
                data.contrasena_nueva = passNueva;
            }

            try {
                const res = await fetch(`/api/usuarios/${usuario._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.AuthState.token}`
                    },
                    body: JSON.stringify(data)
                });

                const responseData = await res.json();

                if (!res.ok) {
                    throw new Error(responseData.message || 'Error al actualizar perfil');
                }

                // Actualizar usuario en AuthState
                window.AuthState.user = { ...window.AuthState.user, ...responseData };
                localStorage.setItem('user', JSON.stringify(window.AuthState.user));

                if (editarSuccess) {
                    editarSuccess.textContent = '¡Perfil actualizado correctamente!';
                    editarSuccess.classList.remove('hidden');
                }

                showToast('Perfil actualizado', 'success');

            } catch (err) {
                if (editarError) {
                    editarError.textContent = err.message || 'Error al actualizar';
                    editarError.classList.remove('hidden');
                }
            } finally {
                if (btnGuardar) btnGuardar.disabled = false;
                if (btnGuardarTexto) btnGuardarTexto.classList.remove('hidden');
                if (btnGuardarLoading) btnGuardarLoading.classList.add('hidden');
            }
        });
    }

    // Eliminar cuenta
    if (btnEliminarCuenta) {
        btnEliminarCuenta.addEventListener('click', () => {
            const modal = document.getElementById('modalEliminar');
            if (modal) modal.classList.remove('hidden');
        });
    }

    // Confirmar eliminación
    const confirmarInput = document.getElementById('confirmarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    
    if (confirmarInput && btnConfirmarEliminar) {
        confirmarInput.addEventListener('input', () => {
            btnConfirmarEliminar.disabled = confirmarInput.value !== 'ELIMINAR';
        });

        btnConfirmarEliminar.addEventListener('click', async () => {
            try {
                const res = await fetch(`/api/usuarios/${usuario._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${window.AuthState.token}`
                    }
                });

                if (!res.ok) throw new Error('Error al eliminar cuenta');

                showToast('Cuenta eliminada', 'info');
                window.AuthState.logout();
            } catch (err) {
                showToast('Error al eliminar la cuenta', 'error');
            }
        });
    }
}

// Cerrar modal eliminar
window.cerrarModalEliminar = function() {
    const modal = document.getElementById('modalEliminar');
    if (modal) modal.classList.add('hidden');
};

// Eliminar publicación
window.eliminarPublicacion = async function(id) {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
        const res = await fetch(`/api/publicaciones/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        if (!res.ok) throw new Error('Error al eliminar');

        showToast('Publicación eliminada', 'success');
        cargarMisPublicaciones();
    } catch (err) {
        showToast('Error al eliminar la publicación', 'error');
    }
};

// Helper para nombres de carreras
function getCarreraNombre(codigo) {
    const carreras = {
        'ISW': 'Ingeniería en Software',
        'ICI': 'Ingeniería Civil',
        'IEL': 'Ingeniería Eléctrica',
        'IME': 'Ingeniería Mecánica',
        'IIN': 'Ingeniería Industrial',
        'IBQ': 'Ingeniería Bioquímica',
        'LAE': 'Licenciatura en Administración de Empresas',
        'LCP': 'Licenciatura en Contaduría Pública',
        'LDG': 'Licenciatura en Diseño Gráfico',
        'LEN': 'Licenciatura en Enfermería',
        'LPS': 'Licenciatura en Psicología',
        'LED': 'Licenciatura en Educación'
    };
    return carreras[codigo] || codigo;
}

// Exponer función globalmente
window.initUsuarios = initUsuarios;
