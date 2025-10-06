const { connectDB, closeDB } = require("../config/db");
const { PublicacionRepository } = require("../repositories/PublicacionRepository");

const publicacionRepo = new PublicacionRepository();

async function runPublicacionTests() {
  try {
    console.log("Iniciando pruebas del PublicacionRepository...");
    await connectDB();

    const nuevaPublicacion = await publicacionRepo.crear({
      tipo_publicacion: "producto",
      vendedor_id: "6520a1111111111111111111", 
      titulo: "Laptop ASUS TUF Gaming",
      descripcion: "Laptop gamer con procesador Ryzen 7 y RTX 3060",
      categoria: "Tecnología",
      precio: 18500,
      estado: "disponible",
      visible: true,
      vistas: 0,
      detalles: {
        marca: "ASUS",
        edicion: "TUF",
        imagenes: ["https://example.com/laptop.jpg"],
        tarifa: 0,
        duracion: "N/A",
        unidad_tarifa: "N/A",
        modalidad: "venta",
        experiencia: "nueva"
      }
    });

    console.log(" Publicación creada correctamente:", nuevaPublicacion._id);

    const todas = await publicacionRepo.obtenerTodas();
    console.log(` Total de publicaciones en la base: ${todas.length}`);

    const encontrada = await publicacionRepo.obtenerPorId(nuevaPublicacion._id);
    console.log(" Publicación encontrada por ID:", encontrada ? encontrada.titulo : "No encontrada");

    const actualizada = await publicacionRepo.actualizar(nuevaPublicacion._id, {
      precio: 17999,
      descripcion: "Laptop gamer actualizada con descuento especial"
    });
    console.log(" Publicación actualizada:", actualizada.precio, "-", actualizada.descripcion);

    const eliminada = await publicacionRepo.eliminar(nuevaPublicacion._id);
    console.log(" Publicación eliminada:", eliminada ? eliminada._id : "No encontrada");

  } catch (error) {
    console.error(" Error durante las pruebas:", error.message);
  } finally {
    await closeDB();
    console.log(" Conexión cerrada. Pruebas finalizadas.");
  }
}

runPublicacionTests();