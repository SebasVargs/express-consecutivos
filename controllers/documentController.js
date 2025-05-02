const Document = require('../models/Document.js');
const Consecutive = require('../models/Consecutive.js');
const User = require('../models/User.js');

// Obtener todos los documentos
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('id_consecutive')
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un documento por ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('id_consecutive')
    
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const document = new Document(req.body);
    const savedDocument = await document.save();
    res.status(201).json(savedDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.status(200).json(updatedDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.status(200).json({ message: 'Documento eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener documentos por ID de consecutivo
exports.getDocumentsByConsecutive = async (req, res) => {
  try {
    const documents = await Document.find({ id_consecutive: req.params.consecutiveId })
      .populate('id_consecutive');

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};