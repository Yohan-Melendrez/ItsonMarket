/**
 * Chats Module - ItsonMarket
 */

let chatsData = [];
let chatActualId = null;
let mensajesPollingInterval = null;

function initChats() {
    console.log("initChats() inicializado");
    
    if (!window.AuthState?.isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    // Verificar si hay un chat específico en la URL
    const params = window.routeParams || {};
    if (params.id) {
        chatActualId = params.id;
    }

    initEventListeners();
    cargarChats();
}

function initEventListeners() {
    // Búsqueda de chats
    const buscarChat = document.getElementById('buscarChat');
    if (buscarChat) {
        buscarChat.addEventListener('input', debounce((e) => {
            filtrarChats(e.target.value);
        }, 300));
    }

    // Formulario de mensaje
    const formMensaje = document.getElementById('formMensaje');
    if (formMensaje) {
        formMensaje.addEventListener('submit', (e) => {
            e.preventDefault();
            enviarMensaje();
        });
    }

    // Botón adjuntar
    const btnAdjuntar = document.getElementById('btnAdjuntar');
    const archivoAdjunto = document.getElementById('archivoAdjunto');
    if (btnAdjuntar && archivoAdjunto) {
        btnAdjuntar.addEventListener('click', () => archivoAdjunto.click());
        archivoAdjunto.addEventListener('change', () => {
            const file = archivoAdjunto.files[0];
            if (file) {
                enviarImagen(file);
            }
        });
    }

    // Botón nuevo chat
    const btnNuevoChat = document.getElementById('btnNuevoChat');
    if (btnNuevoChat) {
        btnNuevoChat.addEventListener('click', abrirModalNuevoChat);
    }

    // Botón volver (móvil)
    const btnVolver = document.getElementById('btnVolverChats');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            const sidebar = document.getElementById('chatSidebar');
            const chatActivo = document.getElementById('chatActivo');
            const chatVacio = document.getElementById('chatVacio');
            
            if (sidebar) sidebar.classList.remove('hidden');
            if (chatActivo) chatActivo.classList.add('hidden');
            if (chatVacio) chatVacio.classList.remove('hidden');
            
            chatActualId = null;
        });
    }

    // Botón opciones del chat
    const btnOpciones = document.getElementById('btnChatOpciones');
    if (btnOpciones) {
        btnOpciones.addEventListener('click', () => {
            const modal = document.getElementById('modalChatOpciones');
            if (modal) modal.classList.remove('hidden');
        });
    }

    // Búsqueda de usuarios para nuevo chat
    const buscarUsuario = document.getElementById('buscarUsuario');
    if (buscarUsuario) {
        buscarUsuario.addEventListener('input', debounce((e) => {
            buscarUsuarios(e.target.value);
        }, 500));
    }
}

