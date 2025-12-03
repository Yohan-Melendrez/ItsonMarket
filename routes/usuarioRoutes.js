const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariosController');
const authMiddleware = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { crearUsuarioValidator, actualizarUsuarioValidator } = require('../validators/usuarioValidator');

/**
 * @route POST /api/usuarios
 * @desc Crear un nuevo usuario
 * @access Public (para registro)
 */
router.post('/', crearUsuarioValidator, handleValidationErrors, controller.crearUsuario);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener un usuario por ID o ITSON ID (perfil público)
 * @access Public
 */
router.get('/:id', controller.obtenerUsuarioPorId);

// A partir de aquí requieren autenticación
router.use(authMiddleware);

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios
 * @access Private
 */
router.get('/', controller.obtenerUsuarios);

/**
 * @route GET /api/usuarios/buscar
 * @desc Buscar usuarios por nombre
 * @access Private
 */
router.get('/buscar', controller.buscarUsuarios);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar un usuario por ITSON ID
 * @access Private
 */
router.put('/:id', actualizarUsuarioValidator, handleValidationErrors, controller.actualizarUsuario);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar un usuario por ITSON ID
 * @access Private
 */
router.delete('/:id', controller.eliminarUsuario);

module.exports = router;