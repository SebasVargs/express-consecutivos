const mongoose = require('mongoose');

const consecutiveSchema = new mongoose.Schema({
  date_soli: {
    type: Date,
    required: [true, 'La fecha de solicitud es obligatoria']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [255, 'La descripción no puede exceder los 255 caracteres']
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: [true, 'El estado es obligatorio']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

consecutiveSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

consecutiveSchema.index({ date_soli: 1 });
consecutiveSchema.index({ user: 1 });
consecutiveSchema.index({ status: 1 });

consecutiveSchema.pre('save', function(next) {
  next();
});

module.exports = mongoose.model('Consecutive', consecutiveSchema);