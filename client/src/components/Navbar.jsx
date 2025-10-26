import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const location = useLocation(); // to detect active route

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/about", label: "About" },
        ...(user
            ? [
                { path: "/books", label: "Book List" },
                { path: "/add", label: "Add Book" },
                { path: "/recommendations", label: "Recommendations" }

            ]
            : [
                { path: "/register", label: "Register" },
                { path: "/login", label: "Login" },
            ]),
    ];

    return (
        <nav className="bg-gray-800 text-white shadow-md rounded-md w-full">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="text-xl font-semibold tracking-wide">
                    <Link to="/">ReadShelf</Link>
                </div>

                <ul className="flex space-x-6 items-center text-lg font-medium">
                    {navLinks.map((link) => (
                        <li key={link.path} className="relative">
                            <Link
                                to={link.path}
                                className="hover:text-yellow-400 transition relative"
                            >
                                {link.label}
                                {/* underline animation */}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="underline"
                                        className="absolute left-0 -bottom-1 h-[2px] bg-yellow-400 w-full rounded"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    />
                                )}
                            </Link>
                        </li>
                    ))}

                    {user && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
                            >
                                Logout
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
