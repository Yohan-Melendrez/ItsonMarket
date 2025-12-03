let transaccionesData = [];
let filtroTransacciones = {
    tipo: 'todas',
    estado: '',
    mes: ''
};
let calificacionSeleccionada = 0;

function initTransacciones() {
    if (!window.AuthState?.isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    initFiltros();
    cargarTransacciones();
    initCalificacion();
}

function initFiltros() {
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filtro = tab.dataset.filter;
            filtroTransacciones.tipo = filtro;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            renderTransacciones();
        });
    });

    const filtroEstado = document.getElementById('filtroEstado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', () => {
            filtroTransacciones.estado = filtroEstado.value;
            renderTransacciones();
        });
    }

    const filtroMes = document.getElementById('filtroMes');
    if (filtroMes) {
        filtroMes.addEventListener('change', () => {
            filtroTransacciones.mes = filtroMes.value;
            renderTransacciones();
        });
    }

    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            filtroTransacciones = { tipo: 'todas', estado: '', mes: '' };
            if (filtroEstado) filtroEstado.value = '';
            if (filtroMes) filtroMes.value = '';
            tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === 'todas'));
            renderTransacciones();
        });
    }
}

async function cargarTransacciones() {
    const lista = document.getElementById('transaccionesLista');
    const loading = document.getElementById('loadingTransacciones');
    const empty = document.getElementById('sinTransacciones');
    const countTodas = document.getElementById('countTodas');

    if (loading) loading.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');

    try {
        const res = await fetch('/api/transacciones/mis-transacciones', {
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Error al cargar transacciones');

        transaccionesData = Array.isArray(data) ? data : (data.data || data.transacciones || []);
        
        if (countTodas) countTodas.textContent = transaccionesData.length;
        if (loading) loading.classList.add('hidden');

        renderTransacciones();

    } catch (err) {
        if (loading) loading.classList.add('hidden');
        if (lista) {
            lista.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3>Error al cargar</h3>
                    <p>No pudimos cargar tus transacciones. Intenta de nuevo.</p>
                    <button onclick="cargarTransacciones()" class="btn btn-primary">Reintentar</button>
                </div>
            `;
        }
    }
}

function renderTransacciones() {
    const lista = document.getElementById('transaccionesLista');
    const empty = document.getElementById('sinTransacciones');
    const userId = window.AuthState.user?._id;
    const userItsonId = window.AuthState.user?.itson_id;

    if (!lista) return;

    let filtered = transaccionesData.filter(t => {
        const soyComprador = t.comprador_id?._id === userId || 
                            t.comprador_id === userId || 
                            t.comprador_itson_id === userItsonId;
        const soyVendedor = t.vendedor_id?._id === userId || t.vendedor_id === userId;

        if (filtroTransacciones.tipo === 'compras' && !soyComprador) return false;
        if (filtroTransacciones.tipo === 'ventas' && !soyVendedor) return false;

        if (filtroTransacciones.estado && t.estado !== filtroTransacciones.estado) return false;

        if (filtroTransacciones.mes) {
            const fecha = new Date(t.fecha_transaccion || t.createdAt);
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (mes !== filtroTransacciones.mes) return false;
        }

        return true;
    });

    filtered.sort((a, b) => new Date(b.fecha_transaccion || b.createdAt) - new Date(a.fecha_transaccion || a.createdAt));

    if (filtered.length === 0) {
        lista.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
    }

    if (empty) empty.classList.add('hidden');

    lista.innerHTML = filtered.map(t => crearTransaccionCard(t, userId, userItsonId)).join('');
}

function crearTransaccionCard(trans, userId, userItsonId) {
    const esCompra = trans.comprador_id?._id === userId || 
                     trans.comprador_id === userId || 
                     trans.comprador_itson_id === userItsonId;
    
    const publicacion = trans.publicacion_id || {};
    const contraparte = esCompra ? trans.vendedor_id : trans.comprador_id;
    const imagen = publicacion.detalles?.imagenes?.[0] || '/imgs/default-product.svg';
    
    const contraparteNombre = contraparte?.nombre || 
                              (esCompra ? 'Vendedor' : `ID: ${trans.comprador_itson_id || 'Desconocido'}`);

    const estadoClasses = {
        'pendiente': 'badge-warning',
        'aceptada': 'badge-primary',
        'en_proceso': 'badge-primary',
        'completada': 'badge-success',
        'cancelada': 'badge-error'
    };

    const estadoLabels = {
        'pendiente': 'Pendiente',
        'aceptada': 'Aceptada',
        'en_proceso': 'En proceso',
        'completada': 'Completada',
        'cancelada': 'Cancelada'
    };

    const fecha = trans.fecha_transaccion || trans.createdAt;
    const fechaFormateada = fecha ? formatDate(fecha) : 'Fecha desconocida';

    // Determinar acciones según estado
    let acciones = '';
    if (trans.estado === 'completada' && esCompra) {
        // Solo el comprador puede calificar
        if (!trans.calificacion) {
            acciones = `
                <button onclick="abrirModalCalificar('${trans._id}')" class="btn btn-sm btn-outline">
                    ⭐ Calificar
                </button>
            `;
        } else {
            acciones = `<span class="badge badge-success">Calificado ⭐${trans.calificacion.puntuacion}</span>`;
        }
    }

    return `
        <div class="card trans-card">
            <div class="flex">
                <div class="trans-image-wrapper">
                    <img src="${imagen}" alt="${publicacion.titulo || 'Producto'}" 
                         class="trans-image"
                         onerror="this.src='/imgs/default-product.svg'">
                </div>
                <div class="trans-body">
                    <div class="flex items-start justify-between gap-4">
                        <div class="trans-content">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="badge ${esCompra ? 'badge-primary' : 'badge-accent'}">
                                    ${esCompra ? 'Compra' : 'Venta'}
                                </span>
                                <span class="badge ${estadoClasses[trans.estado] || 'badge-secondary'}">
                                    ${estadoLabels[trans.estado] || trans.estado}
                                </span>
                            </div>
                            <h3 class="trans-title">
                                ${publicacion.titulo || 'Publicación'}
                            </h3>
                            <p class="trans-subtitle">
                                ${fechaFormateada}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="trans-price">
                                ${formatCurrency(trans.monto || publicacion.precio || 0)}
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3 mt-4 pt-4 trans-divider">
                        <img src="${contraparte?.foto || '/imgs/default-avatar.svg'}" alt="" 
                             class="trans-user-avatar"
                             onerror="this.src='/imgs/default-avatar.svg'">
                        <div class="trans-content">
                            <p class="trans-user-label">
                                ${esCompra ? 'Vendedor' : 'Comprador'}
                            </p>
                            <p class="trans-user-name">
                                ${contraparteNombre}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            ${acciones}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Acciones de transacciones
window.aceptarTransaccion = async function(id) {
    try {
        const res = await fetch(`/api/transacciones/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: JSON.stringify({ estado: 'aceptada' })
        });

        if (!res.ok) throw new Error('Error al aceptar');

        showToast('Transacción aceptada', 'success');
        cargarTransacciones();
    } catch (err) {
        showToast('Error al aceptar la transacción', 'error');
    }
};

window.cancelarTransaccion = async function(id) {
    if (!confirm('¿Estás seguro de cancelar esta transacción?')) return;

    try {
        const res = await fetch(`/api/transacciones/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: JSON.stringify({ estado: 'cancelada' })
        });

        if (!res.ok) throw new Error('Error al cancelar');

        showToast('Transacción cancelada', 'info');
        cargarTransacciones();
    } catch (err) {
        showToast('Error al cancelar la transacción', 'error');
    }
};

window.completarTransaccion = async function(id) {
    try {
        const res = await fetch(`/api/transacciones/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: JSON.stringify({ estado: 'completada' })
        });

        if (!res.ok) throw new Error('Error al completar');

        showToast('¡Transacción completada!', 'success');
        cargarTransacciones();
    } catch (err) {
        showToast('Error al completar la transacción', 'error');
    }
};

function initCalificacion() {
    const estrellas = document.querySelectorAll('.btn-estrella');
    const textos = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
    const textoCalificacion = document.getElementById('textoCalificacion');
    const btnEnviar = document.getElementById('btnEnviarCalificacion');

    estrellas.forEach(btn => {
        btn.addEventListener('click', () => {
            calificacionSeleccionada = parseInt(btn.dataset.rating);
            
            estrellas.forEach((b, i) => {
                const svg = b.querySelector('svg');
                if (i < calificacionSeleccionada) {
                    svg.setAttribute('fill', 'currentColor');
                    b.style.color = 'var(--warning)';
                } else {
                    svg.setAttribute('fill', 'none');
                    b.style.color = 'var(--gray-400)';
                }
            });

            if (textoCalificacion) {
                textoCalificacion.textContent = textos[calificacionSeleccionada - 1];
            }
            if (btnEnviar) btnEnviar.disabled = false;
        });

        btn.addEventListener('mouseenter', () => {
            const rating = parseInt(btn.dataset.rating);
            estrellas.forEach((b, i) => {
                if (i < rating) {
                    b.style.color = 'var(--warning)';
                }
            });
        });

        btn.addEventListener('mouseleave', () => {
            estrellas.forEach((b, i) => {
                if (i >= calificacionSeleccionada) {
                    b.style.color = 'var(--gray-400)';
                }
            });
        });
    });

    if (btnEnviar) {
        btnEnviar.addEventListener('click', enviarCalificacion);
    }
}

window.abrirModalCalificar = function(transaccionId) {
    const modal = document.getElementById('modalCalificar');
    const inputId = document.getElementById('calificarTransaccionId');
    
    if (modal) modal.classList.remove('hidden');
    if (inputId) inputId.value = transaccionId;
    
    // Reset
    calificacionSeleccionada = 0;
    document.querySelectorAll('.btn-estrella').forEach(b => {
        b.style.color = 'var(--gray-400)';
        b.querySelector('svg').setAttribute('fill', 'none');
    });
    document.getElementById('textoCalificacion').textContent = '';
    document.getElementById('comentarioCalificacion').value = '';
    document.getElementById('btnEnviarCalificacion').disabled = true;
};

window.cerrarModalCalificar = function() {
    const modal = document.getElementById('modalCalificar');
    if (modal) modal.classList.add('hidden');
};

async function enviarCalificacion() {
    const transaccionId = document.getElementById('calificarTransaccionId')?.value;
    const comentario = document.getElementById('comentarioCalificacion')?.value || '';

    if (!transaccionId || !calificacionSeleccionada) return;

    try {
        const res = await fetch(`/api/transacciones/${transaccionId}/calificar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: JSON.stringify({
                puntuacion: calificacionSeleccionada,
                comentario
            })
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || data.error || 'Error al enviar calificación');
        }

        showToast('¡Gracias por tu calificación!', 'success');
        cerrarModalCalificar();
        cargarTransacciones();
    } catch (err) {
        showToast(err.message || 'Error al enviar la calificación', 'error');
    }
}

window.cerrarModalDetalles = function() {
    const modal = document.getElementById('modalDetalles');
    if (modal) modal.classList.add('hidden');
};

// Exponer funciones globalmente
window.initTransacciones = initTransacciones;
window.cargarTransacciones = cargarTransacciones;
