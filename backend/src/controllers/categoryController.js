// src/controllers/categoryController.js
const db = require('../config/database');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT c.*, d.name as department_name 
            FROM categories c
            LEFT JOIN departments d ON c.department_id = d.id
            ORDER BY c.name
        `);
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Error retrieving categories', error: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT c.*, d.name as department_name 
            FROM categories c
            LEFT JOIN departments d ON c.department_id = d.id
            WHERE c.id = ?
        `, [req.params.id]);

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(categories[0]);
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ message: 'Error retrieving category', error: error.message });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { name, description, department_id } = req.body;

        // Check if category with same name exists in the same department
        const [existing] = await conn.execute(
            'SELECT id FROM categories WHERE name = ? AND department_id = ?',
            [name, department_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                message: 'Category with this name already exists in the selected department' 
            });
        }

        // Verify department exists if provided
        if (department_id) {
            const [department] = await conn.execute(
                'SELECT id FROM departments WHERE id = ?',
                [department_id]
            );

            if (department.length === 0) {
                return res.status(400).json({ message: 'Selected department does not exist' });
            }
        }

        // Create category
        const [result] = await conn.execute(
            'INSERT INTO categories (name, description, department_id) VALUES (?, ?, ?)',
            [name, description, department_id]
        );

        await conn.commit();

        // Get created category with department info
        const [category] = await conn.execute(`
            SELECT c.*, d.name as department_name 
            FROM categories c
            LEFT JOIN departments d ON c.department_id = d.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json(category[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    } finally {
        conn.release();
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;
        const { name, description, department_id } = req.body;

        // Check if category exists
        const [existing] = await conn.execute(
            'SELECT id FROM categories WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if name is taken by another category in the same department
        const [nameCheck] = await conn.execute(
            'SELECT id FROM categories WHERE name = ? AND department_id = ? AND id != ?',
            [name, department_id, id]
        );

        if (nameCheck.length > 0) {
            return res.status(400).json({ 
                message: 'Category with this name already exists in the selected department' 
            });
        }

        // Verify department exists if provided
        if (department_id) {
            const [department] = await conn.execute(
                'SELECT id FROM departments WHERE id = ?',
                [department_id]
            );

            if (department.length === 0) {
                return res.status(400).json({ message: 'Selected department does not exist' });
            }
        }

        // Update category
        await conn.execute(
            `UPDATE categories 
             SET name = ?, description = ?, department_id = ?, 
             updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [name, description, department_id, id]
        );

        await conn.commit();

        // Get updated category with department info
        const [category] = await conn.execute(`
            SELECT c.*, d.name as department_name 
            FROM categories c
            LEFT JOIN departments d ON c.department_id = d.id
            WHERE c.id = ?
        `, [id]);

        res.json(category[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Error updating category', error: error.message });
    } finally {
        conn.release();
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;

        // Check if category exists
        const [existing] = await conn.execute(
            'SELECT id FROM categories WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if category has any tickets
        const [tickets] = await conn.execute(
            'SELECT id FROM tickets WHERE category_id = ? LIMIT 1',
            [id]
        );

        if (tickets.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete category with associated tickets. Please reassign tickets first.' 
            });
        }

        // Delete category
        await conn.execute('DELETE FROM categories WHERE id = ?', [id]);

        await conn.commit();
        res.status(204).send();
    } catch (error) {
        await conn.rollback();
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    } finally {
        conn.release();
    }
};