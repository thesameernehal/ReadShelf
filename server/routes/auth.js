
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { findOne } = require('../models/Book');

// Route : POST / api / auth / register
router.post('/register', async (req, res) => {
    const { username, name, email, password } = req.body;

    const trimmedEmail = email.trim();
    try {
        // user already exists
        const existingUser = await User.findOne({ email: trimmedEmail });
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
            email: trimmedEmail,
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
    try {
        const { email, password } = req.body;

        // Trim the email to remove spaces
        const trimmedEmail = email.trim();


        // find user by email
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        // Success
        res.status(200).json({
            message: 'Login Successful', user: {
                id: existingUser._id,
                username: existingUser.username,
                name: existingUser.name,
                email: existingUser.email
            }
        });
    } catch (err) {
        console.error('Login error : ', err);
        res.status(500).json({ message: 'Something went wrong' })
    }
});

module.exports = router; 