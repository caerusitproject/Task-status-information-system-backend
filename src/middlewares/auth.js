const jwt = require('jsonwebtoken');
const config = require('../../config/config').jwt;
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.secret);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = { id: user.id, role: user.role, username: user.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid', error: err.message });
  }
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).end();
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
