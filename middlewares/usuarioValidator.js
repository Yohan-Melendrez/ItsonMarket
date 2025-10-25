const { body } = require('express-validator');

const crearUsuarioValidator = [
  body('itson_id')
    .notEmpty()
    .withMessage('El ID es requerido')
    .isLength({ min:4, max: 12 })
    .withMessage('El ID debe tener los 5 ceros y los otros numeros')
    .isAlphanumeric()
    .withMessage('El ITSON ID solo puede contener numeros'),

  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('correo_institucional')
    .notEmpty()
    .withMessage('El correo institucional es requerido')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .custom(value => {
      if (!value.endsWith('@itson.edu.mx')) {
        throw new Error('El correo debe ser del dominio @itson.edu.mx');
      }
      return true;
    }),

  body('carrera')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La carrera no puede exceder 100 caracteres'),

  body('telefono')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,}$/)
    .withMessage('El teléfono debe tener un formato válido'),

  body('foto')
    .optional()
    .isURL()
    .withMessage('La foto debe ser una URL valida')
];

const actualizarUsuarioValidator = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('correo_institucional')
    .optional()
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .custom(value => {
      if (value && !value.endsWith('@itson.edu.mx')) {
        throw new Error('El correo debe ser del dominio @itson.edu.mx');
      }
      return true;
    }),

  body('carrera')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La carrera no puede exceder 100 caracteres'),

  body('telefono')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,}$/)
    .withMessage('El teléfono debe tener un formato válido'),

  body('foto')
    .optional()
    .isURL()
    .withMessage('La foto debe ser una URL válida')
];

module.exports = {
  crearUsuarioValidator,
  actualizarUsuarioValidator
};