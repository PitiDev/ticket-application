const express = require('express');
const router = express.Router();
const priorityController = require('../controllers/priorityController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Priority routes
router.get('/', priorityController.getPriorities);
router.get('/:id', priorityController.getPriorityById);
router.post('/', priorityController.createPriority);
router.put('/:id', priorityController.updatePriority);
router.delete('/:id', priorityController.deletePriority);

module.exports = router;
