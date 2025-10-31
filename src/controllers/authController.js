const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config').jwt;
const { User } = require('../models');

exports.register = async (req, res, next) => {
  try {
    const { username, password, fullName } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username & password required' });
    const salt = parseInt(process.env.BCRYPT_SALT || '10', 10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = await User.create({ username, passwordHash, fullName, role: 'USER' });
    res.json({ id: user.id, username: user.username });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !user.checkPassword(password)) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, role: user.role }, config.secret, { expiresIn: config.expiresIn });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) { next(err); }
};
