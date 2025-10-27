const { ChatModel } = require('../models/Chat');

class ChatRepository {

  async insert(chatData) {
    const nuevoChat = new ChatModel(chatData);
    return nuevoChat.save();
  }

  async findAll() {
    return ChatModel.find({});
  }

  async findById(id) {
    return ChatModel.findById(id);
  }

  async findByParticipante(usuario_id) {
    return ChatModel.find({ participantes: usuario_id });
  }

  async findByPublicacion(publicacion_id) {
    return ChatModel.find({ publicacion_id });
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

  async marcarMensajesLeidos(chatId, usuarioId) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) return null;

    chat.mensajes.forEach((msg) => {
      if (msg.remitente_id.toString() !== usuarioId.toString()) {
        msg.leido = true;
      }
    });

    chat.ultima_actualizacion = Date.now();
    await chat.save();
    return chat.mensajes;
  }

}

module.exports = ChatRepository;