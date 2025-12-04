var chatsData = window.chatsData || [];
var chatActualId = chatActualId || null;

if (window.mensajesPollingInterval)
  clearInterval(window.mensajesPollingInterval);
var mensajesPollingInterval = null;

window.chatsData = chatsData;
window.chatActualId = chatActualId;

/**
 * @function initChats
 * @desc Inicializa vista de chats, carga eventos, lista de chats y determina el chat activo.
 * @returns {void}
 */
function initChats() {
  if (!window.AuthState?.isLoggedIn()) {
    navigateTo("/login");
    return;
  }

  const params = window.routeParams || {};
  if (params.id) {
    chatActualId = params.id;
  } else {
    chatActualId = null;

    const sidebar = document.getElementById("chatSidebar");
    const chatActivo = document.getElementById("chatActivo");
    const chatVacio = document.getElementById("chatVacio");

    if (sidebar) sidebar.classList.remove("hidden");
    if (chatActivo) chatActivo.classList.add("hidden");
    if (chatVacio) chatVacio.classList.remove("hidden");

    document.querySelectorAll(".chat-item").forEach((item) => {
      item.classList.remove("active");
    });
  }

  let intentos = 0;
  const vigilarDOM = setInterval(() => {
    const chatList = document.getElementById("chatList");
    intentos++;

    if (chatList) {
      clearInterval(vigilarDOM);
      initEventListeners();
      if (window.chatsData && window.chatsData.length > 0) {
        const loading = document.getElementById("loadingChats");
        if (loading) loading.classList.add("hidden");
        renderChatList(window.chatsData);
      }
      cargarChats();
    } else if (intentos > 50) {
      clearInterval(vigilarDOM);
    }
  }, 30);
}

/**
 * @function initEventListeners
 * @desc Registra listeners para búsqueda, envío de mensajes y navegación móvil.
 * @returns {void}
 */
function initEventListeners() {
  const buscarChat = document.getElementById("buscarChat");
  if (buscarChat) {
    buscarChat.addEventListener(
      "input",
      debounce((e) => {
        filtrarChats(e.target.value);
      }, 300)
    );
  }

  const formMensaje = document.getElementById("formMensaje");
  if (formMensaje) {
    formMensaje.addEventListener("submit", (e) => {
      e.preventDefault();
      enviarMensaje();
    });
  }

  const btnVolver = document.getElementById("btnVolverChats");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      const sidebar = document.getElementById("chatSidebar");
      const chatActivo = document.getElementById("chatActivo");
      const chatVacio = document.getElementById("chatVacio");

      if (sidebar) sidebar.classList.remove("hidden");
      if (chatActivo) chatActivo.classList.add("hidden");
      if (chatVacio) chatVacio.classList.remove("hidden");

      chatActualId = null;
    });
  }
}

/**
 * @function cargarChats
 * @desc Obtiene los chats del usuario autenticado y los renderiza.
 * @returns {Promise<void>}
 */
