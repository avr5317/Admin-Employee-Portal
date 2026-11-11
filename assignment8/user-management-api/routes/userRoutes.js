// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin, guardAdminCreation } = require('../middleware/auth');
const upload = require('../middleware/upload');
// User routes
router.post('/create', guardAdminCreation, userController.createUser);
router.post('/register', userController.registerUser);
router.get('/getAll', requireAdmin, userController.getAllUsers);
router.put('/edit', requireAdmin, userController.updateUser);
router.delete('/delete', requireAdmin, userController.deleteUser);
router.get('/users', requireAdmin, userController.getAllUsers); 

router.post('/login', userController.loginUser);




// Image upload route with multer middleware
router.post('/uploadImage', requireAuth, upload.single('image'), (req, res, next) => {
    // Handle multer errors
    if (req.fileValidationError) {
        return res.status(400).json({ 
            error: req.fileValidationError 
        });
    }
    next();
}, userController.uploadImage);

module.exports = router;