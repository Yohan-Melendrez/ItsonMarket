// repositories/TransaccionRepository.js
const fs = require('fs');
const path = require('path');

// Cargar el dummy desde la raíz del proyecto
const dummyPath = path.join(__dirname, '..', 'transaccionDummy.json');

// Arreglo en memoria
let transacciones = [];
try {
  const raw = fs.readFileSync(dummyPath, 'utf8');
  transacciones = JSON.parse(raw);
  if (!Array.isArray(transacciones)) transacciones = [];
} catch {
  console.warn('[TransaccionRepository] No se pudo leer transaccionDummy.json, iniciando vacío.');
  transacciones = [];
}

// Siguiente ID (numérico incremental si tus ids son "1","2",...)
let nextId =
  transacciones.length > 0
    ? Math.max(
        ...transacciones
          .map(t => Number(String(t.id).replace(/\D/g, '')))
          .filter(n => !Number.isNaN(n))
      ) + 1
    : 1;

class TransaccionRepository {
  async obtenerTransacciones() {
    await new Promise(r => setTimeout(r, 50));
    return transacciones;
  }

  async crearTransaccion(payload) {
    await new Promise(r => setTimeout(r, 50));

    const nuevaTransaccion = {
      id: String(nextId++),
      ...payload,
      fecha_transaccion: new Date().toISOString(),
      estado: payload.estado || 'pendiente',
      calificaciones: payload.calificaciones ?? {
        comprador_a_vendedor: null,
        vendedor_a_comprador: null,
      },
    };

    transacciones.push(nuevaTransaccion);
    return nuevaTransaccion;
  }

  async obtenerTransaccionPorId(id) {
    await new Promise(r => setTimeout(r, 50));
    return transacciones.find(t => String(t.id) === String(id)) || null;
  }

  async actualizarTransaccion(id, patch) {
    await new Promise(r => setTimeout(r, 50));

    const idx = transacciones.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return null;

    transacciones[idx] = { ...transacciones[idx], ...patch };
    return transacciones[idx];
  }

  async eliminarTransaccion(id) {
    await new Promise(r => setTimeout(r, 50));

    const idx = transacciones.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return null;

    const [eliminada] = transacciones.splice(idx, 1);
    return { eliminado: true, id: String(id), entity: eliminada };
  }
}

module.exports = TransaccionRepository;