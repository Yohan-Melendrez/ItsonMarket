const ChatRepository = require('../repositories/ChatRepository');
const repo = new ChatRepository();

/**
 * @route GET /api/chats
 * @desc Obtener todos los chats (protegido)
 * @access Private
 */
exports.obtenerChats = async (req, res, next) => {
  try {
    const chats = await repo.findAll();

    if (!chats || chats.length === 0) {
      return res.status(404).json({
        mensaje: 'No hay chats registrados en el sistema',
        data: [],
      });
    }

    res.status(200).json({
      mensaje: 'Chats obtenidos correctamente',
      cantidad: chats.length,
      data: chats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/chats/:id
 * @desc Obtener un chat por su ID
 * @access Private
 */
exports.obtenerChatPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chat = await repo.findById(id);

    if (!chat) {
      return res.status(404).json({
        mensaje: 'Chat no encontrado',
      });
    }

    res.status(200).json({
      mensaje: 'Chat obtenido correctamente',
      data: chat,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/chats
 * @desc Crear un nuevo chat
 * @access Private
 */
exports.crearChat = async (req, res, next) => {
  try {
    const { participantes, publicacion_id, mensajes } = req.body;

    const nuevoChat = await repo.insert({
      participantes,
      publicacion_id,
      mensajes: mensajes || [],
    });

    res.status(201).json({
      mensaje: 'Chat creado correctamente',
      data: nuevoChat,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route PUT /api/chats/:id
 * @desc Actualizar datos del chat
 * @access Private
 */
exports.actualizarChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const chatActualizado = await repo.update(id, updateData);

    if (!chatActualizado) {
      return res.status(404).json({
        mensaje: 'Chat no encontrado para actualizar',
      });
    }

    res.status(200).json({
      mensaje: 'Chat actualizado correctamente',
      data: chatActualizado,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route DELETE /api/chats/:id
 * @desc Eliminar un chat
 * @access Private
 */
exports.eliminarChat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eliminado = await repo.delete(id);
    if (!eliminado) {
      return res.status(404).json({
        mensaje: 'Chat no encontrado para eliminar',
      });
    }

    res.status(200).json({
      mensaje: 'Chat eliminado correctamente',
      data: eliminado,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/chats/:id/mensajes
 * @desc Enviar un mensaje en un chat existente
 * @access Private
 */
exports.enviarMensaje = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contenido, tipo, remitente_id } = req.body;

    if (!contenido) {
      return res.status(400).json({
        error: 'El contenido del mensaje es obligatorio',
      });
    }

    const mensaje = {
      remitente_id,
      contenido,
      tipo: tipo || 'texto',
      fecha_envio: new Date(),
      leido: false,
    };

    const chatActualizado = await repo.agregarMensaje(id, mensaje);

    if (!chatActualizado) {
      return res.status(404).json({
        error: 'Chat no encontrado',
      });
    }

    res.status(201).json({
      mensaje: 'Mensaje enviado correctamente',
      data: chatActualizado,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/chats/:id/mensajes
 * @desc Obtener todos los mensajes de un chat
 * @access Private
 */
exports.obtenerMensajes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensajes = await repo.obtenerMensajes(id);

    if (!mensajes) {
      return res.status(404).json({
        error: 'Chat no encontrado',
      });
    }

    res.status(200).json({
      mensaje: 'Mensajes obtenidos correctamente',
      total: mensajes.length,
      data: mensajes,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route PATCH /api/chats/:id/mensajes/leidos
 * @desc Marcar los mensajes de un chat como leídos por el usuario actual
 * @access Private
 */
exports.marcarMensajesLeidos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id || req.body.usuario_id;

    if (!usuarioId) {
      return res.status(400).json({
        error: 'No se proporcionó el usuario para marcar los mensajes como leídos',
      });
    }

    const mensajesLeidos = await repo.marcarMensajesLeidos(id, usuarioId);

    if (!mensajesLeidos) {
      return res.status(404).json({
        error: 'Chat no encontrado',
      });
    }

    res.status(200).json({
      mensaje: 'Mensajes marcados como leídos correctamente',
      data: mensajesLeidos,
    });
  } catch (err) {
    next(err);
  }
};