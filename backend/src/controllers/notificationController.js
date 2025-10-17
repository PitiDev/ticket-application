const db = require('../config/database');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = parseInt(req.query.userId) || req.user?.id;
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        let query = `
            SELECT n.*,
                   t.ticket_number,
                   t.title as ticket_title
            FROM notifications n
            LEFT JOIN tickets t ON n.ticket_id = t.id
            WHERE n.user_id = ?
        `;

        const params = [userId];

        if (unreadOnly) {
            query += ' AND n.is_read = FALSE';
        }

        query += ` ORDER BY n.created_at DESC LIMIT ${limit}`;

        const [notifications] = await db.execute(query, params);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            message: 'Error retrieving notifications',
            error: error.message
        });
    }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = parseInt(req.query.userId) || req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const [result] = await db.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            message: 'Error retrieving unread count',
            error: error.message
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.body.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Verify notification belongs to user
        const [notification] = await db.execute(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (notification.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await db.execute(
            'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            message: 'Error updating notification',
            error: error.message
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.body.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        await db.execute(
            'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            message: 'Error updating notifications',
            error: error.message
        });
    }
};

// Create notification (helper function)
exports.createNotification = async ({ userId, ticketId, type, title, message, metadata = {} }) => {
    try {
        const [result] = await db.execute(
            `INSERT INTO notifications (user_id, ticket_id, type, title, message, metadata)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, ticketId, type, title, message, JSON.stringify(metadata)]
        );

        // Get the created notification
        const [notification] = await db.execute(
            `SELECT n.*, t.ticket_number, t.title as ticket_title
             FROM notifications n
             LEFT JOIN tickets t ON n.ticket_id = t.id
             WHERE n.id = ?`,
            [result.insertId]
        );

        return notification[0];
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.body.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Verify notification belongs to user
        const [notification] = await db.execute(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (notification.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await db.execute('DELETE FROM notifications WHERE id = ?', [id]);

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            message: 'Error deleting notification',
            error: error.message
        });
    }
};
