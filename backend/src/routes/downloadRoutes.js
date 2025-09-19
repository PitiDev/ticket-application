// src/routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes if needed
// router.use(authMiddleware);

// Get all LBB Plus download data
router.get('/lbbplus', downloadController.getLBBPlusDownloads);

// Get latest LBB Plus download data
router.get('/lbbplus/latest', downloadController.getLatestLBBPlusDownload);

// Get LBB Plus download data by date range
// Usage: /api/downloads/lbbplus/range?start_date=2024-01-01&end_date=2024-12-31
router.get('/lbbplus/range', downloadController.getLBBPlusDownloadsByDateRange);

// Get LBB Plus download statistics
router.get('/lbbplus/stats', downloadController.getLBBPlusDownloadStats);

module.exports = router;