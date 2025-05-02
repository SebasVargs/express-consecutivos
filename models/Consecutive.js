const mongoose = require('mongoose');
const Counter = require('./Counter.js');

const consecutiveSchema = new mongoose.Schema({
  date_soli: {
    type: Date,
    required: [true, 'La fecha de solicitud es obligatoria']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [300, 'La descripción no puede exceder los 300 caracteres']
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'El usuario es obligatorio']
  },
  id_status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'status',
    required: [true, 'El estado es obligatorio']
  },
  consecutivo_id: {
    type: Number,
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para retornar el _id como id
consecutiveSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

consecutiveSchema.pre('save', async function (next) {
  const counter = await Counter.findOneAndUpdate(
    { collectionName: 'consecutive' },
    { $inc: { count: 1 } },
    { new: true, upsert: true } 
  );
  this.consecutivo_id = counter.count; 
  next();
});

module.exports = mongoose.model('consecutive', consecutiveSchema, 'consecutive');
