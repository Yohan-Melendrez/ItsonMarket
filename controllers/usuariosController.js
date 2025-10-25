const UsuarioRepository = require('../repositories/UsuarioRepository');
const repo = new UsuarioRepository();

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios (protegido)
 * @access Private
 */
exports.obtenerUsuarios = async (req, res, next) => {
  try {
    console.log('Obteniendo lista de usuarios...');
    const usuarios = await repo.obtenerUsuarios();
    
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ 
        mensaje: "No hay usuarios registrados en el sistema",
        data: []
      });
    }

    res.status(200).json({
      mensaje: "Usuarios obtenidos correctamente",
      cantidad: usuarios.length,
      data: usuarios
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/usuarios
 * @desc Crear un nuevo usuario (protegido)
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

    const usuarioExistente = await repo.buscarPorItsonId(itson_id);
    if (usuarioExistente) {
      return res.status(409).json({
        error: "Usuario ya existe",
        message: `Ya existe un usuario con el ITSON ID: ${itson_id}`
      });
    }

    const nuevoUsuario = await repo.crearUsuario(req.body);
    
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
 * @desc Obtener un usuario por ITSON ID (protegido)
 * @access Private
 */
exports.obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Buscando usuario con ITSON ID: ${id}`);
    
    const usuario = await repo.buscarPorItsonId(id);
    
    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: `No se encontró usuario con ITSON ID: ${id}`
      });
    }

    res.status(200).json({
      mensaje: "Usuario encontrado",
      data: usuario
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar datos de un usuario por ITSON ID (protegido)
 * @access Private
 */
exports.actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Actualizando usuario con ITSON ID: ${id}`, req.body);
    
    const usuarioExistente = await repo.buscarPorItsonId(id);
    if (!usuarioExistente) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: `No se puede actualizar. Usuario con ITSON ID: ${id} no existe`
      });
    }

    const usuarioActualizado = await repo.actualizarUsuario(id, req.body);
    
    res.status(200).json({
      mensaje: "Usuario actualizado correctamente",
      usuario: usuarioActualizado
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar un usuario por ITSON ID (protegido)
 * @access Private
 */
exports.eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Eliminando usuario con ITSON ID: ${id}`);
    
    const usuarioExistente = await repo.buscarPorItsonId(id);
    if (!usuarioExistente) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: `No se puede eliminar. Usuario con ITSON ID: ${id} no existe`
      });
    }

    const resultado = await repo.eliminarUsuario(id);
    
    res.status(200).json({
      mensaje: "Usuario eliminado correctamente",
      usuario_eliminado: {
        itson_id: id,
        nombre: usuarioExistente.nombre
      }
    });
  } catch (err) {
    next(err);
  }
};