const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const { register, createManagedUser, login, refreshTokens } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/manage', authRequired, requireRole(['superadmin']), createManagedUser);
router.post('/login', login);
router.post('/refresh', refreshTokens);

module.exports = router;
