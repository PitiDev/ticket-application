// src/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

/**
 * Send ticket assignment email
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.userName - Recipient name
 * @param {string} options.ticketNumber - Ticket number
 * @param {string} options.ticketTitle - Ticket title
 * @param {string} options.ticketUrl - URL to the ticket
 * @param {string} options.assignedBy - Name of person who assigned the ticket
 * @returns {Promise} - Nodemailer result
 */
exports.sendTicketAssignmentEmail = async (options) => {
    const { email, userName, ticketNumber, ticketTitle, ticketUrl, assignedBy } = options;

    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: `Ticket Assigned: ${ticketNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #3b82f6; margin: 0;">Ticket System</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hello ${userName},</p>
          
          <p>You have been assigned a new ticket:</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">${ticketNumber}: ${ticketTitle}</p>
          </div>
          
          <p>This ticket was assigned to you by ${assignedBy}.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${ticketUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Ticket
            </a>
          </div>
          
          <p>Thank you,<br>Ticket Support Team</p>
        </div>
        
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #6b7280;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Send ticket update notification email
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.userName - Recipient name
 * @param {string} options.ticketNumber - Ticket number
 * @param {string} options.ticketTitle - Ticket title
 * @param {string} options.ticketUrl - URL to the ticket
 * @param {string} options.updateType - Type of update (status, comment, etc.)
 * @param {string} options.updateDetails - Details of the update
 * @param {string} options.updatedBy - Name of person who updated the ticket
 * @returns {Promise} - Nodemailer result
 */
// Updated email template for services/emailService.js
exports.sendTicketUpdateEmail = async (options) => {
    const { email, userName, ticketNumber, ticketTitle, ticketUrl, updateType, updateDetails, updatedBy } = options;

    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: `Ticket Updated: ${ticketNumber}`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ticket Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f5f7fa;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Ticket System</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 25px;">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5;">Hello ${userName},</p>
                
                <p style="font-size: 16px; line-height: 1.5;">There has been an update to ticket:</p>
                
                <div style="background-color: #f0f4f8; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 25px 0;">
                  <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1e40af;">${ticketNumber}: ${ticketTitle}</p>
                </div>
                
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; width: 35%;">
                      <span style="font-weight: 600; color: #4b5563;">Update Type:</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
                      <span style="color: #111827;">${updateType}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; width: 35%;">
                      <span style="font-weight: 600; color: #4b5563;">Details:</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
                      <span style="color: #111827;">${updateDetails}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; width: 35%;">
                      <span style="font-weight: 600; color: #4b5563;">Updated By:</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
                      <span style="color: #111827;">${updatedBy}</span>
                    </td>
                  </tr>
                </table>
                
                <div style="margin: 35px 0; text-align: center;">
                  <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.3s;">
                    View Ticket
                  </a>
                </div>
                
                <p style="margin-bottom: 0; font-size: 16px; line-height: 1.5;">Thank you,<br>Ticket Support Team</p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 13px; color: #6b7280;">This is an automated message. Please do not reply to this email.</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #6b7280;">© ${new Date().getFullYear()} Ticket System. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    return transporter.sendMail(mailOptions);
};

exports.sendTicketAssignmentEmail = async (options) => {
    const { email, userName, ticketNumber, ticketTitle, ticketUrl, assignedBy } = options;

    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: `Ticket Assigned: ${ticketNumber}`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ticket Assignment</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f5f7fa;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Ticket System</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 25px;">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5;">Hello ${userName},</p>
                
                <p style="font-size: 16px; line-height: 1.5;">You have been assigned to the following ticket:</p>
                
                <div style="background-color: #f0f4f8; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 25px 0;">
                  <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1e40af;">${ticketNumber}: ${ticketTitle}</p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">This ticket was assigned to you by <span style="font-weight: 600;">${assignedBy}</span>.</p>
                
                <div style="margin: 35px 0; text-align: center;">
                  <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.3s;">
                    View Ticket
                  </a>
                </div>
                
                <p style="margin-bottom: 0; font-size: 16px; line-height: 1.5;">Thank you,<br>Ticket Support Team</p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 13px; color: #6b7280;">This is an automated message. Please do not reply to this email.</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #6b7280;">© ${new Date().getFullYear()} Ticket System. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    return transporter.sendMail(mailOptions);
};