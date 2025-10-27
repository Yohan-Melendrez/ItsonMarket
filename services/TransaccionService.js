const mongoose = require('mongoose');
const TransaccionRepository = require('../repositories/TransaccionRepository');

const ESTADOS = ['pendiente', 'completada', 'cancelada'];
const TIPOS = ['producto', 'servicio'];

class TransaccionService {
  constructor() {
    this.repo = new TransaccionRepository();
  }

  #isObjectId(v) {
    return mongoose.Types.ObjectId.isValid(v);
  }

  #validatePayload(data, { isUpdate = false } = {}) {
    if (!isUpdate) {
      if (!data.comprador_id || !data.vendedor_id || !data.publicacion_id) {
        throw new Error('comprador_id, vendedor_id y publicacion_id son obligatorios');
      }
      if (![data.comprador_id, data.vendedor_id, data.publicacion_id].every(this.#isObjectId)) {
        throw new Error('IDs inválidos');
      }
      if (!data.tipo_publicacion || !TIPOS.includes(data.tipo_publicacion)) {
        throw new Error('tipo_publicacion inválido (producto | servicio)');
      }
      if (typeof data.monto !== 'number' || data.monto <= 0) {
        throw new Error('monto debe ser un número > 0');
      }
    }
    if (data.estado && !ESTADOS.includes(data.estado)) {
      throw new Error(`estado inválido (${ESTADOS.join(', ')})`);
    }

    const validarCal = (c) => {
      if (!c) return;
      if (typeof c.puntuacion !== 'number' || c.puntuacion < 1 || c.puntuacion > 5) {
        throw new Error('puntuacion debe estar entre 1 y 5');
      }
    };
    if (data.calificaciones) {
      validarCal(data.calificaciones.comprador_a_vendedor);
      validarCal(data.calificaciones.vendedor_a_comprador);
    }
  }

  async crear(data) {
    this.#validatePayload(data);
    if (String(data.comprador_id) === String(data.vendedor_id)) {
      throw new Error('El comprador y el vendedor no pueden ser la misma persona');
    }
    data.estado = data.estado || 'pendiente';
    data.fecha_transaccion = data.fecha_transaccion || new Date();
    return this.repo.insert(data);
  }

  async listar(filtro = {}) {
    const q = {};
    if (filtro.comprador_id && this.#isObjectId(filtro.comprador_id)) q.comprador_id = filtro.comprador_id;
    if (filtro.vendedor_id && this.#isObjectId(filtro.vendedor_id)) q.vendedor_id = filtro.vendedor_id;
    if (filtro.estado && ESTADOS.includes(filtro.estado)) q.estado = filtro.estado;
    return this.repo.findAll(q);
  }

  async obtenerPorId(id) {
    if (!this.#isObjectId(id)) throw new Error('ID inválido');
    return this.repo.findById(id);
  }

  async actualizar(id, data) {
    if (!this.#isObjectId(id)) throw new Error('ID inválido');
    this.#validatePayload(data, { isUpdate: true });

    if (data.estado) {
      const actual = await this.repo.findById(id);
      if (!actual) return null;
      if (actual.estado === 'cancelada' && data.estado === 'completada') {
        throw new Error('No se puede pasar de cancelada a completada');
      }
    }
    return this.repo.update(id, data);
  }

  async eliminar(id) {
    if (!this.#isObjectId(id)) throw new Error('ID inválido');
    return this.repo.delete(id);
  }
}

module.exports = TransaccionService;
