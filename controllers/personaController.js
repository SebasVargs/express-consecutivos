const Persona = require('../models/Persona');

// Obtener todas las personas
exports.getPersonas = async (req, res) => {
  try {
    const personas = await Persona.find();
    res.status(200).json({
      success: true,
      count: personas.length,
      data: personas
    });
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// Obtener una persona por ID
exports.getPersonaById = async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
   
    if (!persona) {
      return res.status(404).json({
        success: false,
        error: 'Persona no encontrada'
      });
    }
   
    res.status(200).json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error('Error al obtener persona por ID:', error);
   
    // Verificar si es un error de ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'ID de persona no válido'
      });
    }
   
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// Crear una nueva persona
exports.createPersona = async (req, res) => {
  try {
    const { nombre, edad, correo } = req.body;
   
    // Verificar si ya existe una persona con ese correo
    const personaExistente = await Persona.findOne({ correo });
    if (personaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una persona con ese correo electrónico'
      });
    }
   
    // Crear la nueva persona
    const persona = await Persona.create({
      nombre,
      edad,
      correo
    });
   
    res.status(201).json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error('Error al crear persona:', error);
   
    // Error de validación de mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
   
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// Actualizar una persona
exports.updatePersona = async (req, res) => {
  try {
    const { nombre, edad, correo } = req.body;
   
    // Buscar y actualizar
    const persona = await Persona.findByIdAndUpdate(
      req.params.id,
      { nombre, edad, correo },
      { new: true, runValidators: true }
    );
   
    if (!persona) {
      return res.status(404).json({
        success: false,
        error: 'Persona no encontrada'
      });
    }
   
    res.status(200).json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error('Error al actualizar persona:', error);
   
    // Error de validación
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
   
    // ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'ID de persona no válido'
      });
    }
   
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// Eliminar una persona
exports.deletePersona = async (req, res) => {
  try {
    const persona = await Persona.findByIdAndDelete(req.params.id);
   
    if (!persona) {
      return res.status(404).json({
        success: false,
        error: 'Persona no encontrada'
      });
    }
   
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar persona:', error);
   
    // ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'ID de persona no válido'
      });
    }
   
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};