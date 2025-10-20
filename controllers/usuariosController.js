const UsuarioRepository = require('../repositories/UsuarioRepository');
const repo = new UsuarioRepository();

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios
 */
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await repo.findAll();
    if (!usuarios || usuarios.length === 0)
      return res.status(404).json({ mensaje: "No hay usuarios registrados" });

    res.status(200).json(usuarios);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios", detalle: err.message });
  }
};

/**
 * @route POST /api/usuarios
 * @desc Crear un nuevo usuario
 */
exports.crearUsuario = async (req, res) => {
  try {
    const { itson_id, nombre, correo_institucional, carrera, telefono } = req.body;

    // Validaciones básicas
    if (!itson_id || !nombre || !correo_institucional) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validación de dominio institucional
    if (!correo_institucional.includes("@itson.edu.mx")) {
      return res.status(400).json({ error: "El correo debe ser institucional (@itson.edu.mx)" });
    }

    const nuevo = await repo.insert(req.body);
    res.status(201).json({ mensaje: "Usuario creado correctamente", usuario: nuevo });
  } catch (err) {
    res.status(400).json({ error: "No se pudo crear el usuario", detalle: err.message });
  }
};

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener un usuario por ITSON ID
 */
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await repo.findByItsonId(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.status(200).json(usuario);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar usuario", detalle: err.message });
  }
};

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar datos de un usuario por ITSON ID
 */
exports.actualizarUsuario = async (req, res) => {
  try {
    const actualizado = await repo.updateByItsonId(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: "Usuario no encontrado para actualizar" });

    res.status(200).json({ mensaje: "Usuario actualizado correctamente", usuario: actualizado });
  } catch (err) {
    res.status(400).json({ error: "Error al actualizar usuario", detalle: err.message });
  }
};

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar un usuario por ITSON ID
 */
exports.eliminarUsuario = async (req, res) => {
  try {
    const eliminado = await repo.deleteByItsonId(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Usuario no encontrado para eliminar" });

    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario", detalle: err.message });
  }
};
