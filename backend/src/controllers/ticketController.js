// src/controllers/ticketController.js
const db = require('../config/database');

// Get all tickets
exports.getTickets = async (req, res) => {
    try {
        const [tickets] = await db.execute(`
            SELECT t.*, 
                   u.username as created_by_name,
                   s.name as status_name,
                   p.name as priority_name,
                   c.name as category_name,
                   d.name as department_name
            FROM tickets t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN departments d ON t.department_id = d.id
            ORDER BY t.created_at DESC
        `);

        res.json(tickets);
    } catch (error) {
        console.error('Error getting tickets:', error);
        res.status(500).json({ message: 'Error retrieving tickets', error: error.message });
    }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
    try {
        const [tickets] = await db.execute(`
            SELECT t.*, 
                   u.username as created_by_name,
                   s.name as status_name,
                   p.name as priority_name,
                   c.name as category_name,
                   d.name as department_name
            FROM tickets t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN departments d ON t.department_id = d.id
            WHERE t.id = ?
        `, [req.params.id]);

        if (tickets.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(tickets[0]);
    } catch (error) {
        console.error('Error getting ticket:', error);
        res.status(500).json({ message: 'Error retrieving ticket', error: error.message });
    }
};

// Create ticket
exports.createTicket = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const {
            title,
            description,
            category_id,
            priority_id,
            department_id,
            due_date,
            is_private,
            parent_ticket_id,
            assigned_to
        } = req.body;

        const created_by = req.body.created_by;

        // Generate ticket number
        const year = new Date().getFullYear();
        const [lastTicket] = await conn.execute(
            'SELECT ticket_number FROM tickets WHERE ticket_number LIKE ? ORDER BY id DESC LIMIT 1',
            [`TKT-${year}-%`]
        );

        let ticketNumber;
        if (lastTicket.length === 0) {
            ticketNumber = `TKT-${year}-00001`;
        } else {
            const lastNumber = parseInt(lastTicket[0].ticket_number.split('-')[2]);
            ticketNumber = `TKT-${year}-${(lastNumber + 1).toString().padStart(5, '0')}`;
        }

        // Get creator details (for email notification)
        const [creator] = await conn.execute(
            'SELECT username, full_name FROM users WHERE id = ?',
            [created_by]
        );

        const creatorName = creator.length > 0 ?
            (creator[0].full_name || creator[0].username) :
            'System';

        // Get assignee details if ticket is being assigned
        let assigneeDetails = null;
        if (assigned_to) {
            const [assignee] = await conn.execute(
                'SELECT id, email, username, full_name FROM users WHERE id = ?',
                [assigned_to]
            );

            if (assignee.length > 0) {
                assigneeDetails = assignee[0];
            }
        }

        // Insert new ticket with ticket_number
        const [result] = await conn.execute(
            `INSERT INTO tickets (
                ticket_number, title, description, category_id, 
                priority_id, department_id, created_by, status_id,
                due_date, is_private, parent_ticket_id, assigned_to
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                (SELECT id FROM statuses WHERE name = 'New'),
                ?, ?, ?, ?
            )`,
            [
                ticketNumber,
                title,
                description,
                category_id,
                priority_id,
                department_id,
                created_by,
                due_date || null,
                is_private || 0,
                parent_ticket_id || null,
                assigned_to || null
            ]
        );

        // Create history entry
        await conn.execute(
            `INSERT INTO ticket_history (
                ticket_id, user_id, action, field_name, new_value
            ) VALUES 
                (?, ?, 'created', 'ticket', ?)`,
            [result.insertId, created_by, ticketNumber]
        );

        // If assigned during creation, add an assignment history entry
        if (assigned_to) {
            await conn.execute(
                `INSERT INTO ticket_history (
                    ticket_id, user_id, action, field_name, new_value
                ) VALUES 
                    (?, ?, 'assigned', 'assigned_to', ?)`,
                [result.insertId, created_by, assigned_to]
            );
        }

        await conn.commit();

        // Get created ticket with all relations
        const [ticket] = await conn.execute(`
            SELECT t.*, 
                   u.username as created_by_name,
                   s.name as status_name,
                   p.name as priority_name,
                   c.name as category_name,
                   d.name as department_name,
                   assigned.username as assigned_to_name,
                   parent.ticket_number as parent_ticket_number
            FROM tickets t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN departments d ON t.department_id = d.id
            LEFT JOIN users assigned ON t.assigned_to = assigned.id
            LEFT JOIN tickets parent ON t.parent_ticket_id = parent.id
            WHERE t.id = ?
        `, [result.insertId]);

        // Send email notifications
        try {
            // Import email service
            const emailService = require('../services/emailService');

            // Notify department managers (if applicable)
            // if (department_id) {
            //     const [departmentManagers] = await conn.execute(`
            //         SELECT u.email, u.username, u.full_name
            //         FROM users u
            //         WHERE u.role = 'manager' AND u.department_id = ?
            //     `, [department_id]);

            //     if (departmentManagers.length > 0) {
            //         for (const manager of departmentManagers) {
            //             await emailService.sendTicketUpdateEmail({
            //                 email: manager.email,
            //                 userName: manager.full_name || manager.username,
            //                 ticketNumber: ticketNumber,
            //                 ticketTitle: title,
            //                 ticketUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tickets/${result.insertId}`,
            //                 updateType: 'New Ticket',
            //                 updateDetails: `A new ticket has been created in your department: ${ticket[0].department_name}`,
            //                 updatedBy: creatorName
            //             });
            //         }
            //     }
            // }

            // Notify the assignee if the ticket is assigned during creation
            if (assigneeDetails && assigneeDetails.email) {
                await emailService.sendTicketAssignmentEmail({
                    email: assigneeDetails.email,
                    userName: assigneeDetails.full_name || assigneeDetails.username,
                    ticketNumber: ticketNumber,
                    ticketTitle: title,
                    ticketUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tickets/${result.insertId}`,
                    assignedBy: creatorName
                });
            }
        } catch (emailError) {
            // Log but don't fail if email sending fails
            console.error('Failed to send notification email:', emailError);
        }

        // Emit socket event if socket.io is available
        try {
            // const { io } = require('../socket');
            // io.emit('ticketCreated', ticket[0]);
        } catch (socketError) {
            // Log but don't fail if socket emission fails
            console.error('Failed to emit socket event:', socketError);
        }

        res.status(201).json(ticket[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Error creating ticket', error: error.message });
    } finally {
        conn.release();
    }
};


// Update ticket
exports.updateTicket = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;
        const updates = req.body;

        // Get user_id from request body or auth token
        const user_id = updates.user_id || req.user?.id;

        if (!user_id) {
            return res.status(401).json({
                message: 'Unauthorized: User ID is required'
            });
        }

        // Get current ticket state with assignee information
        const [oldTicket] = await conn.execute(`
            SELECT t.*, u.email, u.username, u.full_name
            FROM tickets t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.id = ?
        `, [id]);

        if (!oldTicket.length) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Get user info of person making changes
        const [updater] = await conn.execute(
            'SELECT username, full_name FROM users WHERE id = ?',
            [user_id]
        );

        const updaterName = updater.length > 0 ?
            (updater[0].full_name || updater[0].username) :
            'System';

        // Check if assigned_to is being updated
        let newAssignedUser = null;
        if (updates.assigned_to && updates.assigned_to !== oldTicket[0].assigned_to) {
            // Get new assignee info
            const [newAssignee] = await conn.execute(
                'SELECT id, email, username, full_name FROM users WHERE id = ?',
                [updates.assigned_to]
            );

            if (newAssignee.length > 0) {
                newAssignedUser = newAssignee[0];
            }
        }

        // Build update query
        const allowedUpdates = [
            'title', 'description', 'category_id', 'priority_id',
            'status_id', 'assigned_to', 'department_id'
        ];

        const updateFields = [];
        const updateValues = [];
        const historyEntries = [];

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updates[field]);

                // Log change in history if value changed
                if (oldTicket[0][field] !== updates[field]) {
                    conn.execute(
                        `INSERT INTO ticket_history (
                            ticket_id, user_id, action, field_name, old_value, new_value
                        ) VALUES (?, ?, 'updated', ?, ?, ?)`,
                        [id, user_id, field, oldTicket[0][field], updates[field]]
                    );

                    // Store for email notification
                    historyEntries.push({
                        field,
                        oldValue: oldTicket[0][field],
                        newValue: updates[field]
                    });
                }
            }
        });

        if (updateFields.length > 0) {
            updateValues.push(id);
            await conn.execute(
                `UPDATE tickets 
                 SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                updateValues
            );
        }

        await conn.commit();

        // Get updated ticket with all relations
        const [ticket] = await conn.execute(`
            SELECT t.*, 
                   u.username as created_by_name,
                   s.name as status_name,
                   p.name as priority_name,
                   c.name as category_name,
                   d.name as department_name
            FROM tickets t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN departments d ON t.department_id = d.id
            WHERE t.id = ?
        `, [id]);

        // Send email notifications if required
        try {
            // Use the emailService if it's available
            const emailService = require('../services/emailService');

            // Send email to newly assigned user
            if (newAssignedUser && newAssignedUser.email) {
                await emailService.sendTicketAssignmentEmail({
                    email: newAssignedUser.email,
                    userName: newAssignedUser.full_name || newAssignedUser.username,
                    ticketNumber: oldTicket[0].ticket_number,
                    ticketTitle: updates.title || oldTicket[0].title,
                    ticketUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/tickets/${id}`,
                    assignedBy: updaterName
                });
            }

            // Send email for status change if the ticket is assigned to someone
            const statusChange = historyEntries.find(e => e.field === 'status_id');
            if (statusChange && oldTicket[0].assigned_to && oldTicket[0].email) {
                // Get status names
                const [oldStatus] = await conn.execute(
                    'SELECT name FROM statuses WHERE id = ?',
                    [statusChange.oldValue]
                );
                const [newStatus] = await conn.execute(
                    'SELECT name FROM statuses WHERE id = ?',
                    [statusChange.newValue]
                );

                const oldStatusName = oldStatus.length > 0 ? oldStatus[0].name : 'Unknown';
                const newStatusName = newStatus.length > 0 ? newStatus[0].name : 'Unknown';

                await emailService.sendTicketUpdateEmail({
                    email: oldTicket[0].email,
                    userName: oldTicket[0].full_name || oldTicket[0].username,
                    ticketNumber: oldTicket[0].ticket_number,
                    ticketTitle: updates.title || oldTicket[0].title,
                    ticketUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/tickets/${id}`,
                    updateType: 'Status Change',
                    updateDetails: `Status changed from "${oldStatusName}" to "${newStatusName}"`,
                    updatedBy: updaterName
                });
            }
        } catch (emailError) {
            // Log but don't fail if email sending fails
            console.error('Failed to send notification email:', emailError);
        }

        // Emit socket event if socket.io is available
        try {
            // const { io } = require('../socket');
            // io.emit('ticketUpdated', ticket[0]);
        } catch (socketError) {
            // Log but don't fail if socket emission fails
            console.error('Failed to emit socket event:', socketError);
        }

        res.json(ticket[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Error updating ticket:', error);
        res.status(500).json({
            message: 'Error updating ticket',
            error: error.message
        });
    } finally {
        conn.release();
    }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;
        const user_id = req.user.id;

        // Check if ticket exists
        const [ticket] = await conn.execute(
            'SELECT id FROM tickets WHERE id = ?',
            [id]
        );

        if (!ticket.length) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Create history entry before deletion
        await conn.execute(
            `INSERT INTO ticket_history (ticket_id, user_id, action)
             VALUES (?, ?, 'deleted')`,
            [id, user_id]
        );

        // Delete ticket
        await conn.execute('DELETE FROM tickets WHERE id = ?', [id]);

        await conn.commit();
        res.status(204).send();
    } catch (error) {
        await conn.rollback();
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Error deleting ticket', error: error.message });
    } finally {
        conn.release();
    }
};

// Get ticket comments
exports.getTicketComments = async (req, res) => {
    try {
        const [comments] = await db.execute(`
            SELECT c.*, u.username as user_name
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.ticket_id = ?
            ORDER BY c.created_at DESC
        `, [req.params.id]);

        res.json(comments);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ message: 'Error retrieving comments', error: error.message });
    }
};

