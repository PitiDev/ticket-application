const db = require('../config/database');

// Get all priorities
exports.getPriorities = async (req, res) => {
    try {
        const [priorities] = await db.execute('SELECT * FROM priorities ORDER BY id ASC');
        res.json(priorities);
    } catch (error) {
        console.error('Error getting priorities:', error);
        res.status(500).json({ message: 'Error retrieving priorities', error: error.message });
    }
};

// Get priority by ID
exports.getPriorityById = async (req, res) => {
    try {
        const [priorities] = await db.execute('SELECT * FROM priorities WHERE id = ?', [req.params.id]);

        if (priorities.length === 0) {
            return res.status(404).json({ message: 'Priority not found' });
        }

        res.json(priorities[0]);
    } catch (error) {
        console.error('Error getting priority:', error);
        res.status(500).json({ message: 'Error retrieving priority', error: error.message });
    }
};

// Create priority
exports.createPriority = async (req, res) => {
    try {
        const { name } = req.body;

        const [result] = await db.execute('INSERT INTO priorities (name) VALUES (?)', [name]);

        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error('Error creating priority:', error);
        res.status(500).json({ message: 'Error creating priority', error: error.message });
    }
};

// Update priority
exports.updatePriority = async (req, res) => {
    try {
        const { name } = req.body;

        const [result] = await db.execute('UPDATE priorities SET name = ? WHERE id = ?', [name, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Priority not found' });
        }

        res.json({ message: 'Priority updated successfully' });
    } catch (error) {
        console.error('Error updating priority:', error);
        res.status(500).json({ message: 'Error updating priority', error: error.message });
    }
};

// Delete priority
exports.deletePriority = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM priorities WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Priority not found' });
        }

        res.json({ message: 'Priority deleted successfully' });
    } catch (error) {
        console.error('Error deleting priority:', error);
        res.status(500).json({ message: 'Error deleting priority', error: error.message });
    }
};