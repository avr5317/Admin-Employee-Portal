// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const ALLOWED_TYPES = ['admin', 'employee'];

// Create User
exports.createUser = async (req, res) => {
    try {
        const { fullName, email, password, type } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !type) {
            return res.status(400).json({
                error: 'Validation failed. fullName, email, password, and type are required.'
            });
        }

        // Validate type
        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({
                error: 'Validation failed. Type must be either "admin" or "employee".'
            });
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Validation failed. Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Validation failed. Email already exists.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            type
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully.'
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed.',
                details: error.message
            });
        }
        res.status(500).json({
            error: 'An error occurred while creating the user.'
        });
    }
};

// Get All Users (used by frontend + companies + admin page)
exports.getAllUsers = async (req, res) => {
    try {
        // Include imagePath and type, no password
        const users = await User.find({}, 'fullName email imagePath type');

        const userList = users.map(user => ({
            fullName: user.fullName,
            email: user.email,
            imagePath: user.imagePath || null,
            type: user.type
        }));

        res.status(200).json({ users: userList });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: 'An error occurred while retrieving users.'
        });
    }
};

// Alias for Assignment 10 GET /users endpoint
exports.getUsers = exports.getAllUsers;

// Update User
exports.updateUser = async (req, res) => {
    try {
        const { email, fullName, password, type } = req.body;

        // Email is required to identify the user
        if (!email) {
            return res.status(400).json({
                error: 'Validation failed. Email is required to update user.'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        // Update fullName if provided
        if (fullName) {
            user.fullName = fullName;
        }

        // Update password if provided
        if (password) {
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    error: 'Validation failed. Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.'
                });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        
        if (type) {
            if (!ALLOWED_TYPES.includes(type)) {
                return res.status(400).json({
                    error: 'Validation failed. Type must be either "admin" or "employee".'
                });
            }
            user.type = type;
        }

        await user.save();

        res.status(200).json({
            message: 'User updated successfully.'
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed.',
                details: error.message
            });
        }
        res.status(500).json({
            error: 'An error occurred while updating the user.'
        });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email is required to delete user.'
            });
        }

        const user = await User.findOneAndDelete({ email });

        if (!user) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        res.status(200).json({
            message: 'User deleted successfully.'
        });

    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while deleting the user.'
        });
    }
};

// Upload Image
exports.uploadImage = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email is provided
        if (!email) {
            return res.status(400).json({
                error: 'Email is required.'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        // Check if user already has an image
        if (user.imagePath) {
            return res.status(400).json({
                error: 'Image already exists for this user.'
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No image file provided.'
            });
        }

        // Save image path to database
        const filePath = `/images/${req.file.filename}`;
        user.imagePath = filePath;
        await user.save();

        res.status(201).json({
            message: 'Image uploaded successfully.',
            filePath: filePath
        });

    } catch (error) {
        // If there's an error, delete the uploaded file
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            error: 'An error occurred while uploading the image.',
            details: error.message
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required.'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        // Success – send back basic user info including type for role-based routing
        return res.status(200).json({
            message: 'Login successful',
            user: {
                fullName: user.fullName,
                email: user.email,
                type: user.type,
                imagePath: user.imagePath || null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'An error occurred during login.'
        });
    }
};
