// controllers/transaccionController.js
const TransaccionService = require('../services/TransaccionService');
const service = new TransaccionService();

/**
 * @route POST /api/transacciones/marcar-venta
 * @desc Marcar una venta - el vendedor registra la transacción
 * @access Private
 */
exports.marcarVenta = async (req, res, next) => {
  try {
    const vendedor_id = req.user.id || req.user._id;
    const { publicacion_id, comprador_itson_id } = req.body;

    const resultado = await service.marcarVenta({
      publicacion_id,
      comprador_itson_id,
      vendedor_id
    });

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      ...resultado
    });
  } catch (err) { next(err); }
};

/**
 * @route PATCH /api/transacciones/:id/calificar
 * @desc Calificar una transacción - comprador califica al vendedor
 * @access Private
 */
exports.calificar = async (req, res, next) => {
  try {
    const compradorId = req.user.id || req.user._id;
    const { puntuacion, comentario } = req.body;
    const transaccionId = req.params.id;

    const transaccion = await service.calificar(transaccionId, compradorId, {
      puntuacion,
      comentario
    });

    res.status(200).json({
      mensaje: 'Calificación registrada correctamente',
      transaccion
    });
  } catch (err) { next(err); }
};

/**
 * @route GET /api/transacciones/mis-transacciones
 * @desc Obtener todas las transacciones del usuario actual
 * @access Private
 */
exports.misTransacciones = async (req, res, next) => {
  try {
    const usuarioId = req.user.id || req.user._id;
    const itsonId = req.user.itson_id;

    const transacciones = await service.obtenerTransaccionesUsuario(usuarioId, itsonId);

    res.status(200).json({
      mensaje: 'Transacciones obtenidas correctamente',
      cantidad: transacciones.length,
      data: transacciones
    });
  } catch (err) { next(err); }
};

/**
 * @route GET /api/transacciones/pendientes-calificar
 * @desc Obtener transacciones pendientes de calificar del usuario
 * @access Private
 */
exports.pendientesCalificar = async (req, res, next) => {
  try {
    const compradorId = req.user.id || req.user._id;
    const pendientes = await service.repo.findPendientesCalificar(compradorId);

    res.status(200).json({
      cantidad: pendientes.length,
      data: pendientes
    });
  } catch (err) { next(err); }
};

/**
 * @route POST /api/transacciones
 * @desc Crear una nueva transacción
 * @access Private
 */
exports.crear = async (req, res, next) => {
  try {
    const trx = await service.crear(req.body);
    res.status(201).json({ mensaje: 'Transacción creada correctamente', transaccion: trx });
  } catch (err) { next(err); }
};

/**
 * @route GET /api/transacciones
 * @desc Obtener lista de transacciones con filtros
 * @access Private
 */
exports.listar = async (req, res, next) => {
  try {
    const items = await service.listar({
      comprador_id: req.query.comprador_id,
      vendedor_id: req.query.vendedor_id,
      estado: req.query.estado
    });
    res.status(200).json({
      mensaje: 'Transacciones obtenidas correctamente',
      cantidad: items.length,
      data: items
    });
  } catch (err) { next(err); }
};

/**
 * @route GET /api/transacciones/:id
 * @desc Obtener una transacción por ID
 * @access Private
 */
exports.obtenerPorId = async (req, res, next) => {
  try {
    const item = await service.obtenerPorId(req.params.id);
    if (!item) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.status(200).json(item);
  } catch (err) { next(err); }
};

/**
 * @route PUT /api/transacciones/:id
 * @desc Actualizar una transacción existente
 * @access Private
 */
exports.actualizar = async (req, res, next) => {
  try {
    const item = await service.actualizar(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: 'Transacción no encontrada para actualizar' });
    res.status(200).json({ mensaje: 'Transacción actualizada correctamente', transaccion: item });
  } catch (err) { next(err); }
};

/**
 * @route DELETE /api/transacciones/:id
 * @desc Eliminar una transacción
 * @access Private
 */
exports.eliminar = async (req, res, next) => {
  try {
    const item = await service.eliminar(req.params.id);
    if (!item) return res.status(404).json({ error: 'Transacción no encontrada para eliminar' });
    res.status(200).json({ mensaje: 'Transacción eliminada correctamente' });
  } catch (err) { next(err); }
};
