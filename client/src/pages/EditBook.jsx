import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'


const EditBook = () => {

  const { id } = useParams(); // We will extract Book ID from URL 
  const navigate = useNavigate();

  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [status, setStatus] = useState("Reading")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // We will now fetch existing book data
  useEffect(() => {
    const fetchbook = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        setTitle(res.data.title);
        setAuthor(res.data.author);
        setStatus(res.data.status);
      } catch (err) {
        console.log(err);
        setError('Failed to Edit Book');
      } finally {
        setLoading(false);
      }
    };
    fetchbook();
  }, [id])

  if (loading) return <p className='text-center text-white'>Loading Book...</p>;
  if (error) return <p className='text-center text-red-500'>{error}</p>

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/books/${id}`, {
        title,
        author,
        status
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      alert('Book updated successfully !!!')
      navigate('/books')
    } catch (err) {
      console.log('Update Failed : ', err);
      alert('Failed to update Book')
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-md'>

        <h2 className='text-2xl font-bold mb-6 text-center'>Edit Book</h2>
        <form action="" onSubmit={handleSubmit} className='space-y-4'>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Book Title' className='w-full p-3 rounded-md bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500' required />

          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder='Author' className="w-full p-3 rounded-md bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)} className='w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 '>
            <option value="Reading">Reading</option>
            <option value="Completed">Completed</option>
            <option value="Wishlist">Wishlist</option>
          </select>
          <button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4  rounded-md font-semibold transition-colors '>Update Book</button>
        </form>
      </div>
    </div>
  )
}

export default EditBook
