const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  payerType: {
    type: String,
    enum: ['Student', 'Consultant'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified'],
    default: 'Pending'
  },
  stripeStatus: {
    type: String,
    enum: ['succeeded', 'failed', 'pending'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  courseId: {
    type: String,
    required: false
  },
  receiptNumber: {
    type: String,
    default: null
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptSentAt: {
    type: Date,
    default: null
  },
  receiptError: {
    type: String,
    default: null
  },
  pdfReceiptUrl: {
    type: String,
    default: null
  },
  pdfReceiptFilename: {
    type: String,
    default: null
  },
  pdfReceiptGeneratedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', PaymentSchema); 