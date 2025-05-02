const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const keycloakController = require('../controllers/keycloakController.js');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.route('/keycloak/:keycloakId')
  .get(userController.getUserByKeycloakId);

// Rutas para autenticación por token via email
router.post('/login/request-token', keycloakController.requestLoginToken);
router.post('/login/verify-token', keycloakController.verifyLoginToken);

// Ruta para obtener la información del usuario autenticado por Keycloak
router.get('/me', verifyToken, async (req, res) => {
    const keycloakId = req.user.sub;
    try {
        let user = await User.findOne({ keycloakId }).populate('rol').populate('status');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        // Actualizar los metadatos de inicio de sesión
        user.metadata.lastLogin = new Date();
        user.metadata.loginCount += 1;
        await user.save();
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error al buscar el usuario:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;