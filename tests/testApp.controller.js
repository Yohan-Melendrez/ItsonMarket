// tests/testApp.controller.js
const express = require('express');
const app = express();
app.use(express.json());

// Router manual minimalista para el controller
const c = require('../controllers/publicacionController');

// mapea igual que tus rutas reales (sólo lo necesario para probar)
const r = express.Router();
r.get('/', c.list);
r.get('/buscar', c.searchByTitle);
r.get('/vendedor/:vendedorId', c.listBySeller);
r.get('/:id', c.getById);
r.post('/', c.create);
r.put('/:id', c.update);
r.patch('/:id/visibilidad', c.setVisibility);
r.patch('/:id/estado', c.setStatus);
r.post('/:id/vista', c.incrementViews);
r.delete('/:id', c.remove);

app.use('/api/publicaciones', r);

// tu error handler real
const errorHandler = require('../middleware/errorHandler');
app.use(errorHandler);

module.exports = app;