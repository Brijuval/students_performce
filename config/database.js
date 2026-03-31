const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the connection URI from environment variables.
 * Falls back to a default local URI if MONGODB_URI is not set.
 */
async function connectDB() {
    const uri = process.env.MONGODB_URI || (() => {
        console.warn('Warning: MONGODB_URI is not set. Falling back to default local MongoDB URI.');
        return 'mongodb://localhost:27017/students_performance';
    })();

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
