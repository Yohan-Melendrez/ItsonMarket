// validators/publicacionValidator.js
const { body, param, query } = require('express-validator');

const TIPOS = ['producto', 'servicio'];
const DIGITS = /^\d{5,20}$/; // ajusta longitud si tu padrón lo requiere

// El _id de la publicación SÍ es ObjectId:
const idParam = [ param('id').isMongoId().withMessage('id inválido') ];

// El vendedorId NO es ObjectId: es una cadena numérica
const vendedorParam = [
  param('vendedorId')
    .isString().withMessage('vendedorId requerido')
    .matches(DIGITS).withMessage('vendedorId inválido (solo dígitos)'),
];

exports.create = [
  body('tipo_publicacion').isIn(TIPOS).withMessage('tipo_publicacion inválido'),
  body('vendedor_id')
    .isString().withMessage('vendedor_id requerido')
    .matches(DIGITS).withMessage('vendedor_id inválido (solo dígitos)'),
  body('titulo').isString().notEmpty(),
  body('descripcion').isString().notEmpty(),
  body('categoria').isString().notEmpty(),
  body('precio').isFloat({ min: 0 }).withMessage('precio inválido'),
  body('visible').optional().isBoolean(),
  body('estado').optional().isString(),
];

exports.update = [
  ...idParam,
  body('tipo_publicacion').optional().isIn(TIPOS),
  body('vendedor_id').optional()
    .isString().matches(DIGITS).withMessage('vendedor_id inválido (solo dígitos)'),
  body('titulo').optional().isString().notEmpty(),
  body('descripcion').optional().isString().notEmpty(),
  body('categoria').optional().isString().notEmpty(),
  body('precio').optional().isFloat({ min: 0 }),
  body('visible').optional().isBoolean(),
  body('estado').optional().isString(),
];

exports.getById = [ ...idParam ];

exports.list = [
  query('categoria').optional().isString(),
  query('vendedor_id').optional()
    .isString().matches(DIGITS).withMessage('vendedor_id inválido (solo dígitos)'),
  query('titulo').optional().isString(),
  query('tipo_publicacion').optional().isIn(TIPOS),
  query('precioMin').optional().isFloat({ min: 0 }),
  query('precioMax').optional().isFloat({ min: 0 }),
  query('fechaDesde').optional().isISO8601().toDate(),
  query('fechaHasta').optional().isISO8601().toDate(),
  query('sort').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('visible').optional().isBoolean().toBoolean(),
];

exports.searchByTitle = [
  query('q').isString().notEmpty().withMessage('q requerido'),
  query('categoria').optional().isString(),
  query('tipo_publicacion').optional().isIn(TIPOS),
  query('precioMin').optional().isFloat({ min: 0 }),
  query('precioMax').optional().isFloat({ min: 0 }),
  query('sort').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

exports.listBySeller = [
  ...vendedorParam,
  query('sort').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('visible').optional().isBoolean().toBoolean(),
];

exports.setVisibility = [
  ...idParam,
  body('visible').isBoolean().withMessage('visible debe ser boolean'),
];

exports.setStatus = [
  ...idParam,
  body('estado').isString().notEmpty(),
];

exports.incrementViews = [
  ...idParam,
  body('inc').optional().isInt({ min: 1 }).toInt(),
];

exports.remove = [ ...idParam ];