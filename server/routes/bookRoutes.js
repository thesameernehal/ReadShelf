// server/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book.js');
const verifyToken = require('./middleWare/verifyToken');
const axios = require('axios');

// Fetch book cover from Google Books API
async function fetchGoogleBooksCover({ title, author }) {
    try {
        const q = [
            title ? `intitle:${title}` : "",
            author ? `inauthor:${author}` : ""
        ].filter(Boolean).join('+');

        const params = {
            q,
            maxResults: 1,
            orderBy: 'relevance',
            fields: 'items(volumeInfo/imageLinks/thumbnail)'
        };

        if (process.env.GOOGLE_BOOKS_API_KEY) {
            params.key = process.env.GOOGLE_BOOKS_API_KEY;
        }

        const { data } = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params,
            timeout: 4000,
        });

        const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        return thumb ? thumb.replace(/^http:/, 'https:') : '';
    } catch (e) {
        console.error("GoogleBooks fetch error:", e.message || e);
        return "";
    }
}

// Secure all routes with verifyToken (router.use applies to all below)
router.use(verifyToken);

// GET books with pagination
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // verifyToken sets req.userId (and req.user.id)
        const userId = req.userId || (req.user && req.user.id);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: user id missing' });
        }

        const filter = { userId };

        const [books, totalBooks] = await Promise.all([
            Book.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
            Book.countDocuments(filter)
        ]);

        return res.json({
            total: totalBooks,
            page,
            pages: Math.max(1, Math.ceil(totalBooks / limit)),
            books,
        });
    } catch (err) {
        console.error("Error fetching books:", err);
        return res.status(500).json({ message: "Server Error" });
    }
});

// POST add a new book
router.post('/', async (req, res) => {
    try {
        // req.userId is set by verifyToken middleware
        const userId = req.userId || (req.user && req.user.id);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: user id missing' });
        }

        const {
            title,
            author,
            status = 'Wishlist',
            coverUrl = '',
            tags = [],
            popularity = 0,
        } = req.body || {};

        if (!title || !author) {
            return res.status(400).json({ message: 'Title and author are required' });
        }

        const book = new Book({
            title: String(title).trim(),
            author: String(author).trim(),
            status,
            coverUrl,
            tags: Array.isArray(tags) ? tags : [],
            popularity: Number(popularity) || 0,
            userId, // server authoritative
        });

        const saved = await book.save();
        return res.status(201).json({ message: 'Book created', book: saved });
    } catch (err) {
        console.error('Create book error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation failed', errors: err.errors });
        }
        return res.status(500).json({ message: 'Server error' });
    }
});

// GET single book by ID
router.get("/:id", async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book Not Found' });

        if (String(book.userId) !== String(userId)) {
            return res.status(403).json({ message: 'Unauthorized to view this book' });
        }

        return res.json(book);
    } catch (err) {
        console.error('Get single book error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});

// PUT update a book by ID
router.put('/:id', async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book Not Found' });

        if (String(book.userId) !== String(userId)) {
            return res.status(403).json({ message: 'Unauthorized to update this book' });
        }

        const updates = { ...req.body };
        const titleChanged = updates.title && updates.title !== book.title;
        const authorChanged = updates.author && updates.author !== book.author;
        const noCoverProvided = !('coverUrl' in updates) || !updates.coverUrl;

        if ((titleChanged || authorChanged) && noCoverProvided) {
            let coverUrl = await fetchGoogleBooksCover({
                title: updates.title || book.title,
                author: updates.author || book.author
            });
            if (coverUrl) updates.coverUrl = coverUrl;
        }

        const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
        return res.json(updatedBook);
    } catch (err) {
        console.error('Update book error:', err);
        return res.status(400).json({ message: err.message || 'Update failed' });
    }
});

// DELETE book by ID
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        if (String(book.userId) !== String(userId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await book.deleteOne();
        return res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error('Delete error', err);
        return res.status(500).json({ message: 'Unable to delete Book' });
    }
});

module.exports = router;
