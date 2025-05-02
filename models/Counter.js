const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  collectionName: { type: String, required: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('counter', counterSchema, 'counter');
