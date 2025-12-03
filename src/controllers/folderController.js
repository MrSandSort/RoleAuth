const { createFolderSchema, listSchema } = require('../schemas/fileSchema');
const { createFolder, listFolders, findFolderById } = require('../models/folderModel');
const { listFilesInFolder } = require('../models/fileModel');

const createFolderHandler = async (req, res) => {
  const parsed = createFolderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const { name, parentId = null } = parsed.data;

  if (parentId) {
    const parent = await findFolderById(parentId);
    if (!parent || parent.ownerId !== req.user.id) {
      return res.status(404).json({ error: 'Parent folder not found' });
    }
  }

  const folder = await createFolder(req.user.id, name, parentId);
  return res.status(201).json({ folder });
};

const listFolderContents = async (req, res) => {
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

  const [folders, files] = await Promise.all([
    listFolders(req.user.id, folderId),
    listFilesInFolder(req.user.id, folderId),
  ]);

  return res.json({ folders, files, folderId });
};

module.exports = {
  createFolder: createFolderHandler,
  listFolderContents,
};
