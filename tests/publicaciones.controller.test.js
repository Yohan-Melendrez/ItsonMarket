/**
 * @test Controller de Publicaciones (unit con service mockeado)
 * @desc Suite de pruebas unitarias para el controlador de publicaciones con service mockeado
 * @note Utiliza Jest mocks para simular el comportamiento del PublicacionService
 */

jest.setTimeout(20000);

jest.mock('../middleware/auth', () => (req, res, next) => next());

const mockSvc = {
  create: jest.fn(),
  getById: jest.fn(),
  list: jest.fn(),
  listBySeller: jest.fn(),
  searchByTitle: jest.fn(),
  update: jest.fn(),
  setVisibility: jest.fn(),
  setStatus: jest.fn(),
  incrementViews: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../services/PublicacionService', () => {
  return jest.fn().mockImplementation(() => mockSvc);
});

const request = require('supertest');
const app = require('./testApp.controller');

describe('Controller de Publicaciones (unit con service mockeado)', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockSvc)) mockSvc[k].mockReset();
  });

  /**
   * @test GET /api/publicaciones/:id -> 200 con body
   * @desc Valida que obtener una publicación por ID retorna 200 con los datos
   */
  test('GET /api/publicaciones/:id -> 200 con body', async () => {
    mockSvc.getById.mockResolvedValue({ _id: '66f..abc', titulo: 'Demo' });

    const res = await request(app).get('/api/publicaciones/66f000000000000000000abc');

    expect(res.status).toBe(200);
    expect(mockSvc.getById).toHaveBeenCalled();
    expect(res.body.titulo).toBe('Demo');
  });

  /**
   * @test POST /api/publicaciones -> 201 Created
   * @desc Verifica que crear una publicación retorna 201 y llama al service correctamente
   */
  test('POST /api/publicaciones -> 201 Created', async () => {
    const body = { tipo_publicacion:'producto', vendedor_id:'66f000000000000000000aaa', titulo:'X', descripcion:'Y', categoria:'Z', precio:100 };
    mockSvc.create.mockResolvedValue({ _id: '66f..def', ...body });

    const res = await request(app).post('/api/publicaciones').send(body);

    expect(res.status).toBe(201);
    expect(mockSvc.create).toHaveBeenCalledWith(body);
  });

  /**
   * @test DELETE /api/publicaciones/:id -> 204 No Content
   * @desc Valida que eliminar una publicación retorna 204 sin contenido
   */
  test('DELETE /api/publicaciones/:id -> 204 No Content', async () => {
    mockSvc.delete.mockResolvedValue({ _id: '66f..del' });

    const res = await request(app).delete('/api/publicaciones/66f000000000000000000abc');

    expect(res.status).toBe(204);
    expect(mockSvc.delete).toHaveBeenCalled();
    expect(res.text).toBe(''); // sin body
  });

  /**
   * @test GET /api/publicaciones/:id -> 404 cuando el service lanza NotFoundError
   * @desc Verifica que el errorHandler convierte errores 404 del service a respuesta HTTP 404
   */
  test('GET /api/publicaciones/:id -> 404 cuando el service lanza NotFoundError', async () => {
    const err = new Error('Publicación no encontrada');
    err.status = 404; // tu errorHandler respeta err.status
    mockSvc.getById.mockRejectedValue(err);

    const res = await request(app).get('/api/publicaciones/66f000000000000000000999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
  });

  /**
   * @test GET /api/publicaciones/:id -> 400 cuando el service lanza CastError
   * @desc Valida que errores de ID inválido retornan 400
   */
  test('GET /api/publicaciones/:id -> 400 cuando el service lanza CastError', async () => {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';
    mockSvc.getById.mockRejectedValue(err);

    const res = await request(app).get('/api/publicaciones/ID-MAL');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ID inválido/i);
  });

  /**
   * @test POST /api/publicaciones -> 400 cuando el service lanza ValidationError
   * @desc Verifica que errores de validación retornan 400 con detalles de los campos
   */
  test('POST /api/publicaciones -> 400 cuando el service lanza ValidationError', async () => {
    const validationErr = new Error('ValidationError');
    validationErr.name = 'ValidationError';
    validationErr.errors = {
      titulo: { path: 'titulo', message: 'titulo requerido' }
    };
    mockSvc.create.mockRejectedValue(validationErr);

    const res = await request(app).post('/api/publicaciones').send({}); // faltan campos

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/validación/i);
    expect(res.body.details[0]).toEqual({ field: 'titulo', message: 'titulo requerido' });
  });

  /**
   * @test PATCH /api/publicaciones/:id/estado -> 500 por error inesperado
   * @desc Valida que errores inesperados retornan 500
   */
  test('PATCH /api/publicaciones/:id/estado -> 500 por error inesperado', async () => {
    mockSvc.setStatus.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .patch('/api/publicaciones/66f000000000000000000abc/estado')
      .send({ estado: 'pausado' });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/interno/i);
  });
});