// Add comment
exports.addComment = async (req, res) => {
    // Validate user authentication
    // if (!req.user || !req.user.id) {
    //     return res.status(401).json({
    //         message: 'Authentication required',
    //         error: 'User not authenticated'
    //     });
    // }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { content, is_private } = req.body;
        const ticket_id = req.params.id;
        const user_id = req.body.created_by;
        console.log("User ID: ", user_id);
        console.log("Adding comment: ", content, is_private);

        // Validate required fields
        if (!content || !content.trim()) {
            return res.status(400).json({
                message: 'Comment content is required',
                error: 'Missing required field: content'
            });
        }

        if (!ticket_id) {
            return res.status(400).json({
                message: 'Ticket ID is required',
                error: 'Missing required field: ticket_id'
            });
        }

        // Verify ticket exists
        const [ticketExists] = await conn.execute(
            'SELECT id FROM tickets WHERE id = ?',
            [ticket_id]
        );

        if (!ticketExists.length) {
            return res.status(404).json({
                message: 'Ticket not found',
                error: 'Invalid ticket_id'
            });
        }

        // Insert comment
        const [result] = await conn.execute(
            `INSERT INTO comments (ticket_id, user_id, content, is_private)
             VALUES (?, ?, ?, ?)`,
            [ticket_id, user_id, content.trim(), is_private || false]
        );

        // Create history entry
        await conn.execute(
            `INSERT INTO ticket_history (ticket_id, user_id, action)
             VALUES (?, ?, 'commented')`,
            [ticket_id, user_id]
        );

        await conn.commit();

        // Get created comment with user info
        const [comment] = await conn.execute(`
            SELECT c.*, u.username as user_name
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json(comment[0]);
    } catch (error) {
        await conn.rollback();
        console.error('Error adding comment:', error);
        res.status(500).json({
            message: 'Error adding comment',
            error: error.message
        });
    } finally {
        conn.release();
    }
};

// Get ticket history
exports.getTicketHistory = async (req, res) => {
    try {
        const [history] = await db.execute(`
            SELECT h.*, u.username as user_name
            FROM ticket_history h
            LEFT JOIN users u ON h.user_id = u.id
            WHERE h.ticket_id = ?
            ORDER BY h.created_at DESC
        `, [req.params.id]);

        res.json(history);
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ message: 'Error retrieving history', error: error.message });
    }
};



exports.getAssignedTickets = async (req, res) => {
    try {
        const userId = req.query.userId; // Get userId from query params

        let query = `
            SELECT t.*, 
                   u.username as created_by_name,
                   s.name as status_name,
                   p.name as priority_name,
                   c.name as category_name,
                   d.name as department_name,
                   assigned.username as assigned_to_name
            FROM tickets t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN statuses s ON t.status_id = s.id
            LEFT JOIN priorities p ON t.priority_id = p.id
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN departments d ON t.department_id = d.id
            LEFT JOIN users assigned ON t.assigned_to = assigned.id
            WHERE t.assigned_to = ?
            ORDER BY t.created_at DESC
        `;

        const [tickets] = await db.execute(query, [userId]);

        // Get some basic stats
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_tickets,
                SUM(CASE WHEN status_id = (SELECT id FROM statuses WHERE name = 'New') THEN 1 ELSE 0 END) as new_tickets,
                SUM(CASE WHEN status_id = (SELECT id FROM statuses WHERE name = 'In Progress') THEN 1 ELSE 0 END) as in_progress_tickets,
                SUM(CASE WHEN status_id = (SELECT id FROM statuses WHERE name = 'Resolved') THEN 1 ELSE 0 END) as resolved_tickets
            FROM tickets 
            WHERE assigned_to = ?
        `, [userId]);

        res.json({
            tickets,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Error getting assigned tickets:', error);
        res.status(500).json({
            message: 'Error retrieving assigned tickets',
            error: error.message
        });
    }
};

// Add this to get list of available assignees
exports.getAssignees = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, username, email
            FROM users
            WHERE is_active = 1
            ORDER BY username
        `);

        res.json(users);
    } catch (error) {
        console.error('Error getting assignees:', error);
        res.status(500).json({
            message: 'Error retrieving assignees',
            error: error.message
        });
    }
};

// Assign ticket to user
exports.assignTicket = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { ticketId } = req.params;
        const { userId } = req.body;
        const assignedBy = req.user.id;

        // Check if ticket exists
        const [ticketCheck] = await conn.execute(
            'SELECT id, title, ticket_number FROM tickets WHERE id = ?',
            [ticketId]
        );

        if (ticketCheck.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check if user exists
        const [userCheck] = await conn.execute(
            'SELECT id, email, username, full_name FROM users WHERE id = ?',
            [userId]
        );

        if (userCheck.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get assigner details
        const [assigner] = await conn.execute(
            'SELECT username, full_name FROM users WHERE id = ?',
            [assignedBy]
        );

        // Update ticket with new assignee
        await conn.execute(
            'UPDATE tickets SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId, ticketId]
        );

        // Create history record
        await conn.execute(
            `INSERT INTO ticket_history (ticket_id, user_id, action, field_name, old_value, new_value)
             VALUES (?, ?, 'assigned', 'assigned_to', NULL, ?)`,
            [ticketId, assignedBy, userId]
        );

        await conn.commit();

        // Prepare data for email
        const ticket = ticketCheck[0];
        const user = userCheck[0];
        const assignerName = assigner[0].full_name || assigner[0].username;

        // Send email notification
        try {
            await emailService.sendTicketAssignmentEmail({
                email: user.email,
                userName: user.full_name || user.username,
                ticketNumber: ticket.ticket_number,
                ticketTitle: ticket.title,
                ticketUrl: `${process.env.FRONTEND_URL}/tickets/${ticketId}`,
                assignedBy: assignerName
            });
        } catch (emailError) {
            console.error('Failed to send assignment email:', emailError);
            // Continue despite email failure
        }

        // Send real-time notification
        // io.emit('ticketAssigned', {
        //     ticketId,
        //     assignedTo: userId,
        //     assignedBy
        // });

        res.json({ message: 'Ticket assigned successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Assign ticket error:', error);
        res.status(500).json({ message: 'Error assigning ticket', error: error.message });
    } finally {
        conn.release();
    }
};