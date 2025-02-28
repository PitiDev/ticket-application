// src/routes/attachmentRoutes.js
const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');

// Upload attachment
router.post('/upload', attachmentController.addAttachment);

// Get attachments for a ticket
router.get('/ticket/:ticket_id', attachmentController.getTicketAttachments);

// Serve file
router.get('/serve/:id', attachmentController.serveFile);

module.exports = router;