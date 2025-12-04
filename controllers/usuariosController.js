const UsuarioRepository = require('../repositories/UsuarioRepository');
const repo = new UsuarioRepository();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @function buscarUsuario
 * @desc Helper para buscar usuario por _id o itson_id
 * @param {string} id - ID de MongoDB o ITSON ID del usuario
 * @returns {Promise<Object|null>} Objeto usuario encontrado o null
 * @access Private
 */
async function buscarUsuario(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const usuario = await repo.findById(id);
    if (usuario) return usuario;
  }
  return await repo.findByItsonId(id);
}

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios registrados en el sistema
 * @access Private
 */
exports.obtenerUsuarios = async (req, res, next) => {
  try {
    console.log('Obteniendo lista de usuarios...');
    const usuarios = await repo.findAll();
    
    if (!usuarios || usuarios.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(usuarios);
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/usuarios/buscar
 * @desc Buscar usuarios por nombre o ITSON ID
 * @access Private
 */
exports.buscarUsuarios = async (req, res, next) => {
  try {
    const { q, itson_id } = req.query;
    
    if (itson_id) {
      const usuario = await repo.findByItsonId(itson_id);
      if (usuario) {
        return res.status(200).json({
          _id: usuario._id,
          nombre: usuario.nombre,
          carrera: usuario.carrera,
          foto: usuario.foto,
          itson_id: usuario.itson_id
        });
      }
      return res.status(200).json(null);
    }

    if (!q || q.length < 2) {
      return res.status(200).json([]);
    }

    const usuarios = await repo.searchByName(q);
    res.status(200).json(usuarios);
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/usuarios
 * @desc Crear un nuevo usuario en el sistema
 * @access Private
 */
exports.crearUsuario = async (req, res, next) => {
  try {
    console.log('Creando nuevo usuario:', req.body);
    
    const { itson_id, nombre, correo_institucional } = req.body;

    if (!itson_id || !nombre || !correo_institucional) {
      return res.status(400).json({ 
        error: "Campos obligatorios faltantes",
        campos_requeridos: ["itson_id", "nombre", "correo_institucional"]
      });
    }

    const usuarioExistente = await repo.findByItsonId(itson_id);
    if (usuarioExistente) {
      return res.status(409).json({
        error: "Usuario ya existe",
        message: `Ya existe un usuario con el ITSON ID: ${itson_id}`
      });
    }

    const nuevoUsuario = await repo.insert(req.body);
    
    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: nuevoUsuario
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener información detallada de un usuario por ID o ITSON ID
 * @access Private
 */
exports.obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Buscando usuario con ID: ${id}`);
    
    const usuario = await buscarUsuario(id);
    
    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: `No se encontró usuario con ID: ${id}`
      });
    }

    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
};

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar información de un usuario - permite cambiar datos personales y contraseña
 * @access Private
 */
exports.actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Actualizando usuario con ID: ${id}`, req.body);
    
    const usuarioExistente = await buscarUsuario(id);
    if (!usuarioExistente) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: `No se puede actualizar. Usuario con ID: ${id} no existe`
      });
    }

    const updateData = {};
    
    if (req.body.nombre) updateData.nombre = req.body.nombre;
    if (req.body.telefono) updateData.telefono = req.body.telefono;
    if (req.body.carrera) updateData.carrera = req.body.carrera;
    if (req.body.foto) updateData.foto = req.body.foto;
    
    if (req.body.avatar && req.body.avatar.startsWith && req.body.avatar.startsWith('data:image')) {
      updateData.foto = req.body.avatar;
    }
    
    if (req.body.contrasena_nueva) {
      const passOk = await bcrypt.compare(req.body.contrasena_actual, usuarioExistente.contrasena);
      if (!passOk) {
        return res.status(400).json({
          error: "Contraseña incorrecta",
          message: "La contraseña actual no es correcta"
        });
      }
      updateData.contrasena = await bcrypt.hash(req.body.contrasena_nueva, 10);
    }

    const usuarioActualizado = await repo.updateById(usuarioExistente._id, updateData);
    
    res.status(200).json({
      _id: usuarioActualizado._id,
      itson_id: usuarioActualizado.itson_id,
      nombre: usuarioActualizado.nombre,
      correo_institucional: usuarioActualizado.correo_institucional,
      carrera: usuarioActualizado.carrera,
      telefono: usuarioActualizado.telefono,
      foto: usuarioActualizado.foto,
      reputacion: usuarioActualizado.reputacion
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar un usuario del sistema
 * @access Private
 */
exports.eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Eliminando usuario con ID: ${id}`);
    
    const usuarioExistente = await buscarUsuario(id);
    if (!usuarioExistente) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: `No se puede eliminar. Usuario con ID: ${id} no existe`
      });
    }

    await repo.deleteById(usuarioExistente._id);
    
    res.status(200).json({
      mensaje: "Usuario eliminado correctamente"
    });
  } catch (err) {
    next(err);
  }
};