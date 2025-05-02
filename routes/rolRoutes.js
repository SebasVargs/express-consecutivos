const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController.js');

// Rutas base para /api/roles
router.route('/')
  .get(rolController.getRoles)
  .post(rolController.createRol);

// Rutas con ID
router.route('/:id')
  .get(rolController.getRolById)
  .put(rolController.updateRol)
  .delete(rolController.deleteRol);

module.exports = router;