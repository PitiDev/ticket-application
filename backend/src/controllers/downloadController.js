// src/controllers/downloadController.js
const db = require('../config/database');

// Get all LBB Plus download data
exports.getLBBPlusDownloads = async (req, res) => {
    try {
        const [downloads] = await db.execute(
            'SELECT ios, android, update_date FROM lbbplus_download ORDER BY update_date DESC'
        );
        res.json(downloads);
    } catch (error) {
        console.error('Get LBB Plus downloads error:', error);
        res.status(500).json({ 
            message: 'Error retrieving LBB Plus download data', 
            error: error.message 
        });
    }
};

// Get latest LBB Plus download data
exports.getLatestLBBPlusDownload = async (req, res) => {
    try {
        const [downloads] = await db.execute(
            'SELECT ios, android, update_date FROM lbbplus_download ORDER BY update_date DESC LIMIT 1'
        );

        if (downloads.length === 0) {
            return res.status(404).json({ message: 'No download data found' });
        }

        res.json(downloads[0]);
    } catch (error) {
        console.error('Get latest LBB Plus download error:', error);
        res.status(500).json({ 
            message: 'Error retrieving latest LBB Plus download data', 
            error: error.message 
        });
    }
};

// Get LBB Plus download data by date range
exports.getLBBPlusDownloadsByDateRange = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ 
                message: 'start_date and end_date parameters are required' 
            });
        }

        const [downloads] = await db.execute(
            `SELECT ios, android, update_date 
             FROM lbbplus_download 
             WHERE update_date BETWEEN ? AND ? 
             ORDER BY update_date DESC`,
            [start_date, end_date]
        );

        res.json(downloads);
    } catch (error) {
        console.error('Get LBB Plus downloads by date range error:', error);
        res.status(500).json({ 
            message: 'Error retrieving LBB Plus download data by date range', 
            error: error.message 
        });
    }
};

// Get total download statistics
exports.getLBBPlusDownloadStats = async (req, res) => {
    try {
        const [stats] = await db.execute(
            `SELECT 
                SUM(ios) as total_ios_downloads,
                SUM(android) as total_android_downloads,
                SUM(ios + android) as total_downloads,
                COUNT(*) as total_records,
                MAX(update_date) as last_updated
             FROM lbbplus_download`
        );

        res.json(stats[0]);
    } catch (error) {
        console.error('Get LBB Plus download stats error:', error);
        res.status(500).json({ 
            message: 'Error retrieving LBB Plus download statistics', 
            error: error.message 
        });
    }
};

module.exports = {
    getLBBPlusDownloads: exports.getLBBPlusDownloads,
    getLatestLBBPlusDownload: exports.getLatestLBBPlusDownload,
    getLBBPlusDownloadsByDateRange: exports.getLBBPlusDownloadsByDateRange,
    getLBBPlusDownloadStats: exports.getLBBPlusDownloadStats
};