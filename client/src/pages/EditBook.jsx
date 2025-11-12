import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

/*
  EditBook.jsx
  - Kept all original behavior (fetch book, update book).
  - Improved styling to match the app's dark teal-cyan theme.
  - Defensive token getter used for consistency with other pages.
  - Added top spacing so the form doesn't hide under fixed Navbar.
*/

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.token || localStorage.getItem("token") || null;
    }
    return localStorage.getItem("token") || null;
  } catch {
    return localStorage.getItem("token") || null;
  }
};

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Reading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch existing book
  useEffect(() => {
    const fetchbook = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getStoredToken();
        const res = await axios.get(`http://localhost:5000/api/books/${id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = res.data || {};
        setTitle(data.title || "");
        setAuthor(data.author || "");
        setStatus(data.status || "Reading");
      } catch (err) {
        console.error("Fetch book error:", err?.response?.data || err.message || err);
        setError("Failed to load book data");
      } finally {
        setLoading(false);
      }
    };

    fetchbook();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#071018] flex items-center justify-center px-6 lg:px-12">
        <p className="text-gray-300">Loading Book...</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#071018] flex items-center justify-center px-6 lg:px-12">
        <p className="text-red-400">{error}</p>
      </div>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getStoredToken();
      await axios.put(
        `http://localhost:5000/api/books/${id}`,
        { title, author, status },
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      toast.success("Book Edited Successfully");
      navigate("/books");
    } catch (err) {
      console.error("Update Failed:", err?.response?.data || err.message || err);
      toast.error("Unable to edit book");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 lg:px-12 pt-24 flex items-start justify-center">
      <div className="w-full max-w-md bg-[#0b1720] p-6 rounded-2xl shadow-xl border border-teal-700/20">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Book</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Book Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book Title"
              className="w-full px-4 py-2 bg-[#071018] text-gray-100 rounded-lg border border-teal-700/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author"
              className="w-full px-4 py-2 bg-[#071018] text-gray-100 rounded-lg border border-teal-700/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 bg-[#071018] text-gray-100 rounded-lg border border-teal-700/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="Reading">📖 Reading</option>
              <option value="Completed">✅ Completed</option>
              <option value="Wishlist">📝 Wishlist</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-600 text-black font-semibold py-2 rounded-lg transition disabled:opacity-60"
          >
            Update Book
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
