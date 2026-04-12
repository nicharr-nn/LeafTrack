require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  await pool.query(schemaSql);
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    UPDATE users SET name = username WHERE name IS NULL;
    ALTER TABLE users ALTER COLUMN name SET NOT NULL;
  `);
  await pool.query(`
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS workspace_type VARCHAR(20);
  `);
  await pool.query(`
    ALTER TABLE transactions ALTER COLUMN workspace_type SET DEFAULT 'personal';
  `);
  await pool.query(`
    UPDATE transactions SET workspace_type = 'personal' WHERE workspace_type IS NULL;
  `);
  await pool.query(`
    ALTER TABLE transactions ALTER COLUMN workspace_type SET NOT NULL;
  `);

  console.log('Database initialized successfully. users table is ready.');
}

initializeDatabase()
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
