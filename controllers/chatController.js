const ChatRepository = require('../repositories/ChatRepository');
const repo = new ChatRepository();

/**
 * @route GET /api/chats
 * @desc Obtener todos los chats
 */
exports.obtenerChats = async (req, res) => {
  try {
    const chats = await repo.findAll();
    if (!chats || chats.length === 0)
      return res.status(404).json({ mensaje: "No hay chats registrados" });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener chats", detalle: err.message });
  }
};

/**
 * @route POST /api/chats
 * @desc Crear un nuevo chat
 */
exports.crearChat = async (req, res) => {
  try {
    const { participantes, publicacion_id, mensajes } = req.body;

    // Validaciones básicas
    if (!participantes || !publicacion_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios: participantes y publicacion_id" });
    }

    const nuevo = await repo.insert(req.body);
    res.status(201).json({ mensaje: "Chat creado correctamente", chat: nuevo });
  } catch (err) {
    res.status(400).json({ error: "No se pudo crear el chat", detalle: err.message });
  }
};

/**
 * @route GET /api/chats/:id
 * @desc Obtener un chat por ID
 */
exports.obtenerChatPorId = async (req, res) => {
  try {
    const chat = await repo.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: "Chat no encontrado" });

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar chat", detalle: err.message });
  }
};

/**
 * @route GET /api/chats/usuario/:usuario_id
 * @desc Obtener chats por participante
 */
exports.obtenerChatsPorUsuario = async (req, res) => {
  try {
    const chats = await repo.findByParticipante(req.params.usuario_id);
    if (!chats || chats.length === 0)
      return res.status(404).json({ error: "No se encontraron chats para este usuario" });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar chats del usuario", detalle: err.message });
  }
};

/**
 * @route GET /api/chats/publicacion/:publicacion_id
 * @desc Obtener chats por publicación
 */
exports.obtenerChatsPorPublicacion = async (req, res) => {
  try {
    const chats = await repo.findByPublicacion(req.params.publicacion_id);
    if (!chats || chats.length === 0)
      return res.status(404).json({ error: "No se encontraron chats para esta publicación" });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar chats de la publicación", detalle: err.message });
  }
};

/**
 * @route PUT /api/chats/:id
 * @desc Actualizar un chat por ID
 */
exports.actualizarChat = async (req, res) => {
  try {
    const actualizado = await repo.update(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: "Chat no encontrado para actualizar" });

    res.status(200).json({ mensaje: "Chat actualizado correctamente", chat: actualizado });
  } catch (err) {
    res.status(400).json({ error: "Error al actualizar chat", detalle: err.message });
  }
};

/**
 * @route DELETE /api/chats/:id
 * @desc Eliminar un chat por ID
 */
exports.eliminarChat = async (req, res) => {
  try {
    const eliminado = await repo.delete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Chat no encontrado para eliminar" });

    res.status(200).json({ mensaje: "Chat eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar chat", detalle: err.message });
  }
};