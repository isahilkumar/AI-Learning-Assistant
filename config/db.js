const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('⚠️ MongoDB connection warning:', error.message);
        console.log('Server will continue running, but database features will be unavailable until MONGO_URI is set.');
    }
};

module.exports = connectDB;
