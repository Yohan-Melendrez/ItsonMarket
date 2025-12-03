const { ChatModel } = require('../models/Chat');

class ChatRepository {

  async insert(chatData) {
    const nuevoChat = new ChatModel(chatData);
    return nuevoChat.save();
  }

  async findAll() {
    return ChatModel.find({}).populate('participantes', 'nombre foto carrera');
  }

  async findById(id) {
    return ChatModel.findById(id).populate('participantes', 'nombre foto carrera');
  }

  async findByParticipante(usuario_id) {
   return ChatModel.find({ participantes: usuario_id })
      .populate('participantes', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles') 
      .sort({ ultima_actualizacion: -1 }); 
  }

  async findByParticipants(participantes) {
    // Buscar un chat que contenga exactamente estos participantes (en cualquier orden)
    return ChatModel.findOne({
      participantes: { $all: participantes },
      $expr: { $eq: [{ $size: "$participantes" }, participantes.length] }
    }).populate('participantes', 'nombre foto carrera');
  }

  async findByPublicacion(publicacion_id) {
    return ChatModel.find({ publicacion_id }).populate('participantes', 'nombre foto carrera');
  }

  async update(id, updateData) {
    return ChatModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return ChatModel.findByIdAndDelete(id);
  }

  async agregarMensaje(chatId, mensajeData) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) return null;

    chat.mensajes.push(mensajeData);
    chat.ultima_actualizacion = Date.now();
    await chat.save();
    return chat;
  }

  async obtenerMensajes(chatId) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) return null;
    return chat.mensajes || [];
  }

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