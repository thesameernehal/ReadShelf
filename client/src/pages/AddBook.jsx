import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddBook = ({ onBookAdded }) => {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState("Reading");
    const [coverUrl, setCoverUrl] = useState("");

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const res = await axios.post(
                "http://localhost:5000/api/books",
                { title, author, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 201) {
                toast.success("Book added successfully");
                setTitle("");
                setAuthor("");
                setStatus("Reading");
                setCoverUrl("");
            } else {
                toast.error("Failed to add book");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to add book");
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
                        <img
                            src={coverUrl}
                            alt="Book cover"
                            className="h-32 rounded shadow-md"
                        />
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
