const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del rol es obligatorio'],
    trim: true,
    unique: true,
    maxlength: [30, 'El nombre del rol no puede exceder los 30 caracteres']
  }
}, {
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

rolSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('rol', rolSchema, 'rol');