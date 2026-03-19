const mongoose = require('mongoose');

// Medicine sub-schema
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
}, { _id: false });

const VisitSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: [true, 'Owner is required'],
  },
  cow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cow',
    required: [true, 'Cow is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms are required'],
  },
  diagnosis: {
    type: String,
    default: '',
  },
  treatment: {
    type: String,
    default: '',
  },
  medicines: [MedicineSchema],
  notes: {
    type: String,
    default: '',
  },
  followUpDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Index for dashboard queries
VisitSchema.index({ date: -1 });
VisitSchema.index({ cow: 1, date: -1 });
VisitSchema.index({ owner: 1 });

module.exports = mongoose.model('Visit', VisitSchema);
