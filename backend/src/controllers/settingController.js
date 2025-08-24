// backend/src/controllers/settingController.js
const db = require('../config/database');

// ดึงการตั้งค่าทั้งหมด
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.execute('SELECT setting_key, setting_value FROM system_settings');
        
        // แปลงเป็นรูปแบบ key-value
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.setting_key] = setting.setting_value;
        });
        
        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

// อัปเดตการตั้งค่า
exports.updateSettings = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        
        const settings = req.body;
        
        for (const [key, value] of Object.entries(settings)) {
            await conn.execute(
                'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ' +
                'ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        
        await conn.commit();
        
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    } finally {
        conn.release();
    }
};