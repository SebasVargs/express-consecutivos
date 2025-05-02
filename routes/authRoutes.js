const express = require('express');
const router = express.Router();
const keycloakController = require('../controllers/keycloakController');

// Ruta para solicitar un token de acceso por correo
router.post('/request-token', keycloakController.requestLoginToken);

// Ruta para verificar el token e iniciar sesión
router.post('/verify-token', keycloakController.verifyLoginToken);

module.exports = router;