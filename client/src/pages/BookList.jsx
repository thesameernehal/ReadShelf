import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';


const Booklist = () => {

    // useState stores the data and useEffect is the action runner (fetch, filter, scroll, set timer etc.)
    const [books, setbooks] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, seterror] = useState(null);
    const [filter, setfilter] = useState("All")
    const [searchterm, setSearchterm] = useState("")
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // edited fetchBooks
    useEffect(() => {
        const fetchBooks = async () => {
            const token = localStorage.getItem('token'); // Or wherever you stored the token
            console.log("Token", token);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            console.log("Axios config : ", config);

            try {

                const res = await axios.get('http://localhost:5000/api/books', config);
                setbooks(res.data); // change state of setbooks as res.data means data received by res or through axios from api/books
            } catch (err) {
                console.log(err);
                seterror('Failed to fetch books');
            } finally {
                setloading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/books/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setbooks(prevBooks => prevBooks.filter(book => book._id != id));

            toast.success("Book deleted successfully")
            // Updating the UI 
            setConfirmDeleteId(null);
        }
        catch (err) {
            console.log("Failed to delete book :" + err);
            toast.err("Unable to delete book")
        }
    };

    const filteredBooks = books
        .filter((book) => filter === "All" || book.status === filter)
        .filter((book) =>
            book.title.toLowerCase().includes(searchterm.toLowerCase()) || book.author.toLowerCase().includes(searchterm.toLowerCase())
        );

    return (
        <div className='min-h-screen bg-gray-900 text-white px-4 py-8'>
            <h2 className='text-3xl font-bold text-center mb-8'>Your Books</h2>
            <div className='flex flex-col sm:flex-row gap-4 mb-6 items-center justify-center'>
                {/* Filter option */}
                <label className='mr-2 font-semibold'>Filter by Status : </label>

                <select value={filter}
                    onChange={(e) => setfilter(e.target.value)}
                    className='w-full sm:w-48 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 shadow-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                >
                    <option value="All">📚 All</option>
                    <option value="Reading">📖 Reading</option>
                    <option value="Completed">✅ Completed</option>
                    <option value="Wishlist">📝 Wishlist</option>
                </select>

                {/* Search Functionality  */}
                <input type="text" value={searchterm} placeholder='Search Books' onChange={(e) => setSearchterm(e.target.value)} className='w-full sm:w-48 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 shadow-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ' />
            </div>
            {books.length === 0 ? (
                <div className='flex flex-col items-center justify-center text-center mt-20 text-gray-400'>
                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="Empty shelf" className='w-40 h-40 mb-6 opacity-70' />
                    <h2 className='text-2xl font-semibold mb-2 text-white'>No Books Yet</h2>
                    <p className='mb-4'>Start your reading journey by adding your first book.</p>

                    <Link to="/add" className='bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2'>
                        Add Book</Link>
                </div>
            ) : (
                <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book._id}
                            title={book.title}
                            author={book.author}
                            status={book.status}>

                            <div className='flex gap-3'>

                                <Link to={`/edit/${book._id}`}>
                                    <FaEdit className='text-yellow-400 hover:text-yellow-300 cursor-pointer mt-1'></FaEdit></Link>

                                <div className='relative'>
                                    <button onClick={() => setConfirmDeleteId(book._id)}>
                                        <FaTrash className='text-red-500 hover:text-red-400 cursor-pointer '></FaTrash>
                                    </button>

                                    {confirmDeleteId === book._id && (
                                        <div className='absolute top-8 right-0 bg-gray-800 p-3 rounded shadow-md z-10 text-sm w-40 transition-all duration-200'>
                                            <p className='mb-2 text-white'>Are you sure?</p>
                                            <div className='flex justify-end gap-2'>
                                                <button className='px-2 py-1 text-white bg-red-600 hover:bg-red-500 rounded' onClick={() => handleDelete(book._id)}>
                                                    Delete
                                                </button>
                                                <button className='px-2 py-1 text-white bg-gray-600 hover:bg-gray-500 rounded' onClick={() => setConfirmDeleteId(null)}>
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
            )
            }
        </div >
    );
};

export default Booklist
