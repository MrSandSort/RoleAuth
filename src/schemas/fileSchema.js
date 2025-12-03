const { z } = require('zod');

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.number().int().positive().optional().nullable(),
});

const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  folderId: z.number().int().positive().optional().nullable(),
  encryptedKey: z.string().min(1),
  encryptionHeader: z.record(z.any()),
  hash: z.string().min(1).optional(),
});

const listSchema = z.object({
  folderId: z
    .string()
    .transform((val) => (val === '' ? null : Number(val)))
    .pipe(z.number().int().nonnegative().nullable())
    .optional(),
});

const shareCreateSchema = z.object({
  expiresInHours: z.number().int().positive().max(24 * 30).default(24),
  sharedWithUserId: z.number().int().positive().optional(),
});

module.exports = {
  createFolderSchema,
  uploadRequestSchema,
  listSchema,
  shareCreateSchema,
};
