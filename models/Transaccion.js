const mongoose = require("mongoose");

const CalificacionSchema = new mongoose.Schema({
  puntuacion: { type: Number, min: 1, max: 5, required: true },
  comentario: { type: String },
  fecha: { type: Date, default: Date.now }
});

const Transaccion = new mongoose.Schema({
  comprador_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  vendedor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  publicacion_id: { type: mongoose.Schema.Types.ObjectId, ref: "Publicacion", required: true },
  tipo_publicacion: { type: String, enum: ["producto", "servicio"], required: true },
  fecha_transaccion: { type: Date, default: Date.now },
  calificaciones: {
    comprador_a_vendedor: { type: CalificacionSchema },
    vendedor_a_comprador: { type: CalificacionSchema }
  },
  estado: { type: String, enum: ["pendiente", "completada", "cancelada"], default: "pendiente" },
  monto: { type: Number, required: true }
});

const TransaccionModel = mongoose.model("Transaccion", Transaccion);
module.exports = { TransaccionModel };