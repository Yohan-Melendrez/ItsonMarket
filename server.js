require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');

// Importar rutas

const chatRoutes = require('./routes/chatRoutes');
const app = express();
app.use(express.json());

// Rutas base

app.use('/api/chat',chatRoutes);


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Servidor corriendo en puerto ${PORT}`));