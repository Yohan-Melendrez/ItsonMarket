const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const router = express.Router();
const repo = new UsuarioRepository();
const bcrypt = require('bcrypt');


/**
 * @route POST /api/auth/login
 * @desc Autenticar usuario y generar JWT
 * @access Public
 */
router.post('/login', [
  body('itson_id').notEmpty().withMessage('ID del itson es requerido'),
  body('contrasena').notEmpty().withMessage('Contraseña es requerida') // quité isStrongPassword para login
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos de autenticacion invalidos', details: errors.array() });
    }

    const { itson_id, contrasena } = req.body;

    const usuario = await repo.findByItsonId(itson_id); // tu repositorio
    if (!usuario) {
      return res.status(401).json({ error: 'Autenticación fallida', message: 'ITSON ID no registrado' });
    }

    const ok = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!ok) {
      return res.status(401).json({ error: 'Autenticación fallida', message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { userId: usuario._id, itsonId: usuario.itson_id },
      process.env.JWT_SECRET || 'clave_secreta_itson',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      mensaje: 'Autenticación exitosa',
      token,
      usuario: {
        itson_id: usuario.itson_id,
        nombre: usuario.nombre,
        correo: usuario.correo_institucional,
        carrera: usuario.carrera
      },
      expira_en: '24 horas'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en autenticación', message: error.message });
  }
});

/**
 * POST /api/auth/register
 * Público: registra y devuelve token
 */
router.post(
  '/register',
  [
    body('itson_id').trim().notEmpty().withMessage('itson_id requerido'),
    body('contrasena')
      .isStrongPassword()
      .withMessage('La contraseña no cumple los requisitos mínimos'),
    body('nombre').trim().notEmpty().withMessage('nombre requerido'),
    body('correo_institucional').isEmail().withMessage('correo inválido'),
    body('carrera').optional().isString(),
    body('telefono').optional().isString(),
    body('foto').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
      }

      const { itson_id, contrasena, ...rest } = req.body;

      // ¿ya existe?
      const yaExiste = await repo.findByItsonId(itson_id);
      if (yaExiste) {
        return res.status(409).json({ error: 'Conflicto', message: 'ITSON ID ya registrado' });
      }
      const hash = await bcrypt.hash(contrasena, 10);

      // crea por repo
      const creado = await repo.insert({
        itson_id,
        contrasena: hash,
        ...rest,
      });

      // token
      const token = jwt.sign(
        { sub: creado._id.toString(), itsonId: creado.itson_id },
        process.env.JWT_SECRET || 'clave_secreta_itson',
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        mensaje: 'Registro OK',
        token,
        usuario: {
          id: creado._id,
          itson_id: creado.itson_id,
          nombre: creado.nombre,
          correo_institucional: creado.correo_institucional,
          carrera: creado.carrera,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

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