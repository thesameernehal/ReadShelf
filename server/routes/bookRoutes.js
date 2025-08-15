
const express = require('express');
const router = express.Router();
const Book = require('../models/Book.js');
const verifyToken = require('./middleWare/verifyToken');

// Secure all book routes
router.use(verifyToken);

// GET Books with Pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;   // default 1
    const limit = parseInt(req.query.limit) || 10; // default 10
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.userId };

    const [books, totalBooks] = await Promise.all([
      // use _id for safe, time-based sort (works even if timestamps aren't enabled)
      Book.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.json({
      total: totalBooks,
      page,
      pages: Math.ceil(totalBooks / limit),
      books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// Route to add a new book 
router.post('/', async (req, res) => {
    const { title, author, status, coverUrl } = req.body;
    const userId = req.user.userId;

    const newBook = new Book({
        title,
        author,
        status,
        userId,
        coverUrl: coverUrl || ''
    });

    try {
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

})

// Route to get a book by ID (only if it belongs to the user)
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || book.userId != req.user.userId) {
            return res.status(404).json({ message: 'Book Not Found or Unauthorized' });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Route to update a book by ID (only if it belongs to the user)
router.put('/:id', async (req, res) => {
    try {

        const book = await Book.findById(req.params.id);
        if (!book || book.userId.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Book Not Found or Unauthorized' });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body, {
            new: true
        }
        );
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
});



// Route to delete a book by ID (only if it belongs to the user)
router.delete('/:id', async (req, res) => {
    try {

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await book.deleteOne();
        res.json({
            message: 'Book deleted successfully'
        });
    } catch (err) {
        console.error('Delete error', err)
        res.status(500).json({ message: 'Unable to delete Book' })
    }
})

module.exports = router; 