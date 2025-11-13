import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';

const Booklist = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchterm, setSearchterm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6;
  const isMounted = useRef(true);

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchterm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchterm]);

  useEffect(() => {
    isMounted.current = true;
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      // robust token getter
      let token = null;
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.token || localStorage.getItem('token') || null;
        } else {
          token = localStorage.getItem('token') || null;
        }
      } catch (e) {
        token = localStorage.getItem('token') || null;
      }

      console.log('DEBUG Booklist token =', token);

      try {
        // If user is searching or filtering (not "All"), fetch all items so search/filter covers whole library
        const searchActive = Boolean(debouncedSearch) || (filter && filter !== "All");
        const params = {};

        if (searchActive) {
          // ask server for a large limit to retrieve all books for client-side filtering
          params.page = 1;
          params.limit = 10000;
        } else {
          // normal paginated fetch
          params.page = page;
          params.limit = LIMIT;
        }

        const res = await axios.get('http://localhost:5000/api/books', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          params,
        });

        const payload = res.data || {};
        const booksFromServer = payload.books || payload.data || payload || [];
        const allBooks = Array.isArray(booksFromServer) ? booksFromServer : [];

        if (!isMounted.current) return;

        // If searchActive, compute filteredBooks and show them (disable pagination)
        if (searchActive) {
          // apply filter + search across all fetched books
          const filtered = allBooks
            .filter((book) => filter === "All" || book.status === filter)
            .filter((book) =>
              (book.title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              (book.author || '').toLowerCase().includes(debouncedSearch.toLowerCase())
            );
          setBooks(filtered);
          setTotalPages(1);
          setPage(1);
        } else {
          setBooks(allBooks);
          setTotalPages(payload.pages || payload.totalPages || Math.max(1, Math.ceil((payload.count || allBooks.length || 0) / LIMIT)));
        }
      } catch (err) {
        console.error('Fetch books error:', err.response?.data || err.message || err);
        setError('Failed to fetch books');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchBooks();

    return () => {
      isMounted.current = false;
    };
  }, [page, debouncedSearch, filter]);

  // Delete handler
  const handleDelete = async (id) => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      const token = parsed?.token || localStorage.getItem('token') || null;

      await axios.delete(`http://localhost:5000/api/books/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setBooks(prevBooks => prevBooks.filter(book => book._id !== id));
      toast.success("Book deleted successfully");
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete book :", err.response?.data || err.message || err);
      toast.error("Unable to delete book");
    }
  };

  // Render states
  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;

  // When not searching/filtering, we may want to show only the current page's books.
  // If the server returned paginated lists for non-search mode, books already reflect that.
  const searchActive = Boolean(debouncedSearch) || (filter && filter !== "All");

  return (
    <div className='min-h-screen bg-gray-900 text-white px-4 py-8'>
      <h2 className='text-3xl font-bold text-center mb-8'>Your Books</h2>

      <div className='flex flex-col sm:flex-row gap-4 mb-6 items-center justify-center'>
        <label className='mr-2 font-semibold'>Filter by Status : </label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            // reset page when filter changes
            setPage(1);
          }}
          className='w-full sm:w-48 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 shadow-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
        >
          <option value="All">📚 All</option>
          <option value="Reading">📖 Reading</option>
          <option value="Completed">✅ Completed</option>
          <option value="Wishlist">📝 Wishlist</option>
        </select>

        <input
          type="text"
          value={searchterm}
          placeholder='Search Books'
          onChange={(e) => { setSearchterm(e.target.value); setPage(1); }}
          className='w-full sm:w-48 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 shadow-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
        />
      </div>

      {books.length === 0 ? (
        <div className='flex flex-col items-center justify-center text-center mt-20 text-gray-400'>
          <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="Empty shelf" className='w-40 h-40 mb-6 opacity-70' />
          <h2 className='text-2xl font-semibold mb-2 text-white'>No Books Yet</h2>
          <p className='mb-4'>Start your reading journey by adding your first book.</p>
          <Link to="/add" className='bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2'>
            Add Book
          </Link>
        </div>
      ) : (
        <>
          {/* Show a small info when search/filter is active */}
          {searchActive && (
            <div className='text-center text-sm text-gray-300 mb-4'>
              Showing <span className='font-semibold text-white'>{books.length}</span> result{books.length !== 1 ? 's' : ''} (search & filter applied).
            </div>
          )}

          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
            {books.map((book) => (
              <BookCard
                key={book._id || (book._normKey || book.title)}
                title={book.title}
                author={book.author}
                status={book.status}
                coverUrl={book.coverUrl}
              >
                <div className='flex gap-3'>
                  <Link to={`/edit/${book._id}`}>
                    <FaEdit className='text-yellow-400 hover:text-yellow-300 cursor-pointer' />
                  </Link>

                  <div className='relative'>
                    <button onClick={() => setConfirmDeleteId(book._id)}>
                      <FaTrash className='text-red-500 hover:text-red-400 cursor-pointer mb-1' />
                    </button>

                    {confirmDeleteId === book._id && (
                      <div className='absolute top-8 right-0 bg-gray-800 p-3 rounded shadow-2xl z-50 text-sm w-40 transition-all duration-200'>
                        <p className='mb-2 text-white'>Are you sure?</p>
                        <div className='flex justify-end gap-2'>
                          <button
                            className='px-2 py-1 text-white bg-red-600 hover:bg-red-500 rounded'
                            onClick={() => handleDelete(book._id)}
                          >
                            Delete
                          </button>
                          <button
                            className='px-2 py-1 text-white bg-gray-600 hover:bg-gray-500 rounded'
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </BookCard>
            ))}
          </div>
        </>
      )}

      {/* Pagination - hide when search/filter is active (we show full results then) */}
      {!searchActive && (
        <div className='flex justify-center mt-16 gap-4 items-center'>
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className='px-3 py-1 bg-gray-700 rounded disabled:opacity-50'
          >
            Prev
          </button>

          <span>Page {page} of {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            className='px-3 py-1 bg-gray-700 rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Booklist;
