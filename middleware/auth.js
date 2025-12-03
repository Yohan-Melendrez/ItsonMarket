const jwt = require('jsonwebtoken');

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
      
      // Manejar diferentes formatos de payload del token
      const payload = decoded.user || decoded;

      // Normalizar el ID del usuario - puede venir como sub, userId, id, o _id
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