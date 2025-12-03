const db = require('../db');

db.exec(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
`);

const saveRefreshToken = (token, userId, expiresAt) => {
  db.prepare('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    expiresAt
  );
  return { token, userId, expiresAt };
};

const findRefreshToken = (token) =>
  db.prepare('SELECT token, user_id as userId, expires_at as expiresAt FROM refresh_tokens WHERE token = ?').get(token);

const deleteRefreshToken = (token) =>
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);

const purgeExpiredRefreshTokens = () =>
  db.prepare('DELETE FROM refresh_tokens WHERE expires_at <= ?').run(Date.now());

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  purgeExpiredRefreshTokens,
};
