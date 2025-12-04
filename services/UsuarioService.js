const UsuarioDAO = require('../dao/UsuarioDAO');

class UsuarioRepository {
  constructor() {
    this.dao = new UsuarioDAO();
  }

  /**
   * @function crearUsuario
   * @desc Crear un nuevo usuario en el sistema
   * @param {Object} usuarioData - Datos del usuario a crear
   * @returns {Promise<Object>} Usuario creado
   * @access Private
   */
  async crearUsuario(usuarioData) {
    return this.dao.insert(usuarioData);
  }

  /**
   * @function obtenerUsuarios
   * @desc Obtener todos los usuarios registrados
   * @returns {Promise<Array>} Array de todos los usuarios
   * @access Private
   */
  async obtenerUsuarios() {
    return this.dao.findAll();
  }

  /**
   * @function buscarPorItsonId
   * @desc Buscar un usuario por su ITSON ID
   * @param {String} itson_id - ITSON ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   * @access Private
   */
  async buscarPorItsonId(itson_id) {
    return this.dao.findByItsonId(itson_id);
  }

  /**
   * @function actualizarUsuario
   * @desc Actualizar datos de un usuario por ITSON ID
   * @param {String} itson_id - ITSON ID del usuario
   * @param {Object} datosActualizados - Datos a actualizar
   * @returns {Promise<Object|null>} Usuario actualizado o null
   * @access Private
   */
  async actualizarUsuario(itson_id, datosActualizados) {
    return this.dao.updateByItsonId(itson_id, datosActualizados);
  }

  /**
   * @function eliminarUsuario
   * @desc Eliminar un usuario por su ITSON ID
   * @param {String} itson_id - ITSON ID del usuario
   * @returns {Promise<Object|null>} Usuario eliminado o null
   * @access Private
   */
  async eliminarUsuario(itson_id) {
    return this.dao.deleteByItsonId(itson_id);
  }
}

module.exports = UsuarioRepository;
