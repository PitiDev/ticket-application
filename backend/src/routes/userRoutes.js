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
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/', userController.getUsers);

module.exports = router;