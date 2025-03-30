const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  // URL de conexión para un administrador
  const adminUrl = 'mongodb://localhost:27017/admin';
  const dbName = 'appdb';
  const username = 'appUser';
  const password = 'appPassword123';
 
  let adminClient;
  let appClient;
 
  try {
    // Conectar como administrador
    console.log('Conectando a MongoDB...');
    adminClient = new MongoClient(adminUrl);
    await adminClient.connect();
    console.log('Conexión exitosa como administrador');
   
    // Crear usuario administrador si no existe
    await adminClient.db('admin').command({
      createUser: 'adminUser',
      pwd: 'password123',
      roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }]
    }).catch(err => {
      if (err.code !== 51003) { // Ignorar error si el usuario ya existe
        throw err;
      }
      console.log('El usuario administrador ya existe, continuando...');
    });
   
    // Crear la base de datos y usuario de aplicación
    await adminClient.db(dbName).command({
      createUser: username,
      pwd: password,
      roles: [{ role: 'readWrite', db: dbName }]
    }).catch(err => {
      if (err.code !== 51003) { // Ignorar error si el usuario ya existe
        throw err;
      }
      console.log('El usuario de aplicación ya existe, continuando...');
    });
   
    // Conectar con el usuario de la aplicación para verificar
    const appUrl = `mongodb://${username}:${password}@localhost:27017/${dbName}?authSource=${dbName}`;
    appClient = new MongoClient(appUrl);
    await appClient.connect();
    console.log('Verificación exitosa con usuario de aplicación');
   
    // Crear colección si no existe
    await appClient.db(dbName).createCollection('personas');
    console.log('Colección "personas" verificada/creada');
   
    // Crear índices
    await appClient.db(dbName).collection('personas').createIndex({ correo: 1 }, { unique: true });
    await appClient.db(dbName).collection('personas').createIndex({ nombre: 1 });
    console.log('Índices creados correctamente');
   
    // Insertar datos de ejemplo (opcional)
    await appClient.db(dbName).collection('personas').insertMany([
      { nombre: 'Sebastian Pérez', edad: 30, correo: 'juan@ejemplo.com', createdAt: new Date() },
      { nombre: 'María López', edad: 25, correo: 'maria@ejemplo.com', createdAt: new Date() }
    ]).catch(err => {
      if (err.code !== 11000) { // Ignorar errores de duplicación
        throw err;
      }
      console.log('Algunos datos de ejemplo ya existen');
    });
   
    console.log('------------------------------------');
    console.log('Configuración de MongoDB completada exitosamente!');
    console.log('Base de datos:', dbName);
    console.log('Usuario:', username);
    console.log('------------------------------------');
    console.log('Para conectarse desde otro equipo, asegúrate de que MongoDB esté configurado para aceptar conexiones remotas');
    console.log('URL de conexión: mongodb://' + username + ':' + password + '@<IP-WINDOWS>:27017/' + dbName + '?authSource=' + dbName);
    console.log('------------------------------------');
   
  } catch (error) {
    console.error('Error al configurar MongoDB:', error);
  } finally {
    // Cerrar conexiones
    if (adminClient) await adminClient.close();
    if (appClient) await appClient.close();
  }
}

// Ejecutar la función principal
setupMongoDB();