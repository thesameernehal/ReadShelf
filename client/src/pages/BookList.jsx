import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

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
                    className='w-full sm:w-40 px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2'
                >
                    <option value="All">All</option>
                    <option value="Reading">Reading</option>
                    <option value="Completed">Completed</option>
                    <option value="Wishlist">Wishlist</option>
                </select>

                {/* Search Functionality  */}
                <input type="text" value={searchterm} placeholder='Search Books' onChange={(e) => setSearchterm(e.target.value)} className='w-full sm:w-64 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500' />
            </div>
            {books.length === 0 ? (
                <p className='text-center text-gray-400'>No Books Added Yet</p>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    {filteredBooks.map((book) => (
                        <div key={book._id} className='bg-gray-800 pb-4 px-4 pt-10 rounded-xl shadow-md relative group min-h-[200px]:'>
                            <h3 className='font-semibold text-2xl mb-4 break-words'>{book.title}</h3>
                            <p className='text-gray-400 mb-1 text-xl'>Author : {book.author}</p>
                            <p className='text-sm text-blue-400'>Status : {book.status}</p>
                            <div className='absolute top-4 right-4 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>

                                {/* Edit Button */}
                                <Link
                                    to={`/edit/${book._id}`}>
                                    <FaEdit className='text-yellow-400 hover:text-yellow-300 cursor-pointer'></FaEdit>
                                </Link>

                                <button onClick={() => handleDelete(book._id)}>
                                    <FaTrash className='text-red-500 hover:text-red-400 cursor-pointer'></FaTrash>
                                </button>


                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
};

export default Booklist
