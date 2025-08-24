// backend/src/middleware/adminAuth.js
const adminAuthMiddleware = (req, res, next) => {
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ admin หรือ super_admin หรือไม่
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
};

const superAdminAuthMiddleware = (req, res, next) => {
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ super_admin หรือไม่
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Super Admin privileges required' });
    }
};

module.exports = {
    adminAuthMiddleware,
    superAdminAuthMiddleware
};