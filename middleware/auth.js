const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const axios = require('axios');
require('dotenv').config();

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'master';

// Cliente para verificación de tokens JWT con claves RSA de Keycloak
const client = jwksClient({
    jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function(err, key) {
        if (err) return callback(err);
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

exports.verifyToken = async (req, res, next) => {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No se proporcionó un token de acceso' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verificar y decodificar el token JWT
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                console.error('Error al verificar el token:', err);
                return res.status(401).json({ message: 'Token inválido o expirado' });
            }
            
            // Verificar que el token es para esta aplicación
            const clientId = process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'frontend-client';
            if (decoded.azp !== clientId && decoded.aud !== clientId) {
                return res.status(403).json({ message: 'Token no está destinado a esta aplicación' });
            }
            
            // Agregar la información decodificada al objeto de solicitud
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Error en la verificación del token:', error);
        res.status(500).json({ message: 'Error en la autenticación' });
    }
};

// Middleware para verificar roles específicos del usuario
exports.hasRole = (roleNames) => {
    return (req, res, next) => {
        // Asegurarse de que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        
        // Verificar si el usuario tiene al menos uno de los roles requeridos
        const userRoles = req.user.realm_access?.roles || [];
        const hasRequiredRole = Array.isArray(roleNames) 
            ? roleNames.some(role => userRoles.includes(role))
            : userRoles.includes(roleNames);
            
        if (!hasRequiredRole) {
            return res.status(403).json({ message: 'No autorizado, rol requerido' });
        }
        
        next();
    };
};