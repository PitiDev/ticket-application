// src/controllers/dashboardController.js
const db = require('../config/database');

exports.getDashboardData = async (req, res) => {
    const conn = await db.getConnection();
    try {
        // Get total tickets count
        const [totalTickets] = await conn.execute(`
            SELECT COUNT(*) as count FROM tickets
        `);

        // Get tickets by status
        const [ticketsByStatus] = await conn.execute(`
            SELECT s.name as status, COUNT(t.id) as count
            FROM statuses s
            LEFT JOIN tickets t ON s.id = t.status_id
            GROUP BY s.id, s.name
        `);

        // Get recent tickets
        const [recentTickets] = await conn.execute(`
            SELECT 
                t.id,
                t.ticket_number,
                t.title,
                t.created_at,
                s.name as status,
                p.name as priority,
                d.name as department,
                u.username as created_by,
                assigned.username as assigned_to
            FROM tickets t
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            LEFT JOIN departments d ON t.department_id = d.id
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN users assigned ON t.assigned_to = assigned.id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);

        // Get tickets by priority
        const [ticketsByPriority] = await conn.execute(`
            SELECT p.name as priority, COUNT(t.id) as count
            FROM priorities p
            LEFT JOIN tickets t ON p.id = t.priority_id
            GROUP BY p.id, p.name
        `);

        // Get tickets by department
        const [ticketsByDepartment] = await conn.execute(`
            SELECT d.name as department, COUNT(t.id) as count
            FROM departments d
            LEFT JOIN tickets t ON d.id = t.department_id
            GROUP BY d.id, d.name
        `);

        res.json({
            totalTickets: totalTickets[0].count,
            ticketsByStatus,
            ticketsByPriority,
            ticketsByDepartment,
            recentTickets,
            summary: {
                total: totalTickets[0].count,
                open: ticketsByStatus.find(t => t.status === 'New')?.count || 0,
                inProgress: ticketsByStatus.find(t => t.status === 'In Progress')?.count || 0,
                closed: ticketsByStatus.find(t => t.status === 'Closed')?.count || 0
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Error retrieving dashboard data', error: error.message });
    } finally {
        conn.release();
    }
};