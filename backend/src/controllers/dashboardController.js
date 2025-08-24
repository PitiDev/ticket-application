// src/controllers/dashboardController.js
const db = require('../config/database');

exports.getDashboardData = async (req, res) => {
    const conn = await db.getConnection();
    try {
        // ดึงข้อมูลผู้ใช้จาก token (ที่ส่งมาจาก middleware auth)
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // รับพารามิเตอร์สำหรับกรองตามช่วงเวลา
        const timeframe = req.query.timeframe || 'all'; // ค่าเริ่มต้นคือ 'all'
        
        // คำนวณวันที่เริ่มต้นตาม timeframe
        let startDate = '';
        const now = new Date();
        
        if (timeframe === 'daily') {
            // วันนี้
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
        } else if (timeframe === 'weekly') {
            // 7 วันที่ผ่านมา
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            startDate = lastWeek.toISOString().split('T')[0];
        } else if (timeframe === 'monthly') {
            // 30 วันที่ผ่านมา
            const lastMonth = new Date(now);
            lastMonth.setDate(now.getDate() - 30);
            startDate = lastMonth.toISOString().split('T')[0];
        }
        
        // สร้างเงื่อนไข WHERE สำหรับกรองตาม timeframe
        const timeCondition = startDate ? `AND DATE(t.created_at) >= '${startDate}'` : '';
        
        // สร้างเงื่อนไข WHERE สำหรับกรองตาม user role
        let userCondition = '';
        if (userRole !== 'admin' && userRole !== 'super_admin') {
            // ถ้าเป็น user ธรรมดา จะเห็นแค่ ticket ที่เกี่ยวข้องกับตัวเอง
            userCondition = `AND (t.created_by = ${userId} OR t.assigned_to = ${userId})`;
        }
        
        // Get total tickets count with conditions
        const [totalTickets] = await conn.execute(`
            SELECT COUNT(*) as count 
            FROM tickets t
            WHERE 1=1 ${timeCondition} ${userCondition}
        `);

        // Get tickets by status with conditions
        const [ticketsByStatus] = await conn.execute(`
            SELECT s.name as status, COUNT(t.id) as count
            FROM statuses s
            LEFT JOIN tickets t ON s.id = t.status_id AND 1=1 ${timeCondition} ${userCondition}
            GROUP BY s.id, s.name
        `);

        // Get recent tickets with conditions
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
            WHERE 1=1 ${timeCondition} ${userCondition}
            ORDER BY t.created_at DESC
            LIMIT 5
        `);

        // Get tickets by priority with conditions
        const [ticketsByPriority] = await conn.execute(`
            SELECT p.name as priority, COUNT(t.id) as count
            FROM priorities p
            LEFT JOIN tickets t ON p.id = t.priority_id AND 1=1 ${timeCondition} ${userCondition}
            GROUP BY p.id, p.name
        `);

        // Get tickets by department with conditions
        const [ticketsByDepartment] = await conn.execute(`
            SELECT d.name as department, COUNT(t.id) as count
            FROM departments d
            LEFT JOIN tickets t ON d.id = t.department_id AND 1=1 ${timeCondition} ${userCondition}
            GROUP BY d.id, d.name
        `);
        
        // คำนวณข้อมูลสรุป ticket ตามสถานะ
        const openCount = ticketsByStatus.find(t => t.status === 'New')?.count || 0;
        const inProgressCount = ticketsByStatus.find(t => t.status === 'In Progress')?.count || 0;
        const closedCount = ticketsByStatus.find(t => t.status === 'Closed')?.count || 0;

        res.json({
            totalTickets: totalTickets[0].count,
            ticketsByStatus,
            ticketsByPriority,
            ticketsByDepartment,
            recentTickets,
            summary: {
                total: totalTickets[0].count,
                open: openCount,
                inProgress: inProgressCount,
                closed: closedCount
            },
            // ส่งข้อมูลเพิ่มเติมเกี่ยวกับผู้ใช้และการกรอง
            userInfo: {
                id: userId,
                role: userRole,
                timeframe: timeframe
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Error retrieving dashboard data', error: error.message });
    } finally {
        conn.release();
    }
};