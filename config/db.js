const mongoose = require("mongoose")

/**
 * Conexión a la base de datos MongoDB
 * @function connectDB
 * @desc Establece la conexión con la base de datos MongoDB en localhost
 * @returns {Promise<void>}
 * @access Private
 * @throws {Error} Error al conectar a MongoDB
 */
async function connectDB() {
  try {
    const mongoURI = "mongodb://localhost:27017/itsonMarket"
    await mongoose.connect(mongoURI);
    console.log(" Conectado a MongoDB");
  } catch (error) {
    console.error(" Error al conectar a MongoDB:", error.message);
  }
}

/**
 * @function closeDB
 * @desc Desconecta la sesión actual de MongoDB si existe una conexión activa
 * @returns {Promise<void>}
 * @access Private
 */
async function closeDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("Se ha desconectado.")
    }
}

module.exports = {connectDB, closeDB}