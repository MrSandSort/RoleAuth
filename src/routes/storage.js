const express = require('express');
const { authRequired, maybeAuth } = require('../middleware/auth');
const { createFolder, listFolderContents } = require('../controllers/folderController');
const { createUploadRequest, listFiles, getDownloadUrlForFile } = require('../controllers/fileController');
const { createShareLink, redeemShare } = require('../controllers/shareController');

const router = express.Router();

router.post('/folders', authRequired, createFolder);
router.get('/folders', authRequired, listFolderContents);

router.post('/files/presign', authRequired, createUploadRequest);
router.get('/files', authRequired, listFiles);
router.get('/files/:id/download', authRequired, getDownloadUrlForFile);

router.post('/files/:id/share', authRequired, createShareLink);
router.post('/shares/:token/redeem', maybeAuth, redeemShare);

module.exports = router;
