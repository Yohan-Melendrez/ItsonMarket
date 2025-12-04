// controllers/publicacionController.js
const PublicacionService = require('../services/PublicacionService');
const svc = new PublicacionService();


const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


/**
 * @route POST /api/publicaciones
 * @desc Crear una nueva publicación
 * @access Private
 */
exports.create = wrap(async (req, res) => {
  const pub = await svc.create(req.body);
  res.status(201).json(pub);
});

/**
 * @route GET /api/publicaciones/:id
 * @desc Obtener una publicación por ID
 * @access Public
 */
exports.getById = wrap(async (req, res) => {
  const pub = await svc.getById(req.params.id);
  res.status(200).json(pub);
});

/**
 * @route GET /api/publicaciones
 * @desc Obtener lista de publicaciones con filtros y paginación
 * @access Public
 */
exports.list = wrap(async (req, res) => {
  const data = await svc.list({
    categoria: req.query.categoria,
    vendedor_id: req.query.vendedor_id,
    titulo: req.query.titulo,
    tipo_publicacion: req.query.tipo_publicacion,
    precioMin: req.query.precioMin,
    precioMax: req.query.precioMax,
    fechaDesde: req.query.fechaDesde,
    fechaHasta: req.query.fechaHasta,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
    visible: req.query.visible, 
  });
  res.status(200).json(data);
});

/**
 * @route GET /api/publicaciones/vendedor/:vendedorId
 * @desc Obtener todas las publicaciones de un vendedor específico
 * @access Public
 */
exports.listBySeller = wrap(async (req, res) => {
  const data = await svc.listBySeller(req.params.vendedorId, {
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
    visible: req.query.visible,
  });
  res.status(200).json(data);
});

/**
 * @route GET /api/publicaciones/search
 * @desc Buscar publicaciones por título con filtros opcionales
 * @access Public
 */
exports.searchByTitle = wrap(async (req, res) => {
  const data = await svc.searchByTitle(req.query.q, {
    categoria: req.query.categoria,
    tipo_publicacion: req.query.tipo_publicacion,
    precioMin: req.query.precioMin,
    precioMax: req.query.precioMax,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
  });
  res.status(200).json(data);
});

/**
 * @route PUT /api/publicaciones/:id
 * @desc Actualizar una publicación existente
 * @access Private
 */
exports.update = wrap(async (req, res) => {
  const upd = await svc.update(req.params.id, req.body);
  res.status(200).json(upd);
});

/**
 * @route PATCH /api/publicaciones/:id/visibility
 * @desc Cambiar la visibilidad de una publicación
 * @access Private
 */
exports.setVisibility = wrap(async (req, res) => {
  const upd = await svc.setVisibility(req.params.id, req.body.visible);
  res.status(200).json(upd);
});

/**
 * @route PATCH /api/publicaciones/:id/status
 * @desc Cambiar el estado de una publicación
 * @access Private
 */
exports.setStatus = wrap(async (req, res) => {
  const upd = await svc.setStatus(req.params.id, req.body.estado);
  res.status(200).json(upd);
});

/**
 * @route PATCH /api/publicaciones/:id/views
 * @desc Incrementar el contador de visualizaciones de una publicación
 * @access Public
 */
exports.incrementViews = wrap(async (req, res) => {
  const upd = await svc.incrementViews(req.params.id, req.body.inc ?? 1);
  res.status(200).json(upd);
});

/**
 * @route DELETE /api/publicaciones/:id
 * @desc Eliminar una publicación
 * @access Private
 */
exports.remove = wrap(async (req, res) => {
  await svc.delete(req.params.id);
  res.status(204).send();
});
