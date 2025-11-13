// server/controllers/recommendationController.js
// Revised: reduce strict author-exclusion (use a soft penalty instead), make external fallback broader,
// relax per-author cap to 2, and include user tags/genres in seed queries to improve variety.

const Book = require('../models/Book');
const fetch = global.fetch || require('node-fetch');
const axios = require('axios');

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
        console.warn('OpenLibrary error', err && err.message ? err.message : err);
        return [];
    }
}

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
        console.warn('Google Books error', err && err.message ? err.message : err);
        return [];
    }
}

function uniqueByKey(arr, keyFn) {
    const seen = new Set();
    return arr.filter(it => {
        const k = keyFn(it);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

const NEGATIVE_TITLE_KEYWORDS = [
    'summary', 'summaries', 'guide', 'notes', 'journal', 'study', 'analysis',
    'review', 'companion', 'cheat', 'excerpt', 'workbook', 'student', 'solutions',
    'answers', 'translation', 'translated', 'lecture', 'class', 'syllabus', 'annotated',
    'illustrated', 'adaptation', 'study guide'
];

const BIO_KEYWORDS = ['biography', 'who is', 'about the life', 'a life of', 'the story of', 'the life of'];

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

function processCandidates(candidates = [], topN = 12, options = {}) {
    const { excludeKeys = new Set(), minPrimariesToFilter = Math.min(3, topN) } = options;
    if (!Array.isArray(candidates)) candidates = [];

    let list = candidates.filter(it => it && (it.title || it.externalId || it._id));

    if (excludeKeys && excludeKeys.size > 0) {
        list = list.filter(it => {
            const k = normalizeTitleAuthorKeyServer(it);
            return !excludeKeys.has(k);
        });
    }

    const primary = list.filter(it => !looksLikeNonPrimaryWork(it.title));
    if (primary.length >= Math.min(topN, minPrimariesToFilter)) {
        list = primary;
    }

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

    const arr = Array.from(map.values());
    function score(it) {
        let s = 0;
        if (it.coverUrl) s += 1000;
        s += Number(it.popularity || 0);
        if (looksLikeNonPrimaryWork(it.title)) s -= 700;
        const t = (it.title || '').toString().toLowerCase();
        if (t.includes('workbook')) s -= 400;
        s += Number(it._authorMatchBonus || 0) + Number(it._titleMatchBonus || 0);
        return s;
    }

    arr.sort((a, b) => score(b) - score(a));
    return arr.slice(0, topN);
}

/* CF helpers */
function tokenizeForSimilarity(book) {
    const tags = new Set(((book.tags || [])).map(t => String(t).toLowerCase().trim()).filter(Boolean));
    const author = ((book.authors && book.authors[0]) || book.author || '').toString().toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (author) tags.add(author);
    const titleWords = (book.title || '').toString().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    for (const w of titleWords.slice(0, 10)) tags.add(w);
    return tags;
}

function jaccardScore(setA, setB) {
    if (!setA || !setB) return 0;
    const a = Array.from(setA);
    const b = Array.from(setB);
    if (a.length === 0 || b.length === 0) return 0;
    const inter = a.filter(x => b.includes(x)).length;
    const uni = new Set([...a, ...b]).size;
    return uni === 0 ? 0 : inter / uni;
}

function isBiographyLike(item) {
    if (!item || !item.title) return false;
    const title = (item.title || '').toString().toLowerCase();
    const desc = (item.description || '').toString().toLowerCase();
    if (BIO_KEYWORDS.some(k => title.includes(k) || desc.includes(k))) return true;
    const author = ((item.authors && item.authors[0]) || item.author || '').toString().toLowerCase();
    if (author) {
        const cleanAuthor = author.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
        const titleWords = title.split(/\s+/).filter(Boolean);
        const matches = cleanAuthor.filter(tok => titleWords.includes(tok)).length;
        if (matches >= Math.max(1, Math.floor(cleanAuthor.length / 2))) return true;
        if (title.trim() === author.trim()) return true;
    }
    if (/who is |about |the life of |a life of /.test(title)) return true;
    return false;
}

/* Controller */
exports.getRecommendations = async (req, res) => {
    try {
        const userId = (req.user && (req.user.id || req.user._id)) || req.userId || null;
        const TOP_N = Math.min(20, Number(req.query.limit) || 10); // default 10, max 20

        if (!userId) {
            const popular = await getExternalSuggestionsByQuery('fiction fantasy popular', 16);
            const out = processCandidates(popular, TOP_N, { minPrimariesToFilter: 1 });
            return res.json({ source: 'external-popular-guest', recommendations: out });
        }

        // load user's books
        let userBooks = [];
        try {
            userBooks = await Book.find({ userId }).lean().limit(200);
            if (!userBooks || userBooks.length === 0) {
                const popular = await getExternalSuggestionsByQuery('fiction fantasy popular', 16);
                const out = processCandidates(popular, TOP_N, { minPrimariesToFilter: 1 });
                return res.json({ source: 'external-popular-empty-user', recommendations: out });
            }
        } catch (e) {
            console.warn('Failed to load user books:', e && e.message ? e.message : e);
            const popular = await getExternalSuggestionsByQuery('fiction fantasy popular', 16);
            const out = processCandidates(popular, TOP_N, { minPrimariesToFilter: 1 });
            return res.json({ source: 'external-popular-error-load', recommendations: out });
        }

        const userExcludeSet = new Set((userBooks || []).map(b => normalizeTitleAuthorKeyServer(b)));

        // user's primary authors set (normalized) for soft-author-penalty
        const userAuthorSet = new Set(
            (userBooks || [])
                .map(b => ((b.author || (b.authors && b.authors[0]) || '')).toString().toLowerCase().replace(/[^a-z0-9\s]/g, '').trim())
                .filter(Boolean)
        );

        const userTags = userBooks.flatMap(b => b.tags || []);
        const userTagSet = new Set(userTags.map(t => String(t).toLowerCase().trim()).filter(Boolean));

        const userTokens = (userBooks || []).map(b => tokenizeForSimilarity(b));

        // Fetch DB pool
        const pool = await Book.find({ userId: { $ne: userId } }).lean().limit(1200);

        const scoresMap = new Map();

        for (const candidate of pool) {
            const candKey = normalizeTitleAuthorKeyServer(candidate);
            if (userExcludeSet.has(candKey)) continue;

            const candTokens = tokenizeForSimilarity(candidate);

            let aggScore = 0;
            let bestAuthorBonus = 0;
            let bestTitleBonus = 0;

            for (const uTokens of userTokens) {
                const jac = jaccardScore(uTokens, candTokens);
                const candAuthor = ((candidate.authors && candidate.authors[0]) || candidate.author || '').toString().toLowerCase();
                const authorMatch = Array.from(uTokens).some(t => t === candAuthor);
                const titleOverlap = jac;

                const sim = (jac * 0.65) + (authorMatch ? 0.45 : 0) + (titleOverlap * 0.25);
                aggScore += sim;

                if (authorMatch) bestAuthorBonus = Math.max(bestAuthorBonus, 40);
                bestTitleBonus = Math.max(bestTitleBonus, Math.round(titleOverlap * 60));
            }

            if (aggScore <= 0) continue;

            const pop = Number(candidate.popularity || 0);
            let finalScore = aggScore * 100 + pop + bestAuthorBonus + bestTitleBonus;

            // Soft penalty: candidate primary author already in user's library -> small penalty (not hard exclude)
            const candPrimaryAuthor = ((candidate.author || (candidate.authors && candidate.authors[0]) || '')).toString().toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
            if (candPrimaryAuthor && userAuthorSet.has(candPrimaryAuthor)) {
                finalScore -= 45; // small penalty to de-prioritize same-author items
            }

            scoresMap.set(candKey, {
                book: candidate,
                score: finalScore,
                _authorMatchBonus: bestAuthorBonus,
                _titleMatchBonus: bestTitleBonus
            });
        }

        const scoredArr = Array.from(scoresMap.values()).sort((a, b) => b.score - a.score);

        let recommendations = scoredArr.map(s => {
            const it = { ...s.book };
            it._authorMatchBonus = s._authorMatchBonus || 0;
            it._titleMatchBonus = s._titleMatchBonus || 0;
            return it;
        });

        // Diversify with per-author cap (relaxed to 2)
        const MAX_PER_AUTHOR = 2;
        const authorCount = new Map();
        const diversified = [];

        function normAuthorStr(item) {
            const a = ((item.authors && item.authors[0]) || item.author || "").toString().toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
            return a || "__unknown__";
        }

        for (const it of recommendations) {
            const an = normAuthorStr(it);
            const cnt = authorCount.get(an) || 0;
            if (cnt < MAX_PER_AUTHOR) {
                diversified.push(it);
                authorCount.set(an, cnt + 1);
            }
            if (diversified.length >= TOP_N) break;
        }

        if (diversified.length < TOP_N) {
            for (const it of recommendations) {
                const already = diversified.some(x => ((x._normKey || normalizeTitleAuthorKeyServer(x)) === (it._normKey || normalizeTitleAuthorKeyServer(it))));
                if (!already) {
                    diversified.push(it);
                    if (diversified.length >= TOP_N) break;
                }
            }
        }

        recommendations = diversified.slice(0, TOP_N);

        // Supplement with external if still short — build seeds using user tags and title tokens (avoid overusing authors)
        if (recommendations.length < TOP_N) {
            const seedQueries = [];
            // use tags/genres first (these are high value for genre variety)
            if (userTagSet.size > 0) {
                seedQueries.push(...Array.from(userTagSet).slice(0, 8));
            }
            // add some title tokens (not full author names)
            for (const b of userBooks.slice(0, 8)) {
                const w = (b.title || '').toString().split(/\s+/).slice(0, 4).join(' ');
                if (w) seedQueries.push(w);
            }
            // fallback popular seeds
            seedQueries.push('popular books', 'best sellers', 'nonfiction', 'fiction');

            const extResults = [];
            const uniqQ = Array.from(new Set(seedQueries)).slice(0, 12);
            for (const q of uniqQ) {
                const ext = await getExternalSuggestionsByQuery(q, 12);
                for (const e of ext) {
                    const k = e._normKey || normalizeTitleAuthorKeyServer(e);
                    if (userExcludeSet.has(k)) continue;
                    if (isBiographyLike(e)) continue;
                    // no hard author exclusion for external; we'll rely on per-author cap to keep variety
                    if (!recommendations.some(r => (r._normKey || normalizeTitleAuthorKeyServer(r)) === k) &&
                        !extResults.some(er => (er._normKey || normalizeTitleAuthorKeyServer(er)) === k)) {
                        extResults.push(e);
                    }
                }
                if (recommendations.length + extResults.length >= TOP_N) break;
            }

            recommendations = recommendations.concat(extResults).slice(0, TOP_N);
        }

        const final = processCandidates(recommendations, TOP_N, { excludeKeys: userExcludeSet, minPrimariesToFilter: 1 });

        return res.json({ source: 'item-cf+hybrid-diversified-v5', recommendations: final, count: final.length });
    } catch (err) {
        console.error('Hybrid CF recommendation error', err && err.message ? err.message : err);
        return res.status(500).json({ message: 'Server error' });
    }
}

async function getExternalSuggestionsByQuery(query, perSource = 6) {
    const [ol, google] = await Promise.all([
        searchOpenLibrary(query, perSource).catch(e => { console.warn('OL failed', e); return []; }),
        searchGoogleBooks(query, perSource).catch(e => { console.warn('GB failed', e); return []; })
    ]);
    const merged = [...(ol || []), ...(google || [])];
    const uniq = uniqueByKey(merged, i => (i.source || 'ext') + '|' + (i.externalId || (i.title + '|' + (i.authors?.[0] || ''))));
    return uniq.map(it => {
        if (!it._normKey) it._normKey = ((it.title || '') + '|' + ((it.authors && it.authors[0]) || '')).toString().toLowerCase();
        return it;
    });
}
