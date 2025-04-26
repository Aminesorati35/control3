const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ name: 1 })
      .maxTimeMS(10000);
    res.render('students/index', {
      title: 'All Students',
      students
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show new student form
router.get('/new', (req, res) => {
  res.render('students/create', { title: 'Register New Student' });
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const { name, email, studentId, phone, address } = req.body;
    const newStudent = new Student({
      name,
      email,
      studentId,
      phone,
      address
    });
    await newStudent.save();
    res.redirect('/students');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show edit student form
router.get('/:id/edit', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.render('students/edit', { title: 'Edit Student', student });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, email, studentId, phone, address } = req.body;
    await Student.findByIdAndUpdate(req.params.id, {
      name,
      email,
      studentId,
      phone,
      address
    });
    res.redirect('/students');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;