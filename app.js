const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const personaRoutes = require('./routes/personaRoutes');

// Iniciar aplicación Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://192.168.1.16:4200', 'http://localhost:4200'], // URL de tu frontend Angular (cambia a la IP del Mac)
  credentials: true
}));
app.use(helmet());

// Rutas
app.use('/api/personas', personaRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Servidor Express funcionando correctamente'})
})

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'API funcionando correctamente' });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada'})
})

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
          console.log(`Servidor Express ejecutándose en el puerto ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al iniciar la aplicacion', err)
    })

module.exports = app;