const { ChatModel } = require('../models/Chat');

class ChatRepository {

  /**
   * @function insert
   * @desc Crear un nuevo chat en la base de datos
   * @param {Object} chatData - Datos del chat a insertar
   * @returns {Promise<Object>} Chat creado
   * @access Private
   */
  async insert(chatData) {
    const nuevoChat = new ChatModel(chatData);
    return nuevoChat.save();
  }

  /**
   * @function findAll
   * @desc Obtener todos los chats de la base de datos
   * @returns {Promise<Array>} Array de todos los chats
   * @access Private
   */
  async findAll() {
    return ChatModel.find({}).populate('participantes', 'nombre foto carrera');
  }

  /**
   * @function findById
   * @desc Obtener un chat por su ID
   * @param {String} id - ID del chat
   * @returns {Promise<Object|null>} Chat encontrado o null
   * @access Private
   */
  async findById(id) {
    return ChatModel.findById(id).populate('participantes', 'nombre foto carrera');
  }

  /**
   * @function findByParticipante
   * @desc Obtener todos los chats en los que participa un usuario
   * @param {String} usuario_id - ID del usuario
   * @returns {Promise<Array>} Array de chats del usuario ordenados por última actualización
   * @access Private
   */
  async findByParticipante(usuario_id) {
   return ChatModel.find({ participantes: usuario_id })
      .populate('participantes', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles') 
      .sort({ ultima_actualizacion: -1 }); 
  }

  /**
   * @function findByParticipants
   * @desc Obtener un chat específico entre participantes exactos
   * @param {Array<String>} participantes - Array de IDs de participantes
   * @returns {Promise<Object|null>} Chat encontrado o null
   * @access Private
   */
  async findByParticipants(participantes) {
    return ChatModel.findOne({
      participantes: { $all: participantes },
      $expr: { $eq: [{ $size: "$participantes" }, participantes.length] }
    }).populate('participantes', 'nombre foto carrera');
  }

  /**
   * @function findByPublicacion
   * @desc Obtener todos los chats relacionados a una publicación
   * @param {String} publicacion_id - ID de la publicación
   * @returns {Promise<Array>} Array de chats de la publicación
   * @access Private
   */
  async findByPublicacion(publicacion_id) {
    return ChatModel.find({ publicacion_id }).populate('participantes', 'nombre foto carrera');
  }

  /**
   * @function update
   * @desc Actualizar datos de un chat
   * @param {String} id - ID del chat
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Chat actualizado o null
   * @access Private
   */
  async update(id, updateData) {
    return ChatModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * @function delete
   * @desc Eliminar un chat por su ID
   * @param {String} id - ID del chat
   * @returns {Promise<Object|null>} Chat eliminado o null
   * @access Private
   */
  async delete(id) {
    return ChatModel.findByIdAndDelete(id);
  }

  /**
   * @function agregarMensaje
   * @desc Agregar un nuevo mensaje a un chat
   * @param {String} chatId - ID del chat
   * @param {Object} mensajeData - Datos del mensaje
   * @returns {Promise<Object|null>} Chat actualizado con el nuevo mensaje o null
   * @access Private
   */
  async agregarMensaje(chatId, mensajeData) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) return null;

    chat.mensajes.push(mensajeData);
    chat.ultima_actualizacion = Date.now();
    await chat.save();
    return chat;
  }

  /**
   * @function obtenerMensajes
   * @desc Obtener todos los mensajes de un chat
   * @param {String} chatId - ID del chat
   * @returns {Promise<Array|null>} Array de mensajes o null si no existe el chat
   * @access Private
   */
  async obtenerMensajes(chatId) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) return null;
    return chat.mensajes || [];
  }

  /**
   * @function marcarMensajesLeidos
   * @desc Marcar como leídos todos los mensajes no propios en un chat
   * @param {String} chatId - ID del chat
   * @param {String} usuarioId - ID del usuario actual
   * @returns {Promise<Array|null>} Array de mensajes actualizados o null
   * @access Private
   */
  async marcarMensajesLeidos(chatId, usuarioId) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) return null;

    chat.mensajes.forEach((msg) => {
      const emisorId = msg.emisor_id || msg.remitente_id;
      if (emisorId && emisorId.toString() !== usuarioId.toString()) {
        msg.leido = true;
      }
    });

    chat.ultima_actualizacion = Date.now();
    await chat.save();
    return chat.mensajes;
  }

}

module.exports = ChatRepository;