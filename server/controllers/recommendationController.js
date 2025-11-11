// server/controllers/recommendationController.js
const Book = require('../models/Book');
const fetch = global.fetch || require('node-fetch'); // node-fetch fallback

// ---------- Helpers to call external APIs ----------

// Utility: normalize title+author key for de-duplication
// improved normalization to collapse editions/annotations/language variants
function normalizeTitleAuthorKey(item) {
    const rawTitle = (item.title || '').toString().trim().toLowerCase();
    const rawAuthor = (item.authors && item.authors[0]) || item.author || '';

    // 1) remove bracketed annotations like [adaptation], (vol.1), [2/2], etc.
    let t = rawTitle.replace(/\[[^\]]*\]|\([^\)]*\}/g, ''); // remove [...] and (...)
    // 2) remove numeric fractions like "1/2"
    t = t.replace(/\d+\/\d+/g, '');
    // 3) remove common edition tokens (volume, vol, edition, part, book)
    t = t.replace(/\b(volume|vol|edition|part|book|series)\b/gi, ' ');
    // 4) remove punctuation and diacritics-ish (basic)
    t = t.normalize ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : t;
    t = t.replace(/[^a-z0-9\s]/g, ' ');
    // 5) collapse whitespace
    t = t.replace(/\s+/g, ' ').trim();

    // author normalization: keep first author, lowercased and stripped
    let a = ('' + rawAuthor).toString().trim().toLowerCase();
    a = a.normalize ? a.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : a;
    a = a.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

    // limit lengths to avoid huge keys
    return `${t.slice(0, 80)}|${a.slice(0, 60)}`;
}


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
                description: (doc.first_sentence && (typeof doc.first_sentence === 'string' ? doc.first_sentence : (Array.isArray(doc.first_sentence) ? doc.first_sentence.join(' ') : ''))) || doc.subtitle || '',
                coverUrl,
                source: 'openlibrary',
                externalId,
                tags,
                popularity: doc.edition_count || 0,
                _normKey: normalizeTitleAuthorKey({ title: doc.title, authors: doc.author_name })
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
                popularity: item.saleInfo?.buyLink ? 50 : (item.accessInfo?.pdf ? 30 : 10),
                _normKey: normalizeTitleAuthorKey({ title: vol.title, authors })
            };
        });
    } catch (err) {
        console.error('Google Books error', err);
        return [];
    }
}

// Remove exact duplicates by a derived key (keeps first seen)
function uniqueByKey(arr, keyFn) {
    const seen = new Set();
    return arr.filter(it => {
        try {
            const k = keyFn(it);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        } catch (e) {
            return true;
        }
    });
}

