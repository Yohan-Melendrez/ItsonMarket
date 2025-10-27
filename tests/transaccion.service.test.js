jest.setTimeout(30000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { TransaccionModel } = require('../models/Transaccion');
const TransaccionService = require('../services/TransaccionService');

describe('TransaccionService (Mongo en memoria)', () => {
  let mongo;
  let svc;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });

    try {
      TransaccionModel.schema.index({ comprador_id: 1, fecha_transaccion: -1 });
      TransaccionModel.schema.index({ vendedor_id: 1, fecha_transaccion: -1 });
      await TransaccionModel.createIndexes();
    } catch (_) {}

    svc = new TransaccionService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await TransaccionModel.deleteMany({});
  });

  // helpers
  const comprador = new mongoose.Types.ObjectId();
  const vendedor = new mongoose.Types.ObjectId();
  const publicacion = new mongoose.Types.ObjectId();

  async function seed() {
    await TransaccionModel.insertMany([
      {
        comprador_id: comprador,
        vendedor_id: vendedor,
        publicacion_id: publicacion,
        tipo_publicacion: 'producto',
        monto: 500,
        estado: 'pendiente',
        fecha_transaccion: new Date('2025-10-01')
      },
      {
        comprador_id: comprador,
        vendedor_id: vendedor,
        publicacion_id: new mongoose.Types.ObjectId(),
        tipo_publicacion: 'servicio',
        monto: 300,
        estado: 'completada',
        fecha_transaccion: new Date('2025-10-10')
      }
    ]);
  }

  test('crear() crea y valida campos obligatorios', async () => {
    const created = await svc.crear({
      comprador_id: comprador.toString(),
      vendedor_id: vendedor.toString(),
      publicacion_id: publicacion.toString(),
      tipo_publicacion: 'producto',
      monto: 999
    });
    expect(created).toHaveProperty('_id');
    expect(created.estado).toBe('pendiente'); 
  });

  test('crear() falla si comprador = vendedor o monto <= 0', async () => {
    await expect(svc.crear({
      comprador_id: comprador.toString(),
      vendedor_id: comprador.toString(), 
      publicacion_id: publicacion.toString(),
      tipo_publicacion: 'producto',
      monto: 100
    })).rejects.toThrow(/no pueden ser la misma persona/i);

    await expect(svc.crear({
      comprador_id: comprador.toString(),
      vendedor_id: vendedor.toString(),
      publicacion_id: publicacion.toString(),
      tipo_publicacion: 'servicio',
      monto: 0
    })).rejects.toThrow(/monto/i);
  });

  test('obtenerPorId() valida ObjectId', async () => {
    const trx = await svc.crear({
      comprador_id: comprador.toString(),
      vendedor_id: vendedor.toString(),
      publicacion_id: publicacion.toString(),
      tipo_publicacion: 'producto',
      monto: 200
    });

    const got = await svc.obtenerPorId(trx._id);
    expect(got.monto).toBe(200);

    await expect(svc.obtenerPorId('id-mal')).rejects.toThrow(/ID inválido/i);
  });

  test('listar() permite filtrar por estado, comprador y vendedor', async () => {
    await seed();

    const porEstado = await svc.listar({ estado: 'pendiente' });
    expect(porEstado.length).toBe(1);

    const porComprador = await svc.listar({ comprador_id: comprador.toString() });
    expect(porComprador.length).toBe(2);

    const porVendedor = await svc.listar({ vendedor_id: vendedor.toString() });
    expect(porVendedor.length).toBe(2);
  });

  test('actualizar() aplica reglas de negocio', async () => {
    const trx = await svc.crear({
      comprador_id: comprador.toString(),
      vendedor_id: vendedor.toString(),
      publicacion_id: publicacion.toString(),
      tipo_publicacion: 'producto',
      monto: 200
    });

    const upd = await svc.actualizar(trx._id, { estado: 'completada' });
    expect(upd.estado).toBe('completada');

  
    const cancelada = await svc.actualizar(trx._id, { estado: 'cancelada' });
    expect(cancelada.estado).toBe('cancelada');

    await expect(svc.actualizar(trx._id, { estado: 'completada' }))
      .rejects.toThrow(/cancelada a completada/i);
  });

  test('eliminar() borra la transacción', async () => {
    const trx = await svc.crear({
      comprador_id: comprador.toString(),
      vendedor_id: vendedor.toString(),
      publicacion_id: publicacion.toString(),
      tipo_publicacion: 'servicio',
      monto: 700
    });

    const deleted = await svc.eliminar(trx._id);
    expect(deleted._id.toString()).toBe(trx._id.toString());
    const after = await TransaccionModel.findById(trx._id);
    expect(after).toBeNull();
  });
});
