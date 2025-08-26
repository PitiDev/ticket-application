// backend/src/controllers/adminController.js
const db = require('../config/database');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');


// ดึงข้อมูลผู้ใช้ทั้งหมด
exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT u.id, u.username, u.email, u.full_name, u.role, u.is_active, 
                   u.created_at, u.updated_at
            FROM users u
            ORDER BY u.created_at DESC
        `);

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// ดึงข้อมูลผู้ใช้โดย ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.execute(`
            SELECT u.id, u.username, u.email, u.full_name, u.role, u.is_active, 
                   u.created_at, u.updated_at
            FROM users u
            WHERE u.id = ?
        `, [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ดึงข้อมูลแผนกที่ผู้ใช้สังกัด
        const [departments] = await db.execute(`
            SELECT d.id, d.name 
            FROM departments d
            JOIN user_departments ud ON d.id = ud.department_id
            WHERE ud.user_id = ?
        `, [id]);

        const user = users[0];
        user.departments = departments;

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// เพิ่มผู้ใช้ใหม่
exports.createUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { username, email, password, full_name, role, is_active, department_ids } = req.body;

        // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
        const [existingUsers] = await conn.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash รหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // เพิ่มผู้ใช้
        const [result] = await conn.execute(
            `INSERT INTO users (username, email, password, full_name, role, is_active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name, role || 'user', is_active === false ? 0 : 1]
        );

        const userId = result.insertId;

        // เพิ่มความสัมพันธ์กับแผนก (ถ้ามี)
        if (department_ids && department_ids.length > 0) {
            // แก้ไขส่วนนี้: ใช้การเตรียมค่าสำหรับการ insert หลายรายการ
            const departmentValues = department_ids.map(depId => [userId, depId]);

            // ทดสอบการเตรียมค่าก่อนใช้จริง
            console.log('Department Values:', departmentValues);

            // ใช้ bulk insert
            if (departmentValues.length > 0) {
                await conn.query(
                    'INSERT INTO user_departments (user_id, department_id) VALUES ?',
                    [departmentValues]
                );
            }
        }

        await conn.commit();

        // ดึงข้อมูลแผนกของผู้ใช้
        const [departments] = await conn.execute(`
            SELECT d.id, d.name 
            FROM departments d
            JOIN user_departments ud ON d.id = ud.department_id
            WHERE ud.user_id = ?
        `, [userId]);

        res.status(201).json({
            id: userId,
            username,
            email,
            full_name,
            role: role || 'user',
            is_active: is_active === false ? false : true,
            departments: departments
        });
    } catch (error) {
        await conn.rollback();
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    } finally {
        conn.release();
    }
};

