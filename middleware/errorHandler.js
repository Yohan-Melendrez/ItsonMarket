const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err);

  // Error de validación de MongoDB
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Error de registro duplicado en MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Registro duplicado',
      message: `El ${field} '${err.keyValue[field]}' ya existe`
    });
  }

  // Error de casteo de MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'El formato del ID proporcionado no es válido'
    });
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticación no válido'
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error inesperado' 
      : err.message
  });
};

module.exports = errorHandler;