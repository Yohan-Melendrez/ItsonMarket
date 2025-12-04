const mongoose = require("mongoose");

/**
 * @schema MensajeSchema
 * @desc Esquema para los mensajes dentro de un chat
 * @property {ObjectId} remitente_id - ID del usuario que envía el mensaje
 * @property {String} contenido - Contenido de texto del mensaje
 * @property {Date} fecha_envio - Fecha y hora de envío del mensaje
 * @property {Boolean} leido - Indica si el mensaje ha sido leído
 * @property {String} tipo - Tipo de mensaje (ej: texto, imagen)
 */
const MensajeSchema = new mongoose.Schema({
  remitente_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  contenido: { type: String, required: true },
  fecha_envio: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false },
  tipo: { type: String, default: "texto" }
});

/**
 * @schema ChatSchema
 * @desc Esquema principal para los chats entre usuarios sobre publicaciones
 * @property {Array<ObjectId>} participantes - IDs de los usuarios participantes en el chat
 * @property {ObjectId} publicacion_id - ID de la publicación asociada al chat
 * @property {Date} fecha_creacion - Fecha de creación del chat
 * @property {Date} ultima_actualizacion - Fecha de la última actividad en el chat
 * @property {Array<Object>} mensajes - Array de mensajes del chat
 * @property {String} estado - Estado del chat (activo o cerrado)
 */
const Chat = new mongoose.Schema({
  participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true }],
  publicacion_id: { type: mongoose.Schema.Types.ObjectId, ref: "Publicacion", required: true },
  fecha_creacion: { type: Date, default: Date.now },
  ultima_actualizacion: { type: Date, default: Date.now },
  mensajes: [MensajeSchema],
  estado: { type: String, enum: ["activo", "cerrado"], default: "activo" }
});

const ChatModel = mongoose.model("Chat", Chat);
module.exports = { ChatModel };