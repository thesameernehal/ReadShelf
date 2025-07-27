import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className='min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center px-4'>
            <div className='text-center max-w-2xl'>
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

            {/*  Background Image */}
            <div className='mt-10 w-full max-w-4xl'>
                <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f" alt="Bookshelf" className='rounded-2xl shadow-lg w-full object-cover'/>
            </div>
        </div>
    )
}

export default Home
