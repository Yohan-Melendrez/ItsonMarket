const { body, param, query } = require('express-validator');

const TIPOS = ['producto', 'servicio'];

const idParam = [ param('id').isMongoId().withMessage('id inválido') ];

const vendedorParam = [
  param('vendedorId')
    .isString().withMessage('vendedorId requerido'),
];

/**
 * @validator create
 * @desc Valida los datos requeridos para crear una nueva publicación
 * @field {String} tipo_publicacion - Tipo de publicación (producto o servicio)
 * @field {String} vendedor_id - ID del vendedor
 * @field {String} titulo - Título de la publicación
 * @field {String} descripcion - Descripción detallada
 * @field {String} categoria - Categoría de la publicación
 * @field {Number} precio - Precio o tarifa (mínimo 0)
 * @field {Boolean} visible - Visibilidad (opcional)
 * @field {String} estado - Estado de la publicación (opcional)
 * @field {Object} detalles - Detalles adicionales (opcional)
 * @access Private
 */
exports.create = [
  body('tipo_publicacion').isIn(TIPOS).withMessage('tipo_publicacion inválido'),
  body('vendedor_id')
    .isString().withMessage('vendedor_id requerido'),
  body('titulo').isString().notEmpty().withMessage('titulo requerido'),
  body('descripcion').isString().notEmpty().withMessage('descripcion requerida'),
  body('categoria').isString().notEmpty().withMessage('categoria requerida'),
  body('precio').isFloat({ min: 0 }).withMessage('precio inválido'),
  body('visible').optional().isBoolean(),
  body('estado').optional().isString(),
  body('detalles').optional().isObject(),
  body('detalles.imagenes').optional().isArray(),
];

/**
 * @validator update
 * @desc Valida los datos para actualizar una publicación existente
 * @field {String} id - ID de la publicación (en path)
 * @field {*} todos - Todos los campos son opcionales
 * @access Private
 */
exports.update = [
  ...idParam,
  body('tipo_publicacion').optional().isIn(TIPOS),
  body('vendedor_id').optional().isString(),
  body('titulo').optional().isString().notEmpty(),
  body('descripcion').optional().isString().notEmpty(),
  body('categoria').optional().isString().notEmpty(),
  body('precio').optional().isFloat({ min: 0 }),
  body('visible').optional().isBoolean(),
  body('estado').optional().isString(),
  body('detalles').optional().isObject(),
  body('detalles.imagenes').optional().isArray(),
];

/**
 * @validator getById
 * @desc Valida el ID de la publicación para obtener por ID
 * @field {String} id - ID válido de MongoDB
 * @access Private
 */
exports.getById = [ ...idParam ];

/**
 * @validator list
 * @desc Valida parámetros de filtro y paginación para listar publicaciones
 * @field {String} categoria - Categoría de filtro (opcional)
 * @field {String} vendedor_id - ID del vendedor (opcional)
 * @field {String} titulo - Término de búsqueda en título (opcional)
 * @field {String} tipo_publicacion - Tipo de publicación (opcional)
 * @field {Number} precioMin - Precio mínimo (opcional)
 * @field {Number} precioMax - Precio máximo (opcional)
 * @field {Date} fechaDesde - Fecha inicial (opcional, ISO8601)
 * @field {Date} fechaHasta - Fecha final (opcional, ISO8601)
 * @field {String} sort - Campo de ordenamiento (opcional)
 * @field {Number} page - Número de página (opcional, mínimo 1)
 * @field {Number} limit - Límite por página (opcional, máximo 100)
 * @field {Boolean} visible - Filtro de visibilidad (opcional)
 * @access Private
 */
exports.list = [
  query('categoria').optional().isString(),
  query('vendedor_id').optional().isString(),
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

/**
 * @validator searchByTitle
 * @desc Valida parámetros para búsqueda por título
 * @field {String} q - Término de búsqueda (obligatorio)
 * @field {String} categoria - Categoría de filtro (opcional)
 * @field {String} tipo_publicacion - Tipo de publicación (opcional)
 * @field {Number} precioMin - Precio mínimo (opcional)
 * @field {Number} precioMax - Precio máximo (opcional)
 * @field {String} sort - Campo de ordenamiento (opcional)
 * @field {Number} page - Número de página (opcional)
 * @field {Number} limit - Límite por página (opcional)
 * @access Private
 */
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

/**
 * @validator listBySeller
 * @desc Valida parámetros para listar publicaciones de un vendedor
 * @field {String} vendedorId - ID del vendedor en path (obligatorio)
 * @field {String} sort - Campo de ordenamiento (opcional)
 * @field {Number} page - Número de página (opcional)
 * @field {Number} limit - Límite por página (opcional)
 * @field {Boolean} visible - Filtro de visibilidad (opcional)
 * @access Private
 */
exports.listBySeller = [
  ...vendedorParam,
  query('sort').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('visible').optional().isBoolean().toBoolean(),
];

/**
 * @validator setVisibility
 * @desc Valida datos para cambiar la visibilidad de una publicación
 * @field {String} id - ID de la publicación (en path)
 * @field {Boolean} visible - Nuevo estado de visibilidad
 * @access Private
 */
exports.setVisibility = [
  ...idParam,
  body('visible').isBoolean().withMessage('visible debe ser boolean'),
];

/**
 * @validator setStatus
 * @desc Valida datos para cambiar el estado de una publicación
 * @field {String} id - ID de la publicación (en path)
 * @field {String} estado - Nuevo estado de la publicación
 * @access Private
 */
exports.setStatus = [
  ...idParam,
  body('estado').isString().notEmpty(),
];

/**
 * @validator incrementViews
 * @desc Valida datos para incrementar visualizaciones de una publicación
 * @field {String} id - ID de la publicación (en path)
 * @field {Number} inc - Cantidad a incrementar (opcional, mínimo 1)
 * @access Private
 */
exports.incrementViews = [
  ...idParam,
  body('inc').optional().isInt({ min: 1 }).toInt(),
];

/**
 * @validator remove
 * @desc Valida el ID para eliminar una publicación
 * @field {String} id - ID de la publicación (en path)
 * @access Private
 */
exports.remove = [ ...idParam ];