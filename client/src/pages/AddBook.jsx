import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddBook = ({ onBookAdded }) => {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState("Reading");
    const [coverUrl, setCoverUrl] = useState("");

    // Added missing states so handleSubmit won't throw ReferenceError
    const [tags, setTags] = useState([]); // optional, not shown in UI currently
    const [popularity, setPopularity] = useState(0);

    // 🔹 Fetch from Google Books API when title changes
    const fetchBookDetails = async (bookTitle) => {
        if (!bookTitle.trim()) return;
        try {
            const res = await axios.get(
                `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
                    bookTitle
                )}`
            );

            if (res.data.items && res.data.items.length > 0) {
                const bookData = res.data.items[0].volumeInfo;

                // Auto-fill author if empty
                if (!author && bookData.authors && bookData.authors.length > 0) {
                    setAuthor(bookData.authors[0]);
                }

                // Set cover image
                if (bookData.imageLinks && bookData.imageLinks.thumbnail) {
                    setCoverUrl(bookData.imageLinks.thumbnail);
                }
            }
        } catch (err) {
            console.error("Google Books API error:", err);
        }
    };

    // handleSubmit - robust and uses available state vars
    const handleSubmit = async (e) => {
        e.preventDefault();

        // basic validation
        if (!title.trim() || !author.trim()) {
            toast.error("Please provide both title and author.");
            return;
        }

        try {
            const payload = {
                title: title.trim(),
                author: author.trim(),
                status: status || "Wishlist",
                coverUrl: coverUrl || "",
                tags: Array.isArray(tags) ? tags : [],
                popularity: typeof popularity === "number" ? popularity : 0,
            };

            // get token robustly (checks both storage patterns)
            let token = null;
            try {
                const raw = localStorage.getItem("user");
                if (raw) {
                    const parsed = JSON.parse(raw);
                    token = parsed?.token || localStorage.getItem("token") || null;
                } else {
                    token = localStorage.getItem("token") || null;
                }
            } catch (err) {
                token = localStorage.getItem("token") || null;
            }

            const headers = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            console.log('DEBUG add-book payload:', JSON.stringify(payload));

            const res = await axios.post("http://localhost:5000/api/books", payload, {
                headers,
            });

            console.log("✅ Add book response:", res.data);
            toast.success("Book added successfully!");

            // clear form (optional)
            setTitle("");
            setAuthor("");
            setStatus("Reading");
            setCoverUrl("");
            setTags([]);
            setPopularity(0);

            // notify parent if provided (keep existing behavior)
            if (typeof onBookAdded === "function") {
                onBookAdded(res.data);
            }
        } catch (err) {
            console.error("❌ Add book error", err);
            const msg = err.response?.data?.message || err.message || "Add book failed";
            toast.error(msg);
            alert(msg); // keep fallback for immediate feedback
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
                        onBlur={() => fetchBookDetails(title)} // 🔹 Fetch on blur
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
                        <img src={coverUrl} alt="Book cover" className="h-32 rounded shadow-md" />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
                >
                    Add Book
                </button>
            </form>
        </div>
    );
};

export default AddBook;
