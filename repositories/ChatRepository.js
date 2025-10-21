const chatsDummy = require('../scripts/chatDummy.json');
let nextId = 6;

class ChatRepository {

  async insert(chatData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const nuevoChat = {
      id: nextId.toString(),
      ...chatData,
      fecha_creacion: new Date().toISOString(),
      ultima_actualizacion: new Date().toISOString(),
      estado: "activo",
      mensajes: chatData.mensajes || []
    };

    chatsDummy.push(nuevoChat);
    nextId++;
    return nuevoChat;
  }

  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return chatsDummy;
  }

  async findById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return chatsDummy.find(chat => chat.id === id) || null;
  }

  async findByParticipante(usuario_id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return chatsDummy.filter(chat => 
      chat.participantes.includes(usuario_id)
    );
  }

  async findByPublicacion(publicacion_id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return chatsDummy.filter(chat => 
      chat.publicacion_id === publicacion_id
    );
  }

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = chatsDummy.findIndex(chat => chat.id === id);
    
    if (index === -1) {
      return null;
    }

    const chatActualizado = {
      ...chatsDummy[index],
      ...updateData,
      ultima_actualizacion: new Date().toISOString()
    };

    chatsDummy[index] = chatActualizado;
    return chatActualizado;
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = chatsDummy.findIndex(chat => chat.id === id);
    
    if (index === -1) {
      return null;
    }

    // Eliminar físicamente del array
    const chatEliminado = chatsDummy.splice(index, 1)[0];
    return chatEliminado;
  }
}

module.exports = ChatRepository;