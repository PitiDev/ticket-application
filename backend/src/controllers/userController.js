// src/controllers/userController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // ต้องติดตั้ง nodemailer ก่อนใช้งาน: npm install nodemailer


// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};

// Register
exports.register = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { username, email, password, full_name } = req.body;

        // Check if user exists
        const [existingUsers] = await conn.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await conn.execute(
            `INSERT INTO users (username, email, password, full_name, role)
             VALUES (?, ?, ?, ?, 'user')`,
            [username, email, hashedPassword, full_name]
        );

        await conn.commit();

        const token = jwt.sign(
            { id: result.insertId, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                username,
                email,
                role: 'user'
            }
        });
    } catch (error) {
        await conn.rollback();
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error during registration', error: error.message });
    } finally {
        conn.release();
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error retrieving profile', error: error.message });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { username, email, full_name, current_password, new_password } = req.body;
        const userId = req.user.id;

        // Check if user exists
        const [users] = await conn.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // If updating password, verify current password
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ message: 'Current password is required' });
            }

            const validPassword = await bcrypt.compare(current_password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }

        // Check if email or username is taken
        if (email !== user.email || username !== user.username) {
            const [existingUsers] = await conn.execute(
                'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
                [email, username, userId]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email or username already taken' });
            }
        }

        // Prepare update fields
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
        if (new_password) {
            const hashedPassword = await bcrypt.hash(new_password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        // Add user ID to values array
        updateValues.push(userId);

        // Update user
        if (updateFields.length > 0) {
            await conn.execute(
                `UPDATE users 
                 SET ${updateFields.join(', ')}, 
                 updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                updateValues
            );
        }

        await conn.commit();

        // Get updated user data
        const [updatedUser] = await conn.execute(
            'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
            [userId]
        );

        res.json(updatedUser[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    } finally {
        conn.release();
    }
};

// Get Users
exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, role FROM users'
        );
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

// เพิ่มในไฟล์ src/controllers/userController.js

// Change Password
exports.changePassword = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { current_password, new_password, user_id } = req.body;

        // ใช้ user_id จาก request body ถ้า req.user ไม่มี
        const userId = req.user?.id || user_id;

        // ตรวจสอบว่ามี userId หรือไม่
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วน
        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // ตรวจสอบความยาวขั้นต่ำของรหัสผ่านใหม่
        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        const [users] = await conn.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // ตรวจสอบรหัสผ่านปัจจุบัน
        const validPassword = await bcrypt.compare(current_password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // อัพเดทรหัสผ่านในฐานข้อมูล
        await conn.execute(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, userId]
        );

        // ทำ log การเปลี่ยนรหัสผ่าน (ถ้ามีตาราง)
        try {
            await conn.execute(
                'INSERT INTO user_activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
                [userId, 'password_changed', 'Password changed successfully', req.ip || '']
            );
        } catch (logError) {
            // ถ้าไม่มีตาราง user_activity_logs ก็ไม่ต้องทำอะไร
            console.log('Could not log password change event:', logError);
        }

        await conn.commit();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        await conn.rollback();
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    } finally {
        conn.release();
    }
};


// กำหนดค่า config สำหรับอีเมล (ปรับตามการใช้งานจริง)
const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@example.com',
        pass: process.env.EMAIL_PASS || 'your-password'
    }
};

// เพิ่ม dependency ที่ต้องใช้
const crypto = require('crypto');

// ฟังก์ชันสำหรับการลืมรหัสผ่าน
exports.forgotPassword = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // ตรวจสอบว่ามีอีเมลนี้ในระบบหรือไม่
    const [users] = await conn.execute(
      'SELECT id, email, username FROM users WHERE email = ?',
      [email]
    );
    
    // ถ้าไม่พบอีเมล ให้ส่งสถานะสำเร็จเหมือนกัน (เพื่อความปลอดภัย ไม่ให้รู้ว่าอีเมลมีอยู่ในระบบหรือไม่)
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If your email exists in our system, you will receive password reset instructions'
      });
    }
    
    const user = users[0];
    
    // สร้าง token สำหรับรีเซ็ตรหัสผ่าน
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // หมดอายุใน 1 ชั่วโมง
    
    // เก็บ token ลงฐานข้อมูล
    // ตรวจสอบว่ามีตาราง reset_tokens หรือไม่
    try {
      // ลบ token เก่า (ถ้ามี)
      await conn.execute(
        'DELETE FROM reset_tokens WHERE user_id = ?',
        [user.id]
      );
      
      // เพิ่ม token ใหม่
      await conn.execute(
        'INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, resetToken, resetTokenExpiry]
      );
    } catch (err) {
      // ถ้าไม่มีตาราง reset_tokens ให้สร้างก่อน
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // แล้วทำการเพิ่ม token อีกครั้ง
      await conn.execute(
        'INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, resetToken, resetTokenExpiry]
      );
    }
    
    // สร้าง URL สำหรับรีเซ็ตรหัสผ่าน
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // ส่งอีเมล (ใช้ emailService)
    try {
      // Import email service
      const emailService = require('../services/emailService');
      
      await emailService.sendPasswordResetEmail({
        email: user.email,
        username: user.username,
        resetUrl: resetUrl
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // ยังคงทำงานต่อแม้จะส่งอีเมลไม่สำเร็จ เพื่อให้สามารถทดสอบได้
    }
    
    await conn.commit();
    
    // ส่งสถานะสำเร็จกลับไป
    res.json({
      success: true,
      message: 'If your email exists in our system, you will receive password reset instructions'
    });
    
  } catch (error) {
    await conn.rollback();
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: error.message
    });
  } finally {
    conn.release();
  }
};

// ฟังก์ชันสำหรับการรีเซ็ตรหัสผ่าน
exports.resetPassword = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and password are required'
            });
        }

        // ตรวจสอบความยาวของรหัสผ่าน
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // ตรวจสอบ token ในฐานข้อมูล
        const [tokens] = await conn.execute(
            'SELECT * FROM reset_tokens WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const resetToken = tokens[0];

        // เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(password, 10);

        // อัพเดทรหัสผ่านของผู้ใช้
        await conn.execute(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, resetToken.user_id]
        );

        // ลบ token เพื่อไม่ให้ใช้ซ้ำ
        await conn.execute(
            'DELETE FROM reset_tokens WHERE id = ?',
            [resetToken.id]
        );

        await conn.commit();

        // บันทึกประวัติการเปลี่ยนรหัสผ่าน (ถ้ามีตาราง)
        try {
            await conn.execute(
                'INSERT INTO user_activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
                [resetToken.user_id, 'password_reset', 'Password reset via forgot password', req.ip || '']
            );
        } catch (logError) {
            // ถ้าไม่มีตาราง user_activity_logs ก็ไม่ต้องทำอะไร
            console.log('Could not log password reset event:', logError);
        }

        res.json({
            success: true,
            message: 'Your password has been reset successfully'
        });

    } catch (error) {
        await conn.rollback();
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting your password',
            error: error.message
        });
    } finally {
        conn.release();
    }
};