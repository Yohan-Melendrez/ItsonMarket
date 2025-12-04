const { validationResult } = require('express-validator');

/**
 * @function handleValidationErrors
 * @desc Middleware que valida y captura errores de validación de express-validator
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void}
 * @access Private
 * @description Retorna errores de validación con detalles de campo, mensaje y valor proporcionado
 * @example
 * // Uso en rutas con validadores
 * router.post('/api/usuarios', [validaciones...], handleValidationErrors, crearUsuario);
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada invalidos',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

module.exports = { handleValidationErrors };