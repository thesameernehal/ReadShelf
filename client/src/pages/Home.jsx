import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Hero Section */}
            <section className="px-6 lg:px-12 py-20 text-center">
                <h1 className="text-5xl font-bold mb-6">
                    Welcome to <span className="text-teal-400">ReadShelf</span>
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                    Your personal book tracker to manage, explore, and grow your reading journey.
                </p>

                {/* Buttons */}
                <div className="flex justify-center flex-wrap gap-4">
                    <Link to="/books">
                        <button className="bg-teal-500 hover:bg-teal-400 text-black font-semibold px-6 py-3 rounded-full transition">
                            View Your Books
                        </button>
                    </Link>

                    <Link to="/add">
                        <button className="border border-teal-400 text-teal-400 hover:bg-teal-500 hover:text-black font-semibold px-6 py-3 rounded-full transition">
                            Add New Book
                        </button>
                    </Link>

                    <Link to="/recommendations">
                        <button className="bg-gray-900 border border-teal-500 hover:bg-teal-600 hover:text-black text-teal-400 font-semibold px-6 py-3 rounded-full transition">
                            See Recommendations
                        </button>
                    </Link>
                </div>
            </section>

            {/* Divider */}
            <hr className="border-teal-700/30 max-w-6xl mx-auto" />

            {/* Info Section */}
            <section className="px-6 lg:px-12 py-16 text-center">
                <h2 className="text-3xl font-bold mb-10">Why use ReadShelf?</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {/* Card 1 */}
                    <div className="bg-gray-900 border border-teal-700/40 p-8 rounded-2xl shadow-lg hover:shadow-teal-500/30 hover:border-teal-400 transform hover:scale-105 transition">
                        <h3 className="text-xl font-semibold text-teal-400 mb-3">Easy Book Tracking</h3>
                        <p className="text-gray-300 text-sm">
                            Add books to your shelf and monitor your reading progress effortlessly.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-gray-900 border border-teal-700/40 p-8 rounded-2xl shadow-lg hover:shadow-teal-500/30 hover:border-teal-400 transform hover:scale-105 transition">
                        <h3 className="text-xl font-semibold text-teal-400 mb-3">Smart Organization</h3>
                        <p className="text-gray-300 text-sm">
                            Sort books as “Reading”, “Completed” or “Wishlist” in one clean interface.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-gray-900 border border-teal-700/40 p-8 rounded-2xl shadow-lg hover:shadow-teal-500/30 hover:border-teal-400 transform hover:scale-105 transition">
                        <h3 className="text-xl font-semibold text-teal-400 mb-3">Cloud Access</h3>
                        <p className="text-gray-300 text-sm">
                            Access your book collection anytime, anywhere — securely stored in the cloud.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-gray-900 border border-teal-700/40 p-8 rounded-2xl shadow-lg hover:shadow-teal-500/30 hover:border-teal-400 transform hover:scale-105 transition">
                        <h3 className="text-xl font-semibold text-teal-400 mb-3">Dark Mode Ready</h3>
                        <p className="text-gray-300 text-sm">
                            Enjoy a sleek, distraction-free interface designed for long reading sessions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <hr className="border-teal-700/30 max-w-6xl mx-auto" />

            {/* CTA Section */}
            <section className="relative text-center py-20 px-6 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-teal-900/20 to-gray-950 opacity-80"></div>

                <div className="relative max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to take control of your reading journey?
                    </h2>
                    <p className="text-gray-300 mb-8">
                        Sign up now and start building your personalized bookshelf.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3 px-8 rounded-full shadow-lg transition"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Subtle glowing border bottom */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
            </section>
        </div>
    );
};

export default Home;
