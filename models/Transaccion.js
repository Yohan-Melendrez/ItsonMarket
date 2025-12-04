const mongoose = require("mongoose");

/**
 * @schema CalificacionSchema
 * @desc Esquema para las calificaciones de transacciones
 * @property {Number} puntuacion - Puntuación de 1 a 5 estrellas
 * @property {String} comentario - Comentario opcional sobre la transacción
 * @property {Date} fecha - Fecha en que se registró la calificación
 */
const CalificacionSchema = new mongoose.Schema({
  puntuacion: { type: Number, min: 1, max: 5, required: true },
  comentario: { type: String },
  fecha: { type: Date, default: Date.now }
});

/**
 * @schema TransaccionSchema
 * @desc Esquema para registrar transacciones entre compradores y vendedores
 * @property {ObjectId} comprador_id - ID del usuario comprador (opcional)
 * @property {String} comprador_itson_id - ITSON ID del comprador (requerido)
 * @property {ObjectId} vendedor_id - ID del usuario vendedor
 * @property {ObjectId} publicacion_id - ID de la publicación transaccionada
 * @property {String} tipo_publicacion - Tipo: "producto" o "servicio"
 * @property {Date} fecha_transaccion - Fecha de realización de la transacción
 * @property {Object} calificacion - Objeto con la calificación del comprador
 * @property {String} estado - Estado de la transacción (pendiente, completada, cancelada)
 * @property {Number} monto - Monto total de la transacción
 * @property {Boolean} notificacion_enviada - Indica si se envió notificación al usuario
 */
const Transaccion = new mongoose.Schema({
  comprador_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: false },
  comprador_itson_id: { type: String, required: true },
  vendedor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  publicacion_id: { type: mongoose.Schema.Types.ObjectId, ref: "Publicacion", required: true },
  tipo_publicacion: { type: String, enum: ["producto", "servicio"], required: true },
  fecha_transaccion: { type: Date, default: Date.now },
  calificacion: { type: CalificacionSchema }, 
  estado: { type: String, enum: ["pendiente", "completada", "cancelada"], default: "completada" },
  monto: { type: Number, required: true },
  notificacion_enviada: { type: Boolean, default: false }
});

const TransaccionModel = mongoose.model("Transaccion", Transaccion);
module.exports = { TransaccionModel };