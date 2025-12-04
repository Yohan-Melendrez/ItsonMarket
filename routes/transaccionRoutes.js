// routes/transaccionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { crearValidator, actualizarValidator } = require('../validators/transaccionValidator');
const { handleValidationErrors } = require('../middleware/validation');
const ctrl = require('../controllers/transaccionController');

router.use(auth);

/**
 * @route POST /api/transacciones/marcar-venta
 * @desc Marcar una venta - el vendedor registra la transacción
 * @access Private
 */
router.post('/marcar-venta', ctrl.marcarVenta);

/**
 * @route POST /api/transacciones/:id/calificar
 * @desc Calificar una transacción - comprador califica al vendedor
 * @access Private
 */
router.post('/:id/calificar', ctrl.calificar);

/**
 * @route GET /api/transacciones/mis-transacciones
 * @desc Obtener todas las transacciones del usuario actual
 * @access Private
 */
router.get('/mis-transacciones', ctrl.misTransacciones);

/**
 * @route GET /api/transacciones/pendientes-calificar
 * @desc Obtener transacciones pendientes de calificar del usuario
 * @access Private
 */
router.get('/pendientes-calificar', ctrl.pendientesCalificar);

/**
 * @route POST /api/transacciones
 * @desc Crear una nueva transacción
 * @access Private
 */
router.post('/', crearValidator, handleValidationErrors, ctrl.crear);

/**
 * @route GET /api/transacciones
 * @desc Obtener lista de transacciones con filtros
 * @access Private
 */
router.get('/', ctrl.listar);

/**
 * @route GET /api/transacciones/usuario/:userId
 * @desc Obtener transacciones de un usuario específico (compatibilidad)
 * @access Private
 */
router.get('/usuario/:userId', ctrl.listar);

/**
 * @route GET /api/transacciones/:id
 * @desc Obtener una transacción por ID
 * @access Private
 */
router.get('/:id', ctrl.obtenerPorId);

/**
 * @route PUT /api/transacciones/:id
 * @desc Actualizar una transacción existente
 * @access Private
 */
router.put('/:id', actualizarValidator, handleValidationErrors, ctrl.actualizar);

/**
 * @route DELETE /api/transacciones/:id
 * @desc Eliminar una transacción
 * @access Private
 */
router.delete('/:id', ctrl.eliminar);

module.exports = router;
