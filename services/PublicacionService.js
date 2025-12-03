// services/PublicacionService.js
const mongoose = require('mongoose');
const PublicacionRepository = require('../repositories/PublicacionRepository');

class PublicacionService {
  constructor(repo = new PublicacionRepository()) {
    this.repo = repo;
    this.VALID_TYPES = ['producto', 'servicio'];
    this.VALID_STATUS = ['disponible', 'pausado', 'vendido', 'agotado', 'inactivo'];
  }

  // ==== Helpers ====
// reemplaza tu _ensureObjectId por esta versión
  _ensureObjectId(id, name = 'id') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Cast to ObjectId failed');
      err.name = 'CastError';      // <- para que el errorHandler responda 400
      err.path = name;
      throw err;
    }
  }

  _normalizePagination({ page = 1, limit = 12 } = {}) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(100, Number(limit) || 12));
    return { page: p, limit: l };
  }

// helper para 404
  _notFound(msg = 'Publicación no encontrada') {
    const err = new Error(msg);
    err.status = 404;              // <- para que el errorHandler responda 404
    return err;
  }

  // ==== Casos de uso ====

  async create(data) {
    const required = ['tipo_publicacion','vendedor_id','titulo','descripcion','categoria','precio'];
    for (const f of required) {
      if (data[f] === undefined || data[f] === null || data[f] === '') {
        throw new Error(`Falta campo obligatorio: ${f}`);
      }
    }
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

  async getById(id) {
    this._ensureObjectId(id);
    const pub = await this.repo.findById(id);
    if (!pub) throw this._notFound();
    return pub;
  }

  async list(params = {}) {
    // vendedor_id puede ser ObjectId o string, no validar como ObjectId
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
      limit,
      includeHidden: params.includeHidden || false
    });
  }

  async listBySeller(vendedor_id, opts = {}) {
    // Cuando se lista por vendedor, incluir publicaciones ocultas (son del propio vendedor)
    return this.list({ ...opts, vendedor_id, includeHidden: true });
  }

  async searchByTitle(titulo, opts = {}) {
    if (!titulo || !titulo.trim()) throw new Error('titulo requerido');
    return this.list({ ...opts, titulo: titulo.trim() });
  }

  async update(id, patch) {
    this._ensureObjectId(id);
    
    if (patch.tipo_publicacion && !this.VALID_TYPES.includes(patch.tipo_publicacion)) {
      throw new Error('tipo_publicacion inválido');
    }
    if (patch.precio !== undefined && Number(patch.precio) < 0) {
      throw new Error('precio inválido');
    }
    const upd = await this.repo.updateById(id, patch);
    if (!upd) throw this._notFound();
    return upd;
  }

  async setVisibility(id, visible) {
    this._ensureObjectId(id);
    const upd = await this.repo.setVisibility(id, !!visible);
    if (!upd) throw this._notFound();
    return upd;
  }

  async setStatus(id, estado) {
    this._ensureObjectId(id);
    if (this.VALID_STATUS.length && !this.VALID_STATUS.includes(estado)) {
      throw new Error('Estado inválido');
    }
    const upd = await this.repo.setStatus(id, estado);
    if (!upd) throw this._notFound();
    return upd;
  }

  async incrementViews(id, inc = 1) {
    this._ensureObjectId(id);
    const upd = await this.repo.incrementViews(id, Number(inc) || 1);
    if (!upd) throw this._notFound();
    return upd;
  }

  async delete(id) {
    this._ensureObjectId(id);
    const del = await this.repo.deleteById(id);
    if (!del) throw this._notFound();
    return del;
  }
}

module.exports = PublicacionService;