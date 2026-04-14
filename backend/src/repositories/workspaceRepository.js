const pool = require("../config/db");
let schemaReadyPromise = null;

async function ensureWorkspaceSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
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
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }

  await schemaReadyPromise;
}

async function listGroupsForUser(userId) {
  await ensureWorkspaceSchema();
  const result = await pool.query(
    `SELECT w.workspace_id,
            w.name,
            w.description,
            w.owner_id,
            owner.username AS owner_username,
            wm.status,
            COALESCE(member_counts.members, 0) AS members,
            COALESCE(tx_totals.total_income, 0) AS income,
            COALESCE(ABS(tx_totals.total_expenses), 0) AS expenses
     FROM workspace_members wm
     JOIN workspaces w ON w.workspace_id = wm.workspace_id
     JOIN users owner ON owner.user_id = w.owner_id
     LEFT JOIN (
       SELECT workspace_id,
              SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS total_income,
              SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) AS total_expenses
       FROM transactions
       WHERE workspace_type = 'group'
       GROUP BY workspace_id
     ) tx_totals ON tx_totals.workspace_id = w.workspace_id
     LEFT JOIN (
       SELECT workspace_id, COUNT(*)::INTEGER AS members
       FROM workspace_members
       WHERE status = 'accepted'
       GROUP BY workspace_id
     ) member_counts ON member_counts.workspace_id = w.workspace_id
     WHERE wm.user_id = $1
       AND w.type = 'group'
     ORDER BY w.created_at DESC, w.workspace_id DESC`,
    [userId],
  );

  return result.rows;
}

async function createGroup({ ownerId, name, description }) {
  await ensureWorkspaceSchema();
  const result = await pool.query(
    `INSERT INTO workspaces (name, description, type, owner_id)
     VALUES ($1, $2, 'group', $3)
     RETURNING workspace_id, name, description, owner_id, created_at`,
    [name, description || null, ownerId],
  );

  return result.rows[0];
}

async function upsertWorkspaceMembership({
  workspaceId,
  userId,
  status,
  invitedBy,
}) {
  await ensureWorkspaceSchema();
  const result = await pool.query(
    `INSERT INTO workspace_members (workspace_id, user_id, status, invited_by, responded_at)
     VALUES (
       $1::INTEGER,
       $2::INTEGER,
       $3::VARCHAR(20),
       $4::INTEGER,
       CASE WHEN $3::VARCHAR(20) = 'pending' THEN NULL ELSE CURRENT_TIMESTAMP END
     )
     ON CONFLICT (workspace_id, user_id)
     DO UPDATE SET
       status = EXCLUDED.status,
       invited_by = EXCLUDED.invited_by,
       responded_at = CASE
         WHEN EXCLUDED.status = 'pending' THEN NULL
         ELSE CURRENT_TIMESTAMP
       END
     RETURNING workspace_member_id, workspace_id, user_id, status, invited_by, responded_at, created_at`,
    [workspaceId, userId, status, invitedBy || null],
  );
  return result.rows[0];
}

async function findWorkspaceById(workspaceId) {
  await ensureWorkspaceSchema();
  const result = await pool.query(
    `SELECT workspace_id, name, description, type, owner_id, created_at
     FROM workspaces
     WHERE workspace_id = $1`,
    [workspaceId],
  );
  return result.rows[0] || null;
}

async function findWorkspaceMembership(workspaceId, userId) {
  await ensureWorkspaceSchema();
  const result = await pool.query(
    `SELECT workspace_member_id, workspace_id, user_id, status, invited_by, responded_at, created_at
     FROM workspace_members
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId],
  );

  return result.rows[0] || null;
}

async function deleteWorkspaceById(workspaceId) {
  await ensureWorkspaceSchema();
  const result = await pool.query(
    `DELETE FROM workspaces
     WHERE workspace_id = $1
     RETURNING workspace_id`,
    [workspaceId],
  );
  return result.rows[0] || null;
}

module.exports = {
  listGroupsForUser,
  createGroup,
  upsertWorkspaceMembership,
  findWorkspaceById,
  findWorkspaceMembership,
  deleteWorkspaceById,
};
