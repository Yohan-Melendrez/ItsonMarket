// controllers/publicacionController.js
const PublicacionService = require('../services/PublicacionService');
const svc = new PublicacionService();


const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


exports.create = wrap(async (req, res) => {
  const pub = await svc.create(req.body);
  res.status(201).json(pub);
});


exports.getById = wrap(async (req, res) => {
  const pub = await svc.getById(req.params.id);
  res.status(200).json(pub);
});


exports.list = wrap(async (req, res) => {
  const data = await svc.list({
    categoria: req.query.categoria,
    vendedor_id: req.query.vendedor_id,
    titulo: req.query.titulo,
    tipo_publicacion: req.query.tipo_publicacion,
    precioMin: req.query.precioMin,
    precioMax: req.query.precioMax,
    fechaDesde: req.query.fechaDesde,
    fechaHasta: req.query.fechaHasta,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
    visible: req.query.visible, 
  });
  res.status(200).json(data);
});


exports.listBySeller = wrap(async (req, res) => {
  const data = await svc.listBySeller(req.params.vendedorId, {
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
    visible: req.query.visible,
  });
  res.status(200).json(data);
});


exports.searchByTitle = wrap(async (req, res) => {
  const data = await svc.searchByTitle(req.query.q, {
    categoria: req.query.categoria,
    tipo_publicacion: req.query.tipo_publicacion,
    precioMin: req.query.precioMin,
    precioMax: req.query.precioMax,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
  });
  res.status(200).json(data);
});


exports.update = wrap(async (req, res) => {
  const upd = await svc.update(req.params.id, req.body);
  res.status(200).json(upd);
});


exports.setVisibility = wrap(async (req, res) => {
  const upd = await svc.setVisibility(req.params.id, req.body.visible);
  res.status(200).json(upd);
});


exports.setStatus = wrap(async (req, res) => {
  const upd = await svc.setStatus(req.params.id, req.body.estado);
  res.status(200).json(upd);
});


exports.incrementViews = wrap(async (req, res) => {
  const upd = await svc.incrementViews(req.params.id, req.body.inc ?? 1);
  res.status(200).json(upd);
});


exports.remove = wrap(async (req, res) => {
  await svc.delete(req.params.id);
  res.status(204).send();
});
