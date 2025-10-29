import { useEffect, useState } from "react";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")).token
          : null;

        const res = await fetch("http://localhost:5000/api/recommendations", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch recommendations");
        }

        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setSource(data.source || "");
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
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

  if (recommendations.length === 0) {
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
        Source: <span className="text-emerald-400 font-medium">{source}</span>
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((book, idx) => (
          <div
            key={book._id || idx}
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
              {book.authors?.join(", ") || "Unknown Author"}
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
