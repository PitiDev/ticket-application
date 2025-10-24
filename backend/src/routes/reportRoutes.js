// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Report routes
router.get('/users', reportController.getUserReports);
router.get('/performance', reportController.getPerformanceMetrics);

module.exports = router;
