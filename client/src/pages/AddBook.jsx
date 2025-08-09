import React, { useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';

const Addbook = () => {
    // Here use state is used to track form fields
    const [title, settitle] = useState("")
    const [author, setauthor] = useState("")
    const [status, setstatus] = useState("Reading")

    const handleSubmit = async (e) => {
        e.preventDefault(); // for preventing page reload

        try {
            const token = localStorage.getItem('token')
            await axios.post("http://localhost:5000/api/books", {
                title,
                author,
                status
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

            // alert("Book added successfully !!!");
            toast.success('Book added successfully')

            // we will then clear form
            settitle("");
            setauthor("");
            setstatus("Reading");
        } catch (error) {
            console.log(error);
            // alert("Failed to add book")
            toast.error('Failed to add book')
        }
    }
    return (
        <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center px-4'>

            <div className='w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-md'>

                <h2 className='font-bold text-2xl text-center mb-6'>Add a New Book</h2>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <input type="text" placeholder='Book Title' value={title} onChange={(e) => settitle(e.target.value)} className='w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500' required />

                    <input type="text" placeholder='Author' value={author} onChange={(e) => setauthor(e.target.value)}
                        className='w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500' required />

                    <select value={status} onChange={(e) => setstatus(e.target.value)} className='w-full text-white bg-gray-700 p-3 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                        <option>Reading</option>
                        <option>Completed</option>
                        <option>Wishlist</option>
                    </select>

                    <button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-colors shadow-sm hover:shadow-md'>Add Book</button>
                </form>
            </div>
        </div>
    )
}

export default Addbook
