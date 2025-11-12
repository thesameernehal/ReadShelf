// server/controllers/recommendationController.js
const Book = require('../models/Book');
const fetch = global.fetch || require('node-fetch');
const axios = require('axios');

/**
 * Helpers: external source lookups
 */

// Search Open Library (returns standardized book-like objects)
async function searchOpenLibrary(query, limit = 8) {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
        const res = await fetch(url, { timeout: 8000 });
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
                popularity: doc.edition_count || 0,
                _normKey: ((doc.title || '') + '|' + (doc.author_name && doc.author_name[0] || '')).toString().toLowerCase()
            };
        });
    } catch (err) {
        console.error('OpenLibrary error', err && err.message ? err.message : err);
        return [];
    }
}

// Search Google Books (returns standardized book-like objects)
async function searchGoogleBooks(query, limit = 8) {
    try {
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
                coverUrl: coverUrl ? (coverUrl.startsWith('http:') ? coverUrl.replace(/^http:/, 'https:') : coverUrl) : '',
                source: 'google',
                externalId,
                tags,
                popularity: item.saleInfo?.buyLink ? 50 : (item.accessInfo?.pdf ? 30 : 10),
                _normKey: ((vol.title || '') + '|' + (authors && authors[0] || '')).toString().toLowerCase()
            };
        });
    } catch (err) {
        console.error('Google Books error', err && err.message ? err.message : err);
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

/**
 * Server-side filtering & dedupe helpers
 */

// Extended negative keywords (workbook, student, translation, etc.)
const NEGATIVE_TITLE_KEYWORDS = [
    'summary', 'summaries', 'guide', 'notes', 'journal', 'study', 'analysis',
    'review', 'companion', 'cheat', 'excerpt', 'summary of', 'summary :', 'key ideas',
    'workbook', 'student', 'solutions', 'answers', 'translation', 'translated',
    'tamil', 'hindi', 'urdu', 'kannada', 'lecture', 'class', 'syllabus', 'annotated',
    'illustrated', 'adaptation', 'summary -', 'summary:', 'study guide'
];

// small list of language tokens to detect translations/adaptations
const LANGUAGE_TOKENS = ['tamil', 'hindi', 'urdu', 'spanish', 'french', 'german', 'telugu', 'marathi', 'bengali', 'kannada'];

function looksLikeNonPrimaryWork(title = '') {
    if (!title) return false;
    const s = title.toString().toLowerCase();
    if (NEGATIVE_TITLE_KEYWORDS.some(k => s.includes(k))) return true;
    if (LANGUAGE_TOKENS.some(lang => s.includes(lang))) return true;
    if (s.length <= 2) return true;
    return false;
}

function normalizeTitleAuthorKeyServer(item) {
    const rawTitle = (item.title || '').toString().trim().toLowerCase();
    let t = rawTitle.replace(/\[[^\]]*\]|\([^\)]*\)/g, ' ');
    t = t.replace(/\d+\/\d+/g, ' ');
    t = t.replace(/\b(volume|vol|edition|part|book|series|edition)\b/gi, ' ');
    t = t.normalize ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : t;
    t = t.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const author = ((item.authors && item.authors[0]) || item.author || '').toString().trim().toLowerCase();
    const a = author.normalize ? author.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : author;
    const aClean = a.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    return `${t.slice(0, 120)}|${aClean.slice(0, 80)}`;
}

function pickBetterItem(a, b) {
    const aHasCover = Boolean(a.coverUrl);
    const bHasCover = Boolean(b.coverUrl);
    if (aHasCover !== bHasCover) return aHasCover ? a : b;
    const aPop = Number(a.popularity || 0);
    const bPop = Number(b.popularity || 0);
    if (aPop !== bPop) return aPop > bPop ? a : b;
    if ((a.source === 'google') !== (b.source === 'google')) return a.source === 'google' ? a : b;
    return a;
}

/**
 * processCandidates(candidates, topN, options)
 * options:
 *   - excludeKeys: Set of normalized title|author keys to skip (user's own books)
 *   - minPrimariesToFilter: integer controlling when to drop noisy items (default 3)
 */
