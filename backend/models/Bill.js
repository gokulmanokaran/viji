const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  visit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true,
  },
  cow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cow',
    required: true,
  },
  consultationFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  medicineCharges: {
    type: Number,
    default: 0,
    min: 0,
  },
  otherCharges: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Auto-calculate total before saving
BillSchema.pre('save', function (next) {
  this.totalAmount = this.consultationFee + this.medicineCharges + this.otherCharges;
  next();
});

// Index for revenue queries
BillSchema.index({ date: -1 });
BillSchema.index({ owner: 1 });

module.exports = mongoose.model('Bill', BillSchema);
