// tests/publicacion.repository.test.js


jest.setTimeout(30000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Importamos el modelo y el repositorio a probar
const { PublicacionModel } = require('../models/Publicacion');
const PublicacionRepository = require('../repositories/PublicacionRepository');

describe('PublicacionRepository (Mongo en memoria)', () => {
  let mongo;
  let repo;

  // =========================
  //  CONFIGURACIÓN DEL ENTORNO
  // =========================
  beforeAll(async () => {
    // 1) Levantamos un MongoDB efímero en memoria
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });

    // 2) (Opcional) Declaramos índices útiles para estas consultas
    try {
      PublicacionModel.schema.index({ vendedor_id: 1, fecha_publicacion: -1 });
      PublicacionModel.schema.index({ categoria: 1, precio: 1, fecha_publicacion: -1 });
      await PublicacionModel.createIndexes(); // Mongoose 8
    } catch (_) {}

    // 3) Instanciamos el repositorio
    repo = new PublicacionRepository();
  });

  // Cerramos conexiones al final de la suite
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  // Limpiamos la colección antes de cada prueba
  beforeEach(async () => {
    await PublicacionModel.deleteMany({});
  });

  // IDs de ejemplo para vendedores
  const vendedorA = new mongoose.Types.ObjectId();
  const vendedorB = new mongoose.Types.ObjectId();

  // =========================
  //  DATOS SEMILLA (helper)
  // =========================
  async function seed() {
    // Insertamos 4 publicaciones con diferentes categorías, visibilidad y fechas
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
        visible: false, // <<— esta está OCULTA
        vistas: 1,
        fecha_publicacion: new Date('2025-10-22'),
      },
    ]);
  }

  // =========================
  //  PRUEBAS
  // =========================

  test('create() crea una publicación', async () => {
    // Arrange + Act: creamos una publicación
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

    // Assert: valida que se creó con _id y el título correcto
    expect(created).toHaveProperty('_id');
    expect(created.titulo).toBe('Mouse inalámbrico');
  });

  test('findAll() devuelve todas ordenadas por fecha_publicacion DESC', async () => {
    // Arrange: sembramos datos
    await seed();

    // Act: pedimos todas
    const list = await repo.findAll();

    // Assert: 4 docs y la primera es la más reciente por fecha_publicacion (2025-10-22)
    expect(list.length).toBe(4);
    const firstISO = new Date(list[0].fecha_publicacion).toISOString();
    expect(firstISO).toBe(new Date('2025-10-22').toISOString());
  });

  test('findById() obtiene por id (lean por defecto)', async () => {
    // Arrange: creamos 1 doc
    const doc = await repo.create({
      tipo_publicacion: 'servicio',
      vendedor_id: vendedorA,
      titulo: 'Mentoría backend',
      descripcion: 'Arquitectura Node',
      categoria: 'Educación',
      precio: 500,
      visible: true,
    });

    // Act: lo recuperamos por ID
    const got = await repo.findById(doc._id);

    // Assert
    expect(got.titulo).toBe('Mentoría backend');
  });

  test('listPaginated() filtra por categoria + precioMin/Max + título (regex)', async () => {
    // Arrange
    await seed();

    // Act: filtramos por Electrónica, rango de precio y texto en título
    const res = await repo.listPaginated({
      categoria: 'Electrónica',
      precioMin: 1000,
      precioMax: 26000,
      titulo: 'gamer', // aplica regex /gamer/i en "titulo"
      page: 1,
      limit: 10,
      sort: '-precio',
    });

    // Assert: solo coincide la laptop
    expect(res.total).toBe(1);
    expect(res.items[0].titulo).toMatch(/Laptop gamer RTX/i);
  });

  test('listPaginated() filtra por vendedor_id y tipo_publicacion', async () => {
    // Arrange
    await seed();

    // Act: filtramos por vendedorA y tipo "servicio"
    const res = await repo.listPaginated({
      vendedor_id: vendedorA.toString(),
      tipo_publicacion: 'servicio',
      page: 1,
      limit: 10,
    });

    // Assert: debe traer "Clases de programación"
    expect(res.total).toBe(1);
    expect(res.items[0].titulo).toBe('Clases de programación');
  });

  test('listPaginated() respeta visible=true por defecto (excluye ocultas)', async () => {
    // Arrange
    await seed();

    // Act: listamos sin filtros (por defecto visible:true)
    const res = await repo.listPaginated({});

    // Assert: de 4, hay 1 oculta => deben venir 3
    expect(res.total).toBe(3);
    const titles = res.items.map(i => i.titulo);
    expect(titles).not.toContain('Silla gamer');
  });

  test('listPaginated() filtra por fechaDesde/fechaHasta (fecha_publicacion)', async () => {
    // Arrange
    await seed();

    // Act: pedimos entre 2025-10-11 y 2025-10-21
    const res = await repo.listPaginated({
      fechaDesde: '2025-10-11',
      fechaHasta: '2025-10-21',
      sort: 'fecha_publicacion',
    });

    // Assert: caen 2025-10-12 y 2025-10-20 => 2 items
    expect(res.total).toBe(2);
    const fechas = res.items.map(i => new Date(i.fecha_publicacion).toISOString());
    expect(fechas).toContain(new Date('2025-10-12').toISOString());
    expect(fechas).toContain(new Date('2025-10-20').toISOString());
  });

  test('updateById() actualiza y setea fecha_actualizacion', async () => {
    // Arrange: creamos un doc
    const doc = await repo.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorA,
      titulo: 'Monitor 24"',
      descripcion: 'IPS 75Hz',
      categoria: 'Electrónica',
      precio: 2200,
      visible: true,
    });

    // Act: actualizamos precio y título
    const updated = await repo.updateById(doc._id, { precio: 2000, titulo: 'Monitor 24 IPS' });

    // Assert
    expect(updated.precio).toBe(2000);
    expect(updated.titulo).toBe('Monitor 24 IPS');
    expect(updated).toHaveProperty('fecha_actualizacion');
  });

  test('setVisibility() cambia visible', async () => {
    // Arrange
    const doc = await repo.create({
      tipo_publicacion: 'producto',
      vendedor_id: vendedorB,
      titulo: 'SSD 1TB',
      descripcion: 'NVMe',
      categoria: 'Electrónica',
      precio: 1800,
      visible: true,
    });

    // Act: lo ocultamos
    const upd = await repo.setVisibility(doc._id, false);

    // Assert
    expect(upd.visible).toBe(false);
  });

  test('setStatus() cambia estado', async () => {
    // Arrange
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

    // Act: cambiamos a "pausado"
    const upd = await repo.setStatus(doc._id, 'pausado');

    // Assert
    expect(upd.estado).toBe('pausado');
  });

  test('incrementViews() incrementa vistas de forma atómica', async () => {
    // Arrange
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

    // Act: incrementamos en 3
    const after = await repo.incrementViews(doc._id, 3);

    // Assert
    expect(after.vistas).toBe(3);
  });

  test('deleteById() elimina una publicación', async () => {
    // Arrange
    const doc = await repo.create({
      tipo_publicacion: 'servicio',
      vendedor_id: vendedorA,
      titulo: 'Soporte técnico',
      descripcion: 'A domicilio',
      categoria: 'Servicios',
      precio: 350,
      visible: true,
    });

    // Act: borramos y luego verificamos que ya no exista
    const deleted = await repo.deleteById(doc._id);
    const shouldBeNull = await repo.findById(doc._id);

    // Assert
    expect(deleted._id.toString()).toBe(doc._id.toString());
    expect(shouldBeNull).toBeNull();
  });
});