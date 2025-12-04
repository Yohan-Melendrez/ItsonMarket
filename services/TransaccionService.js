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

    if (data.calificacion) {
      if (typeof data.calificacion.puntuacion !== 'number' || 
          data.calificacion.puntuacion < 1 || 
          data.calificacion.puntuacion > 5) {
        throw new Error('puntuacion debe estar entre 1 y 5');
      }
    }
  }

  /**
   * @function marcarVenta
   * @desc Registrar una venta - el vendedor marca una publicación como vendida
   * @param {Object} params - Parámetros de la venta
   * @param {String} params.publicacion_id - ID de la publicación
   * @param {String} params.comprador_itson_id - ITSON ID del comprador
   * @param {String} params.vendedor_id - ID del vendedor
   * @returns {Promise<Object>} Objeto con transacción, datos del comprador y estado de registro
   * @throws {Error} Si los datos son inválidos o no hay permisos
   * @access Private
   */
  async marcarVenta({ publicacion_id, comprador_itson_id, vendedor_id }) {
    console.log('=== MARCAR VENTA ===');
    console.log('publicacion_id:', publicacion_id);
    console.log('comprador_itson_id:', comprador_itson_id);
    console.log('vendedor_id:', vendedor_id);

    if (!this.#isObjectId(publicacion_id)) {
      throw new Error('ID de publicación inválido');
    }
    
    const publicacion = await this.publicacionRepo.findById(publicacion_id);
    console.log('Publicación encontrada:', publicacion ? publicacion.titulo : 'NO');
    
    if (!publicacion) {
      throw new Error('Publicación no encontrada');
    }

    console.log('Comparando vendedor_id:', String(publicacion.vendedor_id), 'con', String(vendedor_id));
    if (String(publicacion.vendedor_id) !== String(vendedor_id)) {
      throw new Error('No tienes permiso para marcar ventas en esta publicación');
    }

    if (!comprador_itson_id || !/^\d{1,11}$/.test(comprador_itson_id)) {
      throw new Error('ITSON ID del comprador inválido');
    }

    const itsonIdNormalizado = comprador_itson_id.padStart(11, '0');
    console.log('ITSON ID normalizado:', itsonIdNormalizado);

    const comprador = await this.usuarioRepo.findByItsonId(itsonIdNormalizado);
    console.log('Comprador encontrado:', comprador ? comprador.nombre : 'NO (pero continuamos)');
    
    if (comprador && String(comprador._id) === String(vendedor_id)) {
      throw new Error('No puedes registrar una venta a ti mismo');
    }

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
   * @function vincularTransaccionesPendientes
   * @desc Vincular transacciones pendientes a un usuario registrado
   * @param {Object} usuario - Objeto del usuario
   * @returns {Promise<Number>} Cantidad de transacciones vinculadas
   * @access Private
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
   * @function calificar
   * @desc Calificar una transacción - el comprador califica al vendedor
   * @param {String} transaccionId - ID de la transacción
   * @param {String} compradorId - ID del comprador que califica
   * @param {Object} params - Datos de la calificación
   * @param {Number} params.puntuacion - Puntuación de 1 a 5
   * @param {String} params.comentario - Comentario opcional
   * @returns {Promise<Object>} Transacción actualizada con calificación
   * @throws {Error} Si los datos son inválidos o no hay permisos
   * @access Private
   */
  async calificar(transaccionId, compradorId, { puntuacion, comentario }) {
    if (!this.#isObjectId(transaccionId)) {
      throw new Error('ID de transacción inválido');
    }

    const transaccion = await this.repo.findById(transaccionId);
    if (!transaccion) {
      throw new Error('Transacción no encontrada');
    }

    const usuarioCalificador = await this.usuarioRepo.findById(compradorId);
    if (!usuarioCalificador) {
      throw new Error('Usuario no encontrado');
    }

    const esCompradorPorId = transaccion.comprador_id && String(transaccion.comprador_id._id || transaccion.comprador_id) === String(compradorId);
    const esCompradorPorItsonId = transaccion.comprador_itson_id === usuarioCalificador.itson_id;
    
    if (!esCompradorPorId && !esCompradorPorItsonId) {
      throw new Error('Solo el comprador puede calificar esta transacción');
    }

    if (transaccion.calificacion) {
      throw new Error('Esta transacción ya fue calificada');
    }

    if (!transaccion.comprador_id && esCompradorPorItsonId) {
      await this.repo.update(transaccionId, { comprador_id: compradorId });
    }

    const actualizada = await this.repo.update(transaccionId, {
      calificacion: {
        puntuacion,
        comentario: comentario || '',
        fecha: new Date()
      }
    });

    await this.actualizarReputacionVendedor(transaccion.vendedor_id);

    return actualizada;
  }

  /**
   * @function actualizarReputacionVendedor
   * @desc Actualizar la reputación promedio de un vendedor basado en sus calificaciones
   * @param {String} vendedorId - ID del vendedor
   * @returns {Promise<void>}
   * @access Private
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
   * @function obtenerTransaccionesUsuario
   * @desc Obtener todas las transacciones de un usuario como comprador o vendedor
   * @param {String} usuarioId - ID del usuario
   * @param {String} itsonId - ITSON ID del usuario
   * @returns {Promise<Array>} Array de transacciones del usuario
   * @access Private
   */
  async obtenerTransaccionesUsuario(usuarioId, itsonId) {
    const transacciones = await this.repo.findByUsuario(usuarioId, itsonId);
    return transacciones;
  }

  /**
   * @function crear
   * @desc Crear una nueva transacción con validación de datos
   * @param {Object} data - Datos de la transacción
   * @returns {Promise<Object>} Transacción creada
   * @throws {Error} Si los datos son inválidos o comprador y vendedor son la misma persona
   * @access Private
   */
  async crear(data) {
    this.#validatePayload(data);
    if (data.comprador_id && String(data.comprador_id) === String(data.vendedor_id)) {
      throw new Error('El comprador y el vendedor no pueden ser la misma persona');
    }
    data.estado = data.estado || 'completada';
    data.fecha_transaccion = data.fecha_transaccion || new Date();
    return this.repo.insert(data);
  }

  /**
   * @function listar
   * @desc Obtener lista de transacciones con filtros
   * @param {Object} filtro - Parámetros de filtro
   * @returns {Promise<Array>} Array de transacciones filtradas
   * @access Private
   */
  async listar(filtro = {}) {
    const q = {};
    if (filtro.comprador_id && this.#isObjectId(filtro.comprador_id)) q.comprador_id = filtro.comprador_id;
    if (filtro.vendedor_id && this.#isObjectId(filtro.vendedor_id)) q.vendedor_id = filtro.vendedor_id;
    if (filtro.estado && ESTADOS.includes(filtro.estado)) q.estado = filtro.estado;
    return this.repo.findAll(q);
  }

  /**
   * @function obtenerPorId
   * @desc Obtener una transacción por su ID
   * @param {String} id - ID de la transacción
   * @returns {Promise<Object|null>} Transacción encontrada o null
   * @throws {Error} Si el ID es inválido
   * @access Private
   */
  async obtenerPorId(id) {
    if (!this.#isObjectId(id)) throw new Error('ID inválido');
    return this.repo.findById(id);
  }

  /**
   * @function actualizar
   * @desc Actualizar datos de una transacción con validaciones de estado
   * @param {String} id - ID de la transacción
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object|null>} Transacción actualizada o null
   * @throws {Error} Si el ID es inválido o cambio de estado es inválido
   * @access Private
   */
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

  /**
   * @function eliminar
   * @desc Eliminar una transacción
   * @param {String} id - ID de la transacción
   * @returns {Promise<Object|null>} Transacción eliminada o null
   * @throws {Error} Si el ID es inválido
   * @access Private
   */
  async eliminar(id) {
    if (!this.#isObjectId(id)) throw new Error('ID inválido');
    return this.repo.delete(id);
  }
}

module.exports = TransaccionService;
