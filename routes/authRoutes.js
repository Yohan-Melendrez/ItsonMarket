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
// LOGIN
router.post('/login', [
  body('itson_id').notEmpty(),
  body('contrasena').notEmpty()
], async (req, res) => {
  try {
    const { itson_id, contrasena } = req.body;

    console.log("BACKEND RECIBIÓ:", req.body);
    console.log("ITS ID recibido:", itson_id, "len:", itson_id.length);

    // Validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos de autenticación inválidos' });
    }

    // Buscar usuario
    const usuario = await repo.findByItsonId(itson_id);
    if (!usuario) {
      return res.status(401).json({ error: 'Autenticación fallida', message: 'ITSON ID no registrado' });
    }

    // Comparar hash
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
        carrera: usuario.carrera,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en autenticación', message: error.message });
  }
});


/**
 * POST /api/auth/register
 * Público: registra y devuelve token
 */
router.post('/register', [
  body('itson_id').notEmpty(),
  body('contrasena').isStrongPassword(),
  body('nombre').notEmpty(),
  body('correo_institucional').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }

    const { itson_id, contrasena, ...rest } = req.body;

    // Validar existencia
    const yaExiste = await repo.findByItsonId(itson_id);
    if (yaExiste) {
      return res.status(409).json({ error: 'Conflicto', message: 'ITSON ID ya registrado' });
    }

    // Hash correcto (SOLO AQUÍ)
    const hash = await bcrypt.hash(contrasena, 10);

    const creado = await repo.insert({
      itson_id,
      contrasena: hash,
      ...rest
    });

    const token = jwt.sign(
      { sub: creado._id.toString(), itsonId: creado.itson_id },
      process.env.JWT_SECRET || 'clave_secreta_itson',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensaje: 'Registro OK',
      token,
      usuario: {
        id: creado._id,
        itson_id: creado.itson_id,
        nombre: creado.nombre,
        correo_institucional: creado.correo_institucional,
        carrera: creado.carrera
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Error en registro', message: err.message });
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