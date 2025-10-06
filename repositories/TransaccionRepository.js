const { TransaccionModel } = require('../models/Transaccion');

class TransaccionRepository {

  async insert(transaccionData) {
    const nuevaTransaccion = new TransaccionModel(transaccionData);
    return nuevaTransaccion.save();
  }

  async findAll() {
    return TransaccionModel.find({});
  }

  async findById(id) {
    return TransaccionModel.findById(id);
  }

  async findByComprador(comprador_id) {
    return TransaccionModel.find({ comprador_id });
  }

  async findByVendedor(vendedor_id) {
    return TransaccionModel.find({ vendedor_id });
  }

  async update(id, updateData) {
    return TransaccionModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return TransaccionModel.findByIdAndDelete(id);
  }
}

module.exports = TransaccionRepository;