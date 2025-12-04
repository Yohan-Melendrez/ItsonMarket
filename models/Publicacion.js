const mongoose = require("mongoose");

/**
 * @schema PublicacionSchema
 * @desc Esquema para las publicaciones de productos y servicios en ItsonMarket
 * @property {String} tipo_publicacion - Tipo de publicación: "producto" o "servicio"
 * @property {String} vendedor_id - ID del usuario vendedor que crea la publicación
 * @property {String} titulo - Título descriptivo de la publicación
 * @property {String} descripcion - Descripción detallada del producto o servicio
 * @property {String} categoria - Categoría a la que pertenece la publicación
 * @property {Number} precio - Precio del producto o tarifa del servicio
 * @property {String} estado - Estado actual de la publicación (disponible, vendido, etc.)
 * @property {Boolean} visible - Indica si la publicación es visible para otros usuarios
 * @property {Number} vistas - Contador de visualizaciones de la publicación
 * @property {Date} fecha_publicacion - Fecha de creación de la publicación
 * @property {Date} fecha_actualizacion - Fecha de última actualización
 * @property {Object} detalles - Objeto con información adicional específica
 * @property {String} detalles.marca - Marca del producto (opcional)
 * @property {String} detalles.edicion - Edición del producto (opcional)
 * @property {Array<String>} detalles.imagenes - Array de URLs de imágenes
 * @property {Number} detalles.tarifa - Tarifa del servicio (opcional)
 * @property {String} detalles.duracion - Duración del servicio (opcional)
 * @property {String} detalles.unidad_tarifa - Unidad de la tarifa (opcional)
 * @property {String} detalles.modalidad - Modalidad del servicio (opcional)
 * @property {String} detalles.experiencia - Experiencia requerida (opcional)
 */
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
