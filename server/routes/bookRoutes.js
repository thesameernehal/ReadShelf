
const express = require('express');
const router = express.Router();
const Book = require('../models/Book.js');

// Route to get all books 
router.get('/', async (req, res) => {
    try {
        const books = await Book.find(); // later: filter by userId
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to add a new book 
router.post('/', async (req, res) => {
    const { title, author, status, userId } = req.body;

    const newBook = new Book({
        title,
        author,
        status,
        userId
    });

    try {
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

})

// Route to get a book by ID
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book)
            return res.status(404).json({ message: 'Book Not Found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.put('/:id', async (req, res) => {
    try {
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


// Router to delete a book

router.delete('/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({
            message: 'Book deleted successfully'
        });
    } catch (err) {
        res.status(400).json({ message: 'Unable to delete Book' })
    }
})

module.exports = router; 