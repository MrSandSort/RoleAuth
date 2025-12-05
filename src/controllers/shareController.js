const crypto = require('crypto');
const { shareCreateSchema } = require('../schemas/fileSchema');
const { findFileById } = require('../models/fileModel');
const { createFileShare, findShareByToken, deleteShare, purgeExpiredShares } = require('../models/fileShareModel');
const { findUserById } = require('../models/userModel');
const { getDownloadUrl } = require('../services/storageService');

// Share controller: creates signed share links with optional user scoping and redeems them for temporary download URLs.

const createShareLink = async (req, res) => {
  const fileId = Number(req.params.id);
  if (Number.isNaN(fileId)) {
    return res.status(400).json({ error: 'Invalid file id' });
  }

  const file = await findFileById(fileId);
  if (!file || file.ownerId !== req.user.id) {
    return res.status(404).json({ error: 'File not found' });
  }

  const parsed = shareCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const { expiresInHours, sharedWithUserId } = parsed.data;

  if (sharedWithUserId) {
    const targetUser = await findUserById(sharedWithUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Shared-with user not found' });
    }
  }

  await purgeExpiredShares();

  const signedToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;

  const share = await createFileShare({
    fileId: file.id,
    signedToken,
    expiresAt,
    sharedWithUserId: sharedWithUserId || null,
    createdBy: req.user.id,
  });

  return res.status(201).json({ shareToken: share.signedToken, expiresAt });
};

const redeemShare = async (req, res) => {
  const { token } = req.params;
  await purgeExpiredShares();

  const share = await findShareByToken(token);
  if (!share) {
    return res.status(404).json({ error: 'Share not found or expired' });
  }
  if (share.expiresAt <= Date.now()) {
    await deleteShare(token);
    return res.status(404).json({ error: 'Share expired' });
  }

  if (share.sharedWithUserId) {
    if (!req.user || req.user.id !== share.sharedWithUserId) {
      return res.status(403).json({ error: 'This share is not for your account' });
    }
  }

  const file = await findFileById(share.fileId);
  if (!file) {
    await deleteShare(token);
    return res.status(404).json({ error: 'File not found' });
  }

  const downloadUrl = await getDownloadUrl({ key: file.s3Key });
  return res.json({ downloadUrl, file, expiresAt: share.expiresAt });
};

module.exports = {
  createShareLink,
  redeemShare,
};
