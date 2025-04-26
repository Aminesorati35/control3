const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    default: function() {
      return this.quantity;
    }
  },
  publicationYear: {
    type: Number
  },
  genre: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},{ 
  autoIndex: true, // Ensure indexes are created
  strictQuery: true // Prevent querying on non-existent fields
}
);
// Add compound indexes for common queries
BookSchema.index({ title: 1, author: 1 }); // For title/author searches
BookSchema.index({ availableQuantity: -1 }); // For availability checks
BookSchema.index({ createdAt: -1 }); // For sorting by creation date

module.exports = mongoose.model('Book', BookSchema);