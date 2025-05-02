const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  source_file: {
    type: String,
    required: [true, 'El archivo fuente es obligatorio'],
    trim: true
  },
  date_charge: {
    type: Date,
    required: [true, 'La fecha de carga es obligatoria']
  },
  id_consecutive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'consecutive',
    required: [true, 'El consecutivo es obligatorio']
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

documentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('document', documentSchema, 'document');