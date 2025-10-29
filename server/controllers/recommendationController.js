// server/controllers/recommendationController.js
const Book = require('../models/Book');
const fetch = global.fetch || require('node-fetch'); // node-fetch fallback

// ---------- Helpers to call external APIs ----------

// Search Open Library (returns standardized book-like objects)
async function searchOpenLibrary(query, limit = 8) {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data || !Array.isArray(data.docs)) return [];

        return data.docs.map(doc => {
            const coverId = doc.cover_i;
            const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';
            const externalId = (doc.key && String(doc.key)) || (doc.edition_key && doc.edition_key[0]) || '';
            const tags = (doc.subject || []).slice(0, 6).map(s => String(s).toLowerCase());
            return {
                title: doc.title || 'Untitled',
                authors: doc.author_name || [],
                description: (doc.first_sentence && (typeof doc.first_sentence === 'string' ? doc.first_sentence : doc.first_sentence.join(' '))) || doc.subtitle || '',
                coverUrl,
                source: 'openlibrary',
                externalId,
                tags,
                popularity: doc.edition_count || 0
            };
        });
    } catch (err) {
        console.error('OpenLibrary error', err);
        return [];
    }
}

// Search Google Books (returns standardized book-like objects)
async function searchGoogleBooks(query, limit = 8) {
    try {
        // Optionally add &key=YOUR_KEY if you have a Google Books API key
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${limit}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data || !Array.isArray(data.items)) return [];

        return data.items.map(item => {
            const vol = item.volumeInfo || {};
            const authors = vol.authors || [];
            const coverUrl = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail || '';
            const externalId = item.id || '';
            const tags = (vol.categories || []).slice(0, 6).map(s => String(s).toLowerCase());
            return {
                title: vol.title || 'Untitled',
                authors,
                description: vol.description || '',
                coverUrl,
                source: 'google',
                externalId,
                tags,
                popularity: item.saleInfo?.buyLink ? 50 : (item.accessInfo?.pdf ? 30 : 10)
            };
        });
    } catch (err) {
        console.error('Google Books error', err);
        return [];
    }
}

