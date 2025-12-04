const { z } = require('zod');

// Zod schemas for auth flows: credential validation, managed user creation, and refresh token payloads.
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const manageUserSchema = credentialsSchema.extend({
  role: z.enum(['user', 'admin', 'superadmin']).default('user'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

module.exports = {
  credentialsSchema,
  manageUserSchema,
  refreshTokenSchema,
};
