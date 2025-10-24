// src/controllers/reportController.js
const db = require('../config/database');

// Get user reports (assignee and reporter statistics)
exports.getUserReports = async (req, res) => {
    try {
        const timeframe = req.query.timeframe || 'all'; // all, daily, weekly, monthly

        // Build date filter based on timeframe
        let dateFilter = '';
        if (timeframe === 'daily') {
            dateFilter = 'AND t.created_at >= CURDATE()';
        } else if (timeframe === 'weekly') {
            dateFilter = 'AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (timeframe === 'monthly') {
            dateFilter = 'AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        // Get tickets by assignee (who is assigned to tickets)
        const assigneeQuery = `
            SELECT
                u.id,
                u.username,
                u.full_name,
                u.email,
                COUNT(t.id) as total_tickets,
                SUM(CASE WHEN s.name = 'New' THEN 1 ELSE 0 END) as new_tickets,
                SUM(CASE WHEN s.name = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tickets,
                SUM(CASE WHEN s.name = 'Pending' THEN 1 ELSE 0 END) as pending_tickets,
                SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) as resolved_tickets,
                SUM(CASE WHEN s.name = 'Closed' THEN 1 ELSE 0 END) as closed_tickets,
                SUM(CASE WHEN p.name = 'High' THEN 1 ELSE 0 END) as high_priority_count,
                SUM(CASE WHEN p.name = 'Critical' THEN 1 ELSE 0 END) as critical_priority_count,
                AVG(TIMESTAMPDIFF(HOUR, t.created_at, COALESCE(t.updated_at, NOW()))) as avg_response_time_hours
            FROM users u
            LEFT JOIN tickets t ON u.id = t.assigned_to
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            WHERE u.role IN ('admin', 'super_admin') ${dateFilter}
            GROUP BY u.id, u.username, u.full_name, u.email
            HAVING total_tickets > 0
            ORDER BY total_tickets DESC
        `;

        // Get tickets by reporter (who created tickets)
        const reporterQuery = `
            SELECT
                u.id,
                u.username,
                u.full_name,
                u.email,
                COUNT(t.id) as total_tickets,
                SUM(CASE WHEN s.name = 'New' THEN 1 ELSE 0 END) as new_tickets,
                SUM(CASE WHEN s.name = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tickets,
                SUM(CASE WHEN s.name = 'Pending' THEN 1 ELSE 0 END) as pending_tickets,
                SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) as resolved_tickets,
                SUM(CASE WHEN s.name = 'Closed' THEN 1 ELSE 0 END) as closed_tickets,
                SUM(CASE WHEN p.name = 'High' THEN 1 ELSE 0 END) as high_priority_count,
                SUM(CASE WHEN p.name = 'Critical' THEN 1 ELSE 0 END) as critical_priority_count
            FROM users u
            INNER JOIN tickets t ON u.id = t.created_by
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            WHERE 1=1 ${dateFilter}
            GROUP BY u.id, u.username, u.full_name, u.email
            ORDER BY total_tickets DESC
        `;

        // Get summary statistics
        const summaryQuery = `
            SELECT
                COUNT(DISTINCT t.assigned_to) as total_assignees,
                COUNT(DISTINCT t.created_by) as total_reporters,
                COUNT(t.id) as total_tickets,
                AVG(TIMESTAMPDIFF(HOUR, t.created_at, COALESCE(t.updated_at, NOW()))) as avg_resolution_time_hours,
                SUM(CASE WHEN s.name = 'Resolved' OR s.name = 'Closed' THEN 1 ELSE 0 END) / COUNT(t.id) * 100 as resolution_rate
            FROM tickets t
            LEFT JOIN statuses s ON t.status_id = s.id
            WHERE 1=1 ${dateFilter}
        `;

        // Department performance
        const departmentQuery = `
            SELECT
                d.name as department_name,
                COUNT(t.id) as total_tickets,
                SUM(CASE WHEN s.name = 'Resolved' OR s.name = 'Closed' THEN 1 ELSE 0 END) as resolved_tickets,
                AVG(TIMESTAMPDIFF(HOUR, t.created_at, COALESCE(t.updated_at, NOW()))) as avg_resolution_time_hours
            FROM tickets t
            LEFT JOIN departments d ON t.department_id = d.id
            LEFT JOIN statuses s ON t.status_id = s.id
            WHERE 1=1 ${dateFilter}
            GROUP BY d.id, d.name
            ORDER BY total_tickets DESC
        `;

        // Execute all queries
        const [assigneeResults] = await db.query(assigneeQuery);
        const [reporterResults] = await db.query(reporterQuery);
        const [summaryResults] = await db.query(summaryQuery);
        const [departmentResults] = await db.query(departmentQuery);

        res.json({
            success: true,
            timeframe: timeframe,
            summary: summaryResults[0] || {},
            assignees: assigneeResults || [],
            reporters: reporterResults || [],
            departments: departmentResults || []
        });

    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user reports',
            error: error.message
        });
    }
};

// Get performance metrics over time
exports.getPerformanceMetrics = async (req, res) => {
    try {
        const period = req.query.period || 'weekly'; // daily, weekly, monthly

        let dateFormat = '%Y-%m-%d';
        let dateInterval = 'DAY';
        let daysBack = 30;

        if (period === 'daily') {
            dateFormat = '%Y-%m-%d';
            dateInterval = 'DAY';
            daysBack = 7;
        } else if (period === 'weekly') {
            dateFormat = '%Y Week %u';
            dateInterval = 'WEEK';
            daysBack = 56; // 8 weeks
        } else if (period === 'monthly') {
            dateFormat = '%Y-%m';
            dateInterval = 'MONTH';
            daysBack = 180; // 6 months
        }

        const metricsQuery = `
            SELECT
                DATE_FORMAT(t.created_at, '${dateFormat}') as period,
                COUNT(t.id) as total_tickets,
                SUM(CASE WHEN s.name = 'Resolved' OR s.name = 'Closed' THEN 1 ELSE 0 END) as resolved_tickets,
                AVG(TIMESTAMPDIFF(HOUR, t.created_at, COALESCE(t.updated_at, NOW()))) as avg_response_time
            FROM tickets t
            LEFT JOIN statuses s ON t.status_id = s.id
            WHERE t.created_at >= DATE_SUB(CURDATE(), INTERVAL ${daysBack} DAY)
            GROUP BY DATE_FORMAT(t.created_at, '${dateFormat}')
            ORDER BY period ASC
        `;

        const [metricsResults] = await db.query(metricsQuery);

        res.json({
            success: true,
            period: period,
            metrics: metricsResults || []
        });

    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance metrics',
            error: error.message
        });
    }
};

module.exports = exports;
