const TransaccionService = require('../services/TransaccionService');
const service = new TransaccionService();

exports.crear = async (req, res, next) => {
  try {
    const trx = await service.crear(req.body);
    res.status(201).json({ mensaje: 'Transacción creada correctamente', transaccion: trx });
  } catch (err) { next(err); }
};

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

exports.obtenerPorId = async (req, res, next) => {
  try {
    const item = await service.obtenerPorId(req.params.id);
    if (!item) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.status(200).json(item);
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const item = await service.actualizar(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: 'Transacción no encontrada para actualizar' });
    res.status(200).json({ mensaje: 'Transacción actualizada correctamente', transaccion: item });
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    const item = await service.eliminar(req.params.id);
    if (!item) return res.status(404).json({ error: 'Transacción no encontrada para eliminar' });
    res.status(200).json({ mensaje: 'Transacción eliminada correctamente' });
  } catch (err) { next(err); }
};
