import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/*
  AddBook.jsx
  - Kept all functionality (token getter, fetch lookup, submit flow) exactly as provided.
  - Updated styling to match the project's dark teal-cyan theme and spacing used across pages.
  - Minor layout change: added top spacing to avoid overlap with fixed navbar.
*/

const AddBook = ({ onBookAdded }) => {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState("Reading");
    const [coverUrl, setCoverUrl] = useState("");
    const [loading, setLoading] = useState(false);

    // Robust token getter (safe fallback even if axios defaults are set)
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

    // SERVER-PROXIED lookup: asks our backend which calls OpenLibrary then Google Books
    const fetchBookDetails = async (bookTitle) => {
        if (!bookTitle || !bookTitle.trim()) return;
        try {
            const res = await axios.get("http://localhost:5000/api/external/search", {
                params: { title: bookTitle.trim() },
                timeout: 6000,
            });

            const items = res.data?.items || [];
            if (!items.length) return;

            // choose best: exact-ish title match > item with cover > first
            const normalized = bookTitle.toLowerCase().trim();
            let best =
                items.find((it) => it.title && it.title.toLowerCase().includes(normalized)) || null;
            if (!best) best = items.find((it) => it.coverUrl) || items[0] || null;
            if (!best) return;

            if (!author && best.authors && best.authors.length > 0) setAuthor(best.authors[0]);
            if (best.coverUrl) setCoverUrl(best.coverUrl);
        } catch (err) {
            console.error("Server-proxied external lookup failed:", err?.response?.data || err.message || err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !author.trim()) {
            toast.error("Title and Author are required");
            return;
        }

        setLoading(true);

        const payload = {
            title: title.trim(),
            author: author.trim(),
            status: status || "Wishlist",
            coverUrl: coverUrl || "",
        };

        try {
            // prefer axios default headers, but include token fallback
            const token = getStoredToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.post("http://localhost:5000/api/books", payload, { headers });

            toast.success("Book added successfully!");
            // reset form
            setTitle("");
            setAuthor("");
            setStatus("Reading");
            setCoverUrl("");

            if (typeof onBookAdded === "function") onBookAdded(res.data.book);
        } catch (err) {
            console.error("Add book error:", err?.response?.data || err.message || err);
            const msg = err?.response?.data?.message || err.message || "Add book failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-24 px-6 lg:px-12">
            <form
                onSubmit={handleSubmit}
                className="bg-[#0b1720] p-6 rounded-2xl shadow-md space-y-4 border border-teal-700/20"
            >
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-100">Book Title</label>
                    <input
                        type="text"
                        placeholder="Enter book title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => fetchBookDetails(title)} // server-proxied lookup on blur
                        className="w-full px-4 py-2 rounded-lg bg-[#071018] text-gray-100 border border-teal-700/20 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-100">Author</label>
                    <input
                        type="text"
                        placeholder="Enter author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[#071018] text-gray-100 border border-teal-700/20 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-100">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[#071018] text-gray-100 border border-teal-700/20 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                    >
                        <option value="Reading">📖 Reading</option>
                        <option value="Wishlist">📝 Wishlist</option>
                        <option value="Completed">✅ Completed</option>
                    </select>
                </div>

                {/* Preview cover if available */}
                {coverUrl && (
                    <div className="flex justify-center">
                        <img
                            src={coverUrl}
                            alt="Book cover"
                            className="h-32 rounded shadow-md border border-teal-700/20 object-cover"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-600 text-black font-semibold py-2 rounded-lg transition disabled:opacity-60"
                >
                    {loading ? "Adding..." : "Add Book"}
                </button>
            </form>
        </div>
    );
};

export default AddBook;
