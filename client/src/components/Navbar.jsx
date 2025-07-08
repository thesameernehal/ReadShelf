import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">📚 ReadShelf</h1>

            <div className="flex gap-6">
                <Link to="/" className="hover:text-yellow-400">Home</Link>
                <Link to="/add" className="hover:text-yellow-400">Add Book</Link>
                <Link to="/books" className="hover:text-yellow-400">Book List</Link>
            </div>
        </nav>
    );
};

export default Navbar;
