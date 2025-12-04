/**
 * @test TransaccionRepository (Mongo en memoria)
 * @desc Suite de pruebas unitarias para el TransaccionRepository
 * @note Utiliza MongoMemoryServer para ejecutar pruebas sin base de datos real
 */

jest.setTimeout(30000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { TransaccionModel } = require('../models/Transaccion');
const TransaccionRepository = require('../repositories/TransaccionRepository');

describe('TransaccionRepository (Mongo en memoria)', () => {
  let mongo;
  let repo;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });

    try {
      TransaccionModel.schema.index({ comprador_id: 1, fecha_transaccion: -1 });
      TransaccionModel.schema.index({ vendedor_id: 1, fecha_transaccion: -1 });
      await TransaccionModel.createIndexes();
    } catch (_) {}

    repo = new TransaccionRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await TransaccionModel.deleteMany({});
  });

  const comprador = new mongoose.Types.ObjectId();
  const vendedor = new mongoose.Types.ObjectId();
  const publicacion = new mongoose.Types.ObjectId();

  async function seed() {
    await TransaccionModel.insertMany([
      { comprador_id: comprador, vendedor_id: vendedor, publicacion_id: publicacion, tipo_publicacion: 'producto', monto: 100, estado: 'pendiente' },
      { comprador_id: comprador, vendedor_id: vendedor, publicacion_id: new mongoose.Types.ObjectId(), tipo_publicacion: 'servicio', monto: 300, estado: 'completada' }
    ]);
  }

  /**
   * @test insert() crea una transacción
   * @desc Valida que se puede crear una nueva transacción con todos los datos requeridos
   */
  test('insert() crea una transacción', async () => {
    const created = await repo.insert({
      comprador_id: comprador,
      vendedor_id: vendedor,
      publicacion_id: publicacion,
      tipo_publicacion: 'producto',
      monto: 150
    });
    expect(created).toHaveProperty('_id');
    expect(created.monto).toBe(150);
  });

  /**
   * @test findAll() admite filtro
   * @desc Verifica que se pueden obtener todas las transacciones y filtrar por estado
   */
  test('findAll() admite filtro', async () => {
    await seed();
    const todas = await repo.findAll({});
    expect(todas.length).toBe(2);

    const completadas = await repo.findAll({ estado: 'completada' });
    expect(completadas.length).toBe(1);
  });

  /**
   * @test findById / update / delete
   * @desc Valida operaciones completas de búsqueda, actualización y eliminación de transacciones
   */
  test('findById / update / delete', async () => {
    const trx = await repo.insert({
      comprador_id: comprador,
      vendedor_id: vendedor,
      publicacion_id: publicacion,
      tipo_publicacion: 'servicio',
      monto: 999
    });

    const got = await repo.findById(trx._id);
    expect(got.monto).toBe(999);

    const upd = await repo.update(trx._id, { estado: 'completada' });
    expect(upd.estado).toBe('completada');

    const del = await repo.delete(trx._id);
    expect(del._id.toString()).toBe(trx._id.toString());
  });
});
