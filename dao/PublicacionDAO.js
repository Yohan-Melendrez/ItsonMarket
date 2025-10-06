const { PublicacionModel } = require('../models/Publicacion');

class PublicacionDAO {
  async crear(data) {
    const nueva = new PublicacionModel(data);
    return await nueva.save();
  }

  async obtenerTodas() {
    return await PublicacionModel.find({});
  }

  async obtenerPorId(id) {
    return await PublicacionModel.findById(id);
  }

  async actualizar(id, data) {
    return await PublicacionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async eliminar(id) {
    return await PublicacionModel.findByIdAndDelete(id);
  }
}

module.exports = { PublicacionDAO };
