// app.js (actualizado)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const consecutiveRoutes = require('./routes/consecutiveRoutes'); // Nueva importación
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://192.168.1.16:4200', 'http://localhost:4200'],
  credentials: true
}));
app.use(helmet());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/consecutives', consecutiveRoutes); // Nueva ruta

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'API funcionando correctamente' });
});

// Manejo de errores (debe ser el último middleware)
app.use(errorHandler);

// Iniciar servidor después de conectar a DB
connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
  });
});