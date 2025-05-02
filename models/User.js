const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  id_rol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rol',
    required: [true, 'El rol es obligatorio']
  },
  email: {
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
  keycloakId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'status'
  },
  metadata: {
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    }
  },
  loginToken: {
    type: String,
    select: false
  },
  loginTokenExpires: {
    type: Date,
    select: false
  },
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

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

userSchema.index({ loginToken: 1, loginTokenExpires: 1 });

module.exports = mongoose.model('user', userSchema, 'user');