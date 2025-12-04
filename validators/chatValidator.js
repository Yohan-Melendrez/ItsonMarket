const { body } = require('express-validator');
const { UsuarioModel } = require('../models/Usuario');
const { PublicacionModel } = require('../models/Publicacion');

/**
 * @validator crearChatValidator
 * @desc Valida los datos requeridos para crear un nuevo chat
 * @field {Array} participantes - Mínimo 2 participantes que deben existir en la base de datos
 * @field {String} publicacion_id - ID válido de MongoDB de una publicación existente
 * @field {Array} mensajes - Array opcional de mensajes iniciales
 * @access Private
 */
const crearChatValidator = [
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

  body('mensajes')
    .optional()
    .isArray()
    .withMessage('El campo mensajes debe ser un arreglo'),
];

/**
 * @validator actualizarChatValidator
 * @desc Valida los datos permitidos para actualizar un chat
 * @field {String} estado - Estado del chat (activo o cerrado)
 * @access Private
 */
const actualizarChatValidator = [
  body('estado')
    .optional()
    .isIn(['activo', 'cerrado'])
    .withMessage('El estado debe ser activo o cerrado'),
];

/**
 * @validator enviarMensajeValidator
 * @desc Valida los datos requeridos para enviar un mensaje en un chat
 * @field {String} contenido - Contenido del mensaje (obligatorio y debe ser texto)
 * @field {String} tipo - Tipo de mensaje (texto, imagen o archivo, opcional)
 * @field {String} remitente_id - ID válido del usuario que envía el mensaje (opcional)
 * @access Private
 */
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