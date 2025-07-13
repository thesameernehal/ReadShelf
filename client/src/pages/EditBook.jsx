import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


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
        const res = await axios.get(`http://localhost:5000/api/books/${id}`)
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

  if (loading) return <p>Loading Book...</p>;
  if (error) return <p>{error}</p>

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5000/api/books/${id}`, {
        title,
        author,
        status
      });
      alert('Book updated successfully !!!')
      navigate('/books')
    } catch (err) {
      console.log('Update Failed : ', err);
      alert('Failed to update Book')
    }
  };

  return (
    <div>
      <h2>Edit Book</h2>
      <form action="" onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Book Title' />

        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder='Author' />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
          <option value="Wishlist">Wishlist</option>
        </select>
        <button type='submit'>Update Book</button>
      </form>
    </div>
  )
}

export default EditBook
