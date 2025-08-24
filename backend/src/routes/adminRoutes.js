// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { adminAuthMiddleware, superAdminAuthMiddleware } = require('../middleware/adminAuth');

// ใช้ middleware ตรวจสอบการเข้าสู่ระบบสำหรับทุก route
router.use(authMiddleware);

// การจัดการผู้ใช้ (จำเป็นต้องมีสิทธิ์ admin หรือ super_admin)
router.get('/users', adminAuthMiddleware, adminController.getUsers);
router.get('/users/:id', adminAuthMiddleware, adminController.getUserById);
router.post('/users', adminAuthMiddleware, adminController.createUser);
router.put('/users/:id', adminAuthMiddleware, adminController.updateUser);
router.delete('/users/:id', superAdminAuthMiddleware, adminController.deleteUser);

// การจัดการแผนก (จำเป็นต้องมีสิทธิ์ admin หรือ super_admin)
router.get('/departments', adminAuthMiddleware, adminController.getDepartments);
router.post('/departments', adminAuthMiddleware, adminController.createDepartment);
router.put('/departments/:id', adminAuthMiddleware, adminController.updateDepartment);
router.delete('/departments/:id', superAdminAuthMiddleware, adminController.deleteDepartment);

// การจัดการการตั้งค่า (จำเป็นต้องมีสิทธิ์ super_admin)
router.get('/settings', adminAuthMiddleware, adminController.getSettings);
router.put('/settings', superAdminAuthMiddleware, adminController.updateSettings);

module.exports = router;