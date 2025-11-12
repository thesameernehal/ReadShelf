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

            {/* Info Section */}
            <section className="px-6 lg:px-12 py-16 text-center">
                <h2 className="text-3xl font-bold mb-10">Why use ReadShelf?</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-teal-500/20 hover:scale-105 transform transition">
                        <div className="text-4xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-teal-400 mb-2">
                            Track Your Reading
                        </h3>
                        <p className="text-gray-300">
                            Add books to your shelf and monitor your reading progress easily.
                        </p>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-teal-500/20 hover:scale-105 transform transition">
                        <div className="text-4xl mb-4">🧠</div>
                        <h3 className="text-xl font-semibold text-teal-400 mb-2">
                            Stay Organized
                        </h3>
                        <p className="text-gray-300">
                            Sort books by status — Reading, Completed or Wishlist in one place.
                        </p>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-teal-500/20 hover:scale-105 transform transition">
                        <div className="text-4xl mb-4">🌙</div>
                        <h3 className="text-xl font-semibold text-teal-400 mb-2">
                            Dark Mode Ready
                        </h3>
                        <p className="text-gray-300">
                            Enjoy a distraction-free, eye-comfortable reading experience anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 text-center py-16 px-6 text-white">
                <h2 className="text-3xl font-bold mb-4">
                    Ready to take control of your reading journey?
                </h2>
                <p className="text-gray-400 mb-6">
                    Sign up now and start building your personalized bookshelf.
                </p>
                <Link
                    to="/register"
                    className="inline-block bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3 px-6 rounded-xl shadow-lg transition"
                >
                    Get Started
                </Link>
            </section>
        </div>
    );
};

export default Home;
