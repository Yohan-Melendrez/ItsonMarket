const { connectDB, closeDB } = require("../config/db");
const UsuarioDAO = require("../repositories/UsuarioRepository");

const usuarioRepo = new UsuarioDAO();

/**
 * @function runUsuarioTests
 * @desc Script de pruebas para validar funcionalidades del UsuarioRepository
 * @description Ejecuta pruebas de inserción, búsqueda, actualización y eliminación de usuarios por ID e ITSON ID
 * @returns {Promise<void>}
 * @access Private
 * @note Este script conecta a MongoDB y ejecuta operaciones CRUD sobre la colección Usuario
 */
async function runUsuarioTests() {
  try {
    console.log(" Iniciando pruebas del UsuarioRepository...");
    await connectDB();

    const nuevoUsuario = await usuarioRepo.insert({
      itson_id: "A00112233",
      nombre: "Carlos Pérez",
      correo_institucional: "carlos.perez@itson.edu.mx",
      carrera: "Ingeniería en Software",
      telefono: "6441234567",
      reputacion: {
        puntuacion_promedio: 4.8,
        total_transacciones: 10
      },
      foto: "https://example.com/foto.png"
    });

    console.log(" Usuario insertado correctamente:", nuevoUsuario._id);

    const usuarios = await usuarioRepo.findAll();
    console.log(` Total de usuarios en la base: ${usuarios.length}`);

    const usuarioPorNombre = await usuarioRepo.findByName("Carlos Pérez");
    console.log(" Usuario encontrado por nombre:", usuarioPorNombre ? usuarioPorNombre.nombre : "No encontrado");

    const usuarioPorItson = await usuarioRepo.findByItsonId("A00112233");
    console.log(" Usuario encontrado por ITSON_ID:", usuarioPorItson ? usuarioPorItson.itson_id : "No encontrado");

    const actualizadoPorId = await usuarioRepo.update(nuevoUsuario._id, {
      telefono: "6447654321"
    });
    console.log(" Usuario actualizado (por ID):", actualizadoPorId.telefono);

    const actualizadoPorItson = await usuarioRepo.updateByItsonId("A00112233", {
      carrera: "Licenciatura en Informática"
    });
    console.log(" Usuario actualizado (por ITSON_ID):", actualizadoPorItson.carrera);

    const eliminadoPorId = await usuarioRepo.delete(nuevoUsuario._id);
    console.log(" Usuario eliminado (por ID):", eliminadoPorId ? eliminadoPorId._id : "No encontrado");

    const eliminadoPorItson = await usuarioRepo.deleteByItsonId("A00112233");
    console.log(" Usuario eliminado (por ITSON_ID):", eliminadoPorItson ? eliminadoPorItson._id : "Ya no existe");

  } catch (error) {
    console.error(" Error durante las pruebas:", error.message);
  } finally {
    await closeDB();
    console.log(" Conexión cerrada. Pruebas finalizadas.");
  }
}

runUsuarioTests();