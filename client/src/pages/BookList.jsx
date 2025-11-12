import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import BookCard from "../components/BookCard";
import { toast } from "react-toastify";

const Booklist = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchterm, setSearchterm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      // robust token getter
      let token = null;
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.token || localStorage.getItem("token") || null;
        } else {
          token = localStorage.getItem("token") || null;
        }
      } catch (e) {
        token = localStorage.getItem("token") || null;
      }

      // debug
      console.log("DEBUG Booklist token =", token);

      try {
        const res = await axios.get("http://localhost:5000/api/books", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          params: {
            page,
            limit: LIMIT,
          },
        });

        const payload = res.data || {};
        const booksFromServer = payload.books || payload.data || [];
        setBooks(Array.isArray(booksFromServer) ? booksFromServer : []);
        setTotalPages(payload.pages || payload.totalPages || 1);
      } catch (err) {
        console.error("Fetch books error:", err.response?.data || err.message || err);
        setError("Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page]);

  // Delete handler
  const handleDelete = async (id) => {
    try {
      const raw = localStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;
      const token = parsed?.token || localStorage.getItem("token") || null;

      await axios.delete(`http://localhost:5000/api/books/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== id));
      toast.success("Book deleted successfully");
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete book :", err.response?.data || err.message || err);
      toast.error("Unable to delete book");
    }
  };

  // Filters & search
  const filteredBooks = books
    .filter((book) => filter === "All" || book.status === filter)
    .filter(
      (book) =>
        (book.title || "").toLowerCase().includes(searchterm.toLowerCase()) ||
        (book.author || "").toLowerCase().includes(searchterm.toLowerCase())
    );

  // Render states
  if (loading) return <p className="p-6 text-center text-gray-300">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-400">{error}</p>;

  return (
    <div className="min-h-screen bg-[#071018] text-white px-6 lg:px-12 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Your Books</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-center">
        <label className="mr-2 font-semibold">Filter by Status :</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 rounded-lg bg-[#0b1720] text-gray-100 border border-teal-700/20 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
        >
          <option value="All">📚 All</option>
          <option value="Reading">📖 Reading</option>
          <option value="Completed">✅ Completed</option>
          <option value="Wishlist">📝 Wishlist</option>
        </select>

        <input
          type="text"
          value={searchterm}
          placeholder="Search Books"
          onChange={(e) => setSearchterm(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 rounded-lg bg-[#0b1720] text-gray-100 border border-teal-700/20 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
        />
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-20 text-gray-400">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="Empty shelf"
            className="w-40 h-40 mb-6 opacity-70"
          />
          <h2 className="text-2xl font-semibold mb-2 text-white">No Books Yet</h2>
          <p className="mb-4">Start your reading journey by adding your first book.</p>
          <Link to="/add" className="bg-teal-500 hover:bg-teal-400 transition text-black rounded-xl px-5 py-2">
            Add Book
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredBooks.map((book) => (
            <BookCard
              key={book._id}
              title={book.title}
              author={book.author}
              status={book.status}
              coverUrl={book.coverUrl}
            >
              <div className="flex gap-3 items-center">
                <Link to={`/edit/${book._id}`}>
                  <FaEdit className="text-yellow-400 hover:text-yellow-300 cursor-pointer" />
                </Link>

                <button
                  onClick={() => setConfirmDeleteId(book._id)}
                  className="relative"
                  aria-label={`Delete ${book.title}`}
                >
                  <FaTrash className="text-red-500 hover:text-red-400 cursor-pointer" />
                </button>
              </div>
            </BookCard>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-16 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 bg-[#0b1720] rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 bg-[#0b1720] rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Fixed confirmation modal to avoid clipping/overlap issues */}
      {confirmDeleteId && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setConfirmDeleteId(null)}
          />

          {/* Modal */}
          <div className="fixed z-50 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-[#0b1720] p-5 rounded-2xl shadow-2xl border border-teal-700/30">
            <p className="text-white mb-4">Are you sure you want to delete this book?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1 rounded bg-[#133038] hover:bg-[#1a4544] text-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Booklist;
