const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 
    'mongodb://appUser:appPassword123@localhost:27017/appdb?authSource=appdb';

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    poolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  try {
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    console.log(`Base de datos: ${conn.connection.name}`);
    console.log(`Conexiones activas: ${conn.connection.readyState === 1 ? 'Activa' : 'Inactiva'}`);

    mongoose.connection.on('connected', () => {
      console.log('Conexión establecida con MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`Error de conexión MongoDB: ${err.message}`);
      console.error('Stack:', err.stack);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Reconectado a MongoDB');
    });

    const gracefulShutdown = async (msg, callback) => {
      await mongoose.connection.close();
      console.log(`MongoDB desconectado a través de ${msg}`);
      callback();
    };

    process.once('SIGUSR2', () => {
      gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
      });
    });

    process.on('SIGINT', () => {
      gracefulShutdown('terminación de la aplicación', () => {
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      gracefulShutdown('terminación de Heroku', () => {
        process.exit(0);
      });
    });

    return conn;

  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    console.error('Stack:', error.stack);
    
    process.exit(1);
  }
};

module.exports = connectDB;