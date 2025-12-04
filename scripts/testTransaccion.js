const { connectDB, closeDB } = require("../config/db");
const TransaccionRepository = require("../repositories/TransaccionRepository");

const transRepo = new TransaccionRepository();

/**
 * @function runTransaccionTests
 * @desc Script de pruebas para validar funcionalidades del TransaccionRepository
 * @description Ejecuta pruebas de inserción, búsqueda, filtrado, actualización y eliminación de transacciones
 * @returns {Promise<void>}
 * @access Private
 * @note Este script conecta a MongoDB y ejecuta operaciones CRUD sobre la colección Transaccion
 */
async function runTransaccionTests() {
  try {
    console.log(" Iniciando pruebas del TransaccionRepository...");
    await connectDB();

    const nuevaTransaccion = await transRepo.insert({
      comprador_id: "6520a1111111111111111111", 
      vendedor_id: "6520a2222222222222222222",
      publicacion_id: "6520a3333333333333333333",
      tipo_publicacion: "producto",
      monto: 500,
      calificaciones: {
        comprador_a_vendedor: {
          puntuacion: 5,
          comentario: "Excelente servicio",
        },
      },
    });

    console.log(" Transacción creada correctamente:", nuevaTransaccion._id);

    const todas = await transRepo.findAll();
    console.log(` Total de transacciones en la base: ${todas.length}`);

    const encontrada = await transRepo.findById(nuevaTransaccion._id);
    console.log(" Transacción encontrada por ID:", encontrada ? encontrada._id : "No encontrada");

    const porComprador = await transRepo.findByComprador("6520a1111111111111111111");
    console.log(" Transacciones del comprador:", porComprador.length);

    const porVendedor = await transRepo.findByVendedor("6520a2222222222222222222");
    console.log(" Transacciones del vendedor:", porVendedor.length);

    const actualizada = await transRepo.update(nuevaTransaccion._id, {
      estado: "completada",
      "calificaciones.vendedor_a_comprador": {
        puntuacion: 4,
        comentario: "Buen comprador, pago rápido",
      },
    });
    console.log(" Transacción actualizada:", actualizada.estado);

    const eliminada = await transRepo.delete(nuevaTransaccion._id);
    console.log(" Transacción eliminada:", eliminada ? eliminada._id : "No encontrada");

  } catch (error) {
    console.error("Error durante las pruebas:", error.message);
  } finally {
    await closeDB();
    console.log("Conexión cerrada. Pruebas finalizadas.");
  }
}

runTransaccionTests();