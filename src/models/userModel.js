const db = require('../db');

const roleRank = { user: 1, admin: 2, superadmin: 3 };

// Ensure table exists on module load so dependent code can rely on it.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'admin', 'superadmin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const findUserByEmail = (email) =>
  db
    .prepare('SELECT id, email, password_hash as passwordHash, role FROM users WHERE email = ?')
    .get(email);

const findUserById = (id) =>
  db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(id);

const createUser = (email, passwordHash, role = 'user') => {
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash, role) VALUES (@email, @passwordHash, @role)'
  );
  const result = stmt.run({ email, passwordHash, role });
  return findUserById(result.lastInsertRowid);
};

module.exports = {
  roleRank,
  findUserByEmail,
  findUserById,
  createUser,
};
