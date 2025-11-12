import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/about", label: "About" },
        ...(user
            ? [
                { path: "/books", label: "Book List" },
                { path: "/add", label: "Add Book" },
                { path: "/recommendations", label: "Recommendations" },
            ]
            : [
                { path: "/register", label: "Register" },
                { path: "/login", label: "Login" },
            ]),
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md text-gray-100 shadow-lg border-b border-cyan-700/40">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-semibold tracking-wide text-cyan-400 hover:text-teal-300 transition-all"
                >
                    Read<span className="text-gray-100">Shelf</span>
                </Link>

                {/* Nav Links */}
                <ul className="flex space-x-6 items-center font-medium">
                    {navLinks.map((link) => (
                        <li key={link.path} className="relative">
                            <Link
                                to={link.path}
                                className={`transition-all duration-200 hover:text-cyan-400 ${location.pathname === link.path ? "text-cyan-400" : ""
                                    }`}
                            >
                                {link.label}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="underline"
                                        className="absolute left-0 -bottom-1 h-[2px] bg-cyan-400 w-full rounded"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                    />
                                )}
                            </Link>
                        </li>
                    ))}

                    {user && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="ml-4 bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white px-4 py-1.5 rounded-md font-medium transition-all shadow-md hover:shadow-cyan-500/30"
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
