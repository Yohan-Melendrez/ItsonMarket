const PublicacionRepository = require('../repositories/PublicacionRepository');
const repo = new PublicacionRepository();

exports.obtenerPublicaciones = async (req, res) => {
  try {
    const publicaciones = await repo.obtenerTodas();
    res.json(publicaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearPublicacion = async (req, res) => {
  try {
    const nueva = await repo.crear(req.body);
    res.status(201).json({ mensaje: "Publicación creada correctamente", publicacion: nueva });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerPublicacionPorId = async (req, res) => {
  try {
    const pub = await repo.obtenerPorId(req.params.id);
    if (!pub) return res.status(404).json({ error: "Publicación no encontrada" });
    res.json(pub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizarPublicacion = async (req, res) => {
  try {
    const act = await repo.actualizar(req.params.id, req.body);
    res.json({ mensaje: "Publicación actualizada correctamente", publicacion: act });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.eliminarPublicacion = async (req, res) => {
  try {
    await repo.eliminar(req.params.id);
    res.json({ mensaje: "Publicación eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