function processCandidates(candidates = [], topN = 12, options = {}) {
    const { excludeKeys = new Set(), minPrimariesToFilter = Math.min(3, topN) } = options;
    if (!Array.isArray(candidates)) candidates = [];

    // 1) base filter (has title or id)
    let list = candidates.filter(it => it && (it.title || it.externalId || it._id));

    // 2) exclude any items that match user's own books (by normalized key)
    if (excludeKeys && excludeKeys.size > 0) {
        list = list.filter(it => {
            const k = normalizeTitleAuthorKeyServer(it);
            return !excludeKeys.has(k);
        });
    }

    // 3) prefer to remove noisy items if there are enough primary candidates
    const primary = list.filter(it => !looksLikeNonPrimaryWork(it.title));
    if (primary.length >= Math.min(topN, minPrimariesToFilter)) {
        list = primary;
    }

    // 4) dedupe by normalized key, picking best representative
    const map = new Map();
    for (const it of list) {
        const key = normalizeTitleAuthorKeyServer(it);
        if (!map.has(key)) map.set(key, it);
        else {
            const existing = map.get(key);
            const better = pickBetterItem(existing, it);
            map.set(key, better);
        }
    }

    // 5) scoring & sorting
    const arr = Array.from(map.values());
    function score(it) {
        let s = 0;
        if (it.coverUrl) s += 1000;
        s += Number(it.popularity || 0);
        if (looksLikeNonPrimaryWork(it.title)) s -= 700;
        const t = (it.title || '').toString().toLowerCase();
        if (t.includes('student workbook') || t.includes('workbook')) s -= 400;
        return s;
    }

    arr.sort((a, b) => score(b) - score(a));
    return arr.slice(0, topN);
}

/**
 * Main controller: GET /api/recommendations
 * Hybrid strategy with server-side processing
 */