async function cargarChats() {
  const chatList = document.getElementById("chatList");
  const loading = document.getElementById("loadingChats");

  if (!window.AuthState?.token) {
    if (loading) loading.classList.add("hidden");
    if (chatList) {
      chatList.innerHTML = `
                <div class="empty-state-message">
                    <p>Inicia sesion para ver tus mensajes</p>
                </div>
            `;
    }
    return;
  }

  try {
    const res = await fetch("/api/chats", {
      headers: {
        Authorization: `Bearer ${window.AuthState.token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al cargar chats");

    const chatsRecibidos = Array.isArray(data) ? data : data.chats || [];

    window.chatsData = chatsRecibidos;
    chatsData = chatsRecibidos;
    if (loading) loading.classList.add("hidden");
    renderChatList(window.chatsData);

    if (window.chatActualId) {
      const chat = window.chatsData.find((c) => c._id === window.chatActualId);
      if (chat) {
        abrirChat(chat);
      } else {
        cargarChatIndividual(window.chatActualId);
      }
    }
  } catch (err) {
    if (loading) loading.classList.add("hidden");

    if (chatList) {
      chatList.innerHTML = `
                <div class="empty-state-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-state-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p class="empty-state-title">No tienes conversaciones aun</p>
                    <p class="empty-state-subtitle">Inicia un chat desde una publicacion</p>
                </div>
            `;
    }
  }
}

/**
 * @function renderChatList
 * @desc Renderiza la lista de chats en el sidebar.
 * @param {Array|null} filteredChats - Lista filtrada opcional de chats.
 * @returns {void}
 */
function renderChatList(filteredChats = null) {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;

  const chats = filteredChats || chatsData;
  const userId = window.AuthState.user?._id;

  if (chats.length === 0) {
    chatList.innerHTML = `
            <div class="empty-state-message">
                <p>No tienes conversaciones</p>
            </div>
        `;
    return;
  }

  chatList.innerHTML = chats
    .map((chat) => {
      let otroParticipante = chat.participantes.find((p) => {
        const pId = p._id || p;
        return pId.toString() !== userId.toString();
      });

      if (!otroParticipante) {
        otroParticipante = chat.participantes[0] || {};
      }

      const nombreMostrar = otroParticipante.nombre || "Usuario";
      const fotoMostrar = otroParticipante.foto || "/imgs/default-avatar.svg";

      const ultimoMensaje =
        chat.mensajes && chat.mensajes.length > 0
          ? chat.mensajes[chat.mensajes.length - 1]
          : { contenido: "Nuevo chat", fecha: chat.createdAt };

      const fechaMostrar = ultimoMensaje.fecha
        ? formatRelativeTime(ultimoMensaje.fecha)
        : "";

      const isActive = chat._id === chatActualId ? "active" : "";

      return `
            <div class="chat-item ${isActive}" 
                 data-chat-id="${chat._id}" 
                 onclick="seleccionarChat('${chat._id}')">
                <img src="${fotoMostrar}" 
                     alt="${nombreMostrar}" 
                     class="chat-item-avatar"
                     onerror="this.src='/imgs/default-avatar.svg'">
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <span class="chat-item-name">${nombreMostrar}</span>
                        <span class="chat-item-time">${fechaMostrar}</span>
                    </div>
                    <p class="chat-item-preview">
                        ${ultimoMensaje.contenido || "Sin mensajes"}
                    </p>
                </div>
            </div>
        `;
    })
    .join("");
}

/**
 * @function filtrarChats
 * @desc Filtra los chats por nombre del participante según la búsqueda.
 * @param {String} query - Texto de búsqueda.
 * @returns {void}
 */
function filtrarChats(query) {
  if (!query) {
    renderChatList();
    return;
  }

  const userId = window.AuthState.user?._id;
  const filtered = chatsData.filter((chat) => {
    const otroParticipante =
      chat.participantes?.find((p) => (p._id || p) !== userId) || {};
    return otroParticipante.nombre?.toLowerCase().includes(query.toLowerCase());
  });

  renderChatList(filtered);
}

/**
 * @function seleccionarChat
 * @desc Selecciona un chat y lo abre en la vista activa.
 * @param {String} chatId - ID del chat.
 * @returns {Promise<void>}
 */
window.seleccionarChat = async function (chatId) {
  const chat = chatsData.find((c) => c._id === chatId);
  if (chat) {
    await abrirChat(chat);
    history.replaceState(null, "", `#/chats/${chatId}`);
  }
};

/**
 * @function abrirChat
 * @desc Muestra el contenido del chat seleccionado e inicia el polling de mensajes.
 * @param {Object} chat - Objeto del chat seleccionado.
 * @returns {Promise<void>}
 */
async function abrirChat(chat) {
  chatActualId = chat._id;
  const userId = window.AuthState.user?._id;

  const chatVacio = document.getElementById("chatVacio");
  const chatActivo = document.getElementById("chatActivo");
  const chatSidebar = document.getElementById("chatSidebar");
  const chatUserName = document.getElementById("chatUserName");
  const chatUserAvatar = document.getElementById("chatUserAvatar");
  const chatUserStatus = document.getElementById("chatUserStatus");
  const chatVerPublicacion = document.getElementById("chatVerPublicacion");
  const chatMessages = document.getElementById("chatMessages");

  if (chatVacio) chatVacio.classList.add("hidden");
  if (chatActivo) chatActivo.classList.remove("hidden");

  if (window.innerWidth <= 768 && chatSidebar) {
    chatSidebar.classList.add("hidden");
  }

  const otroParticipante =
    chat.participantes?.find((p) => (p._id || p) !== userId) || {};

  if (chatUserName)
    chatUserName.textContent = otroParticipante.nombre || "Usuario";
  if (chatUserAvatar) {
    chatUserAvatar.src = otroParticipante.foto || "/imgs/default-avatar.svg";
    chatUserAvatar.onerror = () =>
      (chatUserAvatar.src = "/imgs/default-avatar.svg");
  }
  if (chatUserStatus)
    chatUserStatus.textContent = otroParticipante.carrera || "";

  if (chatVerPublicacion && chat.publicacion_id) {
    chatVerPublicacion.href = `#/publicaciones/${
      chat.publicacion_id._id || chat.publicacion_id
    }`;
    chatVerPublicacion.style.display = "inline-flex";
  } else if (chatVerPublicacion) {
    chatVerPublicacion.style.display = "none";
  }

  document.querySelectorAll(".chat-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.chatId === chat._id);
  });

  await cargarMensajes(chat._id);

  iniciarPollingMensajes();
}

/**
 * @function cargarMensajes
 * @desc Obtiene y renderiza los mensajes de un chat específico.
 * @param {String} chatId - ID del chat.
 * @returns {Promise<void>}
 */
async function cargarMensajes(chatId) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  try {
    const res = await fetch(`/api/chats/${chatId}/mensajes`, {
      headers: {
        Authorization: `Bearer ${window.AuthState.token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al cargar mensajes");

    const listaMensajes = data.data || data.mensajes || data;
    renderMensajes(listaMensajes);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    marcarComoLeido(chatId);
  } catch (err) {
    chatMessages.innerHTML = `
            <div class="empty-state-message">
                Error al cargar mensajes
            </div>
        `;
  }
}

/**
 * @function renderMensajes
 * @desc Renderiza los mensajes dentro del panel de conversación.
 * @param {Array} mensajes - Lista de mensajes.
 * @returns {void}
 */
function renderMensajes(mensajes) {
  const chatMessages = document.getElementById("chatMessages");
  const userId = window.AuthState.user?._id;

  if (!chatMessages) return;

  if (mensajes.length === 0) {
    chatMessages.innerHTML = `
            <div class="empty-state-message">
                <p>No hay mensajes aun</p>
                <p class="empty-state-subtitle">Envia el primer mensaje!</p>
            </div>
        `;
    return;
  }

  chatMessages.innerHTML = mensajes
    .map((msg) => {
      const esMio =
        (msg.remitente_id?._id ||
          msg.remitente_id ||
          msg.emisor_id?._id ||
          msg.emisor_id) === userId;
      const hora = msg.fecha
        ? new Date(msg.fecha).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      return `
            <div class="chat-message ${esMio ? "sent" : ""}">
                <div class="chat-message-content">
                    <p class="chat-message-text">${escapeHtml(
                      msg.contenido || ""
                    )}</p>
                    <span class="chat-message-time">${hora}</span>
                </div>
            </div>
        `;
    })
    .join("");
}

/**
 * @function enviarMensaje
 * @desc Envía un mensaje al chat actual y actualiza la vista.
 * @returns {Promise<void>}
 */
async function enviarMensaje() {
  const input = document.getElementById("inputMensaje");
  if (!input || !chatActualId) return;

  const contenido = input.value.trim();
  if (!contenido) return;

  input.value = "";

  try {
    const miUsuario = window.AuthState.user;
    const miId = miUsuario._id || miUsuario.id;

    const res = await fetch(`/api/chats/${chatActualId}/mensajes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.AuthState.token}`,
      },
      body: JSON.stringify({
        contenido: contenido,
        remitente_id: miId,
        tipo: "texto",
      }),
    });

    if (!res.ok) throw new Error("Error al enviar mensaje");

    await cargarMensajes(chatActualId);

    cargarChats();
  } catch (err) {
    showToast("Error al enviar el mensaje", "error");
    input.value = contenido;
  }
}

/**
 * @function marcarComoLeido
 * @desc Marca los mensajes de un chat como leídos para el usuario actual.
 * @param {String} chatId - ID del chat.
 * @returns {Promise<void>}
 */
async function marcarComoLeido(chatId) {
  try {
    await fetch(`/api/chats/${chatId}/mensajes/leidos`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.AuthState.token}`,
      },
      body: JSON.stringify({
        usuario_id: window.AuthState.user._id || window.AuthState.user.id,
      }),
    });
  } catch (err) {}
}

