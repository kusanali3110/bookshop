const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
    default: null
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  imageUrl: {
    type: String,
    default: null
  },
  isbn: {
    type: String,
    default: null,
    sparse: true  // Allow multiple null values
  },
  publishedDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Create indexes
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ isbn: 1 }, { sparse: true });  // Sparse index for ISBN
bookSchema.index({ tags: 1 });

// Create the model
const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 