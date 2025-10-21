const TransaccionRepository = require('../repositories/TransaccionRepository');
const repo = new TransaccionRepository();

/**
 * @route GET /api/transacciones
 * @desc Obtener todas las transacciones
 */
exports.obtenerTransacciones = async (req, res) => {
  try {
    const transacciones = await repo.obtenerTransacciones();
    res.status(200).json(transacciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @route POST /api/transacciones
 * @desc Crear una nueva transacción
 */
exports.crearTransaccion = async (req, res) => {
  try {
    const nueva = await repo.crearTransaccion(req.body);
    res.status(201).json(nueva); // Devuelve la entidad creada
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @route GET /api/transacciones/:id
 * @desc Obtener una transacción por ID
 */
exports.obtenerTransaccionPorId = async (req, res) => {
  try {
    const transaccion = await repo.obtenerTransaccionPorId(req.params.id);
    if (!transaccion) return res.status(404).json({ error: "Transacción no encontrada" });
    res.status(200).json(transaccion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @route PUT /api/transacciones/:id
 * @desc Actualizar una transacción
 */
exports.actualizarTransaccion = async (req, res) => {
  try {
    const actualizada = await repo.actualizarTransaccion(req.params.id, req.body);
    if (!actualizada) return res.status(404).json({ error: "Transacción no encontrada" });
    res.status(200).json(actualizada); // Devuelve la entidad modificada
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @route DELETE /api/transacciones/:id
 * @desc Eliminar una transacción
 */
exports.eliminarTransaccion = async (req, res) => {
  try {
    const eliminada = await repo.eliminarTransaccion(req.params.id);
    if (!eliminada) return res.status(404).json({ error: "Transacción no encontrada" });
    res.status(204).send(); // 204 No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};