const { UsuarioModel } = require('../models/Usuario');
const bcrypt = require('bcrypt');

class UsuarioRepository {

    /**
     * @function insert
     * @desc Crear un nuevo usuario en la base de datos
     * @param {Object} userData - Datos del usuario a insertar
     * @returns {Promise<Object>} Usuario creado
     * @access Private
     */
    async insert(userData) {
        const usuario = new UsuarioModel(userData);
        return usuario.save();
    }

    /**
     * @function findById
     * @desc Obtener un usuario por su ID de MongoDB
     * @param {String} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     * @access Private
     */
    async findById(id) {
        return UsuarioModel.findById(id);
    }

    /**
     * @function updateById
     * @desc Actualizar datos de un usuario por su ID
     * @param {String} id - ID del usuario
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object|null>} Usuario actualizado o null
     * @access Private
     */
    async updateById(id, updateData) {
        return UsuarioModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    /**
     * @function deleteById
     * @desc Eliminar un usuario por su ID
     * @param {String} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario eliminado o null
     * @access Private
     */
    async deleteById(id) {
        return UsuarioModel.findByIdAndDelete(id);
    }

    /**
     * @function updateByItsonId
     * @desc Actualizar usuario por ITSON ID con hash automático de contraseña
     * @param {String} itsonId - ITSON ID del usuario
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object|null>} Usuario actualizado o null
     * @access Private
     */
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

    /**
     * @function findAll
     * @desc Obtener todos los usuarios sin exponer contraseñas
     * @returns {Promise<Array>} Array de todos los usuarios
     * @access Private
     */
    async findAll() {
        return UsuarioModel.find({}).select('-contrasena');
    }

    /**
     * @function findByName
     * @desc Obtener un usuario por nombre exacto
     * @param {String} nombre - Nombre del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     * @access Private
     */
    async findByName(nombre) {
        return UsuarioModel.findOne({ nombre: nombre });
    }

    /**
     * @function findByItsonId
     * @desc Obtener un usuario por su ITSON ID
     * @param {String} itson_id - ITSON ID del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     * @access Private
     */
    async findByItsonId(itson_id) {
        return UsuarioModel.findOne({ itson_id: itson_id });
    }

    /**
     * @function searchByName
     * @desc Buscar usuarios por nombre con búsqueda insensible a mayúsculas
     * @param {String} query - Término de búsqueda
     * @returns {Promise<Array>} Array de hasta 10 usuarios encontrados
     * @access Private
     */
    async searchByName(query) {
        return UsuarioModel.find({
            nombre: { $regex: query, $options: 'i' }
        }).select('_id nombre correo_institucional carrera foto').limit(10);
    }

    /**
     * @function update
     * @desc Actualizar datos de un usuario por ID
     * @param {String} id - ID del usuario
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object|null>} Usuario actualizado o null
     * @access Private
     */
    async update(id, updateData) {
        return UsuarioModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    /**
     * @function delete
     * @desc Eliminar un usuario por ID
     * @param {String} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario eliminado o null
     * @access Private
     */
    async delete(id) {
        return UsuarioModel.findByIdAndDelete(id);
    }

    /**
     * @function deleteByItsonId
     * @desc Eliminar un usuario por su ITSON ID
     * @param {String} itson_id - ITSON ID del usuario
     * @returns {Promise<Object|null>} Usuario eliminado o null
     * @access Private
     */
    async deleteByItsonId(itson_id) {
        return UsuarioModel.findOneAndDelete({ itson_id: itson_id });
    }
}

module.exports = UsuarioRepository;
