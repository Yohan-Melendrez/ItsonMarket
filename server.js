require('dotenv').config();
const express = require('express');
// Importar rutas
const app = express();
app.use(express.json());
// Rutas base
app.use('/api/transacciones', require('./routes/transaccionRoutes'));



// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Servidor corriendo en puerto ${PORT}`));
