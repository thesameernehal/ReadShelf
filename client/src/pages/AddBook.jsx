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
                toast.success('Book added successfully');
                setTitle("");
                setAuthor("");
                setStatus("Reading");
            } else {
                toast.error('Failed to add book');
            }

        } catch (error) {
            console.log(error);
            toast.error('Failed to add book');
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded-2xl shadow-md space-y-4 mt-10"
        >
            <input
                type="text"
                placeholder="Book Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => fetchBookDetails(title)} // 🔹 Fetch on blur
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
            />

            <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
            />

            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
            >
                <option value="Reading">Reading</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Completed">Completed</option>
            </select>

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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
            >
                Add Book
            </button>
        </form>
    );
};

export default AddBook;
