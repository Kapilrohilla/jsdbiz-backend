const nodemailer = require('nodemailer');
const logger = require('./logger');
const config = require('../config/appconfig');

// Build a transporter with sensible production defaults
function buildTransporter() {
  const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();

  /**
   * Supported providers:
   * - gmail via OAuth/App password (service: 'gmail')
   * - smtp via host/port/secure
   */
  const baseOptions = {
    pool: true,
    maxConnections: Number(process.env.EMAIL_MAX_CONNECTIONS || 3),
    maxMessages: Number(process.env.EMAIL_MAX_MESSAGES || 50),
    rateDelta: Number(process.env.EMAIL_RATE_DELTA || 2000),
    rateLimit: Number(process.env.EMAIL_RATE_LIMIT || 5),
    tls: { rejectUnauthorized: false },
  };

  let transportOptions;
  if (provider === 'gmail') {
    transportOptions = {
      ...baseOptions,
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    };
  } else {
    transportOptions = {
      ...baseOptions,
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || 'false') === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };
  }

  const transporter = nodemailer.createTransport(transportOptions);
  transporter.verify((err) => {
    if (err) {
      logger.error('Email transporter verification failed', err);
    } else {
      logger.info('Email transporter ready');
    }
  });
  return transporter;
}

const transporter = buildTransporter();

function createEmailTemplate(title, contentHtml) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px; }
        .header { background-color: #4a69bd; color: #fff; padding: 16px; text-align: center; border-radius: 6px 6px 0 0; }
        .content { padding: 20px; background: #fff; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 13px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h2>${title}</h2></div>
        <div class="content">${contentHtml}</div>
        <div class="footer">This is an automated message from the ${config.app.appName} System</div>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail({ to, subject, html, text, headers, from, cc, bcc, replyTo, attachments }) {
  console.log('sendEmail', to, subject, html, text, headers, from, cc, bcc, replyTo, attachments);
  const defaultFrom = `${config.app.appName} <${process.env.GMAIL_USER || process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;
  const mailOptions = {
    from: from || defaultFrom,
    to,
    subject,
    html,
    text,
    headers,
    cc,
    bcc,
    replyTo,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent', { messageId: info.messageId, to });
    return true;
  } catch (err) {
    logger.error('Email send failed', err);
    return false;
  }
}

async function sendSystemNotification(subject, message, priority = 'normal') {
  const timestamp = new Date().toISOString();
  const content = `
    <p><strong>Time:</strong> ${timestamp}</p>
    <p><strong>Environment:</strong> ${process.env.NODE_ENV || config.app.env || 'unknown'}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;
  const headers = priority === 'high' ? { 'X-Priority': '1', 'X-MSMail-Priority': 'High', Importance: 'high' } : undefined;
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[${priority === 'high' ? 'ALERT' : 'INFO'}] ${subject}`,
    html: createEmailTemplate(subject, content),
    text: `${subject}\n\nTime: ${timestamp}\nMessage: ${message}`,
    headers,
  });
}

async function sendCrashNotification(err) {
  const timestamp = new Date().toISOString();
  const content = `
    <p><strong>Time:</strong> ${timestamp}</p>
    <p><strong>Environment:</strong> ${process.env.NODE_ENV || config.app.env || 'unknown'}</p>
    <p><strong>Error Name:</strong> ${err && err.name}</p>
    <p><strong>Error Message:</strong> ${err && err.message}</p>
    <p><strong>Stack Trace:</strong></p>
    <pre>${(err && err.stack) || ''}</pre>
  `;
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[ALERT] ${config.app.appName} Backend Crash - ${err && err.name}`,
    html: createEmailTemplate('System Crash Alert', content),
    text: `${config.app.appName} Backend Crash\n\nTime: ${timestamp}\nError: ${err && err.message}\n\nStack:\n${(err && err.stack) || ''}`,
    headers: { 'X-Priority': '1', 'X-MSMail-Priority': 'High', Importance: 'high' },
  });
}

async function sendShutdownNotification(reason) {
  const timestamp = new Date().toISOString();
  const content = `
    <p><strong>Time:</strong> ${timestamp}</p>
    <p><strong>Environment:</strong> ${process.env.NODE_ENV || config.app.env || 'unknown'}</p>
    <p><strong>Reason:</strong> ${reason}</p>
  `;
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[INFO] ${config.app.appName} Backend Shutdown Notification`,
    html: createEmailTemplate('System Shutdown Notification', content),
    text: `${config.app.appName} Backend Shutdown\n\nTime: ${timestamp}\nReason: ${reason}`,
  });
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOTPEmail(email, otp, customerName) {
  const content = `
    <p>Hello${customerName ? ` ${customerName}` : ''},</p>
    <p>Please use the following verification code to complete your action:</p>
    <div style="background-color:#f8f9fa;border:2px solid #4a69bd;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
      <h2 style="color:#4a69bd;margin:0;font-size:32px;letter-spacing:5px;">${otp}</h2>
    </div>
    <p><strong>Important:</strong></p>
    <ul>
      <li>This code will expire in 10 minutes</li>
      <li>Do not share this code with anyone</li>
    </ul>
  `;
  return sendEmail({
    to: email,
    subject: 'Verify Your Email',
    html: createEmailTemplate('Email Verification', content),
    text: `Your OTP: ${otp} (expires in 10 minutes)`,
  });
}

async function sendForgotPasswordOTPEmail(email, otp, customerName) {
  const content = `
    <p>Hello${customerName ? ` ${customerName}` : ''},</p>
    <p>Use the following verification code to reset your password:</p>
    <div style="background-color:#f8f9fa;border:2px solid #4a69bd;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
      <h2 style="color:#4a69bd;margin:0;font-size:32px;letter-spacing:5px;">${otp}</h2>
    </div>
    <p>This code will expire in 10 minutes. If you didn't request this, ignore this email.</p>
  `;
  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: createEmailTemplate('Password Reset', content),
    text: `Password reset code: ${otp} (expires in 10 minutes)`,
  });
}

async function sendPasswordResetSuccessEmail(email, customerName) {
  const content = `
    <p>Hello${customerName ? ` ${customerName}` : ''},</p>
    <p>Your password has been successfully reset.</p>
    <p>If you did not perform this action, contact support immediately.</p>
  `;
  return sendEmail({
    to: email,
    subject: 'Password Reset Successful',
    html: createEmailTemplate('Password Reset Successful', content),
    text: 'Your password has been successfully reset.',
  });
}

module.exports = {
  transporter,
  createEmailTemplate,
  sendEmail,
  sendSystemNotification,
  sendCrashNotification,
  sendShutdownNotification,
  generateOTP,
  sendOTPEmail,
  sendForgotPasswordOTPEmail,
  sendPasswordResetSuccessEmail,
};


