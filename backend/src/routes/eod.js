// src/routes/eod.js
const express = require('express');
const router = express.Router();
const eodController = require('../controllers/eodController');
const authMiddleware = require('../middleware/auth');

// Check that all controller functions exist
if (!eodController.getCurrentDayEod) {
  console.error('Warning: eodController.getCurrentDayEod is undefined');
  eodController.getCurrentDayEod = (req, res) => res.status(501).json({ message: 'Not implemented yet' });
}

if (!eodController.getEodByDate) {
  console.error('Warning: eodController.getEodByDate is undefined');
  eodController.getEodByDate = (req, res) => res.status(501).json({ message: 'Not implemented yet' });
}

if (!eodController.getEodByDateRange) {
  console.error('Warning: eodController.getEodByDateRange is undefined');
  eodController.getEodByDateRange = (req, res) => res.status(501).json({ message: 'Not implemented yet' });
}

if (!eodController.getUserPerformance) {
  console.error('Warning: eodController.getUserPerformance is undefined');
  eodController.getUserPerformance = (req, res) => res.status(501).json({ message: 'Not implemented yet' });
}

if (!eodController.getBranchChecklistDetails) {
  console.error('Warning: eodController.getBranchChecklistDetails is undefined');
  eodController.getBranchChecklistDetails = (req, res) => res.status(501).json({ message: 'Not implemented yet' });
}

if (!eodController.getChecklistTemplates) {
  console.error('Warning: eodController.getChecklistTemplates is undefined');
  eodController.getChecklistTemplates = (req, res) => res.status(501).json({ message: 'Not implemented yet' });
}

router.get('/current', authMiddleware, eodController.getCurrentDayEod);
router.get('/date/:date', authMiddleware, eodController.getEodByDate);
router.get('/range', authMiddleware, eodController.getEodByDateRange);
router.get('/performance', authMiddleware, eodController.getUserPerformance);
router.get('/checklist/:checklistId', authMiddleware, eodController.getBranchChecklistDetails);
router.get('/templates', authMiddleware, eodController.getChecklistTemplates);

module.exports = router;