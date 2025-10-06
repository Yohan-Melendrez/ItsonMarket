require('dotenv').config();
const { UsuarioDAO } = require('./UsuarioDAO');
const { connectDB, closeDB } = require('./db');
const readline = require('readline-sync');

const usuarioDAO = new UsuarioDAO();


async function handleCreateUsuario() {
    console.log("\n--- Crear Nuevo Usuario ---");
    const usuarioData = {
        itson_id: readline.question("ITSON ID: "),
        nombre: readline.question("Nombre: "),
        correo_institucional: readline.question("Correo Institucional: "),
        carrera: readline.question("Carrera: "),
        telefono: readline.question("Telefono: "),
        reputacion: {
            puntuacion_promedio: parseFloat(readline.question("Puntuacion promedio: ")),
            total_transacciones: parseInt(readline.question("Total de transacciones: "))
        },
        foto: readline.question("URL de foto: ")
    };

    try {
        const resultado = await usuarioDAO.insert(usuarioData);
        console.log("Usuario creado exitosamente!");
        console.log("ID del usuario:", resultado.itson_id);
    } catch (error) {
        console.error(`Error al crear usuario: ${error.message}`)
    }
}

async function handleGetAndSaveUsuario() {
    const nombre = readline.question("\nIngrese el nombre del usuario a buscar: ");

    try {
        const usuarioData = await usuarioDAO.findByName(nombre);

        if (!usuarioData) {
            console.log("Usuario no encontrado");
            return;
        }

        console.log("------ Datos Encontrados -------");
        console.log(`ID:${usuarioData.itson_id} | Nombre: ${usuarioData.nombre} | Correo Institucional: ${usuarioData.correo_institucional} | Carrera: ${usuarioData.carrera} | Teléfono: ${usuarioData.telefono} | Puntuación: ${usuarioData.reputacion.puntuacion_promedio} | Transacciones: ${usuarioData.reputacion.total_transacciones}`);
        console.log("--------------------------------");

    } catch (error) {
        console.error(`Error: ${error.message}`)
    }
}

async function handleListUsuarios() {
    try {
        const usuarios = await usuarioDAO.findAll();
        console.log("----- Usuarios Registrados-----");
        if (usuarios.length === 0) {
            console.log("No hay usuarios registrados.")
            return;
        }
        usuarios.forEach((u, index) => {
            console.log(`${index + 1}. ID:${u.itson_id} | Nombre: ${u.nombre} | Correo Institucional: ${u.correo_institucional} | Carrera: ${u.carrera} | Teléfono: ${u.telefono} | Puntuación: ${u.reputacion.puntuacion_promedio} | Transacciones: ${u.reputacion.total_transacciones}`)
        })
        console.log("-------------------------------------")
    } catch (error) {
        console.error(`Error al listar usuarios: ${error.message}`)
    }
}
async function showUpdateMenu(usuario) {
    console.log(`\n--- ACTUALIZANDO USUARIO: ${usuario.nombre} ---`);
    console.log("1. Actualizar nombre");
    console.log("2. Actualizar correo institucional");
    console.log("3. Actualizar carrera");
    console.log("4. Actualizar telefono");
    console.log("5. Actualizar foto");
    console.log("6. Cancelar");

    const opcion = readline.question("Seleccione que desea actualizar: ");
    const updateData = {};

    switch (opcion) {
        case '1':
            updateData.nombre = readline.question("Nuevo nombre: ");
            break;
        case '2':
            updateData.correo_institucional = readline.question("Nuevo correo institucional: ");
            break;
        case '3':
            updateData.carrera = readline.question("Nueva carrera: ");
            break;
        case '4':
            updateData.telefono = readline.question("Nuevo telefono: ");
            break;
        case '5':
            updateData.foto = readline.question("Nueva URL de foto: ");
            break;
        case '6':
            console.log("Actualizacion cancelada.");
            return null;
        default:
            console.log("Opcion invalida.");
            return null;
    }

    return updateData;
}

async function handleUpdateUsuario() {
    const nombre = readline.question("Ingrese el ID  del usuario a actualizar: ")
    try {
        const usuario = await usuarioDAO.findByItsonId(nombre);
        if (!usuario) {
            console.log(`El usuario con ID ${itson_id} no se ha encontrado en la base de datos`);
            return;
        }
        console.log(`Datos Actuales: ID: ${usuario.itson_id} Nombre: ${usuario.nombre} | Correo: ${usuario.correo_institucional} | Carrera: ${usuario.carrera} | Teléfono: ${usuario.telefono}`)

        const updateData = await showUpdateMenu(usuario);

        if (updateData) {
            const resultado = await usuarioDAO.updateByItsonId(nombre, updateData);
            if (resultado) {
                console.log("Usuario actualizado correctamente.");
            } else {
                console.log("No se pudo actualizar el usuario.");
            }
        }

    } catch (error) {
        console.error("Error al actualizar: ", error.message);
    }
}

async function handleDeleteUsuario() {
    const itson_id = readline.question("Ingrese el ITSON ID del usuario a eliminar: ");

    try {
        const usuario = await usuarioDAO.findByItsonId(itson_id);
        if (!usuario) {
            console.log("No se encontro un usuario con ese ID.");
            return;
        }

        console.log(`\n USUARIO A ELIMINAR:`);
        console.log(`Nombre: ${usuario.nombre}`);
        console.log(`ID: ${usuario.itson_id}`);
        console.log(`Correo: ${usuario.correo_institucional}`);
        console.log(`Carrera: ${usuario.carrera}`);

        const confirmar = readline.question("Esta seguro que desea eliminar este usuario? (s/n): ");
        if (confirmar.toLowerCase() !== 's') {
            console.log("Eliminación cancelada.");
            return;
        }

        const resultado = await usuarioDAO.deleteByItsonId(itson_id);

        if (resultado) {
            console.log("Usuario eliminado correctamente.");
        } else {
            console.log("No se pudo eliminar el usuario.");
        }
    } catch (error) {
        console.error("Error al eliminar:", error.message);
    }
}

async function mainMenu() {
    let ejecutando = true;
    while (ejecutando) {
        console.log("---------------------")
        console.log("     USUARIO CRUD    ")
        console.log("---------------------")
        console.log("1. Crear nuevo usuario");
        console.log("2. Buscar usuario por nombre");
        console.log("3. Listar todos los usuarios ");
        console.log("4. Actualizar usuario");
        console.log("5. Eliminar usuario por ID");
        console.log("6. Salir");
        console.log("---------------------")

        const opcion = readline.question("Seleccione una opcion: ");

        switch (opcion) {
            case '1': await handleCreateUsuario(); break;
            case '2': await handleGetAndSaveUsuario(); break;
            case '3': await handleListUsuarios(); break;
            case '4': await handleUpdateUsuario(); break;
            case '5': await handleDeleteUsuario(); break;
            case '6':
                console.log("Saliendo del programa...");
                ejecutando = false;
                break;
            default: console.log("Opción inválida.")
        }
    }
}

async function startApp() {
    try {
        await connectDB();
        await mainMenu();
    } catch (error) {
        console.log("Ocurrió un error fatal", error.message);
    } finally {
        await closeDB();
    }
}

startApp();