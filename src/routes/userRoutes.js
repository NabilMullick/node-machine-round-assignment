const express = require('express');
const router = express.Router();
const { uploadProfile } = require('../middleware/upload');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { sendVerificationEmail } = require('../config/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// User signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const user = new User({
            email,
            password,
            name,
            verificationToken
        });

        await user.save();
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: 'User created. Please verify your email.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Email verification
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ error: 'Please verify your email first' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -verificationToken');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.patch('/profile', auth, uploadProfile, async (req, res) => {
    try {
        const updates = req.body;
        if (req.file) {
            updates.profilePicture = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -verificationToken');

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;