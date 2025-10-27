// tests/publicacion.service.test.js
jest.setTimeout(30000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Importa tus piezas reales
const { PublicacionModel } = require('../models/Publicacion');
const PublicacionService = require('../services/PublicacionService');

describe('PublicacionService (Mongo en memoria)', () => {
  let mongo;
  let svc;

  // ========= Setup / Teardown =========
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });

    // (Opcional) índices útiles
    try {
      PublicacionModel.schema.index({ vendedor_id: 1, fecha_publicacion: -1 });
      PublicacionModel.schema.index({ categoria: 1, precio: 1, fecha_publicacion: -1 });
      await PublicacionModel.createIndexes();
    } catch (_) {}

    svc = new PublicacionService(); // usa el repo real por defecto
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await PublicacionModel.deleteMany({});
  });

  // ========= Helpers / Seeds =========
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

  // ========= Tests: Creación / Obtener =========
  test('create() crea y valida campos obligatorios', async () => {
    const created = await svc.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA.toString(),
      titulo: 'Mouse inalámbrico',
      descripcion: 'Logi MX',
      categoria: 'Electrónica',
      precio: 1500,
      visible: true,
    });
    expect(created).toHaveProperty('_id');
    expect(created.titulo).toBe('Mouse inalámbrico');
  });

  test('create() falla si falta un campo requerido', async () => {
    await expect(svc.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA.toString(),
      // titulo falta
      descripcion: 'desc',
      categoria: 'X',
      precio: 10
    })).rejects.toThrow('Falta campo obligatorio: titulo');
  });

  test('create() valida tipo_publicacion y precio', async () => {
    await expect(svc.create({
      tipo_publicacion: 'otro',
      vendedor_id: vendedorA.toString(),
      titulo: 'X',
      descripcion: 'Y',
      categoria: 'Z',
      precio: 10
    })).rejects.toThrow('tipo_publicacion inválido');

    await expect(svc.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA.toString(),
      titulo: 'X',
      descripcion: 'Y',
      categoria: 'Z',
      precio: -1
    })).rejects.toThrow('precio inválido');
  });

  test('getById() regresa una publicación y valida ID', async () => {
    const created = await svc.create({
      tipo_publicacion: 'servicio',
      vendedor_id: vendedorA.toString(),
      titulo: 'Mentoría backend',
      descripcion: 'Arquitectura Node',
      categoria: 'Educación',
      precio: 500,
    });

    const got = await svc.getById(created._id);
    expect(got.titulo).toBe('Mentoría backend');

    await expect(svc.getById('id-invalido')).rejects.toThrow('ID inválido');
  });

  // ========= Tests: Listado / Filtros =========
  test('list() filtra por categoria + precioMin/Max + titulo (regex)', async () => {
    await seed();
    const res = await svc.list({
      categoria: 'Electrónica',
      precioMin: 1000,
      precioMax: 26000,
      titulo: 'gamer',
      sort: '-precio',
      page: 1,
      limit: 10
    });
    expect(res.total).toBe(1);
    expect(res.items[0].titulo).toMatch(/Laptop gamer RTX/i);
  });

  test('list() filtra por vendedor y tipo_publicacion', async () => {
    await seed();
    const res = await svc.list({
      vendedor_id: vendedorA.toString(),
      tipo_publicacion: 'servicio'
    });
    expect(res.total).toBe(1);
    expect(res.items[0].titulo).toBe('Clases de programación');
  });

  test('list() aplica visible=true por defecto (excluye ocultas)', async () => {
    await seed();
    const res = await svc.list({});
    expect(res.total).toBe(3); // 4 docs, 1 es visible:false
    const titles = res.items.map(i => i.titulo);
    expect(titles).not.toContain('Silla gamer');
  });

  test('list() filtra por rango de fechas', async () => {
    await seed();
    const res = await svc.list({
      fechaDesde: '2025-10-11',
      fechaHasta: '2025-10-21',
      sort: 'fecha_publicacion'
    });
    expect(res.total).toBe(2);
    const fechas = res.items.map(i => new Date(i.fecha_publicacion).toISOString());
    expect(fechas).toContain(new Date('2025-10-12').toISOString());
    expect(fechas).toContain(new Date('2025-10-20').toISOString());
  });

  test('listBySeller() y searchByTitle()', async () => {
    await seed();
   const bySeller = await svc.listBySeller(vendedorB.toString(), { sort: '-fecha_publicacion' });
expect(bySeller.total).toBe(1)
    const byTitle = await svc.searchByTitle('teclado', { page: 1, limit: 5 });
    expect(byTitle.total).toBe(1);
    expect(byTitle.items[0].titulo).toMatch(/Teclado mecánico RGB/i);
  });

  // ========= Tests: Actualizaciones / Estado / Vistas =========
  test('update() actualiza y valida reglas', async () => {
    const created = await svc.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA.toString(),
      titulo: 'Monitor 24"',
      descripcion: 'IPS 75Hz',
      categoria: 'Electrónica',
      precio: 2200,
    });

    const upd = await svc.update(created._id, { precio: 1999, titulo: 'Monitor 24 IPS' });
    expect(upd.precio).toBe(1999);
    expect(upd.titulo).toBe('Monitor 24 IPS');
    expect(upd).toHaveProperty('fecha_actualizacion');

    await expect(svc.update(created._id, { precio: -5 }))
      .rejects.toThrow('precio inválido');
  });

  test('setVisibility() oculta/muestra', async () => {
    const created = await svc.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorB.toString(),
      titulo: 'SSD 1TB',
      descripcion: 'NVMe',
      categoria: 'Electrónica',
      precio: 1800,
      visible: true,
    });

    const upd = await svc.setVisibility(created._id, false);
    expect(upd.visible).toBe(false);
  });

  test('setStatus() cambia estado (si está permitido)', async () => {
    const created = await svc.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorB.toString(),
      titulo: 'GPU usada',
      descripcion: '3060 Ti',
      categoria: 'Electrónica',
      precio: 6000,
      visible: true,
      estado: 'disponible',
    });

    const upd = await svc.setStatus(created._id, 'pausado');
    expect(upd.estado).toBe('pausado');

    // Estado inválido (si tu lista lo limita)
    await expect(svc.setStatus(created._id, 'xxx')).rejects.toThrow('Estado inválido');
  });

  test('incrementViews() suma vistas', async () => {
    const created = await svc.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA.toString(),
      titulo: 'Cámara Web',
      descripcion: '1080p',
      categoria: 'Electrónica',
      precio: 700,
      visible: true,
      vistas: 0,
    });

    const after = await svc.incrementViews(created._id, 3);
    expect(after.vistas).toBe(3);
  });

  test('delete() elimina', async () => {
    const created = await svc.create({
      tipo_publicacion: 'servicio',
      vendedor_id: vendedorA.toString(),
      titulo: 'Soporte técnico',
      descripcion: 'A domicilio',
      categoria: 'Servicios',
      precio: 350,
      visible: true,
    });

    const deleted = await svc.delete(created._id);
    expect(deleted._id.toString()).toBe(created._id.toString());
    await expect(svc.getById(created._id)).rejects.toThrow('Publicación no encontrada');
  });
});
