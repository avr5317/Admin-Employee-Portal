
// 1. Import required modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// 2. Load environment variables
dotenv.config();

// Refuse to start with a missing, short or placeholder JWT_SECRET
const { assertJwtSecret } = require('./config/jwt');
assertJwtSecret();

// 3. Initialize Express app
const app = express();

// 4. Middleware setup - CORS MUST COME BEFORE ROUTES
// Allowed browser origin comes from CLIENT_ORIGIN (default: the local Vite dev server).
// The app sends a Bearer header, not cookies, so credentials are not enabled.
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder (for accessing uploaded images)
// nosniff stops browsers from guessing a different type than the one we send
const { uploadDir } = require('./config/uploads');
app.use('/images', express.static(uploadDir, {
    setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff')
}));

// 5. Define routes - ROUTES COME AFTER MIDDLEWARE
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api', jobRoutes); // so endpoints are /api/create/job and /api/jobs
app.use('/user', userRoutes);

// Root endpoint for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'User Management API',
        version: '1.0.0',
        endpoints: {
            createUser: 'POST /user/create',
            getAllUsers: 'GET /user/getAll',
            updateUser: 'PUT /user/edit',
            deleteUser: 'DELETE /user/delete',
            uploadImage: 'POST /user/uploadImage',
            login: 'POST /user/login',
            getUsers: 'GET /user/users',
            createJob: 'POST /api/create/job',
            getJobs: 'GET /api/jobs'
        }
    });
});

// 6. Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof require('multer').MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
                error: 'File size too large. Maximum size is 5MB.' 
            });
        }
        return res.status(400).json({ 
            error: err.message 
        });
    } else if (err) {
        return res.status(400).json({ 
            error: err.message 
        });
    }
    next();
});

// 7. Handle undefined routes (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// 8. MongoDB Connection
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

// 9. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});

// 10. Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});