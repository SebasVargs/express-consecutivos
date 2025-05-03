const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController.js');
const upload = require('../middleware/upload.js'); // Importas multer configurado

// GET todos los documentos
router.get('/', documentController.getDocuments);

// POST nuevo documento con archivo (usa multer)
router.post('/', upload.single('file'), documentController.createDocument);

// PUT y DELETE por ID
router.route('/:id')
  .put(documentController.updateDocument)
  .delete(documentController.deleteDocument);

// GET documentos por id_consecutive
router.get('/consecutive/:consecutiveId', documentController.getDocumentsByConsecutive);

module.exports = router;
