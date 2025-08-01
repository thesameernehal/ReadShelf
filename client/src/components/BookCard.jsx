import React from 'react'

const StatusColors = {
    Reading: 'bg-blue-600',
    Completed: 'bg-green-600',
    Wishlist: 'bg-yellow-600',
};

const BookCard = ({ title, author, status, children }) => {
    return (
        <div className='bg-gray-800 pb-4 px-4 pt-10 rounded-xl shadow-md relative group min-h-[200px]'>
            <h3 className='font-semibold text-2xl mb-4 break-words min-h-[64px]'>{title}</h3>
            <p className='text-gray-400 mb-1 text-xl'>Author : {author}</p>

            {/* Status */}
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${StatusColors[status] || 'bg-gray-600'} text-white`}>{status}</span>

            {/* Edit n Delete */}
            <div className='absolute top-4 right-4 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                {children}
            </div>
        </div>
    )
}

export default BookCard
