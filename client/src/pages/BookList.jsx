import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

const Booklist = () => {

    // useState stores the data and useEffect is the action runner (fetch, filter, scroll, set timer etc.)
    const [books, setbooks] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, seterror] = useState(null);

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

    return (
        <div className='p-6'>
            <h2 className='text-2xl font-bold text-center mb-4'>Your Book List</h2>
            {books.length === 0 ? (
                <p className='text-center'>No Books Added Yet</p>
            ) : (
                <ul className='space-y-4'>
                    {books.map((book) => (
                        <li key={book._id} className='bg-slate-100 p-4 rounded shadow'>
                            <h3 className='font-semibold text-lg'>{book.title}</h3>
                            <p className='text-sm text-gray-800'>Author : {book.author}</p>
                            <p className='text-sm text-gray-600'>Status : {book.status}</p>

                            <button onClick={() => handleDelete(book._id)} className='mt-2 px-4 py-1 rounded-full
                            bg-red-500 text-white hover:bg-red-700'>Delete</button>

                            <Link
                                to={`/edit/${book._id}`} className='mt-2 ml-2 px-4 py-1 rounded-full
                            bg-blue-500 text-white hover:bg-blue-700'>Edit</Link>
                        </li>
                    ))}
                </ul>
            )
            }
        </div >
    );
};

export default Booklist
