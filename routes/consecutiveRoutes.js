// routes/consecutiveRoutes.js
const express = require('express');
const router = express.Router();
const consecutiveController = require('../controllers/consecutiveController');

// Rutas base para /api/consecutives
router.route('/')
  .get(consecutiveController.getConsecutives)
  .post(consecutiveController.createConsecutive);

// Rutas con ID
router.route('/:id')
  .get(consecutiveController.getConsecutiveById)
  .put(consecutiveController.updateConsecutive)
  .delete(consecutiveController.deleteConsecutive);

// Ruta para conseguir los consecutivos por usuario
router.route('/user/:userId')
  .get(consecutiveController.getConsecutivesByUser);

module.exports = router;