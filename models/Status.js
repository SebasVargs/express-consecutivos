const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del estado es obligatorio'],
    trim: true,
    unique: true
  }
}, {
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

statusSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('status', statusSchema, 'status');