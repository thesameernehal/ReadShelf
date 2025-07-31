import React from 'react'
import booksimage from '../assets/books_image.jpg';

const About = () => {
    return (
        <div className='bg-gray-900 text-white min-h-screen px-6 py-12'>
            <div className='max-w-4xl mx-auto'>

                <h1 className='text-4xl font-bold mb-6 text-center'>About ReadShelf</h1>

                {/* Section 1 : Intro */}
                <p className='text-lg text-gray-300 leading-relaxed text-center'>Welcome to <span className='text-indigo-400 font-semibold'>ReadShelf</span> your personal book tracking companion.
                    Easily track what you're reading, what you've finished, and what you plan to read next.</p>
            </div>

            {/* Section 2 */}
            <section className='bg-gray-900 text-white py-16 px-6'>
                <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
                    {/* Text Content */}
                    <div>
                        <h2 className='text-3xl md:text-4xl font-bold mb-6 leading-snug'> Your Personal Reading Companion
                        </h2>

                        <p className='text-gray-400 mb-6'>
                            Whether you're a casual reader or a passionate bookworm, ReadShelf helps you stay focused, track your journey, and build your dream bookshelf effortlessly.
                        </p>

                        <ul className='space-y-3 text-gray-300'>
                            <li className='flex items-start gap-2'>Track your progress across every book
                            </li>

                            <li className='flex items-start gap-2'>Organize as - Reading, Completed, or Wishlist
                            </li>

                            <li className='flex items-start gap-2'>Enjoy distraction-free dark mode</li>

                        </ul>
                    </div>

                    {/* Visual or Quote */}
                    <div className='text-center md:text-right bg-gray-900'>
                        <blockquote className='italic text-gray-400 text-lg md:pl-12 border-l-4 border-indigo-600 bg-gray-950'>"A reader lives a thousand lives before he dies. The man who never reads lives only one."
                            <span className='block mt-4 text-sm text-gray-500'>– George R.R. Martin</span>
                        </blockquote>

                        <div className='mt-8'>
                            <img src={booksimage} alt="Books Image" className='w-full rounded-xl shadow-xl object-cover' />
                        </div>
                    </div>

                </div>
            </section>

            {/* Section 3 */}
            <section className='bg-gray-950 text-white py-16 px-6'>
                <div className='max-w-6xl mx-auto text-center mb-12'>
                    <h2 className='text-3xl font-bold mb-4'>
                        Why Choose ReadShelf ?
                    </h2>
                    <p className='text-gray-400'>Simplify your reading life with features designed for modern readers.</p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto'>
                    {/* Card 1 */}
                    <div className='bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-lg transition'>
                        <h3 className='text-xl font-semibold mb-2'>Easy Book Tracking</h3>
                        <p className='text-gray-400 text-sm'>Track your reading progress and stay motivated effortlessly.</p>
                    </div>

                    {/* Card 2 */}
                    <div className='bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-lg transition'>
                        <h3 className='text-xl font-semibold mb-2'>Smart Organization</h3>
                        <p className='text-gray-400 text-sm'>Organize books as “Reading”, “Completed” or “Wishlist.”</p>
                    </div>

                    {/* Card 3 */}
                    <div className='bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-lg transition'>
                        <h3 className='text-xl font-semibold mb-2'>Cloud Access</h3>
                        <p className='text-gray-400 text-sm'>Access your reading list from anywhere, anytime.</p>
                    </div>

                    {/* Card 4 */}
                    <div className='bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-lg transition'>
                        <h3 className='text-xl font-semibold mb-2'>Miniminal & Dark UI</h3>
                        <p className='text-gray-400 text-sm'>Enjoy an elegant interface that enhances your focus.</p>
                    </div>
                </div>
            </section>

            {/*  */}
        </div>
    )
}

export default About
