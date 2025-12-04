const { query } = require('../db');

const roleRank = { user: 1, admin: 2, superadmin: 3 };

// User model helpers: fetch users, create new accounts, and expose role ordering for authorization checks.
const findUserByEmail = async (email) => {
  const { rows } = await query(
    'SELECT id, email, password_hash AS "passwordHash", role FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
};

const findUserById = async (id) => {
  const { rows } = await query('SELECT id, email, role FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

const createUser = async (email, passwordHash, role = 'user') => {
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, passwordHash, role]
  );
  return rows[0];
};

module.exports = {
  roleRank,
  findUserByEmail,
  findUserById,
  createUser,
};
