import React, { useState } from 'react'
import axios from 'axios'

const Register = () => {
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                name,
                email,
                password,
            })
            setMessage('User created Successfully !!!')
            console.log(res.data);
        } catch (err) {
            console.error(err);
            setMessage('Registration failed !!!')
        }
    }

    return (
        <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center px-4'>
            <div className='w-full max-w-md bg-gray-800 rounded-xl shadow-md p-6'>

                <h2 className='text-2xl font-bold text-center mb-6'>Register to ReadShelf</h2>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* // Username  */}
                    <input type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)}
                        className='w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />

                    {/* Name */}
                    <input type="text" placeholder='Full Name' value={name} onChange={(e) => setName(e.target.value)}
                        className='w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500' />

                    {/* Email */}
                    <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}
                        className='w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500' />

                    {/* Password */}
                    <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}
                        className='w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500' />

                    <button type='submit'
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-colors'>Register</button>

                    {message && (
                        <p className='text-sm text-center text-blue-400 mt-2'>{message}</p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Register
