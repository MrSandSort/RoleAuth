const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

router.get('/admin', authRequired, requireRole(['admin']), (_req, res) => {
  res.json({ message: 'Hello admin, you have elevated access.' });
});

router.get('/superadmin', authRequired, requireRole(['superadmin']), (_req, res) => {
  res.json({ message: 'Hello superadmin, you have the highest access.' });
});

module.exports = router;
