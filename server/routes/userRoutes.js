const express = require('express');
const router = express.Router();
const User = require('../models/Users'); // Import your User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: email.split('@')[0],
            email,
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret_key_123',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// server/routes/userRoutes.js

// PUT: Update User Profile (Name)
router.put('/update-profile/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.params.id;

        // Find user by ID and update their name
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name: name },
            { new: true } // This returns the updated document instead of the old one
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;