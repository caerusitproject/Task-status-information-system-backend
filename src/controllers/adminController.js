const express = require('express');
const { Setting, User } = require('../models');
const { authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// only ADMIN can manage settings & users
router.use(authorizeRoles('ADMIN'));

router.get('/settings', async (req, res, next) => {
  try { const s = await Setting.findAll(); res.json(s); } catch (e) { next(e); }
});

router.post('/settings', async (req, res, next) => {
  try { const setting = await Setting.create(req.body); res.status(201).json(setting); } catch (e) { next(e); }
});

router.put('/settings/:id', async (req, res, next) => {
  try {
    const s = await Setting.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.update(req.body);
    res.json(s);
  } catch (e) { next(e); }
});

router.delete('/settings/:id', async (req, res, next) => {
  try {
    const s = await Setting.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    await s.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

// Manage users - simple create admin
router.post('/users', async (req, res, next) => {
  try {
    const { username, password, role, fullName } = req.body;
    const bcrypt = require('bcryptjs');
    const salt = parseInt(process.env.BCRYPT_SALT || '10', 10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = await User.create({ username, passwordHash, role: role || 'USER', fullName });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (e) { next(e); }
});

module.exports = { router };
