const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books, search by title/author/isbn, filter by category/author
router.get('/', async (req, res) => {
  try {
    const { search, category, author } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all unique categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all unique authors
router.get('/authors/all', async (req, res) => {
  try {
    const authors = await Book.distinct('author');
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new book
router.post('/', async (req, res) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      copies: req.body.copies,
      category: req.body.category
    });

    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (book) {
      book.title = req.body.title || book.title;
      book.author = req.body.author || book.author;
      book.isbn = req.body.isbn || book.isbn;
      book.copies = req.body.copies !== undefined ? req.body.copies : book.copies;
      book.category = req.body.category || book.category;
      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'notupdated ' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const result = await Book.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({ message: 'Book deleted successfully' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
