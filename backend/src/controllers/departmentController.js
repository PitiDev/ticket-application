// src/controllers/departmentController.js
const db = require('../config/database');

// Get all departments
exports.getDepartments = async (req, res) => {
    try {
        const [departments] = await db.execute(
            'SELECT * FROM departments ORDER BY name'
        );
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ message: 'Error retrieving departments', error: error.message });
    }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const [departments] = await db.execute(
            'SELECT * FROM departments WHERE id = ?',
            [req.params.id]
        );

        if (departments.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json(departments[0]);
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({ message: 'Error retrieving department', error: error.message });
    }
};

// Create department
exports.createDepartment = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { name, description } = req.body;

        // Check if department with same name exists
        const [existing] = await conn.execute(
            'SELECT id FROM departments WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Department with this name already exists' });
        }

        // Create department
        const [result] = await conn.execute(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            [name, description]
        );

        await conn.commit();

        // Get created department
        const [department] = await conn.execute(
            'SELECT * FROM departments WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(department[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Create department error:', error);
        res.status(500).json({ message: 'Error creating department', error: error.message });
    } finally {
        conn.release();
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;
        const { name, description } = req.body;

        // Check if department exists
        const [existing] = await conn.execute(
            'SELECT id FROM departments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if name is taken by another department
        const [nameCheck] = await conn.execute(
            'SELECT id FROM departments WHERE name = ? AND id != ?',
            [name, id]
        );

        if (nameCheck.length > 0) {
            return res.status(400).json({ message: 'Department with this name already exists' });
        }

        // Update department
        await conn.execute(
            'UPDATE departments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, description, id]
        );

        await conn.commit();

        // Get updated department
        const [department] = await conn.execute(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        res.json(department[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Update department error:', error);
        res.status(500).json({ message: 'Error updating department', error: error.message });
    } finally {
        conn.release();
    }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;

        // Check if department exists
        const [existing] = await conn.execute(
            'SELECT id FROM departments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if department has any tickets
        const [tickets] = await conn.execute(
            'SELECT id FROM tickets WHERE department_id = ? LIMIT 1',
            [id]
        );

        if (tickets.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete department with associated tickets. Please reassign tickets first.' 
            });
        }

        // Delete department
        await conn.execute('DELETE FROM departments WHERE id = ?', [id]);

        await conn.commit();
        res.status(204).send();
    } catch (error) {
        await conn.rollback();
        console.error('Delete department error:', error);
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    } finally {
        conn.release();
    }
};