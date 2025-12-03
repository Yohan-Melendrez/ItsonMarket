const mongoose = require('mongoose');
const TransaccionRepository = require('../repositories/TransaccionRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const PublicacionRepository = require('../repositories/PublicacionRepository');

const ESTADOS = ['pendiente', 'completada', 'cancelada'];
const TIPOS = ['producto', 'servicio'];

class TransaccionService {
  constructor() {
    this.repo = new TransaccionRepository();
    this.usuarioRepo = new UsuarioRepository();
    this.publicacionRepo = new PublicacionRepository();
  }

  #isObjectId(v) {
    return mongoose.Types.ObjectId.isValid(v);
  }

  #validatePayload(data, { isUpdate = false } = {}) {
    if (!isUpdate) {
      // Para el nuevo flujo, solo requerimos comprador_itson_id
      if (!data.comprador_itson_id) {
        throw new Error('comprador_itson_id es obligatorio');
      }
      if (!data.vendedor_id || !data.publicacion_id) {
        throw new Error('vendedor_id y publicacion_id son obligatorios');
      }
      if (![data.vendedor_id, data.publicacion_id].every(this.#isObjectId)) {
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

    // Validar calificación si existe
    if (data.calificacion) {
      if (typeof data.calificacion.puntuacion !== 'number' || 
          data.calificacion.puntuacion < 1 || 
          data.calificacion.puntuacion > 5) {
        throw new Error('puntuacion debe estar entre 1 y 5');
      }
    }
  }

  /**
   * Marcar una venta - el vendedor registra que vendió a un comprador por su ITSON ID
   */
  async marcarVenta({ publicacion_id, comprador_itson_id, vendedor_id }) {
    console.log('=== MARCAR VENTA ===');
    console.log('publicacion_id:', publicacion_id);
    console.log('comprador_itson_id:', comprador_itson_id);
    console.log('vendedor_id:', vendedor_id);

    // Validar publicación
    if (!this.#isObjectId(publicacion_id)) {
      throw new Error('ID de publicación inválido');
    }
    
    const publicacion = await this.publicacionRepo.findById(publicacion_id);
    console.log('Publicación encontrada:', publicacion ? publicacion.titulo : 'NO');
    
    if (!publicacion) {
      throw new Error('Publicación no encontrada');
    }

    // Verificar que el vendedor sea el dueño de la publicación
    console.log('Comparando vendedor_id:', String(publicacion.vendedor_id), 'con', String(vendedor_id));
    if (String(publicacion.vendedor_id) !== String(vendedor_id)) {
      throw new Error('No tienes permiso para marcar ventas en esta publicación');
    }

    // Validar ITSON ID (aceptar 1-11 dígitos)
    if (!comprador_itson_id || !/^\d{1,11}$/.test(comprador_itson_id)) {
      throw new Error('ITSON ID del comprador inválido');
    }

    // Normalizar ITSON ID a 11 dígitos con ceros al inicio
    const itsonIdNormalizado = comprador_itson_id.padStart(11, '0');
    console.log('ITSON ID normalizado:', itsonIdNormalizado);

    // Buscar si el comprador existe en el sistema
    const comprador = await this.usuarioRepo.findByItsonId(itsonIdNormalizado);
    console.log('Comprador encontrado:', comprador ? comprador.nombre : 'NO (pero continuamos)');
    
    // No permitir venderse a sí mismo
    if (comprador && String(comprador._id) === String(vendedor_id)) {
      throw new Error('No puedes registrar una venta a ti mismo');
    }

    // Crear la transacción (guardar ITSON ID normalizado)
    const transaccionData = {
      comprador_id: comprador ? comprador._id : null,
      comprador_itson_id: itsonIdNormalizado,
      vendedor_id: vendedor_id,
      publicacion_id: publicacion_id,
      tipo_publicacion: publicacion.tipo_publicacion,
      monto: publicacion.precio,
      estado: 'completada',
      fecha_transaccion: new Date(),
      notificacion_enviada: false
    };

    console.log('Creando transacción con datos:', JSON.stringify(transaccionData, null, 2));
    
    const transaccion = await this.repo.insert(transaccionData);
    console.log('Transacción creada con ID:', transaccion._id);

    return {
      transaccion,
      compradorRegistrado: !!comprador,
      comprador: comprador ? {
        _id: comprador._id,
        nombre: comprador.nombre,
        itson_id: comprador.itson_id
      } : null
    };
  }

  /**
   * Vincular transacciones pendientes cuando un usuario se registra
   */
  async vincularTransaccionesPendientes(usuario) {
    const transaccionesPendientes = await this.repo.findByCompradorItsonId(usuario.itson_id);
    
    for (const trx of transaccionesPendientes) {
      if (!trx.comprador_id) {
        await this.repo.update(trx._id, { comprador_id: usuario._id });
      }
    }

    return transaccionesPendientes.length;
  }

  /**
   * Calificar una transacción (el comprador califica al vendedor)
   */
  async calificar(transaccionId, compradorId, { puntuacion, comentario }) {
    if (!this.#isObjectId(transaccionId)) {
      throw new Error('ID de transacción inválido');
    }

    const transaccion = await this.repo.findById(transaccionId);
    if (!transaccion) {
      throw new Error('Transacción no encontrada');
    }

    // Obtener el usuario que está calificando para verificar su ITSON ID
    const usuarioCalificador = await this.usuarioRepo.findById(compradorId);
    if (!usuarioCalificador) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que el que califica es el comprador (por ID o por ITSON ID)
    const esCompradorPorId = transaccion.comprador_id && String(transaccion.comprador_id._id || transaccion.comprador_id) === String(compradorId);
    const esCompradorPorItsonId = transaccion.comprador_itson_id === usuarioCalificador.itson_id;
    
    if (!esCompradorPorId && !esCompradorPorItsonId) {
      throw new Error('Solo el comprador puede calificar esta transacción');
    }

    // Verificar que no haya sido calificada ya
    if (transaccion.calificacion) {
      throw new Error('Esta transacción ya fue calificada');
    }

    // Si el comprador_id estaba null, actualizarlo ahora
    if (!transaccion.comprador_id && esCompradorPorItsonId) {
      await this.repo.update(transaccionId, { comprador_id: compradorId });
    }

    // Actualizar la transacción con la calificación
    const actualizada = await this.repo.update(transaccionId, {
      calificacion: {
        puntuacion,
        comentario: comentario || '',
        fecha: new Date()
      }
    });

    // Actualizar la reputación del vendedor
    await this.actualizarReputacionVendedor(transaccion.vendedor_id);

    return actualizada;
  }

  /**
   * Recalcular la reputación de un vendedor basada en sus calificaciones
   */
  async actualizarReputacionVendedor(vendedorId) {
    const transacciones = await this.repo.findAll({ vendedor_id: vendedorId });
    
    const calificaciones = transacciones
      .filter(t => t.calificacion && t.calificacion.puntuacion)
      .map(t => t.calificacion.puntuacion);

    if (calificaciones.length === 0) return;

    const promedio = calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
    
    await this.usuarioRepo.updateById(vendedorId, { reputacion: promedio });
  }

  /**
   * Obtener transacciones de un usuario (como comprador o vendedor)
   */
  async obtenerTransaccionesUsuario(usuarioId, itsonId) {
    const transacciones = await this.repo.findByUsuario(usuarioId, itsonId);
    return transacciones;
  }

  async crear(data) {
    this.#validatePayload(data);
    if (data.comprador_id && String(data.comprador_id) === String(data.vendedor_id)) {
      throw new Error('El comprador y el vendedor no pueden ser la misma persona');
    }
    data.estado = data.estado || 'completada';
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
