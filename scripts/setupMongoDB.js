const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  const adminUrl = 'mongodb://localhost:27017/admin';
  const dbName = 'appdb';
  const username = 'appUser';
  const password = 'appPassword123';
 
  let adminClient;
  let appClient;
 
  try {
    console.log('Conectando a MongoDB...');
    adminClient = new MongoClient(adminUrl);
    await adminClient.connect();
    console.log('Conexión exitosa como administrador');
   
    await adminClient.db('admin').command({
      createUser: 'adminUser',
      pwd: 'password123',
      roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }]
    }).catch(err => {
      if (err.code !== 51003) {
        throw err;
      }
      console.log('El usuario administrador ya existe, continuando...');
    });
   
    await adminClient.db(dbName).command({
      createUser: username,
      pwd: password,
      roles: [{ role: 'readWrite', db: dbName }]
    }).catch(err => {
      if (err.code !== 51003) {
        throw err;
      }
      console.log('El usuario de aplicación ya existe, continuando...');
    });
   
    const appUrl = `mongodb://${username}:${password}@localhost:27017/${dbName}?authSource=${dbName}`;
    appClient = new MongoClient(appUrl);
    await appClient.connect();
    console.log('Verificación exitosa con usuario de aplicación');
   
    await appClient.db(dbName).createCollection('personas');
    console.log('Colección "personas" verificada/creada');
   
    await appClient.db(dbName).collection('personas').createIndex({ correo: 1 }, { unique: true });
    await appClient.db(dbName).collection('personas').createIndex({ nombre: 1 });
    console.log('Índices creados correctamente');
   
    await appClient.db(dbName).collection('personas').insertMany([
      { nombre: 'Sebastian Pérez', edad: 30, correo: 'juan@ejemplo.com', createdAt: new Date() },
      { nombre: 'María López', edad: 25, correo: 'maria@ejemplo.com', createdAt: new Date() }
    ]).catch(err => {
      if (err.code !== 11000) {
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
    if (adminClient) await adminClient.close();
    if (appClient) await appClient.close();
  }
}

setupMongoDB();