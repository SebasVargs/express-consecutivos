const mongoose = require('mongoose');

// Definición del esquema para el modelo Persona
const personaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  edad: {
    type: Number,
    required: [true, 'La edad es obligatoria'],
    min: [0, 'La edad no puede ser negativa']
  },
  correo: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, ingrese un correo electrónico válido'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para mejorar el rendimiento de las consultas
personaSchema.index({ correo: 1 }, { unique: true });
personaSchema.index({ nombre: 1 });

// Métodos personalizados para el modelo
personaSchema.methods.toJSON = function() {
  const persona = this.toObject();
  return persona;
};

// Crear y exportar el modelo
const Persona = mongoose.model('Persona', personaSchema);

module.exports = Persona;