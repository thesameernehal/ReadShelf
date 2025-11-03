import { useEffect, useState } from "react";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  function getStoredToken() {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw;
      }

      if (typeof parsed === "object" && parsed !== null) {
        return parsed.token || parsed.jwt || parsed.accessToken || null;
      }
      if (typeof parsed === "string") {
        return parsed;
      }
      return null;
    } catch (e) {
      console.error("getStoredToken error", e);
      return null;
    }
  }

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getStoredToken();
        // debug: remove later if you want
        console.log("DEBUG recommendations token:", token);

        const headers = { "Content-Type": "application/json" };
        if (token && typeof token === "string") {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch("/api/recommendations", { headers });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to load recommendations");
        }
        const data = await res.json();

        // data may be { source, recommendations: [...] } or similar
        const items = data.recommendations || data.recs || data.items || [];
        setRecommendations(Array.isArray(items) ? items : []);
        setSource(data.source || "");
      } catch (err) {
        setError(err.message || "Error fetching recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-400">
        Fetching personalized recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-400">
        {error}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-400">
        No recommendations found. Try adding some books first!
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <h2 className="text-3xl font-semibold mb-2 text-center">
        Recommended Books for You
      </h2>
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
            <h3 className="text-lg font-semibold mb-1 line-clamp-1">
              {book.title}
            </h3>
            <p className="text-sm text-gray-400 mb-2 line-clamp-1">
              {(book.authors && book.authors.join(", ")) || book.author || "Unknown Author"}
            </p>
            {book._recoScore && (
              <p className="text-xs text-emerald-400 mb-2">
                Score: {book._recoScore}
              </p>
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
