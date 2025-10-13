// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Event routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);


// Sync routes
router.post('/sync/all', eventController.syncDownloadStatus);
router.post('/sync/:id', eventController.syncSingleStatus);

module.exports = router;