// Merge external suggestions from both sources (and dedupe by normalized key)
async function getExternalSuggestionsByQuery(query, perSource = 6) {
    const [ol, google] = await Promise.all([
        searchOpenLibrary(query, perSource),
        searchGoogleBooks(query, perSource)
    ]);
    const merged = [...(ol || []), ...(google || [])];

    // First remove true-duplicates by external id/title if present
    const byExternal = uniqueByKey(merged, i => (i.source || 'ext') + '|' + (i.externalId || (i.title + '|' + (i.authors?.[0] || ''))));

    // Then collapse editions by normalized title-author key: keep the item with max popularity
    const map = new Map();
    for (const item of byExternal) {
        const k = item._normKey || normalizeTitleAuthorKey(item);
        const prev = map.get(k);
        if (!prev) {
            map.set(k, item);
        } else {
            // pick the one with higher popularity (or prefer DB-like sources later)
            if ((item.popularity || 0) > (prev.popularity || 0)) {
                map.set(k, item);
            }
        }
    }

    return Array.from(map.values()).slice(0, perSource * 2); // return some variety
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
        // --- REPLACE the existing "tagSet.size === 0" branch with this block ---
        // ---------- REPLACE tagSet.size === 0 branch with this ----------
        if (tagSet.size === 0) {
            // if user has few books, query per book and interleave results so one book doesn't dominate
            const queries = (userBooks || []).slice(0, 6).map(b => {
                const titlePart = (b.title || '').toString().trim();
                const authorPart = (b.author || (b.authors || []).join(' ') || '').toString().trim();
                return `${titlePart} ${authorPart}`.trim();
            }).filter(Boolean);

            // fallback to popular subjects if no queries
            if (queries.length === 0) {
                const popularSubjects = ['fiction', 'fantasy', 'self help', 'technology', 'history'];
                const q = `${popularSubjects[0]} ${popularSubjects[1]}`;
                const external = await getExternalSuggestionsByQuery(q, 8);
                return res.json({ source: 'external-popular', recommendations: external.slice(0, TOP_N) });
            }

            // fetch candidates per query in parallel
            const perQueryResults = await Promise.all(queries.map(q => getExternalSuggestionsByQuery(q, 8)));

            // build a set of normalized keys for user's own books to avoid recommending same title
            const userKeys = new Set((userBooks || []).map(b => normalizeTitleAuthorKey(b)));

            // dedupe within each query result and filter out user-owned titles
            const perQueryUnique = perQueryResults.map(list => {
                return uniqueByKey(list.filter(i => !userKeys.has(i._normKey || normalizeTitleAuthorKey(i))),
                    it => (it._normKey || normalizeTitleAuthorKey(it)));
            });

            // now interleave results: pick up to perBookLimit from each query, in round-robin fashion
            const perBookLimit = Math.max(2, Math.floor(TOP_N / Math.max(1, queries.length))); // at least 2
            const finalList = [];
            let idx = 0;
            while (finalList.length < TOP_N) {
                let added = false;
                for (let qi = 0; qi < perQueryUnique.length; qi++) {
                    const slot = perQueryUnique[qi];
                    let take = 0;
                    // add next available item for this query if not exceeded perBookLimit for this query
                    while (take < perBookLimit) {
                        const cand = slot.shift();
                        if (!cand) break;
                        // ensure we don't re-add same normalized key (global dedupe)
                        const k = cand._normKey || normalizeTitleAuthorKey(cand);
                        if (finalList.some(x => (x._normKey || normalizeTitleAuthorKey(x)) === k)) continue;
                        finalList.push(cand);
                        take++;
                        added = true;
                        if (finalList.length >= TOP_N) break;
                    }
                    if (finalList.length >= TOP_N) break;
                }
                if (!added) break; // nothing more to add
                idx++;
                if (idx > 10) break; // safety
            }

            // if still fewer than TOP_N, fill with popular external suggestions
            if (finalList.length < TOP_N) {
                const extra = await getExternalSuggestionsByQuery(queries.join(' '), Math.max(6, TOP_N - finalList.length));
                for (const e of extra) {
                    const k = e._normKey || normalizeTitleAuthorKey(e);
                    if (!finalList.some(x => (x._normKey || normalizeTitleAuthorKey(x)) === k) && !userKeys.has(k)) {
                        finalList.push(e);
                        if (finalList.length >= TOP_N) break;
                    }
                }
            }

            return res.json({ source: 'external-derived-multi-interleaved', recommendations: finalList.slice(0, TOP_N) });
        }



        // 6) DB-first: find candidate books from DB that share tags (exclude user's own)
        const pool = await Book.find({
            userId: { $ne: userId },
            tags: { $in: Array.from(tagSet) }
        }).sort({ popularity: -1 }).limit(300).lean();

        if (pool && pool.length >= 1) {
            const maxPop = pool.reduce((m, b) => Math.max(m, b.popularity || 0), 1);
            const tagSetArray = Array.from(tagSet);

            const scored = pool.map(book => {
                const bookTags = new Set((book.tags || []).map(t => String(t).toLowerCase().trim()).filter(Boolean));
                let common = 0;
                for (const t of bookTags) if (tagSet.has(t)) common++;
                const union = new Set([...tagSetArray, ...Array.from(bookTags)]).size || 1;
                const overlapRatio = common / union;
                const popScore = (book.popularity || 0) / maxPop;
                const score = (overlapRatio * 0.8) + (popScore * 0.35);
                return {
                    book,
                    score,
                    overlapRatio,
                    popScore,
                    _normKey: normalizeTitleAuthorKey(book)
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

            // now collapse duplicates in scored results by normalized title-author (prefer DB book if present)
            const seenKeys = new Set();
            const dedupedScored = [];
            for (const s of scored) {
                const k = s._normKey || normalizeTitleAuthorKey(s.book);
                if (seenKeys.has(k)) continue;
                seenKeys.add(k);
                dedupedScored.push({ ...s.book, _recoScore: Number(s.score.toFixed(4)), _overlap: Number(s.overlapRatio.toFixed(4)), _popScore: Number(s.popScore.toFixed(4)) });
                if (dedupedScored.length >= TOP_N) break;
            }

            // if enough DB results after dedupe, return them
            if (dedupedScored.length >= Math.min(6, TOP_N)) {
                return res.json({ source: 'db', recommendations: dedupedScored.slice(0, TOP_N) });
            }

            // otherwise we'll augment with external candidates below
        }

        // 7) If DB results are insufficient, call external APIs by tags and merge results
        const tagArray = Array.from(tagSet);
        const query = tagArray.slice(0, 3).join(' ') || 'popular books';
        const externalCandidates = await getExternalSuggestionsByQuery(query, 12); // get more to fill gaps

        // Merge DB pool (even if small) with externalCandidates, dedupe by normalized title-author
        const combinedCandidates = [
            ...(pool || []).map(b => ({ ...b, source: 'db', _normKey: normalizeTitleAuthorKey(b) })),
            ...externalCandidates.map(e => ({ ...e, _normKey: e._normKey || normalizeTitleAuthorKey(e) }))
        ];

        // group by _normKey and pick the best candidate per key (prefer DB over external; else higher popularity)
        const group = new Map();
        for (const item of combinedCandidates) {
            const k = item._normKey || normalizeTitleAuthorKey(item);
            const prev = group.get(k);
            if (!prev) {
                group.set(k, item);
            } else {
                // prefer DB item
                if (prev.source !== 'db' && item.source === 'db') {
                    group.set(k, item);
                } else {
                    // otherwise keep item with higher popularity
                    if ((item.popularity || 0) > (prev.popularity || 0)) {
                        group.set(k, item);
                    }
                }
            }
        }

        // produce a final array ordered: DB-first (by score/pop), then external by popularity
        const finalArr = Array.from(group.values()).sort((a, b) => {
            // prefer db source
            if (a.source === 'db' && b.source !== 'db') return -1;
            if (b.source === 'db' && a.source !== 'db') return 1;
            // else by popularity desc
            return (b.popularity || 0) - (a.popularity || 0);
        });

        return res.json({ source: 'hybrid', recommendations: finalArr.slice(0, TOP_N) });

    } catch (err) {
        console.error('Hybrid recommendation error', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
