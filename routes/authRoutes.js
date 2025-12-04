const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const router = express.Router();
const repo = new UsuarioRepository();
const bcrypt = require('bcrypt');


/**
 * @route POST /api/auth/login
 * @desc Autenticar usuario con ITSON ID y contraseña, genera JWT
 * @access Public
 * @param {String} itson_id - ITSON ID del usuario
 * @param {String} contrasena - Contraseña del usuario
 * @returns {Object} Token JWT y datos del usuario autenticado
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
        _id: usuario._id,
        id: usuario._id,
        itson_id: usuario.itson_id,
        nombre: usuario.nombre,
        correo: usuario.correo_institucional,
        correo_institucional: usuario.correo_institucional,
        carrera: usuario.carrera,
        telefono: usuario.telefono,
        foto: usuario.foto,
        reputacion: usuario.reputacion
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en autenticación', message: error.message });
  }
});


/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario con validación de contraseña fuerte
 * @access Public
 * @param {String} itson_id - ITSON ID único del usuario
 * @param {String} contrasena - Contraseña (debe ser fuerte)
 * @param {String} nombre - Nombre completo del usuario
 * @param {String} correo_institucional - Email institucional válido
 * @returns {Object} Token JWT y datos del usuario registrado
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
        _id: creado._id,
        id: creado._id,
        itson_id: creado.itson_id,
        nombre: creado.nombre,
        correo: creado.correo_institucional,
        correo_institucional: creado.correo_institucional,
        carrera: creado.carrera,
        telefono: creado.telefono,
        foto: creado.foto,
        reputacion: creado.reputacion
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Error en registro', message: err.message });
  }
});


/**
 * @route POST /api/auth/verify
 * @desc Verificar validez del token JWT proporcionado
 * @access Public
 * @param {String} Authorization - Header con token en formato "Bearer <token>"
 * @returns {Object} Estado de validez del token y datos decodificados
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