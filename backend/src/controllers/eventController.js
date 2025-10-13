// src/controllers/eventController.js
const db = require('../config/database');
const fetch = require('node-fetch');


const checkPhoneWithExternalAPI = async (phone) => {
    try {
        const response = await fetch(`http://202.62.106.154:5173/api/customers/phone/${phone}`);
        const data = await response.json();

        if (data.success && data.data && data.data.phone === phone.toString()) {
            return {
                matched: true,
                customer: data.data
            };
        }

        return {
            matched: false,
            customer: null
        };
    } catch (error) {
        console.error(`Error checking phone ${phone}:`, error);
        return {
            matched: false,
            customer: null,
            error: error.message
        };
    }
};

// Sync/Update status for all registrations
exports.syncDownloadStatus = async (req, res) => {
    const conn = await db.getConnection();

    try {
        // Get all registrations
        const [registrations] = await conn.execute(
            'SELECT id, phone, download_status FROM event_lbb'
        );

        const results = {
            total: registrations.length,
            updated: 0,
            matched: 0,
            not_matched: 0,
            errors: 0,
            details: []
        };

        // Loop through each registration
        for (const reg of registrations) {
            const checkResult = await checkPhoneWithExternalAPI(reg.phone);

            if (checkResult.matched) {
                // Phone matched - update status to 'completed'
                await conn.execute(
                    'UPDATE event_lbb SET download_status = ? WHERE id = ?',
                    ['completed', reg.id]
                );

                results.matched++;
                results.updated++;
                results.details.push({
                    id: reg.id,
                    phone: reg.phone,
                    status: 'matched',
                    old_status: reg.download_status,
                    new_status: 'completed',
                    customer: checkResult.customer
                });
            } else if (checkResult.error) {
                // Error occurred
                results.errors++;
                results.details.push({
                    id: reg.id,
                    phone: reg.phone,
                    status: 'error',
                    error: checkResult.error
                });
            } else {
                // Phone not matched
                results.not_matched++;
                results.details.push({
                    id: reg.id,
                    phone: reg.phone,
                    status: 'not_matched',
                    current_status: reg.download_status
                });
            }
        }

        res.json({
            success: true,
            message: 'Sync completed',
            results: results
        });
    } catch (error) {
        console.error('Error syncing download status:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing download status',
            error: error.message
        });
    } finally {
        conn.release();
    }
};

// Sync single registration by ID
exports.syncSingleStatus = async (req, res) => {
    const conn = await db.getConnection();

    try {
        const { id } = req.params;

        // Get registration
        const [registrations] = await conn.execute(
            'SELECT id, phone, download_status FROM event_lbb WHERE id = ?',
            [id]
        );

        if (registrations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        const registration = registrations[0];
        const checkResult = await checkPhoneWithExternalAPI(registration.phone);

        if (checkResult.matched) {
            // Phone matched - update status
            await conn.execute(
                'UPDATE event_lbb SET download_status = ? WHERE id = ?',
                ['completed', id]
            );

            // Get updated record
            const [updated] = await conn.execute(
                'SELECT * FROM event_lbb WHERE id = ?',
                [id]
            );

            res.json({
                success: true,
                message: 'Status updated to completed',
                matched: true,
                old_status: registration.download_status,
                new_status: 'completed',
                customer: checkResult.customer,
                data: updated[0]
            });
        } else {
            res.json({
                success: true,
                message: 'Phone not matched in external system',
                matched: false,
                current_status: registration.download_status,
                error: checkResult.error
            });
        }
    } catch (error) {
        console.error('Error syncing single status:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing status',
            error: error.message
        });
    } finally {
        conn.release();
    }
};

// Get all event registrations
exports.getEvents = async (req, res) => {
    try {
        const { ticket_id, event, download_status } = req.query;

        let query = 'SELECT * FROM event_lbb WHERE 1=1';
        const params = [];

        if (ticket_id) {
            query += ' AND ticket_id = ?';
            params.push(ticket_id);
        }

        if (event) {
            query += ' AND event = ?';
            params.push(event);
        }

        if (download_status) {
            query += ' AND download_status = ?';
            params.push(download_status);
        }

        query += ' ORDER BY created_date DESC';

        const [events] = await db.execute(query, params);

        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving events',
            error: error.message
        });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const [events] = await db.execute(
            'SELECT * FROM event_lbb WHERE id = ?',
            [req.params.id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event registration not found'
            });
        }

        res.json({
            success: true,
            data: events[0]
        });
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving event',
            error: error.message
        });
    }
};

// Create event registration
exports.createEvent = async (req, res) => {
    try {
        const { ticket_id, fullname, phone } = req.body;

        // Validate required fields
        if (!fullname || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullname, phone, download_status'
            });
        }

        // Check for duplicate phone number
        const [existingPhone] = await db.execute(
            'SELECT id, phone FROM event_lbb WHERE phone = ?',
            [phone]
        );

        if (existingPhone.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered',
                duplicate: {
                    id: existingPhone[0].id,
                    phone: existingPhone[0].phone
                }
            });
        }

        const [result] = await db.execute(
            `INSERT INTO event_lbb (ticket_id, fullname, phone)
             VALUES (?, ?, ?)`,
            [ticket_id, fullname, phone]
        );

        // Get created record
        const [newEvent] = await db.execute(
            'SELECT * FROM event_lbb WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Event registration created successfully',
            data: newEvent[0]
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event registration',
            error: error.message
        });
    }
};

// Update event registration
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { ticket_id, fullname, phone, download_status, event } = req.body;

        // Check if event exists
        const [existing] = await db.execute(
            'SELECT * FROM event_lbb WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event registration not found'
            });
        }

        const [result] = await db.execute(
            `UPDATE event_lbb 
             SET ticket_id = ?, fullname = ?, phone = ?, download_status = ?, event = ?
             WHERE id = ?`,
            [ticket_id, fullname, phone, download_status, event, id]
        );

        // Get updated record
        const [updatedEvent] = await db.execute(
            'SELECT * FROM event_lbb WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Event registration updated successfully',
            data: updatedEvent[0]
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event registration',
            error: error.message
        });
    }
};

// Delete event registration
exports.deleteEvent = async (req, res) => {
    try {
        const [existing] = await db.execute(
            'SELECT * FROM event_lbb WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event registration not found'
            });
        }

        await db.execute(
            'DELETE FROM event_lbb WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Event registration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event registration',
            error: error.message
        });
    }
};

module.exports = exports;