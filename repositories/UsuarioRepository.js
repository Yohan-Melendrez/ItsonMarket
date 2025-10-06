const UsuarioDAO = require('../dao/UsuarioDAO');

class UsuarioRepository {
  constructor() {
    this.dao = new UsuarioDAO();
  }

  async crearUsuario(usuarioData) {
    return this.dao.insert(usuarioData);
  }

  async obtenerUsuarios() {
    return this.dao.findAll();
  }

  async buscarPorItsonId(itson_id) {
    return this.dao.findByItsonId(itson_id);
  }

  async actualizarUsuario(itson_id, datosActualizados) {
    return this.dao.updateByItsonId(itson_id, datosActualizados);
  }

  async eliminarUsuario(itson_id) {
    return this.dao.deleteByItsonId(itson_id);
  }
}

module.exports = UsuarioRepository;
