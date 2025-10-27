
const express = require('express'); // Express to create server

const mongoose = require('mongoose'); // Mongoose to connect to MongoDB

const cors = require('cors'); // CORS to allow cross-origin requests

require('dotenv').config(); // dotenv to load variables from .env file 

// Create an express app
const app = express();

// Define a PORT
const PORT = process.env.PORT || 5000;

// Using Middlewares
app.use(cors());  // allow frontend access
app.use(express.json()); // to parse JSON requests

const authRoutes = require('./routes/auth');
const recommendationRoutes = require('./routes/recommendationRoutes'); 

// Using Routes
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/auth', authRoutes);
app.use('/api/recommendations' , recommendationRoutes); 


// Connect to MongoDb and starting the server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MongoDB connected")
        app.listen(PORT, () => console.log(`Server Running on port ${PORT}`))
    })
    .catch(err => console.log(err));


