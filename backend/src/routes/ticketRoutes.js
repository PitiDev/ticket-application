const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController'); 
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Ticket routes
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/', ticketController.createTicket);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Comment routes
router.get('/:id/comments', ticketController.getTicketComments);
router.post('/:id/comments', ticketController.addComment);

// History routes
router.get('/:id/history', ticketController.getTicketHistory);

// New routes for assigned tickets
router.get('/assigned/list', ticketController.getAssignedTickets);
router.get('/assigned/assignees', ticketController.getAssignees);


module.exports = router;