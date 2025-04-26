const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Student = require('../models/Student');

// Get all loans
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('book')
      .populate('student')
      .sort({ issueDate: -1 })
      .maxTimeMS(10000); // Add timeout

    res.render('loans/index', {
      title: 'All Loans',
      loans
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show new loan form
router.get('/new', async (req, res) => {
  try {
    const books = await Book.find({ availableQuantity: { $gt: 0 } });
    const students = await Student.find();
    res.render('loans/create', {
      title: 'Issue New Book',
      books,
      students
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create new loan
router.post('/', async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;

    // Check if book is available
    const book = await Book.findById(bookId);
    if (!book || book.availableQuantity <= 0) {
      return res.status(400).send('Book not available');
    }

    // Create new loan
    const newLoan = new Loan({
      book: bookId,
      student: studentId,
      dueDate: new Date(dueDate),
      status: 'issued'
    });

    await newLoan.save();

    // Update book availability
    book.availableQuantity -= 1;
    await book.save();

    res.redirect('/loans');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Return book
router.post('/:id/return', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan || loan.status === 'returned') {
      return res.status(400).send('Invalid loan or already returned');
    }

    // Update loan
    loan.returnDate = new Date();
    loan.status = 'returned';

    // Calculate fine if overdue
    if (loan.dueDate < loan.returnDate) {
      const daysLate = Math.ceil((loan.returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
      loan.fineAmount = daysLate * 0.5; // $0.50 per day
    }

    await loan.save();

    // Update book availability
    const book = await Book.findById(loan.book);
    book.availableQuantity += 1;
    await book.save();

    res.redirect('/loans');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;