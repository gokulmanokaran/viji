const mongoose = require('mongoose');

const CowSchema = new mongoose.Schema({
  tagNumber: {
    type: String,
    required: [true, 'Tag number is required'],
    unique: true,
    trim: true,
  },
  breed: {
    type: String,
    required: [true, 'Breed is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 0,
  },
  gender: {
    type: String,
    enum: ['Female', 'Male'],
    default: 'Female',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: [true, 'Owner is required'],
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Index for faster queries
CowSchema.index({ owner: 1 });
CowSchema.index({ tagNumber: 1 });

module.exports = mongoose.model('Cow', CowSchema);
