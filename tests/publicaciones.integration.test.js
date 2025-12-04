/**
 * @test Publicaciones (integración happy paths)
 * @desc Suite de pruebas de integración para flujos completos de publicaciones
 * @note Utiliza MongoMemoryServer y app real con router + errorHandler
 */

jest.setTimeout(30000);

jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('../middleware/auth', () => (req, res, next) => next());

const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const publicacionesRouter = require('../routes/publicacionRoutes');
const errorHandler = require('../middleware/errorHandler');
const { PublicacionModel } = require('../models/Publicacion');

describe('Publicaciones (integración happy paths)', () => {
  let mongo;
  let app;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });

    app = express();
    app.use(express.json());
    app.use('/api/publicaciones', publicacionesRouter);
    app.use(errorHandler);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    console.error.mockRestore?.();
  });

  beforeEach(async () => {
    await PublicacionModel.deleteMany({});
  });

  /**
   * @test POST -> GET -> LIST -> PUT -> PATCH visibilidad -> PATCH estado -> POST vista -> DELETE
   * @desc Valida el flujo completo de ciclo de vida de una publicación
   */
  test('POST -> GET -> LIST -> PUT -> PATCH visibilidad -> PATCH estado -> POST vista -> DELETE', async () => {
    const vendedorId = new mongoose.Types.ObjectId().toString();
    const createRes = await request(app)
      .post('/api/publicaciones')
      .send({
        tipo_publicacion: 'producto',
        vendedor_id: vendedorId,
        titulo: 'Teclado mecánico',
        descripcion: 'Switches rojos con RGB',
        categoria: 'Electrónica',
        precio: 1200,
        visible: true
      });

    expect(createRes.status).toBe(201);
    const pub = createRes.body;
    expect(pub).toHaveProperty('_id');

    const getRes = await request(app).get(`/api/publicaciones/${pub._id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.titulo).toBe('Teclado mecánico');

    const listRes = await request(app).get('/api/publicaciones');
    expect(listRes.status).toBe(200);
    expect(listRes.body.total).toBe(1);

    const putRes = await request(app)
      .put(`/api/publicaciones/${pub._id}`)
      .send({ titulo: 'Teclado mecánico RGB', precio: 1300 });
    expect(putRes.status).toBe(200);
    expect(putRes.body.titulo).toBe('Teclado mecánico RGB');
    expect(putRes.body.precio).toBe(1300);

    const visRes = await request(app)
      .patch(`/api/publicaciones/${pub._id}/visibilidad`)
      .send({ visible: false });
    expect(visRes.status).toBe(200);
    expect(visRes.body.visible).toBe(false);

    const estRes = await request(app)
      .patch(`/api/publicaciones/${pub._id}/estado`)
      .send({ estado: 'pausado' });
    expect(estRes.status).toBe(200);
    expect(estRes.body.estado).toBe('pausado');

    const vistaRes = await request(app)
      .post(`/api/publicaciones/${pub._id}/vista`)
      .send({ inc: 3 });
    expect(vistaRes.status).toBe(200);
    expect(vistaRes.body.vistas).toBe(3);

    const delRes = await request(app).delete(`/api/publicaciones/${pub._id}`);
    expect(delRes.status).toBe(204);

    const getGone = await request(app).get(`/api/publicaciones/${pub._id}`);
    expect(getGone.status).toBe(404);
  });

  /**
   * @test GET /vendedor/:vendedorId y /buscar?q= -> happy path
   * @desc Verifica búsquedas especializadas por vendedor y por término de búsqueda
   */
  test('GET /vendedor/:vendedorId y /buscar?q= -> happy path', async () => {
    const vendedorId = new mongoose.Types.ObjectId().toString();

    await request(app).post('/api/publicaciones').send({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorId,
      titulo: 'Mouse gamer',
      descripcion: 'Ergonómico 16000 DPI', 
      categoria: 'Electrónica',
      precio: 800,
      visible: true
    });

    await request(app).post('/api/publicaciones').send({
      tipo_publicacion: 'servicio',
      vendedor_id: vendedorId,
      titulo: 'Mantenimiento PC',
      descripcion: 'Limpieza, cambio de pasta y formateo',
      categoria: 'Servicios',
      precio: 500,
      visible: true
    });

    await request(app).post('/api/publicaciones').send({
      tipo_publicacion: 'producto',
      vendedor_id: new mongoose.Types.ObjectId().toString(),
      titulo: 'Teclado 60%',
      descripcion: 'RGB, switches brown',
      categoria: 'Electrónica',
      precio: 1100,
      visible: true
    });

    const bySeller = await request(app).get(`/api/publicaciones/vendedor/${vendedorId}`);
    expect(bySeller.status).toBe(200);
    expect(bySeller.body.total).toBe(2);

    const search = await request(app)
      .get('/api/publicaciones/buscar')
      .query({ q: 'mouse' });
    expect(search.status).toBe(200);
    expect(search.body.total).toBe(1);
    expect(search.body.items[0].titulo).toMatch(/mouse/i);
  });
});
