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
    const { id_consecutive } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No se ha subido ningún archivo' });
    }

    // Crea documento según tu modelo
    const newDocument = new Document({
      source_file: file.originalname,
      date_charge: new Date(),
      id_consecutive: id_consecutive
    });

    // Guarda el documento en MongoDB
    const savedDocument = await newDocument.save();
    
    // Añade información adicional para la respuesta
    const documentResponse = {
      ...savedDocument.toObject(),
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      size: file.size
    };

    res.status(201).json({ success: true, message: 'Documento creado correctamente', document: documentResponse });
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear documento' });
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