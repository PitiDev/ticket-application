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
 */
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
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #fef7f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; border: 2px solid #FFD700;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #DC143C 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">Ticket System</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 25px; background: linear-gradient(to bottom, #ffffff 0%, #fef9f4 100%);">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5; color: #8B0000;">Hello ${userName},</p>
                
                <p style="font-size: 16px; line-height: 1.5; color: #2c1810;">You have been assigned to the following ticket:</p>
                
                <div style="background: linear-gradient(to right, #fff8e1, #ffeaa7); padding: 20px; border-left: 4px solid #D4AF37; border-radius: 6px; margin: 25px 0; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);">
                  <p style="margin: 0; font-weight: 600; font-size: 16px; color: #8B0000;">${ticketNumber}: ${ticketTitle}</p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #2c1810;">This ticket was assigned to you by <span style="font-weight: 600; color: #DC143C;">${assignedBy}</span>.</p>
                
                <div style="margin: 35px 0; text-align: center;">
                  <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(to right, #D4AF37, #FFD700, #DC143C); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 8px rgba(212, 175, 55, 0.4); transition: all 0.3s; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                    View Ticket
                  </a>
                </div>
                
                <p style="margin-bottom: 0; font-size: 16px; line-height: 1.5; color: #2c1810;">Thank you,<br><span style="color: #8B0000; font-weight: 600;">Ticket Support Team</span></p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background: linear-gradient(to right, #f4f1ec, #fef7f0); padding: 20px; text-align: center; border-top: 1px solid #FFD700;">
                <p style="margin: 0; font-size: 13px; color: #8B4513;">This is an automated message. Please do not reply to this email.</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #8B4513;">© ${new Date().getFullYear()} Ticket System. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send ticket update notification email
 */
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
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #fef7f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; border: 2px solid #FFD700;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #DC143C 0%, #FFD700 50%, #D4AF37 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">Ticket System</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 25px; background: linear-gradient(to bottom, #ffffff 0%, #fef9f4 100%);">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5; color: #8B0000;">Hello ${userName},</p>
                
                <p style="font-size: 16px; line-height: 1.5; color: #2c1810;">There has been an update to ticket:</p>
                
                <div style="background: linear-gradient(to right, #fff8e1, #ffeaa7); padding: 20px; border-left: 4px solid #DC143C; border-radius: 6px; margin: 25px 0; box-shadow: 0 2px 4px rgba(220, 20, 60, 0.2);">
                  <p style="margin: 0; font-weight: 600; font-size: 16px; color: #8B0000;">${ticketNumber}: ${ticketTitle}</p>
                </div>
                
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 12px 8px; border-bottom: 2px solid #FFD700; vertical-align: top; width: 35%; background: linear-gradient(to right, #fef9f4, #ffffff);">
                      <span style="font-weight: 600; color: #8B0000;">Update Type:</span>
                    </td>
                    <td style="padding: 12px 8px; border-bottom: 2px solid #FFD700; vertical-align: top; background: linear-gradient(to left, #fef9f4, #ffffff);">
                      <span style="color: #2c1810; font-weight: 500;">${updateType}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 8px; border-bottom: 2px solid #FFD700; vertical-align: top; width: 35%; background: linear-gradient(to right, #fef9f4, #ffffff);">
                      <span style="font-weight: 600; color: #8B0000;">Details:</span>
                    </td>
                    <td style="padding: 12px 8px; border-bottom: 2px solid #FFD700; vertical-align: top; background: linear-gradient(to left, #fef9f4, #ffffff);">
                      <span style="color: #2c1810; font-weight: 500;">${updateDetails}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 8px; border-bottom: 2px solid #FFD700; vertical-align: top; width: 35%; background: linear-gradient(to right, #fef9f4, #ffffff);">
                      <span style="font-weight: 600; color: #8B0000;">Updated By:</span>
                    </td>
                    <td style="padding: 12px 8px; border-bottom: 2px solid #FFD700; vertical-align: top; background: linear-gradient(to left, #fef9f4, #ffffff);">
                      <span style="color: #DC143C; font-weight: 600;">${updatedBy}</span>
                    </td>
                  </tr>
                </table>
                
                <div style="margin: 35px 0; text-align: center;">
                  <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(to right, #DC143C, #FFD700, #D4AF37); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 8px rgba(220, 20, 60, 0.4); transition: all 0.3s; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                    View Ticket
                  </a>
                </div>
                
                <p style="margin-bottom: 0; font-size: 16px; line-height: 1.5; color: #2c1810;">Thank you,<br><span style="color: #8B0000; font-weight: 600;">Ticket Support Team</span></p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background: linear-gradient(to right, #f4f1ec, #fef7f0); padding: 20px; text-align: center; border-top: 1px solid #FFD700;">
                <p style="margin: 0; font-size: 13px; color: #8B4513;">This is an automated message. Please do not reply to this email.</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #8B4513;">© ${new Date().getFullYear()} Ticket System. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async ({ email, username, resetUrl }) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #fef7f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; border: 2px solid #DC143C;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FFD700 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">Reset Your Password</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 25px; background: linear-gradient(to bottom, #ffffff 0%, #fef9f4 100%);">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5; color: #8B0000;">Hello ${username},</p>
                
                <p style="font-size: 16px; line-height: 1.5; color: #2c1810;">We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
                
                <p style="font-size: 16px; line-height: 1.5; color: #2c1810;">To reset your password, click the button below:</p>
                
                <div style="margin: 35px 0; text-align: center;">
                  <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #8B0000, #DC143C, #FFD700); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 8px rgba(139, 0, 0, 0.4); transition: all 0.3s; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                    Reset Password
                  </a>
                </div>
                
                <div style="background: linear-gradient(to right, #ffe5e5, #fff8e1); padding: 15px; border-radius: 6px; border-left: 4px solid #DC143C; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #8B0000; font-weight: 600;">⚠️ This link will expire in 1 hour.</p>
                </div>
                
                <p style="margin-bottom: 0; font-size: 16px; line-height: 1.5; color: #2c1810;">Thank you,<br><span style="color: #8B0000; font-weight: 600;">The Support Team</span></p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background: linear-gradient(to right, #f4f1ec, #fef7f0); padding: 20px; text-align: center; border-top: 1px solid #DC143C;">
                <p style="margin: 0; font-size: 13px; color: #8B4513;">This is an automated message. Please do not reply to this email.</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #8B4513;">© ${new Date().getFullYear()} Ticket System. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send registration confirmation email
 */
exports.sendRegistrationConfirmationEmail = async ({ email, username }) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Welcome to Our Ticket System',
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Our Ticket System</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #fef7f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; border: 2px solid #FFD700;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #DC143C 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">Welcome to Our Ticket System</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 25px; background: linear-gradient(to bottom, #ffffff 0%, #fef9f4 100%);">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5; color: #8B0000;">Hello ${username},</p>
                
                <p style="font-size: 16px; line-height: 1.5; color: #2c1810;">Thank you for registering with our ticket support system. Your account has been created successfully.</p>
                
                <div style="background: linear-gradient(to right, #fff8e1, #ffeaa7); padding: 20px; border-left: 4px solid #FFD700; border-radius: 6px; margin: 25px 0; text-align: center; box-shadow: 0 2px 4px rgba(255, 215, 0, 0.2);">
                  <p style="margin: 0; font-weight: 600; font-size: 16px; color: #8B0000;">🎉 Welcome to the team!</p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5; color: #2c1810;">You can now log in and start using the system.</p>
                
                <div style="margin: 35px 0; text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(to right, #FFD700, #D4AF37, #DC143C); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 8px rgba(255, 215, 0, 0.4); transition: all 0.3s; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                    Login Now
                  </a>
                </div>
                
                <p style="margin-bottom: 0; font-size: 16px; line-height: 1.5; color: #2c1810;">Thank you,<br><span style="color: #8B0000; font-weight: 600;">The Support Team</span></p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background: linear-gradient(to right, #f4f1ec, #fef7f0); padding: 20px; text-align: center; border-top: 1px solid #FFD700;">
                <p style="margin: 0; font-size: 13px; color: #8B4513;">This is an automated message. Please do not reply to this email.</p>
                <p style="margin: 10px 0 0; font-size: 13px; color: #8B4513;">© ${new Date().getFullYear()} Ticket System. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
  };

  return transporter.sendMail(mailOptions);
};