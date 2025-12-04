const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { UsuarioModel } = require("../models/Usuario");
const { PublicacionModel } = require("../models/Publicacion");
const { TransaccionModel } = require("../models/Transaccion");
const { ChatModel } = require("../models/Chat");
const { connectDB, closeDB } = require("../config/db");

const usuariosData = [
  {
    itson_id: "00000123456",
    nombre: "Juan Pérez",
    correo_institucional: "00000123456@potros.itson.edu.mx",
    carrera: "Ingeniería en Sistemas",
    telefono: "6641234567",
    contrasena: "Password123.",
    foto: "https://via.placeholder.com/150"
  },
  {
    itson_id: "00000234567",
    nombre: "María García",
    correo_institucional: "00000234567@potros.itson.edu.mx",
    carrera: "Ingeniería en Sistemas",
    telefono: "6641234568",
    contrasena: "Password123.",
    foto: "https://via.placeholder.com/150"
  },
  {
    itson_id: "00000345678",
    nombre: "Carlos López",
    correo_institucional: "00000345678@potros.itson.edu.mx",
    carrera: "Administración de Empresas",
    telefono: "6641234569",
    contrasena: "Password123.",
    foto: "https://via.placeholder.com/150"
  },
  {
    itson_id: "00000456789",
    nombre: "Ana Martínez",
    correo_institucional: "00000456789@potros.itson.edu.mx",
    carrera: "Ingeniería Civil",
    telefono: "6641234570",
    contrasena: "Password123.",
    foto: "https://via.placeholder.com/150"
  },
  {
    itson_id: "00000567890",
    nombre: "Luis Rodríguez",
    correo_institucional: "00000567890@potros.itson.edu.mx",
    carrera: "Contador Público",
    telefono: "6641234571",
    contrasena: "Password123.",
    foto: "https://via.placeholder.com/150"
  },
  {
    itson_id: "00000678901",
    nombre: "Sofia Hernández",
    correo_institucional: "00000678901@potros.itson.edu.mx",
    carrera: "Derecho",
    telefono: "6641234572",
    contrasena: "Password123.",
    foto: "https://via.placeholder.com/150"
  }
];

