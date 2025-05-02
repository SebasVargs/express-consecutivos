const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController.js');

// Rutas base para /api/statuses
router.route('/')
  .get(statusController.getStatuses)
  .post(statusController.createStatus);

// Rutas con ID
router.route('/:id')
  .get(statusController.getStatusById)
  .put(statusController.updateStatus)
  .delete(statusController.deleteStatus);

module.exports = router;