async function cargarChats() {
    const chatList = document.getElementById('chatList');
    const loading = document.getElementById('loadingChats');

    try {
        const res = await fetch('/api/chats', {
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Error al cargar chats');

        chatsData = Array.isArray(data) ? data : (data.chats || []);

        if (loading) loading.classList.add('hidden');
        renderChatList();

        // Si hay un chat específico en la URL, abrirlo
        if (chatActualId) {
            const chat = chatsData.find(c => c._id === chatActualId);
            if (chat) {
                abrirChat(chat);
            }
        }

    } catch (err) {
        console.error("Error cargando chats:", err);
        if (loading) loading.classList.add('hidden');
        if (chatList) {
            chatList.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--gray-500);">
                    <p>Error al cargar conversaciones</p>
                    <button onclick="cargarChats()" class="btn btn-sm btn-outline mt-2">Reintentar</button>
                </div>
            `;
        }
    }
}

function renderChatList(filteredChats = null) {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;

    const chats = filteredChats || chatsData;
    const userId = window.AuthState.user?._id;

    if (chats.length === 0) {
        chatList.innerHTML = `
            <div class="text-center" style="padding: 2rem; color: var(--gray-500);">
                <p>No tienes conversaciones</p>
            </div>
        `;
        return;
    }

    chatList.innerHTML = chats.map(chat => {
        // Encontrar el otro participante
        const otroParticipante = chat.participantes?.find(p => 
            (p._id || p) !== userId
        ) || {};
        
        const ultimoMensaje = chat.mensajes?.[chat.mensajes.length - 1] || {};
        const noLeidos = chat.mensajes?.filter(m => 
            !m.leido && (m.emisor_id?._id || m.emisor_id) !== userId
        ).length || 0;

        return `
            <div class="chat-item ${chat._id === chatActualId ? 'active' : ''}" 
                 data-chat-id="${chat._id}" 
                 onclick="seleccionarChat('${chat._id}')">
                <img src="${otroParticipante.foto || '/imgs/default-avatar.svg'}" 
                     alt="${otroParticipante.nombre || 'Usuario'}" 
                     class="chat-item-avatar"
                     onerror="this.src='/imgs/default-avatar.svg'">
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <span class="chat-item-name">${otroParticipante.nombre || 'Usuario'}</span>
                        <span class="chat-item-time">${ultimoMensaje.fecha ? formatRelativeTime(ultimoMensaje.fecha) : ''}</span>
                    </div>
                    <p class="chat-item-preview">
                        ${ultimoMensaje.contenido || 'Sin mensajes'}
                    </p>
                </div>
                ${noLeidos > 0 ? `<span class="chat-item-unread">${noLeidos}</span>` : ''}
            </div>
        `;
    }).join('');
}

function filtrarChats(query) {
    if (!query) {
        renderChatList();
        return;
    }

    const userId = window.AuthState.user?._id;
    const filtered = chatsData.filter(chat => {
        const otroParticipante = chat.participantes?.find(p => 
            (p._id || p) !== userId
        ) || {};
        return otroParticipante.nombre?.toLowerCase().includes(query.toLowerCase());
    });

    renderChatList(filtered);
}

window.seleccionarChat = async function(chatId) {
    const chat = chatsData.find(c => c._id === chatId);
    if (chat) {
        await abrirChat(chat);
        // Actualizar URL sin recargar
        history.replaceState(null, '', `#/chats/${chatId}`);
    }
};

async function abrirChat(chat) {
    chatActualId = chat._id;
    const userId = window.AuthState.user?._id;

    // Elementos del DOM
    const chatVacio = document.getElementById('chatVacio');
    const chatActivo = document.getElementById('chatActivo');
    const chatSidebar = document.getElementById('chatSidebar');
    const chatUserName = document.getElementById('chatUserName');
    const chatUserAvatar = document.getElementById('chatUserAvatar');
    const chatUserStatus = document.getElementById('chatUserStatus');
    const chatVerPublicacion = document.getElementById('chatVerPublicacion');
    const chatMessages = document.getElementById('chatMessages');

    // Ocultar estado vacío y mostrar chat
    if (chatVacio) chatVacio.classList.add('hidden');
    if (chatActivo) chatActivo.classList.remove('hidden');
    
    // En móvil, ocultar sidebar
    if (window.innerWidth <= 768 && chatSidebar) {
        chatSidebar.classList.add('hidden');
    }

    // Encontrar el otro participante
    const otroParticipante = chat.participantes?.find(p => 
        (p._id || p) !== userId
    ) || {};

    // Actualizar header
    if (chatUserName) chatUserName.textContent = otroParticipante.nombre || 'Usuario';
    if (chatUserAvatar) {
        chatUserAvatar.src = otroParticipante.foto || '/imgs/default-avatar.svg';
        chatUserAvatar.onerror = () => chatUserAvatar.src = '/imgs/default-avatar.svg';
    }
    if (chatUserStatus) chatUserStatus.textContent = otroParticipante.carrera || '';

    // Mostrar enlace a publicación si existe
    if (chatVerPublicacion && chat.publicacion_id) {
        chatVerPublicacion.href = `#/publicaciones/${chat.publicacion_id._id || chat.publicacion_id}`;
        chatVerPublicacion.style.display = 'inline-flex';
    } else if (chatVerPublicacion) {
        chatVerPublicacion.style.display = 'none';
    }

    // Actualizar chat activo en la lista
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId === chat._id);
    });

    // Cargar mensajes
    await cargarMensajes(chat._id);

    // Iniciar polling de mensajes
    iniciarPollingMensajes();
}

