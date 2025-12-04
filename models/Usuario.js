const mongoose = require("mongoose");

/**
 * @schema UsuarioSchema
 * @desc Esquema para los usuarios registrados en ItsonMarket
 * @property {String} itson_id - ID institucional único del usuario ITSON
 * @property {String} nombre - Nombre completo del usuario
 * @property {String} correo_institucional - Correo institucional del usuario
 * @property {String} carrera - Carrera o programa académico del usuario
 * @property {String} telefono - Número telefónico de contacto
 * @property {String} contrasena - Contraseña hasheada del usuario
 * @property {Object} reputacion - Objeto con estadísticas de reputación del usuario
 * @property {Number} reputacion.puntuacion_promedio - Puntuación promedio recibida en transacciones
 * @property {Number} reputacion.total_transacciones - Total de transacciones completadas
 * @property {String} foto - URL de la foto de perfil del usuario
 */
const UsuarioSchema = new mongoose.Schema({
    itson_id: String,
    nombre: String,
    correo_institucional: String,
    carrera: String,
    telefono: String,
    contrasena:String,
    
    reputacion: {
        puntuacion_promedio: {
            type: Number,
            default: 0.0
        },
        total_transacciones: {
            type: Number,
            default: 0
        }
    },

    foto:String
})

const UsuarioModel = mongoose.model('Usuario', UsuarioSchema)

module.exports = { UsuarioModel }