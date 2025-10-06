require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const publicacionRoutes = require('./routes/publicacionesRoutes');
const app = express();
app.use(express.json());

// Rutas base
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/publicaciones', publicacionRoutes);

// Conexión a Mongo
connectDB();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Servidor corriendo en puerto ${PORT}`));