// Remove duplicates by a derived key
function uniqueByKey(arr, keyFn) {
    const seen = new Set();
    return arr.filter(it => {
        const k = keyFn(it);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

// Merge external suggestions from both sources
async function getExternalSuggestionsByQuery(query, perSource = 6) {
    const [ol, google] = await Promise.all([
        searchOpenLibrary(query, perSource),
        searchGoogleBooks(query, perSource)
    ]);
    const merged = [...(ol || []), ...(google || [])];
    return uniqueByKey(merged, i => (i.source || 'ext') + '|' + (i.externalId || (i.title + '|' + (i.authors?.[0] || ''))));
}

// ---------- Main controller ----------

/**
 * GET /api/recommendations
 * Hybrid strategy:
 * - If user has no books => query external APIs for popular subjects (guest ok)
 * - If user has books => try DB-based tag overlap first
 * - If DB results are insufficient, merge with external API results
 */
exports.getRecommendations = async (req, res) => {
    try {
        // Accept both authenticated and guest users.
        // If auth middleware set req.user or req.userId, use it. Otherwise userId = null (guest).
        const userId = (req.user && req.user.id) || req.userId || null;
        const TOP_N = 12;

        // 1) If no userId -> treat as guest and return popular external suggestions
        if (!userId) {
            const popularSubjects = ['fiction', 'fantasy', 'self help', 'technology', 'history'];
            const query = `${popularSubjects[0]} ${popularSubjects[1]}`;
            const external = await getExternalSuggestionsByQuery(query, 8);
            return res.json({ source: 'external-popular-guest', recommendations: external.slice(0, TOP_N) });
        }

        // 2) load user's books
        const userBooks = await Book.find({ userId }).lean();

        // 3) if user has no books -> give popular external suggestions
        if (!userBooks || userBooks.length === 0) {
            const popularSubjects = ['fiction', 'fantasy', 'self help', 'technology', 'history'];
            const query = `${popularSubjects[0]} ${popularSubjects[1]}`;
            const external = await getExternalSuggestionsByQuery(query, 8);
            return res.json({ source: 'external-popular', recommendations: external.slice(0, TOP_N) });
        }

        // 4) collect tag set from user's books
        let userTags = userBooks.flatMap(b => b.tags || []);
        userTags = userTags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
        const tagSet = new Set(userTags);

        // 5) if tagSet empty -> derive query from title/author of first user book and call external APIs
        if (tagSet.size === 0) {
            const sample = userBooks[0] || {};
            const titlePart = sample.title || '';
            const authorPart = sample.author || (sample.authors || []).join(' ') || '';
            const q = (titlePart + ' ' + authorPart).trim() || 'popular books';
            const external = await getExternalSuggestionsByQuery(q, 10);
            return res.json({ source: 'external-derived', recommendations: external.slice(0, TOP_N) });
        }

        // 6) DB-first: find candidate books from DB that share tags (exclude user's own)
        const pool = await Book.find({
            userId: { $ne: userId },
            tags: { $in: Array.from(tagSet) }
        }).sort({ popularity: -1 }).limit(300).lean();

        // If we have enough DB candidates, score and return
        // inside recommendationController.js, replace the DB scoring block with this:

        if (pool && pool.length >= 1) {
            // compute max popularity for normalization
            const maxPop = pool.reduce((m, b) => Math.max(m, b.popularity || 0), 1);

            // helper to compute Jaccard-like overlap: common / union
            const tagSetArray = Array.from(tagSet);
            const scored = pool.map(book => {
                const bookTags = new Set((book.tags || []).map(t => String(t).toLowerCase().trim()).filter(Boolean));
                // compute common and union
                let common = 0;
                for (const t of bookTags) if (tagSet.has(t)) common++;
                const union = new Set([...tagSetArray, ...Array.from(bookTags)]).size || 1;
                const overlapRatio = common / union; // between 0 and 1

                const popScore = (book.popularity || 0) / maxPop; // 0..1

                // final deterministic score (tune weights as needed)
                const score = (overlapRatio * 0.8) + (popScore * 0.35);

                return {
                    book,
                    score,
                    overlapRatio,
                    popScore
                };
            });

            // sort by score desc, then popularity desc, then title asc
            scored.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                const aPop = a.book.popularity || 0, bPop = b.book.popularity || 0;
                if (bPop !== aPop) return bPop - aPop;
                const aTitle = (a.book.title || '').toLowerCase();
                const bTitle = (b.book.title || '').toLowerCase();
                return aTitle.localeCompare(bTitle);
            });

            // return top N but include score for debugging
            const top = scored.slice(0, TOP_N).map(s => {
                // attach score to the returned book object slightly (non-persistent)
                return { ...s.book, _recoScore: Number(s.score.toFixed(4)), _overlap: Number(s.overlapRatio.toFixed(4)), _popScore: Number(s.popScore.toFixed(4)) };
            });

            return res.json({ source: 'db', recommendations: top });
        }


        // 7) If DB results are insufficient, call external APIs by tags and merge results
        const tagArray = Array.from(tagSet);
        const query = tagArray.slice(0, 3).join(' ') || 'popular books';
        const externalCandidates = await getExternalSuggestionsByQuery(query, 8);

        // Merge DB pool (even if small) with externalCandidates, dedupe by DB _id or external key
        const combined = uniqueByKey([...(pool || []), ...externalCandidates], item => {
            if (item._id) return 'db|' + String(item._id);
            return (item.source || 'ext') + '|' + (item.externalId || item.title);
        });

        return res.json({ source: 'hybrid', recommendations: combined.slice(0, TOP_N) });

    } catch (err) {
        console.error('Hybrid recommendation error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
