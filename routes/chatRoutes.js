const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {crearChatValidator,actualizarChatValidator,enviarMensajeValidator,} = require('../validators/chatValidator');
const { handleValidationErrors } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

/**
 * @route GET /api/chats
 * @desc Obtener todos los chats
 * @access Private
 */
router.get('/', chatController.obtenerChats);

/**
 * @route GET /api/chats/:id
 * @desc Obtener un chat específico por ID
 * @access Private
 */
router.get('/:id', chatController.obtenerChatPorId);

/**
 * @route POST /api/chats
 * @desc Crear un nuevo chat (entre dos o más usuarios)
 * @access Private
 */
router.post(
  '/',
  crearChatValidator,
  handleValidationErrors,
  chatController.crearChat
);

/**
 * @route PUT /api/chats/:id
 * @desc Actualizar datos de un chat (estado, mensajes, etc.)
 * @access Private
 */
router.put(
  '/:id',
  actualizarChatValidator,
  handleValidationErrors,
  chatController.actualizarChat
);

/**
 * @route DELETE /api/chats/:id
 * @desc Eliminar un chat existente
 * @access Private
 */
router.delete('/:id', chatController.eliminarChat);

/**
 * @route POST /api/chats/:id/mensajes
 * @desc Enviar un nuevo mensaje dentro de un chat
 * @access Private
 */
router.post(
  '/:id/mensajes',
  enviarMensajeValidator,
  handleValidationErrors,
  chatController.enviarMensaje
);

/**
 * @route GET /api/chats/:id/mensajes
 * @desc Obtener todos los mensajes de un chat
 * @access Private
 */
router.get('/:id/mensajes', chatController.obtenerMensajes);

/**
 * @route PATCH /api/chats/:id/mensajes/leidos
 * @desc Marcar mensajes como leídos por el usuario actual
 * @access Private
 */
router.patch('/:id/mensajes/leidos', chatController.marcarMensajesLeidos);

module.exports = router;

