import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
            let best = items.find(it => it.title && it.title.toLowerCase().includes(normalized)) || null;
            if (!best) best = items.find(it => it.coverUrl) || items[0] || null;
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
        <div className="max-w-md mx-auto mt-10">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded-2xl shadow-md space-y-4"
            >
                <div>
                    <label className="block text-sm font-medium mb-1">Book Title</label>
                    <input
                        type="text"
                        placeholder="Enter book title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => fetchBookDetails(title)} // server-proxied lookup on blur
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Author</label>
                    <input
                        type="text"
                        placeholder="Enter author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                            className="h-32 rounded shadow-md"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
                >
                    {loading ? "Adding..." : "Add Book"}
                </button>
            </form>
        </div>
    );
};

export default AddBook;
