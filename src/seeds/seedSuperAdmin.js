const bcrypt = require('bcrypt');
const { createUser, findUserByEmail } = require('../models/userModel');

const seedSuperAdmin = async () => {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are not set. Skipping superadmin seed.');
    return;
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  createUser(email, passwordHash, 'superadmin');
  console.log(`Seeded superadmin account for ${email}`);
};

module.exports = { seedSuperAdmin };
