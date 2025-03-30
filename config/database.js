const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configura la conexión a MongoDB
    // Reemplaza los valores según tu configuración
    const mongoURI = 'mongodb://appUser:appPassword123@localhost:27017/appdb?authSource=appdb';
   
    // Opciones de conexión
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
   
    // Conectar a MongoDB
    const conn = await mongoose.connect(mongoURI, options);
   
    console.log(`MongoDB conectado: ${conn.connection.host}`);
   
    // Manejo de eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error(`Error de conexión MongoDB: ${err}`);
    });
   
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });
   
    // Manejar cierre de aplicación
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada debido a la terminación de la aplicación');
      process.exit(0);
    });
   
    return conn;
   
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;