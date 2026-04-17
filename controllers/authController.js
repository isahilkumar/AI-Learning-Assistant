const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register User
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login Failed: User with email ${email} not found.`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Login Failed: Incorrect password for user ${email}.`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login };