exports.getRecommendations = async (req, res) => {
    try {
        const userId = (req.user && req.user.id) || req.userId || null;
        const TOP_N = 12;

        // 1) guest => popular external suggestions
        if (!userId) {
            const popularSubjects = ['fiction', 'fantasy', 'self help', 'technology', 'history'];
            const query = `${popularSubjects[0]} ${popularSubjects[1]}`;
            const external = await getExternalSuggestionsByQuery(query, 12);
            return res.json({ source: 'external-popular-guest', recommendations: processCandidates(external, TOP_N) });
        }

        // 2) load user's books
        const userBooks = await Book.find({ userId }).lean();

        // 3) if user has no books -> popular external
        if (!userBooks || userBooks.length === 0) {
            const popularSubjects = ['fiction', 'fantasy', 'self help', 'technology', 'history'];
            const query = `${popularSubjects[0]} ${popularSubjects[1]}`;
            const external = await getExternalSuggestionsByQuery(query, 12);
            return res.json({ source: 'external-popular', recommendations: processCandidates(external, TOP_N) });
        }

        // Build excluded set from user's own books
        const userExcludeSet = new Set((userBooks || []).map(b => normalizeTitleAuthorKeyServer(b)));

        // 4) collect tags
        let userTags = userBooks.flatMap(b => b.tags || []);
        userTags = userTags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
        const tagSet = new Set(userTags);

        // 5) if no tags -> build multi-query per book and interleave
        if (tagSet.size === 0) {
            const queries = (userBooks || []).slice(0, 6).map(b => {
                const titlePart = (b.title || '').toString().trim();
                const authorPart = (b.author || (b.authors || []).join(' ') || '').toString().trim();
                return `${titlePart} ${authorPart}`.trim();
            }).filter(Boolean);

            if (queries.length === 0) {
                const popularSubjects = ['fiction', 'fantasy', 'self help', 'technology', 'history'];
                const q = `${popularSubjects[0]} ${popularSubjects[1]}`;
                const external = await getExternalSuggestionsByQuery(q, 12);
                return res.json({ source: 'external-popular', recommendations: processCandidates(external, TOP_N, { excludeKeys: userExcludeSet }) });
            }

            const perQueryResults = await Promise.all(queries.map(q => getExternalSuggestionsByQuery(q, 8)));

            const perQueryUnique = perQueryResults.map(list => {
                return uniqueByKey(list.filter(i => !userExcludeSet.has(i._normKey || normalizeTitleAuthorKeyServer(i))),
                    it => (it._normKey || normalizeTitleAuthorKeyServer(it)));
            });

            const perBookLimit = Math.max(2, Math.floor(TOP_N / Math.max(1, queries.length)));
            const finalList = [];
            let safety = 0;
            while (finalList.length < TOP_N && safety < 20) {
                safety++;
                let addedThisRound = false;
                for (let qi = 0; qi < perQueryUnique.length; qi++) {
                    const slot = perQueryUnique[qi];
                    if (!slot || slot.length === 0) continue;
                    let take = 0;
                    while (take < perBookLimit && slot.length > 0) {
                        const cand = slot.shift();
                        if (!cand) break;
                        const k = cand._normKey || normalizeTitleAuthorKeyServer(cand);
                        if (finalList.some(x => (x._normKey || normalizeTitleAuthorKeyServer(x)) === k)) continue;
                        if (userExcludeSet.has(k)) continue; // ensure we don't recommend user's own books
                        finalList.push(cand);
                        take++;
                        addedThisRound = true;
                        if (finalList.length >= TOP_N) break;
                    }
                    if (finalList.length >= TOP_N) break;
                }
                if (!addedThisRound) break;
            }

            if (finalList.length < TOP_N) {
                const extra = await getExternalSuggestionsByQuery(queries.join(' '), Math.max(6, TOP_N - finalList.length));
                for (const e of extra) {
                    const k = e._normKey || normalizeTitleAuthorKeyServer(e);
                    if (!finalList.some(x => (x._normKey || normalizeTitleAuthorKeyServer(x)) === k) && !userExcludeSet.has(k)) {
                        finalList.push(e);
                        if (finalList.length >= TOP_N) break;
                    }
                }
            }

            return res.json({ source: 'external-derived-multi-interleaved', recommendations: processCandidates(finalList, TOP_N, { excludeKeys: userExcludeSet, minPrimariesToFilter: 3 }) });
        }

        // 6) DB-first: tag overlap
        const pool = await Book.find({
            userId: { $ne: userId },
            tags: { $in: Array.from(tagSet) }
        }).sort({ popularity: -1 }).limit(300).lean();

        if (pool && pool.length >= 1) {
            const maxPop = pool.reduce((m, b) => Math.max(m, b.popularity || 0), 1);
            const tagArray = Array.from(tagSet);
            const scored = pool.map(book => {
                const bookTags = new Set((book.tags || []).map(t => String(t).toLowerCase().trim()).filter(Boolean));
                let common = 0;
                for (const t of bookTags) if (tagSet.has(t)) common++;
                const union = new Set([...tagArray, ...Array.from(bookTags)]).size || 1;
                const overlapRatio = common / union;
                const popScore = (book.popularity || 0) / maxPop;
                const score = (overlapRatio * 0.8) + (popScore * 0.35);
                return { book, score };
            });

            scored.sort((a, b) => b.score - a.score);
            const top = scored.slice(0, TOP_N).map(s => ({ ...s.book, _recoScore: Number(s.score.toFixed(4)) }));
            return res.json({ source: 'db', recommendations: processCandidates(top, TOP_N, { excludeKeys: userExcludeSet }) });
        }

        // 7) hybrid: insufficient DB results -> external by top tags
        const tagArray = Array.from(tagSet);
        const query = tagArray.slice(0, 3).join(' ') || 'popular books';
        const externalCandidates = await getExternalSuggestionsByQuery(query, 12);

        const combined = uniqueByKey([...(pool || []), ...externalCandidates], item => {
            if (item._id) return 'db|' + String(item._id);
            return (item.source || 'ext') + '|' + (item.externalId || item.title);
        });

        return res.json({ source: 'hybrid', recommendations: processCandidates(combined, TOP_N, { excludeKeys: userExcludeSet }) });

    } catch (err) {
        console.error('Hybrid recommendation error', err && err.message ? err.message : err);
        return res.status(500).json({ message: 'Server error' });
    }
};
