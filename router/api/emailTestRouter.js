const router = require('express').Router();
const { sendEmailDetailed, createEmailTemplate } = require('../../utils/email');

// POST /api/v1/test-email
router.post('/test-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body || {};
    if (!to) return res.status(400).json({ type: 'error', message: 'to is required' });
    const finalSubject = subject || 'Test Email from Ivisa';
    const finalHtml = html || createEmailTemplate('Test Email', `<p>${text || 'This is a test email.'}</p>`);
    const info = await sendEmailDetailed({ to, subject: finalSubject, html: finalHtml, text: text || 'This is a test email.' });
    return res.json({ type: 'success', messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response });
  } catch (err) {
    return res.status(500).json({ type: 'error', message: err.message || 'Failed to send test email' });
  }
});

module.exports = router;


