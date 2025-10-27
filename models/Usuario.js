const mongoose = require("mongoose");

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