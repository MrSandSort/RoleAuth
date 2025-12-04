const { query } = require('../db');

// Folder model: creates folders, lists children for an owner/parent, and fetches individual folder records.
const createFolder = async (ownerId, name, parentId = null) => {
  const { rows } = await query(
    `INSERT INTO folders (owner_id, name, parent_id)
     VALUES ($1, $2, $3)
     RETURNING id, owner_id AS "ownerId", name, parent_id AS "parentId", created_at AS "createdAt"`,
    [ownerId, name, parentId]
  );
  return rows[0];
};

const listFolders = async (ownerId, parentId = null) => {
  const { rows } = await query(
    `SELECT id, owner_id AS "ownerId", name, parent_id AS "parentId", created_at AS "createdAt"
     FROM folders
     WHERE owner_id = $1 AND (parent_id IS NOT DISTINCT FROM $2)
     ORDER BY name ASC`,
    [ownerId, parentId]
  );
  return rows;
};

const findFolderById = async (id) => {
  const { rows } = await query(
    `SELECT id, owner_id AS "ownerId", name, parent_id AS "parentId", created_at AS "createdAt"
     FROM folders
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  createFolder,
  listFolders,
  findFolderById,
};
