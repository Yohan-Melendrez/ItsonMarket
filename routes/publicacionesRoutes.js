const express = require('express');
const router = express.Router();

const controller = require('../controllers/publicacionController'); // usa los handlers que ya te di
const authMiddleware = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const {
  crearPublicacionValidator,
  actualizarPublicacionValidator,
  obtenerPublicacionPorIdValidator,
  listarPublicacionesValidator,
  buscarPublicacionesValidator,
  listarPorVendedorValidator,
  setVisibilityValidator,
  setStatusValidator,
  incrementarVistasValidator,
  eliminarPublicacionValidator
} = require('../validators/publicacionValidator');

// Todas privadas (como tu router de usuarios)
router.use(authMiddleware);

/**
 * @route GET /api/publicaciones
 * @desc Listar publicaciones con filtros + paginación
 * @access Private
 */
router.get('/', listarPublicacionesValidator, handleValidationErrors, controller.list);

/**
 * @route GET /api/publicaciones/buscar
 * @desc Buscar por título (q) con filtros opcionales
 * @access Private
 */
router.get('/buscar', buscarPublicacionesValidator, handleValidationErrors, controller.searchByTitle);

/**
 * @route GET /api/publicaciones/vendedor/:vendedorId
 * @desc Listar publicaciones por vendedor
 * @access Private
 */
router.get('/vendedor/:vendedorId', listarPorVendedorValidator, handleValidationErrors, controller.listBySeller);

/**
 * @route GET /api/publicaciones/:id
 * @desc Obtener publicación por ID
 * @access Private
 */
router.get('/:id', obtenerPublicacionPorIdValidator, handleValidationErrors, controller.getById);

/**
 * @route POST /api/publicaciones
 * @desc Crear nueva publicación
 * @access Private
 */
router.post('/', crearPublicacionValidator, handleValidationErrors, controller.create);

/**
 * @route PUT /api/publicaciones/:id
 * @desc Actualizar publicación por ID
 * @access Private
 */
router.put('/:id', actualizarPublicacionValidator, handleValidationErrors, controller.update);

/**
 * @route PATCH /api/publicaciones/:id/visibilidad
 * @desc Cambiar visibilidad (true/false)
 * @access Private
 */
router.patch('/:id/visibilidad', setVisibilityValidator, handleValidationErrors, controller.setVisibility);

/**
 * @route PATCH /api/publicaciones/:id/estado
 * @desc Cambiar estado (p.ej. disponible/pausado/vendido)
 * @access Private
 */
router.patch('/:id/estado', setStatusValidator, handleValidationErrors, controller.setStatus);

/**
 * @route POST /api/publicaciones/:id/vista
 * @desc Incrementar contador de vistas
 * @access Private
 */
router.post('/:id/vista', incrementarVistasValidator, handleValidationErrors, controller.incrementViews);

/**
 * @route DELETE /api/publicaciones/:id
 * @desc Eliminar publicación por ID
 * @access Private
 */
router.delete('/:id', eliminarPublicacionValidator, handleValidationErrors, controller.remove);

module.exports = router;