async function cargarMensajes(chatId) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    try {
        const res = await fetch(`/api/chats/${chatId}/mensajes`, {
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Error al cargar mensajes');

        const mensajes = Array.isArray(data) ? data : (data.mensajes || []);
        renderMensajes(mensajes);

        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Marcar como leídos
        marcarComoLeido(chatId);

    } catch (err) {
        console.error("Error cargando mensajes:", err);
        chatMessages.innerHTML = `
            <div class="text-center" style="padding: 2rem; color: var(--gray-500);">
                Error al cargar mensajes
            </div>
        `;
    }
}

function renderMensajes(mensajes) {
    const chatMessages = document.getElementById('chatMessages');
    const userId = window.AuthState.user?._id;
    
    if (!chatMessages) return;

    if (mensajes.length === 0) {
        chatMessages.innerHTML = `
            <div class="text-center" style="padding: 2rem; color: var(--gray-500);">
                <p>No hay mensajes aún</p>
                <p style="font-size: 0.85rem;">¡Envía el primer mensaje!</p>
            </div>
        `;
        return;
    }

    chatMessages.innerHTML = mensajes.map(msg => {
        const esMio = (msg.emisor_id?._id || msg.emisor_id) === userId;
        const hora = msg.fecha ? new Date(msg.fecha).toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) : '';

        if (msg.tipo === 'imagen' && msg.imagen) {
            return `
                <div class="chat-message ${esMio ? 'sent' : ''}">
                    <div class="chat-message-content">
                        <img src="${msg.imagen}" alt="Imagen" class="chat-message-image" 
                             onclick="verImagenCompleta('${msg.imagen}')">
                        <span class="chat-message-time">${hora}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="chat-message ${esMio ? 'sent' : ''}">
                <div class="chat-message-content">
                    <p class="chat-message-text">${escapeHtml(msg.contenido || '')}</p>
                    <span class="chat-message-time">${hora}</span>
                </div>
            </div>
        `;
    }).join('');
}

async function enviarMensaje() {
    const input = document.getElementById('inputMensaje');
    if (!input || !chatActualId) return;

    const contenido = input.value.trim();
    if (!contenido) return;

    // Limpiar input inmediatamente
    input.value = '';

    try {
        const res = await fetch(`/api/chats/${chatActualId}/mensajes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: JSON.stringify({ contenido })
        });

        if (!res.ok) throw new Error('Error al enviar mensaje');

        // Recargar mensajes
        await cargarMensajes(chatActualId);
        
        // Actualizar lista de chats
        cargarChats();

    } catch (err) {
        console.error("Error enviando mensaje:", err);
        showToast('Error al enviar el mensaje', 'error');
        input.value = contenido; // Restaurar mensaje si falla
    }
}

async function enviarImagen(file) {
    if (!chatActualId) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen no debe superar 5MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('tipo', 'imagen');

    try {
        const res = await fetch(`/api/chats/${chatActualId}/mensajes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error('Error al enviar imagen');

        await cargarMensajes(chatActualId);
        cargarChats();

    } catch (err) {
        console.error("Error enviando imagen:", err);
        showToast('Error al enviar la imagen', 'error');
    }
}

async function marcarComoLeido(chatId) {
    try {
        await fetch(`/api/chats/${chatId}/leer`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });
    } catch (err) {
        console.error("Error marcando como leído:", err);
    }
}

function iniciarPollingMensajes() {
    // Detener polling anterior si existe
    if (mensajesPollingInterval) {
        clearInterval(mensajesPollingInterval);
    }

    // Polling cada 5 segundos
    mensajesPollingInterval = setInterval(async () => {
        if (chatActualId) {
            await cargarMensajes(chatActualId);
        }
    }, 5000);
}

// Nuevo chat
function abrirModalNuevoChat() {
    const modal = document.getElementById('modalNuevoChat');
    if (modal) modal.classList.remove('hidden');
}

window.cerrarModalNuevoChat = function() {
    const modal = document.getElementById('modalNuevoChat');
    if (modal) modal.classList.add('hidden');
    
    const resultados = document.getElementById('resultadosUsuarios');
    if (resultados) resultados.innerHTML = '';
    
    const input = document.getElementById('buscarUsuario');
    if (input) input.value = '';
};

async function buscarUsuarios(query) {
    const resultados = document.getElementById('resultadosUsuarios');
    if (!resultados || !query || query.length < 2) {
        if (resultados) resultados.innerHTML = '';
        return;
    }

    resultados.innerHTML = '<div class="spinner" style="margin: 1rem auto;"></div>';

    try {
        const res = await fetch(`/api/usuarios/buscar?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        const usuarios = await res.json();

        if (!res.ok || !Array.isArray(usuarios) || usuarios.length === 0) {
            resultados.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 1rem;">No se encontraron usuarios</p>';
            return;
        }

        resultados.innerHTML = usuarios
            .filter(u => u._id !== window.AuthState.user?._id)
            .map(u => `
                <div class="flex items-center gap-3 p-3 cursor-pointer" 
                     style="border-radius: var(--radius-md); transition: background 0.2s;"
                     onmouseover="this.style.background='var(--gray-100)'"
                     onmouseout="this.style.background='transparent'"
                     onclick="iniciarChatCon('${u._id}')">
                    <img src="${u.foto || '/imgs/default-avatar.svg'}" alt=""
                         style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <p style="font-weight: 500; margin: 0;">${u.nombre}</p>
                        <p style="font-size: 0.8rem; color: var(--gray-500); margin: 0;">${u.carrera || ''}</p>
                    </div>
                </div>
            `).join('');

    } catch (err) {
        console.error("Error buscando usuarios:", err);
        resultados.innerHTML = '<p style="text-align: center; color: var(--error); padding: 1rem;">Error en la búsqueda</p>';
    }
}

window.iniciarChatCon = async function(usuarioId) {
    try {
        const res = await fetch('/api/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthState.token}`
            },
            body: JSON.stringify({ participante_id: usuarioId })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Error al crear chat');

        cerrarModalNuevoChat();
        
        // Recargar chats y abrir el nuevo
        await cargarChats();
        const chatId = data._id || data.chat?._id;
        if (chatId) {
            const chat = chatsData.find(c => c._id === chatId);
            if (chat) abrirChat(chat);
        }

    } catch (err) {
        console.error("Error iniciando chat:", err);
        showToast('Error al iniciar conversación', 'error');
    }
};

// Opciones del chat
window.cerrarModalOpciones = function() {
    const modal = document.getElementById('modalChatOpciones');
    if (modal) modal.classList.add('hidden');
};

window.verPerfilUsuario = function() {
    cerrarModalOpciones();
    // TODO: Implementar vista de perfil de otro usuario
    showToast('Función próximamente disponible', 'info');
};

window.silenciarNotificaciones = function() {
    cerrarModalOpciones();
    showToast('Notificaciones silenciadas', 'success');
};

window.eliminarConversacion = async function() {
    if (!chatActualId || !confirm('¿Eliminar esta conversación?')) return;

    try {
        const res = await fetch(`/api/chats/${chatActualId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.AuthState.token}`
            }
        });

        if (!res.ok) throw new Error('Error al eliminar');

        cerrarModalOpciones();
        chatActualId = null;
        
        const chatVacio = document.getElementById('chatVacio');
        const chatActivo = document.getElementById('chatActivo');
        if (chatVacio) chatVacio.classList.remove('hidden');
        if (chatActivo) chatActivo.classList.add('hidden');

        showToast('Conversación eliminada', 'info');
        cargarChats();

    } catch (err) {
        console.error("Error eliminando chat:", err);
        showToast('Error al eliminar la conversación', 'error');
    }
};

// Ver imagen completa
window.verImagenCompleta = function(src) {
    // Crear modal temporal para ver imagen
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content" style="max-width: 90vw; max-height: 90vh; padding: 0; background: transparent; box-shadow: none;">
            <img src="${src}" style="max-width: 100%; max-height: 90vh; border-radius: var(--radius-lg);">
        </div>
    `;
    document.body.appendChild(modal);
};

// Helper para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Limpiar al salir
window.addEventListener('hashchange', () => {
    if (!location.hash.includes('/chats')) {
        if (mensajesPollingInterval) {
            clearInterval(mensajesPollingInterval);
            mensajesPollingInterval = null;
        }
        chatActualId = null;
    }
});

// Exponer función globalmente
window.initChats = initChats;
window.cargarChats = cargarChats;
