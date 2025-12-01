const express = require('express');
const { verifyToken } = require('./auth');
const User = require('../models/User');
const EmailAccount = require('../models/EmailAccount');

const router = express.Router();

// Middleware for admin only
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso riservato agli admin' });
  }
  next();
};

router.use(verifyToken, isAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
});

// Get all email accounts
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await EmailAccount.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: User, attributes: ['username', 'email'] }]
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero degli account' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    user.role = role;
    await user.save();
    res.json({ message: 'Ruolo aggiornato' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    await user.destroy();
    res.json({ message: 'Utente eliminato' });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione' });
  }
});

module.exports = router;