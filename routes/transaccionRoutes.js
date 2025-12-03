// routes/transaccionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { crearValidator, actualizarValidator } = require('../validators/transaccionValidator');
const { handleValidationErrors } = require('../middleware/validation');
const ctrl = require('../controllers/transaccionController');

// Todas las rutas requieren autenticación
router.use(auth);

// Nuevos endpoints para el flujo de ventas
router.post('/marcar-venta', ctrl.marcarVenta);
router.post('/:id/calificar', ctrl.calificar);
router.get('/mis-transacciones', ctrl.misTransacciones);
router.get('/pendientes-calificar', ctrl.pendientesCalificar);

// Endpoints existentes
router.post('/', crearValidator, handleValidationErrors, ctrl.crear);
router.get('/', ctrl.listar);
router.get('/usuario/:userId', ctrl.listar); // Para compatibilidad
router.get('/:id', ctrl.obtenerPorId);
router.put('/:id', actualizarValidator, handleValidationErrors, ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
