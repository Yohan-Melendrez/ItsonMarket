const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaccionController');

// CRUD básico
router.get('/', controller.obtenerTransacciones);          
router.get('/:id', controller.obtenerTransaccionPorId);     
router.post('/', controller.crearTransaccion);              
router.put('/:id', controller.actualizarTransaccion);      
router.delete('/:id', controller.eliminarTransaccion);      

module.exports = router;