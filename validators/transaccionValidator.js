// validators/transaccionValidator.js
const { body, param } = require('express-validator');

const estadoPermitido = ['pendiente', 'completada', 'cancelada'];
const tiposPermitidos = ['producto', 'servicio'];

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

const actualizarValidator = [
  param('id').isMongoId().withMessage('ID inválido'),
  body('tipo_publicacion').optional().isIn(tiposPermitidos).withMessage('tipo_publicacion inválido'),
  body('monto').optional().isFloat({ gt: 0 }).withMessage('monto debe ser > 0'),
  body('estado').optional().isIn(estadoPermitido).withMessage('estado inválido'),
  body('calificaciones.comprador_a_vendedor.puntuacion').optional().isInt({ min:1, max:5 }).withMessage('puntuacion 1..5'),
  body('calificaciones.vendedor_a_comprador.puntuacion').optional().isInt({ min:1, max:5 }).withMessage('puntuacion 1..5'),
];

module.exports = { crearValidator, actualizarValidator };
