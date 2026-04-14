const pool = require("../config/db");

async function getAllUsers() {
  const result = await pool.query(
    "SELECT user_id, name, username, role, created_date FROM users ORDER BY user_id",
  );
  return result.rows;
}
async function createUser({ name, username, password, role = "user" }) {
  const result = await pool.query(
    `INSERT INTO users (name, username, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, name, username, role, created_date`,
    [name, username, password, role],
  );

  return result.rows[0];
}

async function findUserByUsername(username) {
  const result = await pool.query(
    `SELECT user_id, name, username, password, role, created_date
     FROM users
     WHERE username = $1`,
    [username],
  );
  return result.rows[0] || null;
}

async function findUserById(userId) {
  const result = await pool.query(
    `SELECT user_id, name, username, role, created_date
     FROM users
     WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0] || null;
}

async function updateUser(userId, { name, username, password }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (username !== undefined) {
    fields.push(`username = $${paramIndex++}`);
    values.push(username);
  }
  if (password !== undefined) {
    fields.push(`password = $${paramIndex++}`);
    values.push(password);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(userId);

  const result = await pool.query(
    `UPDATE users
     SET ${fields.join(", ")}
     WHERE user_id = $${paramIndex}
     RETURNING user_id, name, username, role, created_date`,
    values,
  );

  if (result.rows.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

async function deleteUser(userId) {
  const result = await pool.query(
    "DELETE FROM users WHERE user_id = $1 RETURNING user_id",
    [userId],
  );

  if (result.rows.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  getAllUsers,
  createUser,
  findUserByUsername,
  findUserById,
  updateUser,
  deleteUser,
};
