const express = require('express');
const router = express.Router();
const consecutiveController = require('../controllers/consecutiveController.js');

router.route('/')
  .get(consecutiveController.getConsecutives)
  .post(consecutiveController.createConsecutive);

router.route('/:id')
  .get(consecutiveController.getConsecutiveById)
  .put(consecutiveController.updateConsecutive)
  .delete(consecutiveController.deleteConsecutive);

router.route('/user/:userId')
  .get(consecutiveController.getConsecutivesByUser);

module.exports = router;