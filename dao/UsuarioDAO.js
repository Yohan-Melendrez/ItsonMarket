const { UsuarioModel } = require('../models/Usuario');

class UsuarioDAO {

    async insert(usuarioData) {
        const usuarioNuevo = new UsuarioModel(usuarioData);
        return usuarioNuevo.save();
    }

    async findAll() {
        return UsuarioModel.find({});
    }

    async findByName(nombre) {
        return UsuarioModel.findOne({ nombre: nombre });
    }

    async findByItsonId(itson_id) {
        return UsuarioModel.findOne({ itson_id: itson_id });
    }

    async update(id, updateData) {
        return UsuarioModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async updateByItsonId(itson_id, updateData) {
        return UsuarioModel.findOneAndUpdate({ itson_id: itson_id }, updateData, { new: true });
    }

    async delete(id) {
        return UsuarioModel.findByIdAndDelete(id);
    }

    async deleteByItsonId(itson_id) {
        return UsuarioModel.findOneAndDelete({ itson_id: itson_id });
    }
}

module.exports = UsuarioDAO;
