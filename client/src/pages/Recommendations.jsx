import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  // reliable token getter
  function getStoredToken() {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return localStorage.getItem("token") || null;
      const parsed = JSON.parse(raw);
      return parsed?.token || parsed?.jwt || localStorage.getItem("token") || null;
    } catch {
      return localStorage.getItem("token") || null;
    }
  }

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getStoredToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        // use absolute backend URL to avoid proxy issues
        const res = await axios.get("http://localhost:5000/api/recommendations", { headers, timeout: 8000 });
        const data = res.data || {};
        const items = data.recommendations || data.recs || data.items || [];

        // ---- frontend dedupe & ranking ----
        const rawItems = Array.isArray(items) ? items : [];

        // helper: clean title for keying
        function cleanTitleForKey(t) {
          if (!t) return "";
          let s = t.toString().toLowerCase();
          // remove bracketed content and punctuation, diacritics
          s = s.replace(/\[[^\]]*\]|\([^\)]*\)/g, " ");
          s = s.normalize ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : s;
          s = s.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
          // remove words that often indicate non-primary works
          s = s.replace(/\b(summary|guide|notes|journal|excerpt|adaptation|study|analysis|review|companion)\b/g, " ");
          s = s.replace(/\s+/g, " ").trim();
          return s.slice(0, 100);
        }

        // scoring: prefer cover, prefer non-summary, prefer higher popularity
        function scoreItem(it) {
          const hasCover = Boolean(it.coverUrl);
          const pop = Number(it.popularity || 0);
          const title = (it.title || "").toString().toLowerCase();
          // penalize titles that look like summaries/guides
          const negativeKeywords = ["summary", "guide", "notes", "journal", "study", "analysis", "review", "excerpt", "companion"];
          const hasNegative = negativeKeywords.some((k) => title.includes(k));
          let score = (hasCover ? 1000 : 0) + pop;
          if (hasNegative) score -= 500; // big penalty for summaries/guides
          return score;
        }

        // group by normalized key (title + first author)
        const map = new Map();
        for (const it of rawItems) {
          const keyTitle = cleanTitleForKey(it.title || "");
          const firstAuthor = ((it.authors && it.authors[0]) || it.author || "")
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .slice(0, 50);
          const key = `${keyTitle}|${firstAuthor}`.trim();

          if (!keyTitle) {
            // fallback small key using raw title/author
            const fallback = ((it.title || "") + "|" + (firstAuthor || "")).slice(0, 120);
            if (!map.has(fallback)) map.set(fallback, it);
            else {
              const existing = map.get(fallback);
              if (scoreItem(it) > scoreItem(existing)) map.set(fallback, it);
            }
            continue;
          }

          if (!map.has(key)) {
            map.set(key, it);
          } else {
            const existing = map.get(key);
            if (scoreItem(it) > scoreItem(existing)) {
              map.set(key, it);
            }
          }
        }

        // ordered array, sort by score desc and take top N
        const dedupedArr = Array.from(map.values()).sort((a, b) => scoreItem(b) - scoreItem(a));
        const TOP_N = 12;
        setRecommendations(dedupedArr.slice(0, TOP_N));
        setSource(data.source || "");
        // ---- end dedupe & ranking ----

      } catch (err) {
        console.error("Recommendations fetch error:", err?.response?.data || err.message || err);
        setError(err?.response?.data?.message || err.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
    // run once on mount
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Fetching personalized recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-400">
        {error}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        No recommendations found. Try adding some books first!
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <h2 className="text-3xl font-semibold mb-2 text-center">Recommended Books for You</h2>
      <p className="text-center text-gray-400 mb-8">
        Source: <span className="text-emerald-400 font-medium">{source || "unknown"}</span>
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((book, idx) => (
          <div
            key={book._id || `${book.source || "ext"}|${book.externalId || book.title}-${idx}`}
            className="bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <img
              src={book.coverUrl || "/default-book.jpg"}
              alt={book.title}
              className="w-full h-52 object-cover rounded-xl mb-4"
            />
            <h3 className="text-lg font-semibold mb-1 line-clamp-1">{book.title}</h3>
            <p className="text-sm text-gray-400 mb-2 line-clamp-1">
              {(book.authors && book.authors.join(", ")) || book.author || "Unknown Author"}
            </p>
            {book._recoScore && (
              <p className="text-xs text-emerald-400 mb-2">Score: {book._recoScore}</p>
            )}
            <p className="text-sm text-gray-500 line-clamp-2">
              {book.description || "No description available."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
