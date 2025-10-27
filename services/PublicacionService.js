const mongoose = require('mongoose');
const PublicacionRepository = require('../repositories/PublicacionRepository');

class PublicacionService {
  /**
   * @param {PublicacionRepository} repo
   */
  constructor(repo = new PublicacionRepository()) {
    this.repo = repo;
    this.VALID_TYPES = ['producto', 'servicio'];
    // Ajusta si manejas estados permitidos
    this.VALID_STATUS = ['disponible', 'pausado', 'vendido', 'agotado', 'inactivo'];
  }

  // ===== Helpers =====
  /** @private */
  _ensureObjectId(id, name = 'id') {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error(`ID inválido: ${name}`);
  }

  /** @private */
  _normalizePagination({ page = 1, limit = 12 } = {}) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(100, Number(limit) || 12));
    return { page: p, limit: l };
  }

  // ===== Casos de uso =====

  /**
   * Crear publicación.
   * @param {Object} data
   * @param {'producto'|'servicio'} data.tipo_publicacion
   * @param {string} data.vendedor_id
   * @param {string} data.titulo
   * @param {string} data.descripcion
   * @param {string} data.categoria
   * @param {number} data.precio
   * @param {boolean} [data.visible=true]
   * @param {string} [data.estado='disponible']
   * @returns {Promise<Object>} publicación creada
   */
  async create(data) {
    const required = ['tipo_publicacion','vendedor_id','titulo','descripcion','categoria','precio'];
    for (const f of required) {
      if (data[f] === undefined || data[f] === null || data[f] === '') {
        throw new Error(`Falta campo obligatorio: ${f}`);
      }
    }
    this._ensureObjectId(data.vendedor_id, 'vendedor_id');
    if (!this.VALID_TYPES.includes(data.tipo_publicacion)) throw new Error('tipo_publicacion inválido');
    if (Number(data.precio) < 0) throw new Error('precio inválido');

    const payload = {
      tipo_publicacion: data.tipo_publicacion,
      vendedor_id: data.vendedor_id,
      titulo: String(data.titulo).trim(),
      descripcion: String(data.descripcion).trim(),
      categoria: String(data.categoria).trim(),
      precio: Number(data.precio),
      visible: data.visible !== undefined ? !!data.visible : true,
      estado: data.estado || 'disponible',
      detalles: data.detalles || undefined
    };

    return this.repo.create(payload);
  }

  /**
   * Obtener una publicación por ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    this._ensureObjectId(id);
    const pub = await this.repo.findById(id);
    if (!pub) throw new Error('Publicación no encontrada');
    return pub;
  }

  /**
   * Listado con filtros + paginación + orden.
   * Filtros soportados: categoria, vendedor_id, titulo, tipo_publicacion, precioMin, precioMax, fechaDesde, fechaHasta
   * @param {Object} params
   * @param {string} [params.categoria]
   * @param {string} [params.vendedor_id]
   * @param {string} [params.titulo]
   * @param {'producto'|'servicio'} [params.tipo_publicacion]
   * @param {number} [params.precioMin]
   * @param {number} [params.precioMax]
   * @param {string|Date} [params.fechaDesde]
   * @param {string|Date} [params.fechaHasta]
   * @param {string} [params.sort='-fecha_publicacion']
   * @param {number} [params.page=1]
   * @param {number} [params.limit=12]
   * @returns {Promise<{page:number,limit:number,total:number,pages:number,items:Object[]}>}
   */
  async list(params = {}) {
    if (params.vendedor_id) this._ensureObjectId(params.vendedor_id, 'vendedor_id');
    if (params.tipo_publicacion && !this.VALID_TYPES.includes(params.tipo_publicacion)) {
      throw new Error('tipo_publicacion inválido');
    }
    if (params.precioMin !== undefined && Number(params.precioMin) < 0) {
      throw new Error('precioMin inválido');
    }
    if (params.precioMax !== undefined && Number(params.precioMax) < 0) {
      throw new Error('precioMax inválido');
    }
    const { page, limit } = this._normalizePagination(params);

    return this.repo.listPaginated({
      categoria: params.categoria,
      vendedor_id: params.vendedor_id,
      titulo: params.titulo,
      tipo_publicacion: params.tipo_publicacion,
      precioMin: params.precioMin !== undefined ? Number(params.precioMin) : undefined,
      precioMax: params.precioMax !== undefined ? Number(params.precioMax) : undefined,
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      sort: params.sort || '-fecha_publicacion',
      page,
      limit
    });
  }

  /**
   * Listar por vendedor (atajo a list()).
   * @param {string} vendedor_id
   * @param {Object} [opts]
   */
  async listBySeller(vendedor_id, opts = {}) {
    this._ensureObjectId(vendedor_id, 'vendedor_id');
    return this.list({ ...opts, vendedor_id });
  }

  /**
   * Buscar por título (atajo a list()).
   * @param {string} titulo
   * @param {Object} [opts]
   */
  async searchByTitle(titulo, opts = {}) {
    if (!titulo || !titulo.trim()) throw new Error('titulo requerido');
    return this.list({ ...opts, titulo: titulo.trim() });
  }

  /**
   * Actualizar publicación.
   * @param {string} id
   * @param {Object} patch
   * @returns {Promise<Object>}
   */
  async update(id, patch) {
    this._ensureObjectId(id);
    if (patch.vendedor_id) this._ensureObjectId(patch.vendedor_id, 'vendedor_id');
    if (patch.tipo_publicacion && !this.VALID_TYPES.includes(patch.tipo_publicacion)) {
      throw new Error('tipo_publicacion inválido');
    }
    if (patch.precio !== undefined && Number(patch.precio) < 0) {
      throw new Error('precio inválido');
    }
    const upd = await this.repo.updateById(id, patch);
    if (!upd) throw new Error('Publicación no encontrada');
    return upd;
  }

  /**
   * Cambiar visibilidad (mostrar/ocultar).
   * @param {string} id
   * @param {boolean} visible
   */
  async setVisibility(id, visible) {
    this._ensureObjectId(id);
    const upd = await this.repo.setVisibility(id, !!visible);
    if (!upd) throw new Error('Publicación no encontrada');
    return upd;
  }

  /**
   * Cambiar estado (si usas estados).
   * @param {string} id
   * @param {string} estado
   */
  async setStatus(id, estado) {
    this._ensureObjectId(id);
    if (this.VALID_STATUS.length && !this.VALID_STATUS.includes(estado)) {
      throw new Error('Estado inválido');
    }
    const upd = await this.repo.setStatus(id, estado);
    if (!upd) throw new Error('Publicación no encontrada');
    return upd;
  }

  /**
   * Incrementar vistas.
   * @param {string} id
   * @param {number} inc
   */
  async incrementViews(id, inc = 1) {
    this._ensureObjectId(id);
    const upd = await this.repo.incrementViews(id, Number(inc) || 1);
    if (!upd) throw new Error('Publicación no encontrada');
    return upd;
  }

  /**
   * Eliminar publicación.
   * @param {string} id
   */
  async delete(id) {
    this._ensureObjectId(id);
    const del = await this.repo.deleteById(id);
    if (!del) throw new Error('Publicación no encontrada');
    return del;
  }
}

module.exports = PublicacionService;
