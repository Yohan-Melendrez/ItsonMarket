const { UsuarioModel } = require('../models/Usuario');
const bcrypt = require('bcrypt');

class UsuarioRepository {

    async insert(userData) {
        const usuario = new UsuarioModel(userData);
        return usuario.save();
    }

    async findById(id) {
        return UsuarioModel.findById(id);
    }

    async updateById(id, updateData) {
        return UsuarioModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteById(id) {
        return UsuarioModel.findByIdAndDelete(id);
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
        return UsuarioModel.find({}).select('-contrasena');
    }

    async findByName(nombre) {
        return UsuarioModel.findOne({ nombre: nombre });
    }

    async findByItsonId(itson_id) {
        return UsuarioModel.findOne({ itson_id: itson_id });
    }

    async searchByName(query) {
        return UsuarioModel.find({
            nombre: { $regex: query, $options: 'i' }
        }).select('_id nombre correo_institucional carrera foto').limit(10);
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
