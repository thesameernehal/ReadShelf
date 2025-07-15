
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt.js');
const User = require('../models/User');

// Route : POST / api / auth / register
route.post('/register', async (req, res) => {
    const { username, name, email, password } = req.body;

    try {
        // user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists..."
            });
        }

        // hash password 
        const salt = await bcrypt.gensalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user 
        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword
        });

        // save to db
        await newUser.save();

        res.status(201).json({ message: "User created successfully !!!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" })
    }
});

module.exports = router; 