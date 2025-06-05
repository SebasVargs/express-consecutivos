const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Configuración de Keycloak - Ajustada para versiones recientes de Keycloak
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_ADMIN_CLIENT_ID = 'backend-admin-client'; // Cliente con roles de admin
const KEYCLOAK_ADMIN_CLIENT_SECRET = 'LDq7QzimGYi7I292LAocKHCuzkCS4RqE'; // Secreto del cliente admin

// Conectar a MongoDB
mongoose.connect('mongodb://appUser:appPassword123@localhost:27017/appdb?authSource=appdb')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Importar modelos (asumiendo que están en archivos separados)
const User = require('../models/User'); // Ajusta la ruta según la estructura de tu proyecto

// Función para obtener el token de administrador - URL corregida
async function getKeycloakAdminToken() {
    console.log('KEYCLOAK_URL:', KEYCLOAK_URL);
    console.log('KEYCLOAK_REALM:', KEYCLOAK_REALM);
    console.log('KEYCLOAK_ADMIN_CLIENT_ID:', KEYCLOAK_ADMIN_CLIENT_ID);
    console.log('KEYCLOAK_ADMIN_CLIENT_SECRET:', KEYCLOAK_ADMIN_CLIENT_SECRET);


    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', KEYCLOAK_ADMIN_CLIENT_ID);
    params.append('client_secret', KEYCLOAK_ADMIN_CLIENT_SECRET);

    try {
        console.log(`Intentando obtener token de: ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`);
        const response = await axios.post(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            params.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );
        console.log('Token obtenido exitosamente');
        return response.data.access_token;
    } catch (error) {
        console.error('Error al obtener el token de administrador:', error.message);
        if (error.response) {
            console.error('Detalles de la respuesta:', error.response.status, error.response.data);
        }
        throw error;
    }
}

// Función para registrar un usuario en Keycloak - URLs corregidas
async function registerUserInKeycloak(userData) {
    const adminToken = await getKeycloakAdminToken();

    try {
        console.log(`Intentando registrar usuario en: ${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`);
        const response = await axios.post(
            `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
            {
                username: userData.email,
                email: userData.email,
                firstName: userData.name.split(' ')[0],
                lastName: userData.name.split(' ').slice(1).join(' '),
                enabled: true,
                credentials: [{
                    type: 'password',
                    value: userData.password,
                    temporary: false
                }],
                attributes: {
                    rolId: userData.rol
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extraer el keycloakId de la respuesta
        let keycloakId;
        if (response.headers && response.headers.location) {
            keycloakId = response.headers.location.split('/').pop();
            console.log(`Usuario creado con ID: ${keycloakId} (de header location)`);
        } else {
            // Obtener el usuario recién creado para conseguir su ID
            const userResponse = await axios.get(
                `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${encodeURIComponent(userData.email)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            keycloakId = userResponse.data[0].id;
            console.log(`Usuario creado con ID: ${keycloakId} (consultado después de creación)`);
        }

        return keycloakId;
    } catch (error) {
        console.error('Error al registrar usuario en Keycloak:', error.message);
        if (error.response) {
            console.error("Detalles del error de Keycloak:", error.response.status, error.response.data);
        }
        throw error;
    }
}

// Ruta para registrar usuario en ambos sistemas simultáneamente
app.post('/api/auth/register', async (req, res) => {
    const userData = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!userData.name || !userData.email || !userData.password || !userData.rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        // 1. Registrar al usuario en Keycloak y obtener su ID
        const keycloakId = await registerUserInKeycloak(userData);

        // 2. Crear objeto de usuario para MongoDB usando el modelo proporcionado
        const newUser = new User({
            name: userData.name,
            email: userData.email,
            rol: userData.rol,
            keycloakId: keycloakId,
            status: userData.status || undefined, // Si se proporciona un status, lo usamos
            metadata: {
                lastLogin: null,
                loginCount: 0
            }
        });

        // 3. Guardar en MongoDB
        await newUser.save();

        res.status(201).json({
            message: 'Usuario registrado exitosamente en Keycloak y MongoDB',
            userId: newUser.id,
            keycloakId: keycloakId
        });
    } catch (error) {
        console.error('Error completo:', error);

        // Manejo de errores específicos
        if (error.response && error.response.status === 409) {
            return res.status(409).json({ message: 'El usuario ya existe en Keycloak' });
        }

        if (error.code === 11000) { // Error de MongoDB por duplicado
            return res.status(409).json({ message: 'El usuario ya existe en la base de datos' });
        }

        res.status(500).json({
            message: 'Error al registrar el usuario',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Express escuchando en el puerto ${PORT}`));