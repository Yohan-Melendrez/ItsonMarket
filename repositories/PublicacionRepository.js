const { PublicacionDAO } = require('../dao/PublicacionDAO');

class PublicacionRepository {
  constructor() {
    this.dao = new PublicacionDAO();
  }

  async crearPublicacion(data) {
    return await this.dao.crear(data);
  }

  async obtenerPublicaciones() {
    return await this.dao.obtenerTodas();
  }

  async obtenerPublicacionPorId(id) {
    return await this.dao.obtenerPorId(id);
  }

  async actualizarPublicacion(id, data) {
    return await this.dao.actualizar(id, data);
  }

  async eliminarPublicacion(id) {
    return await this.dao.eliminar(id);
  }
}

module.exports = PublicacionRepository;
