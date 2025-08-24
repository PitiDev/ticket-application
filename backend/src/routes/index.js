const express = require('express');
const router = express.Router();

const ticketRoutes = require('./ticketRoutes'); 
const userRoutes = require('./userRoutes');
const departmentRoutes = require('./departmentRoutes');
const categoryRoutes = require('./categoryRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const priorityRoutes = require('./priorityRoutes');
const attachmentRoutes = require('./attachmentRoutes');
const adminRoutes = require('./adminRoutes');
const settingRoutes = require('./settingRoutes');




router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/priorities', priorityRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingRoutes);




module.exports = router;