/**
 * @function iniciarPollingMensajes
 * @desc Inicia un intervalo que recarga mensajes cada 5s.
 * @returns {void}
 */
function iniciarPollingMensajes() {
  if (mensajesPollingInterval) {
    clearInterval(mensajesPollingInterval);
  }

  mensajesPollingInterval = setInterval(async () => {
    if (chatActualId) {
      await cargarMensajes(chatActualId);
    }
  }, 5000);
}

/**
 * @function escapeHtml
 * @desc Escapa caracteres HTML peligrosos en un texto.
 * @param {String} text - Texto sin sanitizar.
 * @returns {String} Texto seguro para renderizar.
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

window.addEventListener("hashchange", () => {
  const esRutaChats = location.hash.includes("/chats");
  const esRaizChats =
    location.hash.endsWith("/chats") || location.hash.endsWith("/chats/");

  if (!esRutaChats) {
    if (mensajesPollingInterval) {
      clearInterval(mensajesPollingInterval);
      mensajesPollingInterval = null;
    }
    chatActualId = null;
  } else if (esRaizChats) {
    chatActualId = null;
  }
});

window.initChats = initChats;
window.cargarChats = cargarChats;

/**
 * @function cargarChatIndividual
 * @desc Obtiene un chat desde la API si no está en memoria y lo abre.
 * @param {String} id - ID del chat a cargar.
 * @returns {Promise<void>}
 */
async function cargarChatIndividual(id) {
  try {
    const res = await fetch(`/api/chats/${id}`, {
      headers: {
        Authorization: `Bearer ${window.AuthState.token}`,
      },
    });

    const data = await res.json();

    const chat = data.data || data;

    if (chat && chat._id) {
      const existe = chatsData.find((c) => c._id === chat._id);
      if (!existe) {
        chatsData.push(chat);
        renderChatList();
      }
      abrirChat(chat);
    }
  } catch (err) {}
}
