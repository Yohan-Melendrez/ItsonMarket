const { TransaccionModel } = require('../models/Transaccion');

class TransaccionRepository {

  /**
   * @function insert
   * @desc Crear una nueva transacción en la base de datos
   * @param {Object} transaccionData - Datos de la transacción a insertar
   * @returns {Promise<Object>} Transacción creada
   * @access Private
   */
  async insert(transaccionData) {
    const nuevaTransaccion = new TransaccionModel(transaccionData);
    return nuevaTransaccion.save();
  }

  /**
   * @function findAll
   * @desc Obtener todas las transacciones con filtros opcionales
   * @param {Object} filter - Filtros a aplicar (por defecto vacío)
   * @returns {Promise<Array>} Array de transacciones ordenadas por fecha
   * @access Private
   */
  async findAll(filter = {}) {
    return TransaccionModel.find(filter)
      .populate('comprador_id', 'nombre foto carrera itson_id')
      .populate('vendedor_id', 'nombre foto carrera itson_id')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }

  /**
   * @function findById
   * @desc Obtener una transacción por su ID
   * @param {String} id - ID de la transacción
   * @returns {Promise<Object|null>} Transacción encontrada o null
   * @access Private
   */
  async findById(id) {
    return TransaccionModel.findById(id)
      .populate('comprador_id', 'nombre foto carrera itson_id')
      .populate('vendedor_id', 'nombre foto carrera itson_id')
      .populate('publicacion_id', 'titulo precio detalles');
  }

  /**
   * @function findByComprador
   * @desc Obtener todas las transacciones donde el usuario es comprador
   * @param {String} comprador_id - ID del comprador
   * @returns {Promise<Array>} Array de transacciones del comprador
   * @access Private
   */
  async findByComprador(comprador_id) {
    return TransaccionModel.find({ comprador_id })
      .populate('vendedor_id', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }

  /**
   * @function findByVendedor
   * @desc Obtener todas las transacciones donde el usuario es vendedor
   * @param {String} vendedor_id - ID del vendedor
   * @returns {Promise<Array>} Array de transacciones del vendedor
   * @access Private
   */
  async findByVendedor(vendedor_id) {
    return TransaccionModel.find({ vendedor_id })
      .populate('comprador_id', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }


  /**
   * @function findByCompradorItsonId
   * @desc Obtener transacciones por ITSON ID del comprador
   * @param {String} itson_id - ITSON ID del comprador
   * @returns {Promise<Array>} Array de transacciones encontradas
   * @access Private
   */
  async findByCompradorItsonId(itson_id) {
    return TransaccionModel.find({ comprador_itson_id: itson_id })
      .populate('vendedor_id', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }


  /**
   * @function findByUsuario
   * @desc Obtener todas las transacciones de un usuario como comprador o vendedor
   * @param {String} usuarioId - ID del usuario
   * @param {String} itsonId - ITSON ID del usuario (opcional)
   * @returns {Promise<Array>} Array de transacciones del usuario
   * @access Private
   */
  async findByUsuario(usuarioId, itsonId) {
    const query = {
      $or: [
        { comprador_id: usuarioId },
        { vendedor_id: usuarioId }
      ]
    };
    
    if (itsonId) {
      query.$or.push({ comprador_itson_id: itsonId });
    }

    return TransaccionModel.find(query)
      .populate('comprador_id', 'nombre foto carrera itson_id')
      .populate('vendedor_id', 'nombre foto carrera itson_id')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }


  /**
   * @function findPendientesCalificar
   * @desc Obtener transacciones completadas sin calificación del comprador
   * @param {String} comprador_id - ID del comprador
   * @returns {Promise<Array>} Array de transacciones pendientes de calificar
   * @access Private
   */
  async findPendientesCalificar(comprador_id) {
    return TransaccionModel.find({
      comprador_id,
      calificacion: { $exists: false },
      estado: 'completada'
    })
      .populate('vendedor_id', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }

  /**
   * @function update
   * @desc Actualizar datos de una transacción
   * @param {String} id - ID de la transacción
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Transacción actualizada o null
   * @access Private
   */
  async update(id, updateData) {
    return TransaccionModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * @function delete
   * @desc Eliminar una transacción por su ID
   * @param {String} id - ID de la transacción
   * @returns {Promise<Object|null>} Transacción eliminada o null
   * @access Private
   */
  async delete(id) {
    return TransaccionModel.findByIdAndDelete(id);
  }
}

module.exports = TransaccionRepository;