const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController.js');

// Rutas base para /api/documents
router.route('/')
  .get(documentController.getDocuments)
  .post(documentController.createDocument);

// Rutas con ID
router.route('/:id')
  .put(documentController.updateDocument)
  .delete(documentController.deleteDocument);

// Ruta para conseguir los documentos por consecutivo
router.route('/consecutive/:consecutiveId')
  .get(documentController.getDocumentsByConsecutive);

module.exports = router;