const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/external/search?title=...&author=...
// Returns array of candidate book-like objects (not saved to DB)
router.get('/search', async (req, res) => {
    try {
        const { title = '', author = '' } = req.query;
        const qTitle = String(title || '').trim();
        const qAuthor = String(author || '').trim();

        if (!qTitle && !qAuthor) {
            return res.status(400).json({ message: 'title or author query required' });
        }

        // 1) Try OpenLibrary first
        try {
            const olResp = await axios.get('https://openlibrary.org/search.json', {
                params: {
                    title: qTitle || undefined,
                    author: qAuthor || undefined,
                    limit: 6,
                },
                timeout: 5000,
            });

            const docs = olResp.data?.docs || [];
            if (docs.length > 0) {
                const items = docs.map(d => {
                    const cover = d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : '';
                    return {
                        title: d.title || '',
                        authors: d.author_name || [],
                        coverUrl: cover,
                        source: 'openlibrary',
                        externalId: d.key || ''
                    };
                });
                return res.json({ source: 'openlibrary', items });
            }
        } catch (olErr) {
            console.warn('OpenLibrary lookup failed on server:', olErr.message || olErr);
            // continue to Google fallback
        }

        // 2) Google Books fallback
        try {
            const gbResp = await axios.get('https://www.googleapis.com/books/v1/volumes', {
                params: { q: `${qTitle ? 'intitle:' + qTitle : ''} ${qAuthor ? 'inauthor:' + qAuthor : ''}`, maxResults: 6 },
                timeout: 5000,
            });

            const items = (gbResp.data?.items || []).map(it => {
                const vol = it.volumeInfo || {};
                const cover = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail || '';
                return {
                    title: vol.title || '',
                    authors: vol.authors || [],
                    coverUrl: cover ? (cover.startsWith('http:') ? cover.replace(/^http:/, 'https:') : cover) : '',
                    source: 'google',
                    externalId: it.id || ''
                };
            });

            return res.json({ source: 'google', items });
        } catch (gbErr) {
            console.warn('Google Books lookup failed on server:', gbErr.message || gbErr);
        }

        // If both fail
        return res.status(502).json({ message: 'Could not fetch external data' });
    } catch (err) {
        console.error('External search error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