// อัปเดตข้อมูลผู้ใช้
exports.updateUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;
        const { username, email, password, full_name, role, is_active, department_ids } = req.body;

        // ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
        const [users] = await conn.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // เตรียมข้อมูลสำหรับอัปเดต
        const updateFields = [];
        const updateValues = [];

        if (username) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        if (full_name) {
            updateFields.push('full_name = ?');
            updateValues.push(full_name);
        }

        if (role) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }

        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active ? 1 : 0);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        // เพิ่ม user ID ใน values array
        updateValues.push(id);

        // อัปเดตผู้ใช้
        if (updateFields.length > 0) {
            await conn.execute(
                `UPDATE users 
                 SET ${updateFields.join(', ')}, 
                 updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                updateValues
            );
        }

        // อัปเดตความสัมพันธ์กับแผนก (ถ้ามี)
        if (department_ids !== undefined) {
            // ลบความสัมพันธ์เดิม
            await conn.execute(
                'DELETE FROM user_departments WHERE user_id = ?',
                [id]
            );

            // เพิ่มความสัมพันธ์ใหม่
            if (department_ids && department_ids.length > 0) {
                // แก้ไขส่วนนี้: เตรียมค่าให้ถูกต้อง
                const departmentValues = department_ids.map(depId => [id, depId]);

                // ทดสอบการเตรียมค่าก่อนใช้จริง
                console.log('Department Values:', departmentValues);

                // ใช้ bulk insert
                if (departmentValues.length > 0) {
                    await conn.query(
                        'INSERT INTO user_departments (user_id, department_id) VALUES ?',
                        [departmentValues]
                    );
                }
            }
        }

        await conn.commit();

        // ดึงข้อมูลผู้ใช้ที่อัปเดตแล้ว
        const [updatedUser] = await conn.execute(
            'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ?',
            [id]
        );

        // ดึงข้อมูลแผนกของผู้ใช้
        const [departments] = await conn.execute(`
            SELECT d.id, d.name 
            FROM departments d
            JOIN user_departments ud ON d.id = ud.department_id
            WHERE ud.user_id = ?
        `, [id]);

        // เพิ่มข้อมูลแผนกเข้าไปในผลลัพธ์
        const result = {
            ...updatedUser[0],
            departments: departments
        };

        res.json(result);
    } catch (error) {
        await conn.rollback();
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    } finally {
        conn.release();
    }
};

// ลบผู้ใช้
exports.deleteUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;

        // ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
        const [users] = await conn.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ลบผู้ใช้
        await conn.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        await conn.commit();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    } finally {
        conn.release();
    }
};

// ดึงข้อมูลแผนกทั้งหมด
exports.getDepartments = async (req, res) => {
    try {
        const [departments] = await db.execute(`
            SELECT d.id, d.name, d.description, d.created_at, d.updated_at,
                   COUNT(u.id) as user_count
            FROM departments d
            LEFT JOIN user_departments ud ON d.id = ud.department_id
            LEFT JOIN users u ON ud.user_id = u.id
            GROUP BY d.id
            ORDER BY d.name
        `);

        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

// เพิ่มแผนกใหม่
exports.createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;

        // ตรวจสอบว่ามีแผนกนี้อยู่แล้วหรือไม่
        const [existingDepartments] = await db.execute(
            'SELECT id FROM departments WHERE name = ?',
            [name]
        );

        if (existingDepartments.length > 0) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        // เพิ่มแผนก
        const [result] = await db.execute(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            [name, description]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            description
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Error creating department', error: error.message });
    }
};

// อัปเดตข้อมูลแผนก
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // ตรวจสอบว่ามีแผนกนี้หรือไม่
        const [departments] = await db.execute(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        if (departments.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // ตรวจสอบว่าชื่อแผนกซ้ำกับแผนกอื่นหรือไม่
        if (name !== departments[0].name) {
            const [existingDepartments] = await db.execute(
                'SELECT id FROM departments WHERE name = ? AND id != ?',
                [name, id]
            );

            if (existingDepartments.length > 0) {
                return res.status(400).json({ message: 'Department name already taken' });
            }
        }

        // อัปเดตแผนก
        await db.execute(
            'UPDATE departments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, description, id]
        );

        res.json({
            id: Number(id),
            name,
            description
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ message: 'Error updating department', error: error.message });
    }
};

// ลบแผนก
exports.deleteDepartment = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;

        // ตรวจสอบว่ามีแผนกนี้หรือไม่
        const [departments] = await conn.execute(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        if (departments.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // ลบความสัมพันธ์กับผู้ใช้
        await conn.execute(
            'DELETE FROM user_departments WHERE department_id = ?',
            [id]
        );

        // อัปเดตตั๋วที่อยู่ในแผนกนี้
        await conn.execute(
            'UPDATE tickets SET department_id = NULL WHERE department_id = ?',
            [id]
        );

        // อัปเดตหมวดหมู่ที่อยู่ในแผนกนี้
        await conn.execute(
            'UPDATE categories SET department_id = NULL WHERE department_id = ?',
            [id]
        );

        // ลบแผนก
        await conn.execute(
            'DELETE FROM departments WHERE id = ?',
            [id]
        );

        await conn.commit();

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Error deleting department:', error);
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    } finally {
        conn.release();
    }
};

// ดึงข้อมูลการตั้งค่าระบบทั้งหมด
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.execute('SELECT * FROM system_settings');

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

// อัปเดตการตั้งค่าระบบ
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