const mongoose = require('mongoose');

const OwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

// Index phone for fast search
OwnerSchema.index({ phone: 1 });
OwnerSchema.index({ name: 'text' });

module.exports = mongoose.model('Owner', OwnerSchema);
