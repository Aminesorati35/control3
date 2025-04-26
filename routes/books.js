const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find()
    .sort({ createdAt: -1 })
    .maxTimeMS(10000);;
    res.render('books/index', { 
      title: 'All Books',
      books 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show new book form
router.get('/new', (req, res) => {
  res.render('books/create', { title: 'Add New Book' });
});

// Create new book
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, quantity, publicationYear, genre } = req.body;
    const newBook = new Book({
      title,
      author,
      isbn,
      quantity,
      availableQuantity: quantity,
      publicationYear,
      genre
    });
    await newBook.save();
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show edit book form
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    res.render('books/edit', { title: 'Edit Book', book });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, isbn, quantity, publicationYear, genre } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).send('Book not found');
    }
    
    // Calculate the difference in available copies
    const quantityDifference = quantity - book.quantity;
    
    book.title = title;
    book.author = author;
    book.isbn = isbn;
    book.quantity = quantity;
    book.availableQuantity = book.availableQuantity + quantityDifference;
    book.publicationYear = publicationYear;
    book.genre = genre;
    
    await book.save();
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;