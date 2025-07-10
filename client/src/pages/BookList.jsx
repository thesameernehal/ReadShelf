import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Booklist = () => {
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

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
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Booklist
