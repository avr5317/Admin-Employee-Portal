// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_ALGORITHM } = require('../config/jwt');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { uploadDir } = require('../config/uploads');
const { detectImageType } = require('../utils/imageType');
const { rejectNonStringInput } = require('../utils/validateInput');

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const ALLOWED_TYPES = ['admin', 'employee'];

// Create User
exports.createUser = async (req, res) => {
    try {
        const body = req.body || {};
        if (rejectNonStringInput(res, body, ['fullName', 'email', 'password', 'type'])) return;
        const { fullName, email, password, type } = body;

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

// Register (public self-service sign-up) - always creates an 'employee'
exports.registerUser = async (req, res) => {
    try {
        // Only these fields are read; any "type" in the body is ignored
        const body = req.body || {};

        // Reject non-string values (prevents query-operator objects like {"$gt": ""})
        if (rejectNonStringInput(res, body, ['fullName', 'email', 'password'])) return;
        const { fullName, email, password } = body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                error: 'Validation failed. fullName, email, and password are required.'
            });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Validation failed. Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.'
            });
        }

        // The schema stores emails trimmed and lowercased, so check the same form
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                error: 'Validation failed. Email already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Email format and fullName rules are enforced by the User schema on save
        const user = new User({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            type: 'employee'
        });
        await user.save();

        return res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                type: user.type
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed.',
                details: error.message
            });
        }
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Validation failed. Email already exists.'
            });
        }
        return res.status(500).json({
            error: 'An error occurred while registering the user.'
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

// Alias: GET /user/users is served by the same handler as getAllUsers
exports.getUsers = exports.getAllUsers;

// Update User
exports.updateUser = async (req, res) => {
    try {
        const body = req.body || {};
        if (rejectNonStringInput(res, body, ['email', 'fullName', 'password', 'type'])) return;
        const { email, fullName, password, type } = body;

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
        const body = req.body || {};
        if (rejectNonStringInput(res, body, ['email'])) return;
        const { email } = body;

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

// Delete a previously stored image file. Only files inside the upload folder are touched.
async function removeStoredImage(imagePath) {
    if (typeof imagePath !== 'string' || !imagePath.startsWith('/images/')) return;
    const fullPath = path.join(uploadDir, path.basename(imagePath));
    if (path.dirname(fullPath) !== uploadDir) return;
    try {
        await fs.promises.unlink(fullPath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Could not delete old image:', error.message);
        }
    }
}

// Upload Image
// - A non-admin always uploads for their OWN account; any email in the body is ignored.
// - An admin may pass "email" to set an image for any existing user (default: their own).
// - The real file type is checked from the file's first bytes; the stored name is a
//   server-generated UUID plus an extension chosen from the detected type.
// - An owner may replace their image; the old file is deleted after the new one is saved.
exports.uploadImage = async (req, res) => {
    let savedPath = null;
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No image file provided.'
            });
        }

        const type = detectImageType(req.file.buffer);
        if (!type) {
            return res.status(400).json({
                error: 'Invalid file. Only PNG, JPEG, GIF and WebP images are allowed.'
            });
        }

        // Decide whose image this is
        const body = req.body || {};
        let user;
        if (req.user.type === 'admin' && body.email !== undefined && body.email !== '') {
            if (rejectNonStringInput(res, body, ['email'])) return;
            user = await User.findOne({ email: body.email.trim().toLowerCase() });
        } else {
            user = await User.findById(req.user.id);
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        // Write the file under a name the client cannot influence
        const fileName = `${crypto.randomUUID()}.${type.ext}`;
        savedPath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(savedPath, req.file.buffer, { flag: 'wx' });

        const previousImage = user.imagePath;
        const filePath = `/images/${fileName}`;
        await User.updateOne({ _id: user._id }, { $set: { imagePath: filePath } });
        savedPath = null; // saved: keep the file

        // Replace: remove the old file only after the new one is stored
        if (previousImage) {
            await removeStoredImage(previousImage);
        }

        return res.status(previousImage ? 200 : 201).json({
            message: previousImage ? 'Image replaced successfully.' : 'Image uploaded successfully.',
            filePath: filePath
        });

    } catch (error) {
        // If anything failed after the file was written, delete it
        if (savedPath) {
            try {
                await fs.promises.unlink(savedPath);
            } catch (unlinkError) {
                // nothing to clean up
            }
        }

        console.error('Upload image error:', error.message);
        return res.status(500).json({
            error: 'An error occurred while uploading the image.'
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const body = req.body || {};
        if (rejectNonStringInput(res, body, ['email', 'password'])) return;
        const { email, password } = body;

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

        // Sign JWT (1 day) containing id, email and type
        const token = jwt.sign(
            { id: user._id, email: user.email, type: user.type },
            process.env.JWT_SECRET,
            { algorithm: JWT_ALGORITHM, expiresIn: '1d' }
        );

        // Success – send back basic user info including type for role-based routing
        return res.status(200).json({
            message: 'Login successful',
            user: {
                fullName: user.fullName,
                email: user.email,
                type: user.type,
                imagePath: user.imagePath || null
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'An error occurred during login.'
        });
    }
};
