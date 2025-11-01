import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const { setUser } = useContext(AuthContext);
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email: email.trim(),
                password,
            });

            // Extract token and user safely
            const token =
                res.data.token ||
                res.data.jwt ||
                res.data.accessToken ||
                (res.data.user && res.data.user.token) ||
                null;

            const userObj =
                res.data.user && typeof res.data.user === 'object'
                    ? { ...res.data.user, token }
                    : {
                        id: res.data.id || '',
                        username: res.data.username || '',
                        email: res.data.email || '',
                        name: res.data.name || '',
                        token,
                    };

            // Save merged user object in localStorage
            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('token', userObj.token);  
            setUser(userObj);
            setMessage('Login Successfully !!!');
            console.log('✅ Logged in User:', userObj);

            // Navigate to Dashboard
            // navigate('/add');
            window.location.reload();

        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || 'Login Failed');
        }
    };


    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
            <div className='w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-lg text-white'>

                <h2 className='text-2xl font-semibold text-center mb-6'>Login to ReadShelf</h2>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}
                        className='w-full px-4 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 required' />

                    <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full px-4 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 required' />

                    <button type='submit' className='w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition'>Login</button>

                    {/* Message */}
                    {message && (
                        <div className='mb-4 text-center text-sm text-yellow-400'>{message}</div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Login
