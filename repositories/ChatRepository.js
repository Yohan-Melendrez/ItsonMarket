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
}

module.exports = ChatRepository;