const publicacionesData = [
  {
    tipo_publicacion: "producto",
    titulo: "Libro de Cálculo Diferencial",
    descripcion: "Libro de Cálculo Diferencial. Usado pero en muy buen estado. Perfecto para estudiantes de primer semestre.",
    categoria: "Libros",
    precio: 250,
    estado: "disponible",
    detalles: {
      marca: "Pearson",
      edicion: "12va edición",
      imagenes: ["https://via.placeholder.com/300"],
      experiencia: "Propietario hace 1 año"
    }
  },
  {
    tipo_publicacion: "producto",
    titulo: "Laptop ASUS VivoBook 15",
    descripcion: "Laptop para estudiante. Intel Core i5, 8GB RAM, 512GB SSD. Excelente para programación.",
    categoria: "Electrónica",
    precio: 8500,
    estado: "disponible",
    detalles: {
      marca: "ASUS",
      edicion: "2022",
      imagenes: ["https://via.placeholder.com/300"],
      experiencia: "Propietario hace 6 meses"
    }
  },
  {
    tipo_publicacion: "producto",
    titulo: "Calculadora Científica Casio",
    descripcion: "Calculadora científica con más de 400 funciones. Ideal para matemáticas, física e ingeniería.",
    categoria: "Útiles Escolares",
    precio: 450,
    estado: "disponible",
    detalles: {
      marca: "Casio",
      edicion: "FX-570LA",
      imagenes: ["https://via.placeholder.com/300"],
      experiencia: "Propietario hace 2 años"
    }
  },
  {
    tipo_publicacion: "producto",
    titulo: "Mochila Ergonómica para Laptops",
    descripcion: "Mochila resistente y cómoda, con compartimientos especiales para laptops hasta 17 pulgadas.",
    categoria: "Accesorios",
    precio: 350,
    estado: "disponible",
    detalles: {
      marca: "Samsonite",
      edicion: "2023",
      imagenes: ["https://via.placeholder.com/300"],
      experiencia: "Propietario hace 3 meses"
    }
  },
  {
    tipo_publicacion: "producto",
    titulo: "Audífonos Inalámbricos Sony",
    descripcion: "Audífonos Bluetooth con cancelación de ruido. Perfectos para clases en línea y música.",
    categoria: "Electrónica",
    precio: 1200,
    estado: "disponible",
    detalles: {
      marca: "Sony",
      edicion: "WH-CH720N",
      imagenes: ["https://via.placeholder.com/300"],
      experiencia: "Propietario hace 4 meses"
    }
  },
  {
    tipo_publicacion: "producto",
    titulo: "Monitor LG 24 pulgadas",
    descripcion: "Monitor LED 24 pulgadas, resolución Full HD 1920x1080. Ideal para trabajos de diseño y programación.",
    categoria: "Electrónica",
    precio: 1500,
    estado: "disponible",
    detalles: {
      marca: "LG",
      edicion: "24MK430H",
      imagenes: ["https://via.placeholder.com/300"],
      experiencia: "Propietario hace 1 año"
    }
  },

  // SERVICIOS
  {
    tipo_publicacion: "servicio",
    titulo: "Tutoría de Programación en C++",
    descripcion: "Ofrezco tutoría en programación C++ para estudiantes de Ingeniería. Clases personalizadas.",
    categoria: "Tutorías",
    precio: 200,
    estado: "disponible",
    detalles: {
      tarifa: 200,
      duracion: "1 hora",
      unidad_tarifa: "por sesión",
      modalidad: "Presencial o Virtual",
      experiencia: "3 años de experiencia en programación"
    }
  },
  {
    tipo_publicacion: "servicio",
    titulo: "Clases de Inglés para Estudiantes",
    descripcion: "Enseño inglés a nivel de conversación y preparación para exámenes. Soy hablante nativo.",
    categoria: "Idiomas",
    precio: 150,
    estado: "disponible",
    detalles: {
      tarifa: 150,
      duracion: "1 hora",
      unidad_tarifa: "por clase",
      modalidad: "Virtual",
      experiencia: "Certificado en TOEFL"
    }
  },
  {
    tipo_publicacion: "servicio",
    titulo: "Redacción y Corrección de Trabajos Académicos",
    descripcion: "Ayudo a redactar y corregir trabajos académicos. Especialista en APA y Chicago style.",
    categoria: "Asesoría Académica",
    precio: 100,
    estado: "disponible",
    detalles: {
      tarifa: 100,
      duracion: "Variable",
      unidad_tarifa: "por página",
      modalidad: "Virtual",
      experiencia: "5 años de experiencia"
    }
  },
  {
    tipo_publicacion: "servicio",
    titulo: "Diseño Gráfico para Proyectos Escolares",
    descripcion: "Creo diseños gráficos, presentaciones y posters para tus proyectos. Uso Adobe Creative Suite.",
    categoria: "Diseño",
    precio: 250,
    estado: "disponible",
    detalles: {
      tarifa: 250,
      duracion: "Según proyecto",
      unidad_tarifa: "por proyecto",
      modalidad: "Virtual",
      experiencia: "2 años en diseño gráfico"
    }
  },
  {
    tipo_publicacion: "servicio",
    titulo: "Apoyo en Matemáticas (Álgebra, Geometría, Cálculo)",
    descripcion: "Clases de refuerzo en matemáticas. Me especializo en resolver dudas de estudiantes de todas las carreras.",
    categoria: "Tutorías",
    precio: 180,
    estado: "disponible",
    detalles: {
      tarifa: 180,
      duracion: "1.5 horas",
      unidad_tarifa: "por sesión",
      modalidad: "Presencial o Virtual",
      experiencia: "Licenciado en Matemáticas"
    }
  },
  {
    tipo_publicacion: "servicio",
    titulo: "Edición de Videos para Proyectos",
    descripcion: "Edito y monto videos para presentaciones escolares. Agradeceré cualquier feedback.",
    categoria: "Multimedia",
    precio: 300,
    estado: "disponible",
    detalles: {
      tarifa: 300,
      duracion: "Según duración",
      unidad_tarifa: "por video",
      modalidad: "Virtual",
      experiencia: "3 años de experiencia"
    }
  },
  {
    tipo_publicacion: "servicio",
    titulo: "Asesoría en Base de Datos SQL",
    descripcion: "Ayudo a diseñar y optimizar bases de datos. Experiencia con MySQL, PostgreSQL y SQL Server.",
    categoria: "Programación",
    precio: 220,
    estado: "disponible",
    detalles: {
      tarifa: 220,
      duracion: "1 hora",
      unidad_tarifa: "por sesión",
      modalidad: "Virtual",
      experiencia: "4 años"
    }
  }
];

/**
 * @function hashPassword
 * @desc Generar hash bcrypt de una contraseña
 * @param {String} password - Contraseña en texto plano
 * @returns {Promise<String>} Contraseña hasheada
 * @access Private
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * @function seedDatabase
 * @desc Función principal que popula la base de datos con datos de prueba
 * @description Limpia colecciones existentes e inserta usuarios, publicaciones, transacciones y chats de ejemplo
 * @returns {Promise<void>}
 * @access Private
 * @note Contraseña de prueba para todos los usuarios: Password123.
 */
