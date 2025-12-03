const { query } = require('../db');

const saveRefreshToken = async (token, userId, expiresAt) => {
  await query(
    'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, new Date(expiresAt)]
  );
  return { token, userId, expiresAt };
};

const findRefreshToken = async (token) => {
  const { rows } = await query(
    'SELECT token, user_id AS "userId", extract(epoch from expires_at) * 1000 AS "expiresAt" FROM refresh_tokens WHERE token = $1',
    [token]
  );
  return rows[0] || null;
};

const deleteRefreshToken = async (token) =>
  query('DELETE FROM refresh_tokens WHERE token = $1', [token]);

const purgeExpiredRefreshTokens = async () =>
  query('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  purgeExpiredRefreshTokens,
};
