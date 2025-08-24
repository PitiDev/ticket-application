// backend/src/routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/auth');

// ใช้ middleware ตรวจสอบการเข้าสู่ระบบ
// router.use(authMiddleware);

// routes
router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

module.exports = router;