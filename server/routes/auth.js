
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { findOne } = require('../models/Book');

// Route : POST / api / auth / register
router.post('/register', async (req, res) => {
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
        const salt = await bcrypt.genSalt(10);
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

// Login Route 
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {
        // find user by email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        // Success
        res.status(200).json({ message: 'Login Successful', user: existingUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' })
    }
});

module.exports = router; 