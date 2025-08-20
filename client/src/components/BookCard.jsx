import React from 'react'

const StatusColors = {
    Reading: 'bg-blue-600',
    Completed: 'bg-green-600',
    Wishlist: 'bg-yellow-600',
};

const BookCard = ({ title, author, status, coverUrl, children }) => {
    return (
        <div className='bg-gray-800 pb-4 px-4 pt-10 rounded-xl shadow-md text-white space-y-2 relative group min-h-[260px] transition-transform transform hover:scale-105 hover:shadow-[0_0_15px_#3b82f6] duration-300 hover:border-2 hover:border-blue-500 border border-gray-700'>

            {/* Cover + Title */}
            <div className='flex gap-4'>
                <img
                    src={coverUrl && coverUrl.trim() !== "" ? coverUrl : "https://via.placeholder.com/96x144?text=No+Cover"}
                    alt={`${title} cover`}
                    className='w-24 h-36 object-cover rounded-md shrink-0'
                    loading="lazy"
                />
                <div className="flex flex-col justify-between">
                    <h3 className='font-semibold text-xl mb-2 break-words text-blue-400'>{title}</h3>
                    <p className='text-gray-400 text-lg'>Author: {author}</p>
                    <span className={`text-sm font-medium px-4 py-1 rounded-full tracking-wide shadow-sm ${StatusColors[status] || 'bg-gray-600'} text-white`}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Edit + Delete buttons */}
            <div className='absolute top-4 right-4 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                {children}
            </div>
        </div>
    )
}

export default BookCard
