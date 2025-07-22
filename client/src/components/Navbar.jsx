import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setisLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setisLoggedIn(!!token); // True if token exists
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setisLoggedIn(false);
        navigate('/login');
    }

    return (

        <div>

            <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">

                <h1 className="text-xl font-bold">📚 ReadShelf</h1>

                <Link to='/' className="hover:text-yellow-400">Home</Link>

                {isLoggedIn ? (
                    <>
                        <Link to="/add" className="hover:text-yellow-400">Add Book</Link>
                        <Link to="/books" className="hover:text-yellow-400">Book List</Link>
                        <button onClick={handleLogout} className='text-red-500'>Logout</button>
                    </>
                ) : (

                    <>
                        <Link to="/register" className="hover:text-yellow-400">Register</Link>

                        <Link to="/login" className="hover:text-yellow-400">Login</Link>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
