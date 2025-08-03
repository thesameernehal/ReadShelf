import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import BookCard from '../components/BookCard';

const Booklist = () => {

    // useState stores the data and useEffect is the action runner (fetch, filter, scroll, set timer etc.)
    const [books, setbooks] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, seterror] = useState(null);
    const [filter, setfilter] = useState("All")
    const [searchterm, setSearchterm] = useState("")


    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/books');
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
    // The empty array [] means: Run only once when the component mounts (loads)

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/books/${id}`)
        }
        catch (err) {
            console.log("Failed to delete book :" + err);
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
                <p className='text-center text-gray-400'>No Books Added Yet</p>
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
                                    <FaEdit className='text-yellow-400 hover:text-yellow-300 cursor-pointer'></FaEdit></Link>

                                <button onClick={() => handleDelete(book._id)}>
                                    <FaTrash className='text-red-500 hover:text-red-400 cursor-pointer'></FaTrash>
                                </button>
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
