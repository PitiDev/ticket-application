// src/controllers/userController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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