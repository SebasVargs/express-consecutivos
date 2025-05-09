const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const path = require('path')
const connectDB = require('./config/database');
const consecutiveRoutes = require('./routes/consecutiveRoutes');
const documentRoutes = require('./routes/documentRoutes');
const statusRoutes = require('./routes/statusRoutes');
const rolRoutes = require('./routes/rolRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Configuración de Keycloak
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'master';
const KEYCLOAK_ADMIN_CLIENT_ID = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'backend-admin-client';
const KEYCLOAK_ADMIN_CLIENT_SECRET = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || 'am5vIvBhx3GBEwTDhWHL1EwUaaLZRn7Z';

// Middlewares
app.use(express.json());
app.use(cors({
    origin: ['http://192.168.1.16:4200', 'http://localhost:4200'],
    credentials: true
}));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'self'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
        },
    },
}));

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));


// Función para obtener el token de administrador de Keycloak
async function getKeycloakAdminToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client-credentials');
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
        console.log('Parametros enviados a Keycloak:', params.toString());
        console.log('Token obtenido exitosamente');
        return response.data.access_token;
    } catch (error) {
        console.error('Error al obtener el token de administrador:', error.message);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
        if (error.response) {
            console.error('Detalles de la respuesta:', error.response.status, error.response.data);
        }
        throw error;
    }
}

// Función para registrar un usuario en Keycloak
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

app.post('/api/auth/register', async (req, res) => {
    const userData = req.body;

    if (!userData.name || !userData.email || !userData.password || !userData.rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        const keycloakId = await registerUserInKeycloak(userData);
        const User = require('./models/User');

        const newUser = new User({
            name: userData.name,
            email: userData.email,
            rol: userData.rol,
            keycloakId: keycloakId,
            status: userData.status || undefined,
            metadata: {
                lastLogin: null,
                loginCount: 0
            }
        });

        await newUser.save();

        res.status(201).json({
            message: 'Usuario registrado exitosamente en Keycloak y MongoDB',
            userId: newUser.id,
            keycloakId: keycloakId
        });
    } catch (error) {
        console.error('Error completo:', error);

        if (error.response && error.response.status === 409) {
            return res.status(409).json({ message: 'El usuario ya existe en Keycloak' });
        }

        if (error.code === 11000) {
            return res.status(409).json({ message: 'El usuario ya existe en la base de datos' });
        }

        res.status(500).json({
            message: 'Error al registrar el usuario',
            error: error.message
        });
    }
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/consecutives', consecutiveRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/status', statusRoutes);

app.use(errorHandler);

connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor en puerto ${PORT}`);
        console.log(`Keycloak configurado en: ${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`);
    });
});