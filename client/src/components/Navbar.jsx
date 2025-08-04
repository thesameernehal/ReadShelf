import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <nav className='bg-gray-800 text-white shadow-md rounded-md w-full'>
            <div className='max-w-7xl mx-auto px-4 py-3 flex justify-between items-center'>
                <div className='text-xl font-semibold tracking-wide'>
                    <Link to="/">ReadShelf</Link>
                </div>

                <ul className='flex space-x-6 items-center text-lg font-medium'>
                    <li><Link to="/" className='hover:text-yellow-400 transition'>Home</Link></li>

                    <li><Link to="/about" className='hover:text-yellow-400 transition'>About</Link></li>

                    {!user && (
                        <>
                            <li><Link to='/register' className='hover:text-yellow-400 transition'>Register</Link></li>
                            <li><Link to='/login' className='hover:text-yellow-400 transition'>Login</Link></li>
                        </>
                    )}

                    {user && (
                        <>

                            <li><Link to='/books' className='hover:text-yellow-400 transition'>Book List</Link></li>
                            <li><Link to='/add' className='hover:text-yellow-400 transition'>Add Book</Link></li>
                            <li>
                                <button onClick={logout} className='bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md transition'>Logout</button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
