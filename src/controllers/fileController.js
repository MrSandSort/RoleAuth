const crypto = require('crypto');
const { uploadRequestSchema, listSchema } = require('../schemas/fileSchema');
const { findFolderById } = require('../models/folderModel');
const { createFileMetadata, listFilesInFolder, findFileById } = require('../models/fileModel');
const { generateObjectKey, getUploadUrl, getDownloadUrl } = require('../services/storageService');

// File controller: validates upload/download requests, persists file metadata, and returns signed storage URLs.
const createUploadRequest = async (req, res) => {
  const parsed = uploadRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const { filename, contentType, size, folderId = null, encryptedKey, encryptionHeader, hash } =
    parsed.data;

  if (folderId) {
    const folder = await findFolderById(folderId);
    if (!folder || folder.ownerId !== req.user.id) {
      return res.status(404).json({ error: 'Folder not found' });
    }
  }

  const s3Key = generateObjectKey(req.user.id, filename);
  const file = await createFileMetadata({
    ownerId: req.user.id,
    folderId,
    s3Key,
    filename,
    size,
    contentType,
    encryptedKey,
    encryptionHeader,
    hash,
  });
  const uploadUrl = await getUploadUrl({ key: s3Key, contentType });

  return res.status(201).json({ file, uploadUrl });
};

const listFiles = async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const folderId = parsed.data.folderId ?? null;

  if (folderId !== null) {
    const folder = await findFolderById(folderId);
    if (!folder || folder.ownerId !== req.user.id) {
      return res.status(404).json({ error: 'Folder not found' });
    }
  }

  const files = await listFilesInFolder(req.user.id, folderId);
  return res.json({ files, folderId });
};

const getDownloadUrlForFile = async (req, res) => {
  const fileId = Number(req.params.id);
  if (Number.isNaN(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  const file = await findFileById(fileId);
  if (!file || file.ownerId !== req.user.id) {
    return res.status(404).json({ error: 'File not found' });
  }

  const downloadUrl = await getDownloadUrl({ key: file.s3Key });
  return res.json({ file, downloadUrl });
};

module.exports = {
  createUploadRequest,
  listFiles,
  getDownloadUrlForFile,
};
