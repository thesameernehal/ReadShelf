import React from "react";

const StatusColors = {
    Reading: "from-blue-600 to-indigo-500",
    Completed: "from-green-600 to-emerald-500",
    Wishlist: "from-yellow-600 to-amber-500",
};

const BookCard = ({ title, author, status, coverUrl, children }) => {
    return (
        <div
            className="
            relative bg-gradient-to-br from-gray-900 to-gray-800
            rounded-2xl p-5 shadow-md text-white 
            group min-h-[260px] transition-all transform 
            hover:-translate-y-1 hover:scale-[1.03]
            hover:shadow-[0_0_25px_rgba(20,184,166,0.3)]
            border border-gray-700 hover:border-teal-500 duration-300
            "
        >
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Cover + Info */}
            <div className="flex gap-5 relative z-10">
                <img
                    src={
                        coverUrl && coverUrl.trim() !== ""
                            ? coverUrl
                            : "https://via.placeholder.com/96x144?text=No+Cover"
                    }
                    alt={`${title} cover`}
                    className="w-24 h-36 object-cover rounded-md shadow-md border border-gray-700"
                    loading="lazy"
                />

                <div className="flex flex-col justify-between">
                    <h3 className="font-semibold text-xl text-teal-400 mb-2 break-words leading-snug">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-base italic mb-2">
                        by <span className="text-gray-300">{author}</span>
                    </p>
                    <span
                        className={`text-sm font-medium px-4 py-1 rounded-full tracking-wide shadow-sm bg-gradient-to-r ${StatusColors[status] || "from-gray-700 to-gray-600"
                            } text-white`}
                    >
                        {status}
                    </span>
                </div>
            </div>

            {/* Floating action buttons */}
            <div
                className="
                absolute bottom-4 right-4 flex space-x-3
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300 z-10
                "
            >
                {children}
            </div>

            {/* Decorative bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};

export default BookCard;
