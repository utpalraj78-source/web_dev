const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
  },
  copies: {
    type: Number,
    required: [true, 'Number of copies is required'],
    min: [0, 'Copies cannot be negative'],
    default: 1,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  }
}, {
  timestamps: true
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
