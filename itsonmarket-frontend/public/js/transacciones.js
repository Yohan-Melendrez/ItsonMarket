/**
 * Transacciones Module - ItsonMarket
 */

let transaccionesData = [];
let filtroTransacciones = {
    tipo: 'todas',
    estado: '',
    mes: ''
};
let calificacionSeleccionada = 0;

function initTransacciones() {
    console.log("initTransacciones() inicializado");
    
    if (!window.AuthState?.isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    initFiltros();
    cargarTransacciones();
    initCalificacion();
}

function initFiltros() {
    // Tabs de tipo
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

    // Filtro de estado
    const filtroEstado = document.getElementById('filtroEstado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', () => {
            filtroTransacciones.estado = filtroEstado.value;
            renderTransacciones();
        });
    }

    // Filtro de mes
    const filtroMes = document.getElementById('filtroMes');
    if (filtroMes) {
        filtroMes.addEventListener('change', () => {
            filtroTransacciones.mes = filtroMes.value;
            renderTransacciones();
        });
    }

    // Limpiar filtros
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
        const res = await fetch('/api/transacciones', {
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Error al cargar transacciones');

        transaccionesData = Array.isArray(data) ? data : (data.transacciones || []);
        
        if (countTodas) countTodas.textContent = transaccionesData.length;
        if (loading) loading.classList.add('hidden');

        renderTransacciones();

    } catch (err) {
        console.error("Error cargando transacciones:", err);
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

    if (!lista) return;

    // Filtrar
    let filtered = transaccionesData.filter(t => {
        // Filtro por tipo (compra/venta)
        if (filtroTransacciones.tipo === 'compras') {
            if (t.comprador_id?._id !== userId && t.comprador_id !== userId) return false;
        } else if (filtroTransacciones.tipo === 'ventas') {
            if (t.vendedor_id?._id !== userId && t.vendedor_id !== userId) return false;
        }

        // Filtro por estado
        if (filtroTransacciones.estado && t.estado !== filtroTransacciones.estado) return false;

        // Filtro por mes
        if (filtroTransacciones.mes) {
            const fecha = new Date(t.createdAt);
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (mes !== filtroTransacciones.mes) return false;
        }

        return true;
    });

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filtered.length === 0) {
        lista.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
    }

    if (empty) empty.classList.add('hidden');

    lista.innerHTML = filtered.map(t => crearTransaccionCard(t, userId)).join('');
}

function crearTransaccionCard(trans, userId) {
    const esCompra = trans.comprador_id?._id === userId || trans.comprador_id === userId;
    const publicacion = trans.publicacion_id || {};
    const contraparte = esCompra ? trans.vendedor_id : trans.comprador_id;
    const imagen = publicacion.detalles?.imagenes?.[0] || '/imgs/default-product.svg';

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

    // Determinar acciones según estado
    let acciones = '';
    if (trans.estado === 'pendiente' && !esCompra) {
        acciones = `
            <button onclick="aceptarTransaccion('${trans._id}')" class="btn btn-sm btn-primary">Aceptar</button>
            <button onclick="cancelarTransaccion('${trans._id}')" class="btn btn-sm btn-outline">Rechazar</button>
        `;
    } else if (trans.estado === 'aceptada' || trans.estado === 'en_proceso') {
        if (!esCompra) {
            acciones = `
                <button onclick="completarTransaccion('${trans._id}')" class="btn btn-sm btn-primary">Marcar completada</button>
            `;
        }
    } else if (trans.estado === 'completada') {
        // Verificar si ya calificó
        const yaCalificó = esCompra ? trans.calificacion_comprador : trans.calificacion_vendedor;
        if (!yaCalificó) {
            acciones = `
                <button onclick="abrirModalCalificar('${trans._id}')" class="btn btn-sm btn-outline">
                    Calificar
                </button>
            `;
        } else {
            acciones = '<span class="badge badge-success">Calificado</span>';
        }
    }

    return `
        <div class="card" style="padding: 0; margin-bottom: 1rem; overflow: hidden;">
            <div class="flex">
                <div style="width: 140px; min-height: 140px; background: var(--gray-100);">
                    <img src="${imagen}" alt="${publicacion.titulo || 'Producto'}" 
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.src='/imgs/default-product.svg'">
                </div>
                <div style="flex: 1; padding: 1.25rem;">
                    <div class="flex items-start justify-between gap-4">
                        <div style="flex: 1;">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="badge ${esCompra ? 'badge-primary' : 'badge-accent'}">
                                    ${esCompra ? 'Compra' : 'Venta'}
                                </span>
                                <span class="badge ${estadoClasses[trans.estado] || 'badge-secondary'}">
                                    ${estadoLabels[trans.estado] || trans.estado}
                                </span>
                            </div>
                            <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem;">
                                ${publicacion.titulo || 'Publicación'}
                            </h3>
                            <p style="font-size: 0.85rem; color: var(--gray-500); margin: 0;">
                                ${formatDate(trans.createdAt)}
                            </p>
                        </div>
                        <div class="text-right">
                            <p style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin: 0;">
                                ${formatCurrency(trans.monto || publicacion.precio || 0)}
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3 mt-4 pt-4" style="border-top: 1px solid var(--gray-200);">
                        <img src="${contraparte?.foto || '/imgs/default-avatar.svg'}" alt="" 
                             style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;"
                             onerror="this.src='/imgs/default-avatar.svg'">
                        <div style="flex: 1;">
                            <p style="font-size: 0.75rem; color: var(--gray-500); margin: 0;">
                                ${esCompra ? 'Vendedor' : 'Comprador'}
                            </p>
                            <p style="font-weight: 500; margin: 0;">
                                ${contraparte?.nombre || 'Usuario'}
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
        console.error(err);
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
        console.error(err);
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
        console.error(err);
        showToast('Error al completar la transacción', 'error');
    }
};

// Calificación
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
                calificacion: calificacionSeleccionada,
                comentario
            })
        });

        if (!res.ok) throw new Error('Error al enviar calificación');

        showToast('¡Gracias por tu calificación!', 'success');
        cerrarModalCalificar();
        cargarTransacciones();
    } catch (err) {
        console.error(err);
        showToast('Error al enviar la calificación', 'error');
    }
}

window.cerrarModalDetalles = function() {
    const modal = document.getElementById('modalDetalles');
    if (modal) modal.classList.add('hidden');
};

// Exponer funciones globalmente
window.initTransacciones = initTransacciones;
window.cargarTransacciones = cargarTransacciones;
