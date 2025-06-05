const User = require('../models/User.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER || 'cvsa5000@gmail.com',
        pass: process.env.EMAIL_PASS || 'bkuj tnmd lkyw tjlr'
    }
});

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_ADMIN_CLIENT_ID = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'backend-admin-client';
const KEYCLOAK_ADMIN_CLIENT_SECRET = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || 'LDq7QzimGYi7I292LAocKHCuzkCS4RqE';
const KEYCLOAK_FRONTEND_CLIENT_ID = process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'frontend-client';
const KEYCLOAK_FRONTEND_CLIENT_SECRET = process.env.KEYCLOAK_FRONTEND_CLIENT_SECRET || 'Y2xvqiEs87OH5ckOise9qIplLoEjf4zK';

async function getKeycloakAdminToken() {
    console.log('KEYCLOAK_URL:', KEYCLOAK_URL);
    console.log('KEYCLOAK_REALM:', KEYCLOAK_REALM);
    console.log('KEYCLOAK_ADMIN_CLIENT_ID:', KEYCLOAK_ADMIN_CLIENT_ID);
    console.log('KEYCLOAK_ADMIN_CLIENT_SECRET:', KEYCLOAK_ADMIN_CLIENT_SECRET);

    try {
        const response = await axios.post(
            `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: KEYCLOAK_ADMIN_CLIENT_ID,
                client_secret: KEYCLOAK_ADMIN_CLIENT_SECRET,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        console.log('Token de administrador obtenido correctamente');
        return response.data.access_token;
    } catch (error) {
        console.error('Error al obtener el token de administrador de Keycloak:', error);
        throw new Error('Error al autenticar con la API de administración de Keycloak.');
    }
}

exports.requestLoginToken = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const loginToken = crypto.randomBytes(32).toString('hex');
        const loginTokenExpiry = Date.now() + 300000; // 5 minutos de validez

        await User.findOneAndUpdate(
            { email: user.email },
            {
                loginToken: loginToken,
                loginTokenExpires: loginTokenExpiry
            }
        );

        const mailOptions = {
            to: email,
            subject: 'Token de Acceso a la Aplicación',
            html: `<p>Hola,</p><p>Este es tu token de acceso único para la aplicación:</p><p><strong>${loginToken}</strong></p><p>Este token expirará en 5 minutos.</p><p>Por favor, ingresa este token en la pantalla de inicio de sesión.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ message: 'Error al enviar el correo electrónico.' });
            }
            console.log('Correo enviado:', info.response);
            res.json({ message: 'Se ha enviado un token a tu correo electrónico.' });
        });

    } catch (error) {
        console.error('Error al solicitar el token de acceso:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

exports.verifyLoginToken = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({
            loginToken: token,
            loginTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }

        // Get admin token first
        try {
            const adminToken = await getKeycloakAdminToken();
            console.log('Obtenido token de administrador, intentando acceder a usuarios...');

            // Check if user exists in Keycloak
            try {
                const userResponse = await axios.get(
                    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?email=${encodeURIComponent(user.email)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );

                console.log('Respuesta de keycloak', userResponse.status);

                let keycloakUserId;

                if (userResponse.data && userResponse.data.length > 0) {
                    // User exists, get ID
                    keycloakUserId = userResponse.data[0].id;
                } else {
                    // User doesn't exist, create in Keycloak
                    const createResponse = await axios.post(
                        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
                        {
                            username: user.email,
                            email: user.email,
                            enabled: true
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${adminToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    // Get the user ID of the newly created user
                    const newUserResponse = await axios.get(
                        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?email=${encodeURIComponent(user.email)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${adminToken}`
                            }
                        }
                    );

                    keycloakUserId = newUserResponse.data[0].id;
                }

                // Set temporary password matching token
                await axios.put(
                    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakUserId}/reset-password`,
                    {
                        type: "password",
                        value: token,
                        temporary: false
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Now authenticate with Keycloak using a client configured for password grants
                const loginResponse = await axios.post(
                    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
                    new URLSearchParams({
                        grant_type: 'password',
                        client_id: KEYCLOAK_FRONTEND_CLIENT_ID,
                        client_secret: KEYCLOAK_FRONTEND_CLIENT_SECRET,
                        username: user.email,
                        password: token
                    }).toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                // Update user in MongoDB with Keycloak ID if not exists
                if (!user.keycloakId) {
                    await User.findByIdAndUpdate(user._id, { keycloakId: keycloakUserId });
                }

                // Update metadata
                await User.findByIdAndUpdate(user._id, {
                    $unset: { loginToken: 1, loginTokenExpires: 1 },
                    $set: { 'metadata.lastLogin': new Date() },
                    $inc: { 'metadata.loginCount': 1 }
                });

                res.json(loginResponse.data);

            } catch (keycloakError) {
                console.error('Error al gestionar el usuario en Keycloak:', keycloakError.response ? keycloakError.response.data : keycloakError.message);
                return res.status(500).json({ message: 'Error al gestionar la autenticación.' });
            }
        } catch (adminTokenError) {
            console.error('Error al obtener token de administrador:', adminTokenError);
            return res.status(500).json({ message: 'Error de autenticación con el servidor.' });
        }
    } catch (error) {
        console.error('Error al verificar el token de acceso:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};