const { connectDB, closeDB } = require("../config/db");
const ChatRepository = require("../repositories/ChatRepository");

const chatRepo = new ChatRepository();

async function runTests() {
  try {
    console.log("🧠 Iniciando pruebas del ChatRepository...");
    await connectDB();

    const nuevoChat = await chatRepo.insert({
      participantes: ["6520a1111111111111111111", "6520a2222222222222222222"], 
      publicacion_id: "6520a3333333333333333333",
      mensajes: [
        {
          remitente_id: "6520a1111111111111111111",
          contenido: "Hola, esto es una prueba del chat",
          tipo: "texto"
        }
      ]
    });

    console.log(" Chat insertado correctamente:", nuevoChat._id);

    const todos = await chatRepo.findAll();
    console.log(` Total de chats en la base: ${todos.length}`);

    const chatEncontrado = await chatRepo.findById(nuevoChat._id);
    console.log(" Chat encontrado por ID:", chatEncontrado ? chatEncontrado._id : "No encontrado");

    const chatActualizado = await chatRepo.update(nuevoChat._id, {
      estado: "cerrado"
    });
    console.log(" Chat actualizado:", chatActualizado.estado);

    const porUsuario = await chatRepo.findByParticipante("6520a1111111111111111111");
    console.log(" Chats encontrados por participante:", porUsuario.length);

    const porPublicacion = await chatRepo.findByPublicacion("6520a3333333333333333333");
    console.log(" Chats encontrados por publicación:", porPublicacion.length);

    const eliminado = await chatRepo.delete(nuevoChat._id);
    console.log(" Chat eliminado correctamente:", eliminado ? eliminado._id : "No encontrado");

  } catch (error) {
    console.error(" Error durante las pruebas:", error.message);
  } finally {
    await closeDB();
    console.log(" Conexión cerrada. Pruebas finalizadas");
  }
}

runTests();