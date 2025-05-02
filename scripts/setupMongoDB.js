const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  const adminUrl = 'mongodb://localhost:27017';
  const dbName = 'appdb';
  const adminUsername = 'adminUser';
  const adminPassword = 'password123';
  const appUsername = 'appUser';
  const appPassword = 'appPassword123';

  const adminRoles = [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    { role: 'readWriteAnyDatabase', db: 'admin' }
  ];

  const appRoles = [
    { role: 'readWrite', db: dbName },
    { role: 'dbAdmin', db: dbName }
  ];

  let adminClient;
  let appClient;

  try {
    console.log('\nIniciando configuración de MongoDB...');
    adminClient = new MongoClient(adminUrl);
    await adminClient.connect();
    console.log('✔ Conexión exitosa al servidor MongoDB');

    // Crear usuario administrador
    try {
      await adminClient.db('admin').command({
        createUser: adminUsername,
        pwd: adminPassword,
        roles: adminRoles
      });
      console.log('✔ Usuario administrador creado');
    } catch (err) {
      if (err.code === 51003) {
        console.log('⚠ El usuario administrador ya existe');
      } else {
        throw err;
      }
    }

    // Crear base de datos y usuario de aplicación
    const db = adminClient.db(dbName);
    try {
      await db.command({
        createUser: appUsername,
        pwd: appPassword,
        roles: appRoles
      });
      console.log('✔ Usuario de aplicación creado');
    } catch (err) {
      if (err.code === 51003) {
        console.log('⚠ El usuario de aplicación ya existe');
      } else {
        throw err;
      }
    }

    // Verificar conexión con usuario de aplicación
    const appUrl = `mongodb://${appUsername}:${appPassword}@localhost:27017/${dbName}?authSource=${dbName}`;
    appClient = new MongoClient(appUrl);
    await appClient.connect();
    console.log('✔ Autenticación exitosa con usuario de aplicación');

    // Crear colecciones necesarias
    const collections = [
      'rol',
      'user',
      'status',
      'consecutive',
      'document',
      'count'  // Aquí se añade la colección count para el contador
    ];

    for (const collectionName of collections) {
      try {
        await appClient.db(dbName).createCollection(collectionName);
        console.log(`✔ Colección "${collectionName}" creada`);
      } catch (err) {
        if (err.codeName === 'NamespaceExists') {
          console.log(`⚠ La colección "${collectionName}" ya existía`);
        } else {
          throw err;
        }
      }
    }

    const countCollection = appClient.db(dbName).collection('count');
    await countCollection.createIndex({ id: 1 }, { unique: true });
    await countCollection.createIndex({ count: 1 });

    // Índices
    const rolCollection = appClient.db(dbName).collection('rol');
    await rolCollection.createIndex({ id: 1 }, { unique: true });
    await rolCollection.createIndex({ name: 1 }, { unique: true });

    const userCollection = appClient.db(dbName).collection('user');
    await userCollection.createIndex({ id: 1 }, { unique: true });
    await userCollection.createIndex({ name: 1 });
    await userCollection.createIndex({ id_rol: 1 });

    const statusCollection = appClient.db(dbName).collection('status');
    await statusCollection.createIndex({ id: 1 }, { unique: true });
    await statusCollection.createIndex({ name: 1 }, { unique: true });

    const consecutiveCollection = appClient.db(dbName).collection('consecutive');
    await consecutiveCollection.createIndex({ id: 1 }, { unique: true });
    await consecutiveCollection.createIndex({ id_status: 1 });
    await consecutiveCollection.createIndex({ id_user: 1 });
    await consecutiveCollection.createIndex({ date_soli: 1 });

    const documentCollection = appClient.db(dbName).collection('document');
    await documentCollection.createIndex({ id: 1 }, { unique: true });
    await documentCollection.createIndex({ id_consecutive: 1 });
    await documentCollection.createIndex({ date_charge: 1 });

    // Finalización
    console.log('\n✅ Configuración de MongoDB completada exitosamente!');
    console.log('------------------------------------');
    console.log(`- Base de datos: ${dbName}`);
    console.log(`- Usuario: ${appUsername}`);
    console.log(`- Contraseña: ${appPassword}`);
    console.log('------------------------------------');
    console.log('Resumen de colecciones y relaciones:');
    console.log('1. Rol -> User (1:N)');
    console.log('2. User -> Consecutive (1:N)');
    console.log('3. Status -> Consecutive (1:N)');
    console.log('4. Consecutive -> Document (1:N)');
    console.log('------------------------------------\n');

  } catch (error) {
    console.error('\n❌ Error durante la configuración:');
    console.error(error);
    process.exit(1);
  } finally {
    if (adminClient) await adminClient.close();
    if (appClient) await appClient.close();
    process.exit(0);
  }
}

setupMongoDB();
