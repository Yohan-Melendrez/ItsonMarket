// services/PublicacionService.js
const mongoose = require('mongoose');
const PublicacionRepository = require('../repositories/PublicacionRepository');

class PublicacionService {
  constructor(repo = new PublicacionRepository()) {
    this.repo = repo;
    this.VALID_TYPES = ['producto', 'servicio'];
    this.VALID_STATUS = ['disponible', 'pausado', 'vendido', 'agotado', 'inactivo'];
  }


  _ensureObjectId(id, name = 'id') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Cast to ObjectId failed');
      err.name = 'CastError';      
      err.path = name;
      throw err;
    }
  }

  _normalizePagination({ page = 1, limit = 12 } = {}) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(100, Number(limit) || 12));
    return { page: p, limit: l };
  }


  _notFound(msg = 'Publicación no encontrada') {
    const err = new Error(msg);
    err.status = 404;              
    return err;
  }

  

  /**
   * @function create
   * @desc Crear una nueva publicación con validación de datos obligatorios
   * @param {Object} data - Datos de la publicación
   * @returns {Promise<Object>} Publicación creada
   * @throws {Error} Si falta campo obligatorio o datos inválidos
   * @access Private
   */
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

  /**
   * @function getById
   * @desc Obtener una publicación por su ID
   * @param {String} id - ID de la publicación
   * @returns {Promise<Object>} Publicación encontrada
   * @throws {Error} Si el ID es inválido o publicación no existe
   * @access Private
   */
  async getById(id) {
    this._ensureObjectId(id);
    const pub = await this.repo.findById(id);
    if (!pub) throw this._notFound();
    return pub;
  }

  /**
   * @function list
   * @desc Obtener lista paginada de publicaciones con múltiples filtros
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Object>} Objeto con publicaciones y información de paginación
   * @throws {Error} Si los parámetros de filtro son inválidos
   * @access Private
   */
  async list(params = {}) {
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

  /**
   * @function listBySeller
   * @desc Obtener todas las publicaciones de un vendedor específico
   * @param {String} vendedor_id - ID del vendedor
   * @param {Object} opts - Opciones adicionales de filtro
   * @returns {Promise<Object>} Publicaciones del vendedor con paginación
   * @access Private
   */
  async listBySeller(vendedor_id, opts = {}) {
    return this.list({ ...opts, vendedor_id, includeHidden: true });
  }

  /**
   * @function searchByTitle
   * @desc Buscar publicaciones por título
   * @param {String} titulo - Término de búsqueda
   * @param {Object} opts - Opciones adicionales de filtro
   * @returns {Promise<Object>} Publicaciones encontradas con paginación
   * @throws {Error} Si el título está vacío
   * @access Private
   */
  async searchByTitle(titulo, opts = {}) {
    if (!titulo || !titulo.trim()) throw new Error('titulo requerido');
    return this.list({ ...opts, titulo: titulo.trim() });
  }

  /**
   * @function update
   * @desc Actualizar datos de una publicación
   * @param {String} id - ID de la publicación
   * @param {Object} patch - Datos a actualizar
   * @returns {Promise<Object>} Publicación actualizada
   * @throws {Error} Si el ID es inválido, datos son inválidos o publicación no existe
   * @access Private
   */
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

  /**
   * @function setVisibility
   * @desc Cambiar la visibilidad de una publicación
   * @param {String} id - ID de la publicación
   * @param {Boolean} visible - Visibilidad (true/false)
   * @returns {Promise<Object>} Publicación actualizada
   * @throws {Error} Si el ID es inválido o publicación no existe
   * @access Private
   */
  async setVisibility(id, visible) {
    this._ensureObjectId(id);
    const upd = await this.repo.setVisibility(id, !!visible);
    if (!upd) throw this._notFound();
    return upd;
  }

  /**
   * @function setStatus
   * @desc Cambiar el estado de una publicación
   * @param {String} id - ID de la publicación
   * @param {String} estado - Nuevo estado (disponible, pausado, vendido, etc)
   * @returns {Promise<Object>} Publicación actualizada
   * @throws {Error} Si el ID es inválido, estado es inválido o publicación no existe
   * @access Private
   */
  async setStatus(id, estado) {
    this._ensureObjectId(id);
    if (this.VALID_STATUS.length && !this.VALID_STATUS.includes(estado)) {
      throw new Error('Estado inválido');
    }
    const upd = await this.repo.setStatus(id, estado);
    if (!upd) throw this._notFound();
    return upd;
  }

  /**
   * @function incrementViews
   * @desc Incrementar el contador de visualizaciones de una publicación
   * @param {String} id - ID de la publicación
   * @param {Number} inc - Cantidad a incrementar (por defecto 1)
   * @returns {Promise<Object>} Publicación actualizada
   * @throws {Error} Si el ID es inválido o publicación no existe
   * @access Private
   */
  async incrementViews(id, inc = 1) {
    this._ensureObjectId(id);
    const upd = await this.repo.incrementViews(id, Number(inc) || 1);
    if (!upd) throw this._notFound();
    return upd;
  }

  /**
   * @function delete
   * @desc Eliminar una publicación
   * @param {String} id - ID de la publicación
   * @returns {Promise<Object>} Publicación eliminada
   * @throws {Error} Si el ID es inválido o publicación no existe
   * @access Private
   */
  async delete(id) {
    this._ensureObjectId(id);
    const del = await this.repo.deleteById(id);
    if (!del) throw this._notFound();
    return del;
  }
}

module.exports = PublicacionService;