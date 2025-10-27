// tests/publicacion.repository.test.js
jest.setTimeout(30000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');


const { PublicacionModel } = require('../models/Publicacion');
const PublicacionRepository = require('../repositories/PublicacionRepository');

describe('PublicacionRepository (Mongo en memoria)', () => {
  let mongo;
  let repo;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });

    try {
      PublicacionModel.schema.index({ vendedor_id: 1, fecha_publicacion: -1 });
      PublicacionModel.schema.index({ categoria: 1, precio: 1, fecha_publicacion: -1 });
      await PublicacionModel.ensureIndexes();
    } catch (_) {}

    repo = new PublicacionRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await PublicacionModel.deleteMany({});
  });

  const vendedorA = new mongoose.Types.ObjectId();
  const vendedorB = new mongoose.Types.ObjectId();

  async function seed() {
    await PublicacionModel.insertMany([
      {
        tipo_publicacion: 'producto',
        vendedor_id: vendedorA,
        titulo: 'Laptop gamer RTX',
        descripcion: 'Muy rápida para gaming',
        categoria: 'Electrónica',
        precio: 25000,
        estado: 'disponible',
        visible: true,
        vistas: 10,
        fecha_publicacion: new Date('2025-10-10'),
      },
      {
        tipo_publicacion: 'servicio',
        vendedor_id: vendedorA,
        titulo: 'Clases de programación',
        descripcion: 'Node.js y React',
        categoria: 'Educación',
        precio: 300,
        estado: 'disponible',
        visible: true,
        vistas: 5,
        fecha_publicacion: new Date('2025-10-12'),
      },
      {
        tipo_publicacion: 'producto',
        vendedor_id: vendedorB,
        titulo: 'Teclado mecánico RGB',
        descripcion: 'Switches rojos',
        categoria: 'Electrónica',
        precio: 1200,
        estado: 'disponible',
        visible: true,
        vistas: 2,
        fecha_publicacion: new Date('2025-10-20'),
      },
      {
        tipo_publicacion: 'producto',
        vendedor_id: vendedorB,
        titulo: 'Silla gamer',
        descripcion: 'Ergonómica',
        categoria: 'Muebles',
        precio: 4000,
        estado: 'disponible',
        visible: false, 
        vistas: 1,
        fecha_publicacion: new Date('2025-10-22'),
      },
    ]);
  }

  test('create() crea una publicación', async () => {
    const created = await repo.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA,
      titulo: 'Mouse inalámbrico',
      descripcion: 'Logi MX',
      categoria: 'Electrónica',
      precio: 1500,
      estado: 'disponible',
      visible: true,
    });

    expect(created).toHaveProperty('_id');
    expect(created.titulo).toBe('Mouse inalámbrico');
  });

  test('findAll() devuelve todas ordenadas por fecha_publicacion DESC', async () => {
    await seed();
    const list = await repo.findAll();
    expect(list.length).toBe(4);
    // La más reciente es 2025-10-22 (Silla gamer)
    const firstISO = new Date(list[0].fecha_publicacion).toISOString();
    expect(firstISO).toBe(new Date('2025-10-22').toISOString());
  });

  test('findById() obtiene por id (lean por defecto)', async () => {
    const doc = await repo.create({
      tipo_publicacion: 'servicio',
      vendedor_id: vendedorA,
      titulo: 'Mentoría backend',
      descripcion: 'Arquitectura Node',
      categoria: 'Educación',
      precio: 500,
      visible: true,
    });

    const got = await repo.findById(doc._id);
    expect(got.titulo).toBe('Mentoría backend');
  });

  test('listPaginated() filtra por categoria + precioMin/Max + título (regex)', async () => {
    await seed();
    const res = await repo.listPaginated({
      categoria: 'Electrónica',
      precioMin: 1000,
      precioMax: 26000,
      titulo: 'gamer', // regex /gamer/i en "titulo"
      page: 1,
      limit: 10,
      sort: '-precio',
    });

    expect(res.total).toBe(1);
    expect(res.items[0].titulo).toMatch(/Laptop gamer RTX/i);
  });

  test('listPaginated() filtra por vendedor_id y tipo_publicacion', async () => {
    await seed();
    const res = await repo.listPaginated({
      vendedor_id: vendedorA.toString(),
      tipo_publicacion: 'servicio',
      page: 1,
      limit: 10,
    });

    expect(res.total).toBe(1);
    expect(res.items[0].titulo).toBe('Clases de programación');
  });

  test('listPaginated() respeta visible=true por defecto (excluye ocultas)', async () => {
    await seed();
    const res = await repo.listPaginated({});
    // De 4, hay 1 oculta => debe traer 3
    expect(res.total).toBe(3);
    const titles = res.items.map(i => i.titulo);
    expect(titles).not.toContain('Silla gamer');
  });

  test('listPaginated() filtra por fechaDesde/fechaHasta (fecha_publicacion)', async () => {
    await seed();
    const res = await repo.listPaginated({
      fechaDesde: '2025-10-11',
      fechaHasta: '2025-10-21',
      sort: 'fecha_publicacion',
    });

    // En ese rango: 2025-10-12 y 2025-10-20 => 2 items
    expect(res.total).toBe(2);
    const fechas = res.items.map(i => new Date(i.fecha_publicacion).toISOString());
    expect(fechas).toContain(new Date('2025-10-12').toISOString());
    expect(fechas).toContain(new Date('2025-10-20').toISOString());
  });

  test('updateById() actualiza y setea fecha_actualizacion', async () => {
    const doc = await repo.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA,
      titulo: 'Monitor 24"',
      descripcion: 'IPS 75Hz',
      categoria: 'Electrónica',
      precio: 2200,
      visible: true,
    });

    const updated = await repo.updateById(doc._id, { precio: 2000, titulo: 'Monitor 24 IPS' });
    expect(updated.precio).toBe(2000);
    expect(updated.titulo).toBe('Monitor 24 IPS');
    expect(updated).toHaveProperty('fecha_actualizacion');
  });

  test('setVisibility() cambia visible', async () => {
    const doc = await repo.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorB,
      titulo: 'SSD 1TB',
      descripcion: 'NVMe',
      categoria: 'Electrónica',
      precio: 1800,
      visible: true,
    });

    const upd = await repo.setVisibility(doc._id, false);
    expect(upd.visible).toBe(false);
  });

  test('setStatus() cambia estado', async () => {
    const doc = await repo.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorB,
      titulo: 'GPU usada',
      descripcion: '3060 Ti',
      categoria: 'Electrónica',
      precio: 6000,
      visible: true,
      estado: 'disponible',
    });

    const upd = await repo.setStatus(doc._id, 'pausado');
    expect(upd.estado).toBe('pausado');
  });

  test('incrementViews() incrementa vistas de forma atómica', async () => {
    const doc = await repo.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA,
      titulo: 'Cámara Web',
      descripcion: '1080p',
      categoria: 'Electrónica',
      precio: 700,
      visible: true,
      vistas: 0,
    });

    const after = await repo.incrementViews(doc._id, 3);
    expect(after.vistas).toBe(3);
  });

  test('deleteById() elimina una publicación', async () => {
    const doc = await repo.create({
      tipo_publicacion: 'servicio',
      vendedor_id: vendedorA,
      titulo: 'Soporte técnico',
      descripcion: 'A domicilio',
      categoria: 'Servicios',
      precio: 350,
      visible: true,
    });

    const deleted = await repo.deleteById(doc._id);
    expect(deleted._id.toString()).toBe(doc._id.toString());

    const shouldBeNull = await repo.findById(doc._id);
    expect(shouldBeNull).toBeNull();
  });
});