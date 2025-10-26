const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const router = express.Router();
const repo = new UsuarioRepository();

/**
 * @route POST /api/auth/login
 * @desc Autenticar usuario y generar JWT
 * @access Public
 */
router.post('/login', [
  body('itson_id')
    .notEmpty()
    .withMessage('ID del itson es requerido'),
  body('correo_institucional')
    .isEmail()
    .withMessage('Correo institucional valido es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de autenticacion invalidos',
        details: errors.array()
      });
    }

    const { itson_id, correo_institucional } = req.body;

    const usuario = await repo.findByItsonId(itson_id);
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Autenticación fallida',
        message: 'ITSON ID no registrado'
      });
    }

    if (usuario.correo_institucional !== correo_institucional) {
      return res.status(401).json({
        error: 'Autenticación fallida',
        message: 'Credenciales incorrectas'
      });
    }

    const token = jwt.sign(
      { 
        userId: usuario._id,
        itsonId: usuario.itson_id,
        email: usuario.correo_institucional
      },
      process.env.JWT_SECRET || 'clave_secreta_itson',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      mensaje: 'Autenticación exitosa',
      token: token,
      usuario: {
        itson_id: usuario.itson_id,
        nombre: usuario.nombre,
        correo: usuario.correo_institucional,
        carrera: usuario.carrera
      },
      expira_en: '24 horas'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error en autenticación',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/verify
 * @desc Verificar token JWT
 * @access Public
 */
router.post('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        valid: false,
        error: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_itson');
    
    res.status(200).json({
      valid: true,
      usuario: decoded,
      message: 'Token válido'
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token inválido o expirado'
    });
  }
});

module.exports = router;