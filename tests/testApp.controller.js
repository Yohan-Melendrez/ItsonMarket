/**
 * @file testApp.controller.js
 * @desc Aplicación Express de prueba para testing del controlador de publicaciones
 * @note Configura rutas de publicaciones, middleware de parsing JSON y errorHandler
 */

const express = require('express');
const app = express();
app.use(express.json());

const c = require('../controllers/publicacionController');

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

const errorHandler = require('../middleware/errorHandler');
app.use(errorHandler);

module.exports = app;