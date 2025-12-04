// routes/publicacionRoutes.js
const express = require('express');
const router = express.Router();

const controller = require('../controllers/publicacionController');
const authMiddleware = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const v = require('../validators/publicacionValidator');

/**
 * @route GET /api/publicaciones
 * @desc Listar publicaciones con filtros + paginación
 * @access Public
 */
router.get('/', v.list, handleValidationErrors, controller.list);

/**
 * @route GET /api/publicaciones/buscar
 * @desc Buscar por título (q) con filtros opcionales
 * @access Public
 */
router.get('/buscar', v.searchByTitle, handleValidationErrors, controller.searchByTitle);

/**
 * @route GET /api/publicaciones/vendedor/:vendedorId
 * @desc Listar publicaciones por vendedor
 * @access Public
 */
router.get('/vendedor/:vendedorId', v.listBySeller, handleValidationErrors, controller.listBySeller);

/**
 * @route GET /api/publicaciones/:id
 * @desc Obtener publicación por ID
 * @access Public
 */
router.get('/:id', v.getById, handleValidationErrors, controller.getById);

// ========== RUTAS PRIVADAS (requieren autenticación) ==========
router.use(authMiddleware);

/**
 * @route POST /api/publicaciones
 * @desc Crear nueva publicación
 * @access Private
 */
router.post('/', v.create, handleValidationErrors, controller.create);

/**
 * @route PUT /api/publicaciones/:id
 * @desc Actualizar publicación por ID
 * @access Private
 */
router.put('/:id', v.update, handleValidationErrors, controller.update);

/**
 * @route PATCH /api/publicaciones/:id/visibilidad
 * @desc Cambiar visibilidad (true/false)
 * @access Private
 */
router.patch('/:id/visibilidad', v.setVisibility, handleValidationErrors, controller.setVisibility);

/**
 * @route PATCH /api/publicaciones/:id/estado
 * @desc Cambiar estado (p.ej. disponible/pausado/vendido)
 * @access Private
 */
router.patch('/:id/estado', v.setStatus, handleValidationErrors, controller.setStatus);

/**
 * @route POST /api/publicaciones/:id/vista
 * @desc Incrementar contador de vistas
 * @access Private
 */
router.post('/:id/vista', v.incrementViews, handleValidationErrors, controller.incrementViews);

/**
 * @route DELETE /api/publicaciones/:id
 * @desc Eliminar publicación por ID
 * @access Private
 */
router.delete('/:id', v.remove, handleValidationErrors, controller.remove);

module.exports = router;