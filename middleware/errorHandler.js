/**
 * @function errorHandler
 * @desc Middleware centralizador de errores que captura y formatea diferentes tipos de errores
 * @param {Error} err - Objeto de error capturado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void}
 * @access Private
 * @description Maneja errores de validación MongoDB, registros duplicados, casteo de ID, JWT y errores generales
 * @example
 * // Uso en la aplicación
 * app.use(errorHandler);
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Registro duplicado',
      message: `El ${field} '${err.keyValue[field]}' ya existe`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'El formato del ID proporcionado no es válido'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticación no válido'
    });
  }

  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error inesperado' 
      : err.message
  });
};

module.exports = errorHandler;