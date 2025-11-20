// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        validate: {
            validator: function(v) {
                // Only alphabetic characters and spaces
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: 'Full name must contain only alphabetic characters'
        }
    },
    type: {
    type: String,
    enum: ['admin', 'employee'],
    required: true,
    default: 'employee'
  }   
,
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Email validation regex
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    imagePath: {
        type: String,
        default: null
    }
}, 
{
    timestamps: true
    
    
    
});

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;