require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { connectDB } = require('./config/db');

const usuarioRoutes = require('./routes/usuarioRoutes');
const publicacionRoutes = require('./routes/publicacionesRoutes');
const transaccionRoutes = require('./routes/transaccionRoutes'); 
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/transacciones', transaccionRoutes); 

app.get('/api/health', (_req, res) =>
  res.status(200).json({ status: 'OK', message: 'Servicio funcionando', timestamp: new Date().toISOString() })
);

// siempre al final
app.use(errorHandler);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
