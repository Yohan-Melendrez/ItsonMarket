const express = require('express');
const router = express.Router();
const controller = require('./controllers/usuariosController');

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios
 */
router.get('/', controller.obtenerUsuarios);

/**
 * @route POST /api/usuarios
 * @desc Crear un nuevo usuario
 */
router.post('/', controller.crearUsuario);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener un usuario por ITSON ID
 */
router.get('/:id', controller.obtenerUsuarioPorId);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar un usuario por ITSON ID
 */
router.put('/:id', controller.actualizarUsuario);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar un usuario por ITSON ID
 */
router.delete('/:id', controller.eliminarUsuario);

module.exports = router;
