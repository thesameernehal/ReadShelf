
const Book = require('../models/Book');

// controller func to handle recommendations 
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id; // user ID from token 

        // This gives all books of this user
        const userBooks = await Book.find({ userId });

        // is user has 0 books , suggest popular ones
        if (userBooks.length === 0) {
            const popularBooks = await Book.find().sort({ popularity: -1 }).limit(5);
            return res.json({ message: "Showing popular books", data: popularBooks });
        }

        // collect tags from user's books
        const userTags = userBooks.flatMap(book => book.tags);

        // find other books with similar tags (not of same user)
        const recommendations = await Book.find({
            userId: { $ne: userId },
            tags: { $in: userTags }
        }).limit(5);

        // if no similar tag found , again give popular books
        if (recommendations.length === 0) {
            const fallbackBooks = await Book.find().sort({ popularity: -1 }).limit(5);
            return res.json({ message: "No tag matches found , showing popular books you may like", data: fallbackBooks });
        }

        // returning final recommendations 
        res.json({message: "Recommended books based on your reading interests" , data: recommendations});
    } catch(error){
        console.error(error);
        res.status(500).json({message: "Error fetching recommendations"}); 
    }
}; 

module.exports = {getRecommendations}