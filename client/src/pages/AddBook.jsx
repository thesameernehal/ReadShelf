import React, { useState } from 'react'
import axios from 'axios';

const Addbook = () => {
    // Here use state is used to track form fields
    const [title, settitle] = useState("")
    const [author, setauthor] = useState("")
    const [status, setstatus] = useState("Reading")

    const handleSubmit = async (e) => {
        e.preventDefault(); // for preventing page reload

        try {
            const response = await axios.post("http://localhost:5000/api/books", {
                title,
                author,
                status,
                userId: 'tempUser'
            });

            alert("Book added successfully !!!");

            // we will then clear form
            settitle("");
            setauthor("");
            setstatus("Reading");
        } catch (error) {
            console.log(error);
            alert("Failed to add book")
        }
    }
    return (
        <div className='text-center p-4'>
            <h2 className='font-semibold text-2xl'>This is AddBook Page</h2>

            <form onSubmit={handleSubmit}>
                <input type="text" value={title} onChange={(e) => settitle(e.target.value)} />
                <input type="text" value={author} onChange={(e) => setauthor(e.target.value)} />
                <select value={status} onChange={(e) => setstatus(e.target.value)}>
                    <option>Reading</option>
                    <option>Completed</option>
                    <option>Wishlist</option>
                </select>

                <button type='submit'>Add Book</button>
            </form>
        </div>
    )
}

export default Addbook
