const express = require('express');
const { verifyToken } = require('./auth');
const Email = require('../models/Email');
const EmailAccount = require('../models/EmailAccount');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const router = express.Router();

// Get emails for account
router.get('/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { folder = 'INBOX', page = 1, limit = 20 } = req.query;
    
    const account = await EmailAccount.findByPk(accountId);
    if (!account || account.userId !== req.user.id) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    // For now, return from DB; later integrate with IMAP
    const emails = await Email.findAll({
      where: { accountId, folder },
      order: [['receivedDate', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero delle email' });
  }
});

// Send email
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { accountId, to, subject, body, attachments } = req.body;
    
    const account = await EmailAccount.findByPk(accountId);
    if (!account || account.userId !== req.user.id) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpPort === 465,
      auth: {
        user: account.address,
        pass: account.password
      }
    });
    
    const mailOptions = {
      from: account.address,
      to,
      subject,
      html: body,
      attachments
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Save to sent folder (later with IMAP)
    await Email.create({
      accountId,
      messageId: info.messageId,
      subject,
      from: account.address,
      to,
      bodyHtml: body,
      sentDate: new Date(),
      folder: 'Sent'
    });
    
    res.json({ message: 'Email inviata', id: info.messageId });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'invio dell\'email', details: error.message });
  }
});

// Fetch new emails (sync with IMAP)
router.post('/sync/:accountId', verifyToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await EmailAccount.findByPk(accountId);
    if (!account || account.userId !== req.user.id) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    const imap = new Imap({
      user: account.address,
      password: account.password,
      host: account.imapHost,
      port: account.imapPort,
      tls: account.imapPort === 993,
      tlsOptions: { rejectUnauthorized: false }
    });
    
    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        
        imap.search(['UNSEEN'], (err, results) => {
          if (err) throw err;
          
          if (results.length === 0) {
            imap.end();
            return res.json({ message: 'Nessuna nuova email' });
          }
          
          const f = imap.fetch(results, { bodies: '' });
          f.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) console.error(err);
                
                await Email.create({
                  accountId,
                  messageId: parsed.messageId,
                  subject: parsed.subject,
                  from: parsed.from.text,
                  to: parsed.to.text,
                  bodyText: parsed.text,
                  bodyHtml: parsed.html,
                  receivedDate: parsed.date,
                  attachments: parsed.attachments?.map(att => ({
                    filename: att.filename,
                    contentType: att.contentType,
                    size: att.size
                  })) || [],
                  size: stream.bytes
                });
              });
            });
          });
          
          f.once('end', () => {
            imap.end();
            res.json({ message: `${results.length} nuove email sincronizzate` });
          });
        });
      });
    });
    
    imap.once('error', (err) => {
      res.status(500).json({ error: 'Errore IMAP', details: err.message });
    });
    
    imap.connect();
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la sincronizzazione' });
  }
});

module.exports = router;