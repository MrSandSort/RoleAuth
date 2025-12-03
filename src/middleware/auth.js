const jwt = require('jsonwebtoken');
const { findUserById, roleRank } = require('../models/userModel');

const authRequired = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Invalid Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const maybeAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return next();
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Invalid Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const hasRole = (userRole, allowedRoles) =>
  allowedRoles.some((role) => roleRank[userRole] >= roleRank[role]);

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(500).json({ error: 'User not loaded before role check' });
  }

  if (!hasRole(req.user.role, allowedRoles)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  next();
};

module.exports = {
  authRequired,
  maybeAuth,
  requireRole,
};
