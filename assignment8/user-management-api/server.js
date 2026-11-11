
// 1. Import required modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 2. Load environment variables
dotenv.config();

// Refuse to start with a missing, short or placeholder JWT_SECRET
const { assertJwtSecret } = require('./config/jwt');
assertJwtSecret();

// 3. Load the Express app (built in app.js, after the environment is ready)
const app = require('./app');

// 4. MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// 5. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});

// 6. Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});
