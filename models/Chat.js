const mongoose = require("mongoose");

const MensajeSchema = new mongoose.Schema({
  remitente_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  contenido: { type: String, required: true },
  fecha_envio: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false },
  tipo: { type: String, default: "texto" }
});

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