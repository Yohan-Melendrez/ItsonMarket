const mongoose = require("mongoose")


async function connectDB(){
    try {
           const mongoURI = "mongodb+srv://yohanmelendrez244907_db_user:ItsonMarket1@itsonmarket.sw2bmke.mongodb.net/ItsonMarket?retryWrites=true&w=majority&appName=ItsonMarket6";
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoURI);
            console.log("Conectado a MongoDB");
        } else {
            console.log("Ya se puede conectar")
        }
    } catch (error) {
        console.error("Error al conectarse a MongoDB", error)
    }
}

async function closeDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("Se ha desconectado.")
    }
}

module.exports = {connectDB, closeDB}