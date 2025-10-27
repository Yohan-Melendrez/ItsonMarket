const { body } = require('express-validator');
const { UsuarioModel } = require('../models/Usuario');
const { PublicacionModel } = require('../models/Publicacion');

const crearChatValidator = [
  // Validar participantes
  body('participantes')
    .isArray({ min: 2 })
    .withMessage('Debe incluir al menos dos participantes')
    .custom(async (participantes) => {
      const usuarios = await UsuarioModel.find({ _id: { $in: participantes } });
      if (usuarios.length !== participantes.length) {
        throw new Error('Uno o más participantes no existen');
      }
      return true;
    }),

  // Validar publicacion
  body('publicacion_id')
    .notEmpty()
    .withMessage('El campo publicacion_id es obligatorio')
    .isMongoId()
    .withMessage('El ID de publicación debe ser válido')
    .custom(async (id) => {
      const pub = await PublicacionModel.findById(id);
      if (!pub) throw new Error('La publicación especificada no existe');
      return true;
    }),

  // Validar mensajes opcionales
  body('mensajes')
    .optional()
    .isArray()
    .withMessage('El campo mensajes debe ser un arreglo'),
];

const actualizarChatValidator = [
  body('estado')
    .optional()
    .isIn(['activo', 'cerrado'])
    .withMessage('El estado debe ser activo o cerrado'),
];

// Validador para envío de mensajes
const enviarMensajeValidator = [
  body('contenido')
    .notEmpty()
    .withMessage('El contenido del mensaje es obligatorio')
    .isString()
    .withMessage('El contenido debe ser texto'),
  body('tipo')
    .optional()
    .isIn(['texto', 'imagen', 'archivo'])
    .withMessage('El tipo de mensaje no es válido'),
  body('remitente_id')
    .optional()
    .isMongoId()
    .withMessage('El ID del remitente no es válido'),
];

module.exports = {
  crearChatValidator,
  actualizarChatValidator,
  enviarMensajeValidator,
};