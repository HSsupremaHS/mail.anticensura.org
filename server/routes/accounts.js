const express = require('express');
const { verifyToken } = require('./auth');
const EmailAccount = require('../models/EmailAccount');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }
  next();
};

// Create new email account
router.post('/', verifyToken, async (req, res) => {
  try {
    const { address, password } = req.body;
    const userId = req.user.id;
    
    if (!address.endsWith('@anticensura.org')) {
      return res.status(400).json({ error: 'Indirizzo email deve terminare con @anticensura.org' });
    }
    
    const existing = await EmailAccount.findOne({ where: { address } });
    if (existing) {
      return res.status(400).json({ error: 'Indirizzo email già in uso' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const account = await EmailAccount.create({
      userId,
      address,
      password: hashedPassword
    });
    
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la creazione dell\'account' });
  }
});

// Get all accounts for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const accounts = await EmailAccount.findAll({
      where: { userId: req.user.id },
      attributes: { exclude: ['password'] }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero degli account' });
  }
});

// Update account
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    const account = await EmailAccount.findByPk(req.params.id);
    
    if (!account || account.userId !== req.user.id) {
      return res.status(404).json({ error: 'Account non trovato' });
    }
    
    if (password) {
      account.password = await bcrypt.hash(password, 12);
    }
    
    await account.save();
    res.json({ message: 'Account aggiornato' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
  }
});

// Delete account (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const account = await EmailAccount.findByPk(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Account non trovato' });
    }
    
    await account.destroy();
    res.json({ message: 'Account eliminato' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione' });
  }
});

module.exports = router;