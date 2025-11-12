import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

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

        const res = await axios.get("http://localhost:5000/api/recommendations", {
          headers,
          timeout: 8000,
        });

        const data = res.data || {};
        const items = data.recommendations || data.recs || data.items || [];

        function cleanTitleForKey(t) {
          if (!t) return "";
          let s = t.toString().toLowerCase();
          s = s.replace(/\[[^\]]*\]|\([^\)]*\)/g, " ");
          s = s.normalize ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : s;
          s = s.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
          s = s.replace(/\b(summary|guide|notes|journal|excerpt|study|analysis|review|companion)\b/g, " ");
          return s.trim().slice(0, 100);
        }

        function scoreItem(it) {
          const hasCover = Boolean(it.coverUrl);
          const pop = Number(it.popularity || 0);
          const title = (it.title || "").toLowerCase();
          const negatives = ["summary", "guide", "notes", "review", "study"];
          const penalty = negatives.some(k => title.includes(k)) ? -500 : 0;
          return (hasCover ? 1000 : 0) + pop + penalty;
        }

        const map = new Map();
        for (const it of items) {
          const keyTitle = cleanTitleForKey(it.title || "");
          const firstAuthor = ((it.authors && it.authors[0]) || it.author || "")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .slice(0, 50);
          const key = `${keyTitle}|${firstAuthor}`.trim();

          if (!map.has(key) || scoreItem(it) > scoreItem(map.get(key))) {
            map.set(key, it);
          }
        }

        const deduped = Array.from(map.values()).sort((a, b) => scoreItem(b) - scoreItem(a));
        setRecommendations(deduped.slice(0, 12));
        setSource(data.source || "");
      } catch (err) {
        console.error("Recommendations fetch error:", err?.response?.data || err.message || err);
        setError(err?.response?.data?.message || err.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Fetching personalized recommendations...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-400">
        {error}
      </div>
    );

  if (!recommendations.length)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        No recommendations found. Try adding some books first!
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-2 text-emerald-400">
        Recommended Books for You
      </h2>
      <p className="text-center text-gray-400 mb-10">
        Source:{" "}
        <span className="text-teal-400 font-medium">
          {source || "unknown"}
        </span>
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {recommendations.map((book, idx) => (
          <div
            key={book._id || `${book.title}-${idx}`}
            className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <img
              src={book.coverUrl || "/default-book.jpg"}
              alt={book.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1 text-white line-clamp-1">
                {book.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                {(book.authors && book.authors.join(", ")) ||
                  book.author ||
                  "Unknown Author"}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2">
                {book.description || "No description available."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
