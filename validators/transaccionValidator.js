// validators/transaccionValidator.js
const { body, param } = require('express-validator');

const estadoPermitido = ['pendiente', 'completada', 'cancelada'];
const tiposPermitidos = ['producto', 'servicio'];

/**
 * @validator crearValidator
 * @desc Valida los datos requeridos para crear una nueva transacción
 * @field {String} comprador_id - ID válido de MongoDB del comprador
 * @field {String} vendedor_id - ID válido de MongoDB del vendedor
 * @field {String} publicacion_id - ID válido de MongoDB de la publicación
 * @field {String} tipo_publicacion - Tipo de publicación (producto o servicio)
 * @field {Number} monto - Monto de la transacción (debe ser mayor a 0)
 * @field {String} estado - Estado de la transacción (opcional, pendiente/completada/cancelada)
 * @field {Number} calificaciones.comprador_a_vendedor.puntuacion - Puntuación 1-5 (opcional)
 * @field {Number} calificaciones.vendedor_a_comprador.puntuacion - Puntuación 1-5 (opcional)
 * @access Private
 */
const crearValidator = [
  body('comprador_id').isMongoId().withMessage('comprador_id inválido'),
  body('vendedor_id').isMongoId().withMessage('vendedor_id inválido'),
  body('publicacion_id').isMongoId().withMessage('publicacion_id inválido'),
  body('tipo_publicacion').isIn(tiposPermitidos).withMessage('tipo_publicacion inválido'),
  body('monto').isFloat({ gt: 0 }).withMessage('monto debe ser > 0'),
  body('estado').optional().isIn(estadoPermitido).withMessage('estado inválido'),
  body('calificaciones.comprador_a_vendedor.puntuacion').optional().isInt({ min:1, max:5 }).withMessage('puntuacion 1..5'),
  body('calificaciones.vendedor_a_comprador.puntuacion').optional().isInt({ min:1, max:5 }).withMessage('puntuacion 1..5'),
];

/**
 * @validator actualizarValidator
 * @desc Valida los datos para actualizar una transacción existente
 * @field {String} id - ID válido de MongoDB de la transacción (en path)
 * @field {String} tipo_publicacion - Tipo de publicación (opcional)
 * @field {Number} monto - Monto de la transacción (opcional, mayor a 0)
 * @field {String} estado - Estado de la transacción (opcional)
 * @field {Number} calificaciones.comprador_a_vendedor.puntuacion - Puntuación 1-5 (opcional)
 * @field {Number} calificaciones.vendedor_a_comprador.puntuacion - Puntuación 1-5 (opcional)
 * @access Private
 */
const actualizarValidator = [
  param('id').isMongoId().withMessage('ID inválido'),
  body('tipo_publicacion').optional().isIn(tiposPermitidos).withMessage('tipo_publicacion inválido'),
  body('monto').optional().isFloat({ gt: 0 }).withMessage('monto debe ser > 0'),
  body('estado').optional().isIn(estadoPermitido).withMessage('estado inválido'),
  body('calificaciones.comprador_a_vendedor.puntuacion').optional().isInt({ min:1, max:5 }).withMessage('puntuacion 1..5'),
  body('calificaciones.vendedor_a_comprador.puntuacion').optional().isInt({ min:1, max:5 }).withMessage('puntuacion 1..5'),
];

module.exports = { crearValidator, actualizarValidator };
