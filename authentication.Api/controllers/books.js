const express = require('express');
const Book = require('../models/Book');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new book
router.post('/', async (req, res) => {
  try {
    const { title, author , publishedDate, description } = req.body;

    const newBook = new Book({
      title,
      author,
      publishedDate,
      description
    });

    await newBook.save();
    res.status(201).json({ message: 'Booke Added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all books
router.get('/', authenticateToken, async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a book by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update a book by ID
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, author, publishedDate, description } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, {
      title,
      author,
      publishedDate,
      description
    }, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json({ message: 'Booke Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a book by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).json({ message: 'Booke Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
