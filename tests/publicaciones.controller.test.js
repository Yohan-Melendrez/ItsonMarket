// tests/publicaciones.controller.unit.test.js
jest.setTimeout(20000);

// 1) Mock de auth (si tus rutas reales lo usan; aquí el testApp no lo aplica, pero por si acaso)
jest.mock('../middleware/auth', () => (req, res, next) => next());

// 2) Crea un mock compartido del service
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

// 3) Mockea el módulo PublicacionService **antes** de requerir controller/app
jest.mock('../services/PublicacionService', () => {
  return jest.fn().mockImplementation(() => mockSvc);
});

const request = require('supertest');
const app = require('./testApp.controller'); // usa el app minimal

describe('Controller de Publicaciones (unit con service mockeado)', () => {
  beforeEach(() => {
    // limpia invocaciones y resets
    for (const k of Object.keys(mockSvc)) mockSvc[k].mockReset();
  });

  // ========== ÉXITOS ==========
  test('GET /api/publicaciones/:id -> 200 con body', async () => {
    mockSvc.getById.mockResolvedValue({ _id: '66f..abc', titulo: 'Demo' });

    const res = await request(app).get('/api/publicaciones/66f000000000000000000abc');

    expect(res.status).toBe(200);
    expect(mockSvc.getById).toHaveBeenCalled();
    expect(res.body.titulo).toBe('Demo');
  });

  test('POST /api/publicaciones -> 201 Created', async () => {
    const body = { tipo_publicacion:'producto', vendedor_id:'66f000000000000000000aaa', titulo:'X', descripcion:'Y', categoria:'Z', precio:100 };
    mockSvc.create.mockResolvedValue({ _id: '66f..def', ...body });

    const res = await request(app).post('/api/publicaciones').send(body);

    expect(res.status).toBe(201);
    expect(mockSvc.create).toHaveBeenCalledWith(body);
  });

  test('DELETE /api/publicaciones/:id -> 204 No Content', async () => {
    mockSvc.delete.mockResolvedValue({ _id: '66f..del' });

    const res = await request(app).delete('/api/publicaciones/66f000000000000000000abc');

    expect(res.status).toBe(204);
    expect(mockSvc.delete).toHaveBeenCalled();
    expect(res.text).toBe(''); // sin body
  });

  // ========== ERRORES (ver que viajan al errorHandler) ==========
  test('GET /api/publicaciones/:id -> 404 cuando el service lanza NotFoundError', async () => {
    const err = new Error('Publicación no encontrada');
    err.status = 404; // tu errorHandler respeta err.status
    mockSvc.getById.mockRejectedValue(err);

    const res = await request(app).get('/api/publicaciones/66f000000000000000000999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/publicaciones/:id -> 400 cuando el service lanza CastError', async () => {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';
    mockSvc.getById.mockRejectedValue(err);

    const res = await request(app).get('/api/publicaciones/ID-MAL');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ID inválido/i);
  });

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

  test('PATCH /api/publicaciones/:id/estado -> 500 por error inesperado', async () => {
    mockSvc.setStatus.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .patch('/api/publicaciones/66f000000000000000000abc/estado')
      .send({ estado: 'pausado' });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/interno/i);
  });
});