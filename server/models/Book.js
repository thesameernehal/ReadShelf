
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['Reading', 'Wishlist', 'Completed'],
        default: "Reading"
    },

    userId: {
        type: String,
        required: true
    },

    coverUrl: {
        type: String,
        default: ""
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model('Book', bookSchema); 