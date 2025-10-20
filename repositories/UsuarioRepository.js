const { UsuarioModel } = require('../models/Usuario');

class UsuarioRepository {

    async insert(usuarioData) {
        const usuarioNuevo = new UsuarioModel(usuarioData);
        return usuarioNuevo.save();
    }

    async findAll() {
        return UsuarioModel.find({});
    }

    async findByItsonId(itson_id) {
        return UsuarioModel.findOne({ itson_id: itson_id });
    }


    async updateByItsonId(itson_id, updateData) {
        return UsuarioModel.findOneAndUpdate({ itson_id: itson_id }, updateData, { new: true });
    }


    async deleteByItsonId(itson_id) {
        return UsuarioModel.findOneAndDelete({ itson_id: itson_id });
    }
}

module.exports = UsuarioRepository;
