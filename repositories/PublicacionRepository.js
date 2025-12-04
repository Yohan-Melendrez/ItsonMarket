// repositories/PublicacionRepository.js
const { PublicacionModel } = require('../models/Publicacion');

class PublicacionRepository {
  /**
   * Crear una nueva publicación.
   * @param {Object} data - Datos de la publicación.
   * @returns {Promise<Object>} Publicación creada (objeto plano).
   */
  async create(data) {
    const doc = new PublicacionModel(data);
    const saved = await doc.save();
    return saved.toObject ? saved.toObject() : saved;
  }

  /**
   * Obtener todas las publicaciones ordenadas por fecha_publicacion DESC.
   * (Uso de lean() para mejor rendimiento en lecturas)
   * @returns {Promise<Object[]>} Lista de publicaciones.
   */
  async findAll() {
    return PublicacionModel.find({})
      .sort({ fecha_publicacion: -1 })
      .lean();
  }

  /**
   * Obtener una publicación por su ID.
   * @param {string} id - ObjectId de la publicación.
   * @param {Object} [opts]
   * @param {boolean} [opts.lean=true] - Si true, retorna objetos planos.
   * @returns {Promise<Object|import('mongoose').Document|null>}
   */
  async findById(id, { lean = true } = {}) {
    const q = PublicacionModel.findById(id);
    return lean ? q.lean() : q;
  }

  /**
   * Listado con filtros + paginación + orden.
   * Solo aplica los filtros enviados: categoría, vendedor, título, tipo_publicacion,
   * precio (min/max) y rango de fecha (fecha_publicacion).
   * Este metodo es como un metodo chetado para no tener que craftear multiples metodos 
   * para cada combinacion de filtros posibles. 
   * @param {Object} [params]
   * @param {string} [params.categoria]
   * @param {string} [params.vendedor_id]
   * @param {string} [params.titulo] - Búsqueda parcial (case-insensitive) en "titulo".
   * @param {'producto'|'servicio'} [params.tipo_publicacion]
   * @param {number} [params.precioMin]
   * @param {number} [params.precioMax]
   * @param {string|Date} [params.fechaDesde]
   * @param {string|Date} [params.fechaHasta]
   * @param {string} [params.sort='-fecha_publicacion'] - ej: '-fecha_publicacion' | 'precio' | '-precio'
   * @param {number} [params.page=1]
   * @param {number} [params.limit=12]
   * @returns {Promise<{page:number, limit:number, total:number, pages:number, items:Object[]}>}
   */
  async listPaginated({
    categoria,
    vendedor_id,
    titulo,
    tipo_publicacion,
    precioMin,
    precioMax,
    fechaDesde,
    fechaHasta,
    sort = '-fecha_publicacion',
    page = 1,
    limit = 12,
    includeHidden = false
  } = {}) {
    const filter = {};
    
    if (!includeHidden) {
      filter.visible = true;
    }

    if (categoria) filter.categoria = categoria;
    if (vendedor_id) filter.vendedor_id = vendedor_id;
    if (tipo_publicacion) filter.tipo_publicacion = tipo_publicacion;

    if (titulo && titulo.trim()) {
      filter.titulo = { $regex: new RegExp(titulo.trim(), 'i') };
    }

    if (precioMin !== undefined || precioMax !== undefined) {
      filter.precio = {};
      if (precioMin !== undefined) filter.precio.$gte = Number(precioMin);
      if (precioMax !== undefined) filter.precio.$lte = Number(precioMax);
    }

    if (fechaDesde || fechaHasta) {
      filter.fecha_publicacion = {};
      if (fechaDesde) filter.fecha_publicacion.$gte = new Date(fechaDesde);
      if (fechaHasta) filter.fecha_publicacion.$lte = new Date(fechaHasta);
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 12));
    const skip = (safePage - 1) * safeLimit;

    const cursor = PublicacionModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit)
      .lean();

    const [items, total] = await Promise.all([
      cursor,
      PublicacionModel.countDocuments(filter)
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
      items
    };
  }

  /**
   * Contar publicaciones que coinciden con un filtro.
   * @param {Object} filtros
   * @returns {Promise<number>}
   */
  async count(filtros = {}) {
    return PublicacionModel.countDocuments(filtros);
  }

  /**
   * Actualizar una publicación por ID (parcial o total).
   * Agrega fecha_actualizacion automáticamente.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>} Publicación actualizada.
   */
  async updateById(id, data) {
    return PublicacionModel.findByIdAndUpdate(
      id,
      { ...data, fecha_actualizacion: new Date() },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Cambiar visibilidad (mostrar/ocultar) de una publicación.
   * @param {string} id
   * @param {boolean} visible
   * @returns {Promise<Object|null>}
   */
  async setVisibility(id, visible) {
    return PublicacionModel.findByIdAndUpdate(
      id,
      { visible, fecha_actualizacion: new Date() },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Cambiar estado de una publicación (p.ej., 'disponible', 'pausado', 'vendido').
   * @param {string} id
   * @param {string} estado
   * @returns {Promise<Object|null>}
   */
  async setStatus(id, estado) {
    return PublicacionModel.findByIdAndUpdate(
      id,
      { estado, fecha_actualizacion: new Date() },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Incrementar contador de vistas de forma atómica.
   * @param {string} id
   * @param {number} [inc=1]
   * @returns {Promise<Object|null>}
   */
  async incrementViews(id, inc = 1) {
    return PublicacionModel.findByIdAndUpdate(
      id,
      { $inc: { vistas: inc }, $set: { fecha_actualizacion: new Date() } },
      { new: true }
    ).lean();
  }

  /**
   * Eliminar una publicación por ID.
   * @param {string} id
   * @returns {Promise<Object|null>} Documento eliminado (o null si no existe).
   */
  async deleteById(id) {
    return PublicacionModel.findByIdAndDelete(id).lean();
  }
}

module.exports = PublicacionRepository;