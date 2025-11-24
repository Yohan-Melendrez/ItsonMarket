const mongoose = require("mongoose");

const PublicacionSchema = new mongoose.Schema({
  tipo_publicacion: { type: String, enum: ["producto", "servicio"], required: true },
  vendedor_id: { type: String, required: true },
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  categoria: { type: String, required: true },
  precio: { type: Number, required: true },
  estado: { type: String, default: "disponible" },
  visible: { type: Boolean, default: true },
  vistas: { type: Number, default: 0 },
  fecha_publicacion: { type: Date, default: Date.now },
  fecha_actualizacion: { type: Date, default: Date.now },
  detalles: {
    marca: String,
    edicion: String,
    imagenes: [String],
    tarifa: Number,
    duracion: String,
    unidad_tarifa: String,
    modalidad: String,
    experiencia: String
  }
});

const PublicacionModel = mongoose.model("Publicacion", PublicacionSchema);
module.exports = { PublicacionModel };
