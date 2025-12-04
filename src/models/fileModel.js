const { query } = require('../db');

// File model: persists file metadata, lists files per owner/folder, and fetches individual file records.
const createFileMetadata = async ({
  ownerId,
  folderId = null,
  s3Key,
  filename,
  size,
  contentType,
  encryptedKey,
  encryptionHeader,
  hash,
}) => {
  const { rows } = await query(
    `INSERT INTO files (owner_id, folder_id, s3_key, filename, size, content_type, encrypted_key, encryption_header, hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, owner_id AS "ownerId", folder_id AS "folderId", s3_key AS "s3Key",
               filename, size, content_type AS "contentType", encrypted_key AS "encryptedKey",
               encryption_header AS "encryptionHeader", hash,
               created_at AS "createdAt", updated_at AS "updatedAt"`,
    [ownerId, folderId, s3Key, filename, size, contentType, encryptedKey, encryptionHeader, hash]
  );
  return rows[0];
};

const listFilesInFolder = async (ownerId, folderId = null) => {
  const { rows } = await query(
    `SELECT id, owner_id AS "ownerId", folder_id AS "folderId", s3_key AS "s3Key",
            filename, size, content_type AS "contentType", encrypted_key AS "encryptedKey",
            encryption_header AS "encryptionHeader", hash, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM files
     WHERE owner_id = $1 AND (folder_id IS NOT DISTINCT FROM $2)
     ORDER BY created_at DESC`,
    [ownerId, folderId]
  );
  return rows;
};

const findFileById = async (id) => {
  const { rows } = await query(
    `SELECT id, owner_id AS "ownerId", folder_id AS "folderId", s3_key AS "s3Key",
            filename, size, content_type AS "contentType", encrypted_key AS "encryptedKey",
            encryption_header AS "encryptionHeader", hash, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM files
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  createFileMetadata,
  listFilesInFolder,
  findFileById,
};
