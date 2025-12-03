const { query } = require('../db');

const createFileShare = async ({ fileId, signedToken, expiresAt, sharedWithUserId = null, createdBy }) => {
  const { rows } = await query(
    `INSERT INTO file_shares (file_id, signed_token, expires_at, shared_with_user_id, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, file_id AS "fileId", signed_token AS "signedToken",
               expires_at AS "expiresAt", shared_with_user_id AS "sharedWithUserId",
               created_by AS "createdBy", created_at AS "createdAt"`,
    [fileId, signedToken, new Date(expiresAt), sharedWithUserId, createdBy]
  );
  return rows[0];
};

const findShareByToken = async (token) => {
  const { rows } = await query(
    `SELECT id, file_id AS "fileId", signed_token AS "signedToken",
            extract(epoch from expires_at) * 1000 AS "expiresAt",
            shared_with_user_id AS "sharedWithUserId",
            created_by AS "createdBy", created_at AS "createdAt"
     FROM file_shares
     WHERE signed_token = $1`,
    [token]
  );
  return rows[0] || null;
};

const deleteShare = async (token) =>
  query('DELETE FROM file_shares WHERE signed_token = $1', [token]);

const purgeExpiredShares = async () =>
  query('DELETE FROM file_shares WHERE expires_at <= NOW()');

module.exports = {
  createFileShare,
  findShareByToken,
  deleteShare,
  purgeExpiredShares,
};
