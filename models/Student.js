const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},{ autoIndex: true });
StudentSchema.index({ name: 1 }); // For sorting by name
StudentSchema.index({ email: 1 }, { unique: true });
StudentSchema.index({ studentId: 1 }, { unique: true });
module.exports = mongoose.model('Student', StudentSchema);