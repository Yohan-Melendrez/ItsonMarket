// routes/transaccionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { crearValidator, actualizarValidator } = require('../validators/transaccionValidator');
const { handleValidationErrors } = require('../middleware/validation');
const ctrl = require('../controllers/transaccionController');

router.use(auth);

router.post('/', crearValidator, handleValidationErrors, ctrl.crear);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtenerPorId);
router.put('/:id', actualizarValidator, handleValidationErrors, ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
