// src/controllers/attachmentController.js
const db = require('../config/database');
const path = require('path');
const fs = require('node:fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configuration
const config = {
    baseUrl: process.env.BASE_URL || 'http://172.16.4.62:9000',
    uploadDir: 'uploads'
};

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, `../../${config.uploadDir}`);
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.error('Error creating uploads directory:', err);
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and original extension
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const uniqueName = `${timestamp}_${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Add attachment to ticket or comment
exports.addAttachment = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { ticket_id, comment_id, user_id } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: 'No file uploaded',
                error: 'File is required'
            });
        }

        if (!ticket_id) {
            return res.status(400).json({
                message: 'Ticket ID is required',
                error: 'Missing ticket_id'
            });
        }

        // Construct file paths and URLs
        const relativePath = path.relative(path.join(__dirname, '../..'), file.path);
        const fileUrl = `${config.baseUrl}/${relativePath.replace(/\\/g, '/')}`;

        // Insert attachment record
        const [result] = await conn.execute(
            `INSERT INTO attachments (
                ticket_id, 
                comment_id, 
                user_id, 
                file_name, 
                file_path,
                file_url, 
                file_type,
                file_size
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ticket_id,
                comment_id || null,
                user_id || null,
                file.originalname,
                file.path,
                fileUrl,
                file.mimetype,
                file.size
            ]
        );

        // Add history entry
        await conn.execute(
            `INSERT INTO ticket_history (
                ticket_id, 
                user_id, 
                action, 
                field_name, 
                new_value
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                ticket_id,
                user_id || null,
                'attached',
                'file',
                file.originalname
            ]
        );

        await conn.commit();

        // Get created attachment
        const [attachment] = await conn.execute(`
            SELECT a.*
            FROM attachments a
            WHERE a.id = ?
        `, [result.insertId]);

        res.status(201).json(attachment[0]);
    } catch (error) {
        await conn.rollback();
        // Clean up uploaded file if database operation fails
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        console.error('Error adding attachment:', error);
        res.status(500).json({
            message: 'Error adding attachment',
            error: error.message
        });
    } finally {
        conn.release();
    }
};

// Get attachments for a ticket
exports.getTicketAttachments = async (req, res) => {
    try {
        const [attachments] = await db.execute(`
            SELECT a.*
            FROM attachments a
            WHERE a.ticket_id = ?
            ORDER BY a.created_at DESC
        `, [req.params.ticket_id]);

        // Add full URL for each attachment
        const attachmentsWithUrls = attachments.map(attachment => ({
            ...attachment,
            download_url: `${config.baseUrl}/api/attachments/serve/${attachment.id}`
        }));

        res.json(attachmentsWithUrls);
    } catch (error) {
        console.error('Error getting attachments:', error);
        res.status(500).json({
            message: 'Error retrieving attachments',
            error: error.message
        });
    }
};

// Serve file
exports.serveFile = async (req, res) => {
    try {
        const [attachment] = await db.execute(
            'SELECT * FROM attachments WHERE id = ?',
            [req.params.id]
        );

        if (!attachment.length) {
            return res.status(404).json({
                message: 'Attachment not found'
            });
        }

        const file = attachment[0];
        res.sendFile(path.resolve(file.file_path));
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({
            message: 'Error serving file',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    addAttachment: [upload.single('file'), exports.addAttachment],
    getTicketAttachments: exports.getTicketAttachments,
    serveFile: exports.serveFile
};