async function seedDatabase() {
  try {
    await connectDB();

    await UsuarioModel.deleteMany({});
    await PublicacionModel.deleteMany({});
    await TransaccionModel.deleteMany({});
    await ChatModel.deleteMany({});
    console.log("✓ Colecciones limpias");

    const usuariosConHash = await Promise.all(
      usuariosData.map(async (usuario) => ({
        ...usuario,
        contrasena: await hashPassword(usuario.contrasena)
      }))
    );

    const usuariosInsertados = await UsuarioModel.insertMany(usuariosConHash);
    console.log(`✓ ${usuariosInsertados.length} usuarios creados`);

    const publicacionesConVendedor = publicacionesData.map((pub, index) => ({
      ...pub,
      vendedor_id: usuariosInsertados[index % usuariosInsertados.length]._id
    }));

    const publicacionesInsertadas = await PublicacionModel.insertMany(
      publicacionesConVendedor
    );
    console.log(`✓ ${publicacionesInsertadas.length} publicaciones creadas`);

    const transacciones = [
      {
        comprador_id: usuariosInsertados[1]._id,
        comprador_itson_id: usuariosInsertados[1].itson_id,
        vendedor_id: usuariosInsertados[0]._id,
        publicacion_id: publicacionesInsertadas[0]._id,
        tipo_publicacion: "producto",
        estado: "completada",
        monto: 250,
        calificacion: {
          puntuacion: 5,
          comentario: "Excelente vendedor, libro en perfecto estado"
        },
        notificacion_enviada: true
      },
      {
        comprador_id: usuariosInsertados[2]._id,
        comprador_itson_id: usuariosInsertados[2].itson_id,
        vendedor_id: usuariosInsertados[1]._id,
        publicacion_id: publicacionesInsertadas[6]._id,
        tipo_publicacion: "servicio",
        estado: "completada",
        monto: 200,
        calificacion: {
          puntuacion: 5,
          comentario: "Excelente tutor, muy claro en sus explicaciones"
        },
        notificacion_enviada: true
      },
      {
        comprador_id: usuariosInsertados[3]._id,
        comprador_itson_id: usuariosInsertados[3].itson_id,
        vendedor_id: usuariosInsertados[0]._id,
        publicacion_id: publicacionesInsertadas[2]._id,
        tipo_publicacion: "producto",
        estado: "completada",
        monto: 450,
        calificacion: {
          puntuacion: 4,
          comentario: "Buen producto, muy rápido en la entrega"
        },
        notificacion_enviada: true
      }
    ];

    const transaccionesInsertadas = await TransaccionModel.insertMany(transacciones);
    console.log(`✓ ${transaccionesInsertadas.length} transacciones creadas`);

    for (let vendedorId of [usuariosInsertados[0]._id, usuariosInsertados[1]._id]) {
      const transaccionesVendedor = await TransaccionModel.find({
        vendedor_id: vendedorId,
        estado: "completada",
        calificacion: { $exists: true }
      });

      if (transaccionesVendedor.length > 0) {
        const promedio =
          transaccionesVendedor.reduce((sum, t) => sum + t.calificacion.puntuacion, 0) /
          transaccionesVendedor.length;

        await UsuarioModel.findByIdAndUpdate(vendedorId, {
          "reputacion.puntuacion_promedio": promedio,
          "reputacion.total_transacciones": transaccionesVendedor.length
        });
      }
    }
    console.log("✓ Reputación de vendedores actualizada");

    const chats = [
      {
        participantes: [usuariosInsertados[0]._id, usuariosInsertados[1]._id],
        publicacion_id: publicacionesInsertadas[0]._id,
        estado: "activo",
        mensajes: [
          {
            remitente_id: usuariosInsertados[1]._id,
            contenido: "¿Aún tienes disponible el libro de Cálculo?",
            leido: true
          },
          {
            remitente_id: usuariosInsertados[0]._id,
            contenido: "Sí, está disponible. ¿Cuándo quieres recogerlo?",
            leido: true
          }
        ]
      },
      {
        participantes: [usuariosInsertados[1]._id, usuariosInsertados[2]._id],
        publicacion_id: publicacionesInsertadas[6]._id,
        estado: "activo",
        mensajes: [
          {
            remitente_id: usuariosInsertados[2]._id,
            contenido: "Hola, ¿cuándo podríamos tener la primera clase?",
            leido: true
          },
          {
            remitente_id: usuariosInsertados[1]._id,
            contenido: "Podemos empezar este fin de semana a las 3 PM",
            leido: true
          }
        ]
      }
    ];

    const chatsInsertados = await ChatModel.insertMany(chats);
    console.log(`✓ ${chatsInsertados.length} chats creados`);

    console.log("\n Base de datos sembrada exitosamente");
    console.log("\n Resumen:");
    console.log(`   - ${usuariosInsertados.length} usuarios`);
    console.log(`   - ${publicacionesInsertadas.length} publicaciones`);
    console.log(`   - ${transaccionesInsertadas.length} transacciones`);
    console.log(`   - ${chatsInsertados.length} chats`);

    console.log("\n Contraseña para todos los usuarios: Password123.");
    console.log("\n Usuarios de prueba:");
    usuariosData.forEach((u) => {
      console.log(`   - ${u.nombre} (${u.correo_institucional})`);
    });

  } catch (error) {
    console.error(" Error al sembrar la base de datos:", error.message);
  } finally {
    await closeDB();
  }
}

seedDatabase();
