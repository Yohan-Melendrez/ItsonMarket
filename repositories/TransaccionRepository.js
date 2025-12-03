const { TransaccionModel } = require('../models/Transaccion');

class TransaccionRepository {

  async insert(transaccionData) {
    const nuevaTransaccion = new TransaccionModel(transaccionData);
    return nuevaTransaccion.save();
  }

  async findAll(filter = {}) {
    return TransaccionModel.find(filter)
      .populate('comprador_id', 'nombre foto carrera itson_id')
      .populate('vendedor_id', 'nombre foto carrera itson_id')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }

  async findById(id) {
    return TransaccionModel.findById(id)
      .populate('comprador_id', 'nombre foto carrera itson_id')
      .populate('vendedor_id', 'nombre foto carrera itson_id')
      .populate('publicacion_id', 'titulo precio detalles');
  }

  async findByComprador(comprador_id) {
    return TransaccionModel.find({ comprador_id })
      .populate('vendedor_id', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }

  async findByVendedor(vendedor_id) {
    return TransaccionModel.find({ vendedor_id })
      .populate('comprador_id', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }

  /**
   * Buscar transacciones por ITSON ID del comprador (para usuarios no registrados)
   */
  async findByCompradorItsonId(itson_id) {
    return TransaccionModel.find({ comprador_itson_id: itson_id })
      .populate('vendedor_id', 'nombre foto carrera')
      .populate('publicacion_id', 'titulo precio detalles')
      .sort({ fecha_transaccion: -1 });
  }

  /**
   * Buscar todas las transacciones de un usuario (como comprador o vendedor)
   */
  async findByUsuario(usuarioId, itsonId) {
    const query = {
      $or: [
        { comprador_id: usuarioId },
        { vendedor_id: usuarioId }
      ]
    };
    
    // También incluir transacciones por ITSON ID si el usuario no estaba registrado
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
   * Buscar transacciones sin calificar de un comprador
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

  async update(id, updateData) {
    return TransaccionModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return TransaccionModel.findByIdAndDelete(id);
  }
}

module.exports = TransaccionRepository;