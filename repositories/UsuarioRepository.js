const { UsuarioModel } = require('../models/Usuario');
const bcrypt = require('bcrypt');

class UsuarioRepository {

    async insert(userData) {
        if (userData.contrasena) {
            userData.contrasena = await bcrypt.hash(userData.contrasena, 10);
        }
        const usuario = new UsuarioModel(userData);
        return usuario.save();
    }

    async updateByItsonId(itsonId, updateData) {
        if (updateData.contrasena) {
            updateData.contrasena = await bcrypt.hash(updateData.contrasena, 10);
        }

        return UsuarioModel.findOneAndUpdate(
            { itson_id: itsonId },
            updateData,
            { new: true }
        );
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



    async delete(id) {
        return UsuarioModel.findByIdAndDelete(id);
    }

    async deleteByItsonId(itson_id) {
        return UsuarioModel.findOneAndDelete({ itson_id: itson_id });
    }
}

module.exports = UsuarioRepository;
