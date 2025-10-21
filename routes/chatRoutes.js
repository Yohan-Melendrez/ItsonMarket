const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatController');

/**
 * @route GET /api/chats
 * @desc Obtener todos los chats
 */
router.get('/', controller.obtenerChats);

/**
 * @route POST /api/chats
 * @desc Crear un nuevo chat
 */
router.post('/', controller.crearChat);

/**
 * @route GET /api/chats/:id
 * @desc Obtener un chat por ID
 */
router.get('/:id', controller.obtenerChatPorId);

/**
 * @route GET /api/chats/usuario/:usuario_id
 * @desc Obtener chats por participante
 */
router.get('/usuario/:usuario_id', controller.obtenerChatsPorUsuario);

/**
 * @route GET /api/chats/publicacion/:publicacion_id
 * @desc Obtener chats por publicación
 */
router.get('/publicacion/:publicacion_id', controller.obtenerChatsPorPublicacion);

/**
 * @route PUT /api/chats/:id
 * @desc Actualizar un chat por ID
 */
router.put('/:id', controller.actualizarChat);

/**
 * @route DELETE /api/chats/:id
 * @desc Eliminar un chat por ID
 */
router.delete('/:id', controller.eliminarChat);

module.exports = router;