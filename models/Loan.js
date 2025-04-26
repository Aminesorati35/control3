const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued'
  },
  fineAmount: {
    type: Number,
    default: 0
  }
},{ autoIndex: true });

LoanSchema.index({ book: 1 });
LoanSchema.index({ student: 1 });
LoanSchema.index({ issueDate: -1 }); // For sorting loans
LoanSchema.index({ status: 1 }); // For filtering by status

module.exports = mongoose.model('Loan', LoanSchema);