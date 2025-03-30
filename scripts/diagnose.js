const mongoose = require('mongoose');
const http = require('http');

// Comprobar MongoDB
async function checkMongoDB() {
  try {
    console.log('Verificando conexión a MongoDB...');
   
    const mongoURI = 'mongodb://appUser:appPassword123@localhost:27017/appdb?authSource=appdb';
    await mongoose.connect(mongoURI);
   
    console.log('✅ Conexión a MongoDB exitosa');
   
    // Verificar si podemos acceder a la colección
    const personas = await mongoose.connection.db.collection('personas').countDocuments();
    console.log(`✅ Colección de personas accesible (contiene ${personas} documentos)`);
   
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.log('Posibles causas:');
      console.log('- MongoDB no está en ejecución');
      console.log('- Las credenciales de usuario son incorrectas');
      console.log('- La base de datos no existe');
      console.log('\nIntente ejecutar el script setupMongoDB.js para configurar la base de datos');
    }
    return false;
  }
}

// Comprobar el servidor Express
function checkExpressServer() {
  return new Promise((resolve) => {
    console.log('Verificando si el servidor Express está respondiendo...');
   
    // Verificar ruta principal
    http.get('http://localhost:3000/', (res) => {
      const statusCode = res.statusCode;
      console.log(`✅ Servidor Express responde en ruta principal (status: ${statusCode})`);
     
      // Verificar ruta de API
      http.get('http://localhost:3000/api/health', (res) => {
        const statusCode = res.statusCode;
        console.log(`✅ Ruta de API health responde (status: ${statusCode})`);
       
        // Verificar ruta de personas
        http.get('http://localhost:3000/api/personas', (res) => {
          const statusCode = res.statusCode;
          console.log(`✅ Ruta de API personas responde (status: ${statusCode})`);
          resolve(true);
        }).on('error', (e) => {
          console.error('❌ Error al verificar ruta /api/personas:', e.message);
          resolve(false);
        });
       
      }).on('error', (e) => {
        console.error('❌ Error al verificar ruta /api/health:', e.message);
        resolve(false);
      });
     
    }).on('error', (e) => {
      console.error('❌ Error al verificar servidor Express:', e.message);
      console.log('Asegúrate de que el servidor Express esté en ejecución en el puerto 3000');
      resolve(false);
    });
  });
}

async function runDiagnosis() {
  console.log('=== DIAGNÓSTICO DEL SISTEMA ===');
 
  // Verificar MongoDB
  const mongoOk = await checkMongoDB();
 
  // Verificar Express
  const expressOk = await checkExpressServer();
 
  console.log('\n=== RESUMEN DEL DIAGNÓSTICO ===');
  console.log(`MongoDB: ${mongoOk ? '✅ OK' : '❌ Error'}`);
  console.log(`Express: ${expressOk ? '✅ OK' : '❌ Error'}`);
 
  if (!mongoOk || !expressOk) {
    console.log('\nRecomendaciones:');
    if (!mongoOk) {
      console.log('1. Verifica que MongoDB esté ejecutándose:');
      console.log('   - En Windows: Busca "Servicios" y asegúrate de que "MongoDB Server" esté iniciado');
      console.log('   - O ejecuta: "net start MongoDB"');
      console.log('2. Verifica las credenciales y ejecuta el script setupMongoDB.js nuevamente');
    }
    if (!expressOk) {
      console.log('1. Asegúrate de que el servidor Express esté en ejecución');
      console.log('2. Verifica que no haya errores en la consola al iniciar el servidor');
      console.log('3. Comprueba que las rutas estén correctamente definidas en app.js');
    }
  } else {
    console.log('\n✅ Todo parece estar funcionando correctamente');
  }
}

runDiagnosis();