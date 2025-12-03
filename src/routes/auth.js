const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const { register, createManagedUser, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/manage', authRequired, requireRole(['superadmin']), createManagedUser);
router.post('/login', login);

module.exports = router;
