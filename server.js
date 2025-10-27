require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const publicacionRoutes = require('./routes/publicacionesRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());                   
app.use(express.urlencoded());    
app.use(errorHandler);

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/chats', chatRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servicio funcionando',
    timestamp: new Date().toISOString()
  });
});
// Conexión a Mongo
connectDB();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log('\nRutas disponibles:');
  console.log(`- POST http://localhost:${PORT}/api/auth/login`);
  console.log(`- POST http://localhost:${PORT}/api/auth/verify`);
  console.log(`- GET  http://localhost:${PORT}/api/health`);
  console.log(`- CRUD http://localhost:${PORT}/api/usuarios (protegido)`);
  console.log(`- CRUD http://localhost:${PORT}/api/publicaciones (protegido)`);
  console.log(`- CRUD http://localhost:${PORT}/api/chats (protegido)`);
});
