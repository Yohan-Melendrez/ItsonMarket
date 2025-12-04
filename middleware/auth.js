const jwt = require('jsonwebtoken');

/**
 * @function authMiddleware
 * @desc Middleware de autenticación que valida el token JWT en el encabezado Authorization
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void}
 * @access Private
 * @example
 * // Uso en rutas protegidas
 * router.get('/api/usuarios', authMiddleware, obtenerUsuarios);
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_itson');
      
      const payload = decoded.user || decoded;

      const usuarioId = payload.sub || payload.userId || payload.id || payload._id;
      
      if (usuarioId) {
        payload.id = usuarioId;
        payload._id = usuarioId;
      }
      
      req.user = payload;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido o ha expirado'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Error en autenticación',
      message: error.message
    });
  }
};

module.exports = authMiddleware;