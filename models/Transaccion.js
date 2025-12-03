const mongoose = require("mongoose");

const CalificacionSchema = new mongoose.Schema({
  puntuacion: { type: Number, min: 1, max: 5, required: true },
  comentario: { type: String },
  fecha: { type: Date, default: Date.now }
});

const Transaccion = new mongoose.Schema({
  // comprador_id es opcional: si el comprador no está registrado, usamos comprador_itson_id
  comprador_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: false },
  // ITSON ID del comprador (siempre se guarda, para vincular cuando se registre)
  comprador_itson_id: { type: String, required: true },
  vendedor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  publicacion_id: { type: mongoose.Schema.Types.ObjectId, ref: "Publicacion", required: true },
  tipo_publicacion: { type: String, enum: ["producto", "servicio"], required: true },
  fecha_transaccion: { type: Date, default: Date.now },
  calificacion: { type: CalificacionSchema }, // Calificación del comprador al vendedor
  estado: { type: String, enum: ["pendiente", "completada", "cancelada"], default: "completada" },
  monto: { type: Number, required: true },
  // Para saber si el comprador ya fue notificado para calificar
  notificacion_enviada: { type: Boolean, default: false }
});

const TransaccionModel = mongoose.model("Transaccion", Transaccion);
module.exports = { TransaccionModel };