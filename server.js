require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const path = require('path');

const usuarioRoutes = require('./routes/usuarioRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const transaccionRoutes = require('./routes/transaccionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================================
// 1) API PRIMERO (MUY IMPORTANTE)
// ==================================

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/chats', chatRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servicio funcionando',
    timestamp: new Date().toISOString()
  });
});

// ==================================
// 2) FRONTEND DESPUÉS DE LAS RUTAS API
// ==================================

app.use(express.static(path.join(__dirname, 'itsonmarket-frontend', 'public')));
app.use('/views', express.static(path.join(__dirname, 'itsonmarket-frontend', 'views')));

// SPA Fallback — *hasta el final*
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'itsonmarket-frontend', 'public', 'index.html'));
});

// ==================================
// 3) Middleware de errores
// ==================================
app.use(errorHandler);

// ==================================
// 4) Conectar a Mongo y levantar servidor
// ==================================
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
