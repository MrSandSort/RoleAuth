require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { seedSuperAdmin } = require('./seeds/seedSuperAdmin');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be set in your environment');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;

const start = async () => {
  await initDb();
  await seedSuperAdmin();
  app.listen(PORT, () => {
    console.log(`Auth server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
