import React from 'react'

const About = () => {
    return (
        <div className='bg-gray-900 text-white min-h-screen px-6 py-12'>
            <div className='max-w-4xl mx-auto'>

                <h1 className='text-4xl font-bold mb-6 text-center'>About ReadShelf</h1>

                {/* Section 1 : Intro */}
                <p className='text-lg text-gray-300 leading-relaxed text-center'>Welcome to <span className='text-indigo-400 font-semibold'>ReadShelf</span> your personal book tracking companion.
                    Easily track what you're reading, what you've finished, and what you plan to read next.</p>
            </div>
        </div>
    )
}

export default About
