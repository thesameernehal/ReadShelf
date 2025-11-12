import React, { useState } from 'react';
import axios from 'axios';
import { BookOpenCheck, PenLine } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                name,
                email,
                password,
            });
            setMessage('User created successfully! 📚');
            console.log(res.data);
        } catch (err) {
            console.error(err);
            setMessage('Registration failed! Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row text-white">
            {/* Left Section */}
            <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-teal-700 via-cyan-700 to-gray-900 p-10">
                <div className="text-center space-y-6">
                    <BookOpenCheck className="w-20 h-20 mx-auto text-teal-300 drop-shadow-lg" />
                    <h2 className="text-4xl font-bold text-white">Join ReadShelf</h2>
                    <p className="text-gray-200 text-lg italic">
                        “Every story begins with a single page. Let yours start here.”
                    </p>
                    <p className="text-cyan-200 text-sm">
                        Track your reads, organize your library, and rediscover your love for books.
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex-1 flex justify-center items-center bg-gray-800 p-8">
                <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 shadow-xl">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <PenLine className="text-cyan-400 w-6 h-6" />
                        <h2 className="text-2xl font-semibold text-center text-cyan-300">
                            Create Your Account
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        />

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white py-2 px-4 rounded-md font-semibold transition-all duration-300"
                        >
                            Register
                        </button>

                        {message && (
                            <p className="text-sm text-center text-cyan-300 mt-2">{message}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
