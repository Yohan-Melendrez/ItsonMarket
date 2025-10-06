const mongoose = require("mongoose")


async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log(" Conectado a MongoDB");
  } catch (error) {
    console.error(" Error al conectar a MongoDB:", error.message);
  }
}

async function closeDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("Se ha desconectado.")
    }
}

module.exports = {connectDB, closeDB}