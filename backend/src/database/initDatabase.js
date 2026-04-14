require("dotenv").config();
const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require("../config/db");

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");

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
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(workspace_id) ON DELETE SET NULL;
  `);
  await pool.query(`
    ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description TEXT;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_member_id SERIAL PRIMARY KEY,
      workspace_id INTEGER NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
      invited_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      responded_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (workspace_id, user_id)
    );
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
  await pool.query(`
    ALTER TABLE default_category_budgets
    ALTER COLUMN default_amount DROP NOT NULL;
  `);

  console.log("Database initialized successfully. users table is ready.");
}

initializeDatabase()
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
