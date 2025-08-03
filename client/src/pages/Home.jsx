import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className='min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center px-4'>
            {/* Hero Section  */}
            <div className='text-center max-w-2xl py-20'>
                <h1 className='text-4xl md:text-5xl font-bold mb-4 mt-8'>Welcome to <span className='text-indigo-500'>ReadShelf</span> </h1>

                <p className='text-lg md:text-xl text-gray-300 mb-6'>Your personal book tracker to manage, explore, and grow your reading journey.</p>

                <div className='flex justify-center gap-4'>

                    <Link to='/books'>
                        <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-full transition duration-300'>
                            View Your Books
                        </button>
                    </Link>

                    <Link to='/add'>
                        <button className='border border-indigo-500 text-indigo-500 hover:bg-indigo-800 hover:text-white px-6 py-2 rounded-full transition duration-300'>
                            Add New Book
                        </button>
                    </Link>
                </div>
            </div>

            {/* Info Section */}
            <section className='bg-gray-900 text-white py-16 px-4'>
                <h2 className='text-3xl mb-10 text-center font-bold'>Why use ReadShelf ? </h2>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto max-w-6xl'>
                    {/* Cards */}
                    <div className='bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border hover:border-purple-500 hover:scale-105 transform transition-transform duration-300 cursor-pointer"
'>
                        <div className='text-4xl mb-4'>📚</div>
                        <h3 className='text-xl font-semibold mb-2'>Track Your Reading</h3>
                        <p className='text-gray-300'>Add books to your shelf and monitor your reading progress easily.</p>
                    </div>

                    <div className='bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border hover:border-purple-500 hover:scale-105 transform transition-transform duration-300"
'>
                        <div className="text-4xl mb-4">🧠</div>
                        <h3 className="text-xl font-semibold mb-2">Stay Organized</h3>
                        <p className="text-gray-300">Sort books by status — Reading, Completed or Wishlist in one place.</p>
                    </div>

                    <div className='bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border hover:border-purple-500 hover:scale-105 transform transition-transform duration-300"
'>
                        <div className="text-4xl mb-4">🌙</div>
                        <h3 className="text-xl font-semibold mb-2">Dark Mode Ready</h3>
                        <p className="text-gray-300">Enjoy a distraction-free, eye-comfortable reading experience anytime.</p>

                    </div>
                </div>
            </section>

            {/* CTA - Call to Action  */}
            <section className='bg-gray-950 text-center py-16 px-4 text-white'>

                <h2 className='text-3xl font-bold mb-4'>Ready to take control of your reading journey?</h2>

                <p className='text-gray-400 mb-6'>Sign up now and start building your personalized bookshelf.</p>

                <Link to="/register" className='inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300'>
                    Get Started</Link>
            </section>

        </div>
    )
}

export default Home
