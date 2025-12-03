const { Pool } = require('pg');

const connectionOptions = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'postgres',
    };

const pool = new Pool(connectionOptions);

const query = (text, params) => pool.query(text, params);

const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'superadmin')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);`);

  await query(`
    CREATE TABLE IF NOT EXISTS folders (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_folders_owner ON folders(owner_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);`);

  await query(`
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
      s3_key TEXT NOT NULL UNIQUE,
      filename TEXT NOT NULL,
      size BIGINT,
      content_type TEXT,
      encrypted_key TEXT,
      encryption_header JSONB,
      hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_files_owner ON files(owner_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);`);

  await query(`
    CREATE TABLE IF NOT EXISTS file_shares (
      id SERIAL PRIMARY KEY,
      file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
      signed_token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      shared_with_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_file_shares_file ON file_shares(file_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_file_shares_expires ON file_shares(expires_at);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON file_shares(shared_with_user_id);`);
};

module.exports = {
  pool,
  query,
  initDb,
};
