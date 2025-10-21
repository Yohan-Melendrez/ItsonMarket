const express = require('express');
const router = express.Router();
const controller = require('../controllers/publicacionesController');

router.get('/', controller.obtenerPublicaciones);
router.get('/:id', controller.obtenerPublicacionPorId);
router.post('/', controller.crearPublicacion);
router.put('/:id', controller.actualizarPublicacion);
router.delete('/:id', controller.eliminarPublicacion);

module.exports = router;
