// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.register);

// Protected routes
// router.use(authMiddleware);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/me', authMiddleware, userController.getProfile); // Assuming you have a /me endpoint
router.get('/', userController.getUsers);

router.post('/change-password',  userController.changePassword);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


module.exports = router;