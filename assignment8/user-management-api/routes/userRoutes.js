// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
// User routes
router.post('/create', userController.createUser);
router.get('/getAll', userController.getAllUsers);
router.put('/edit', userController.updateUser);
router.delete('/delete', userController.deleteUser);
router.get('/users', userController.getAllUsers); 

router.post('/login', userController.loginUser);




// Image upload route with multer middleware
router.post('/uploadImage', upload.single('image'), (req, res, next) => {
    // Handle multer errors
    if (req.fileValidationError) {
        return res.status(400).json({ 
            error: req.fileValidationError 
        });
    }
    next();
}, userController.uploadImage);

module.exports = router;