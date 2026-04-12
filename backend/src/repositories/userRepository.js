const pool = require('../config/db');

async function getAllUsers() {
  const result = await pool.query(
    'SELECT user_id, name, username, role, created_date FROM users ORDER BY user_id'
  );
  return result.rows;
}
async function createUser({ name, username, password }) {
  const result = await pool.query(
    `INSERT INTO users (name, username, password)
     VALUES ($1, $2, $3)
     RETURNING user_id, name, username, role, created_date`,
    [name, username, password]
  );

  return result.rows[0];
}

async function findUserByUsername(username) {
  const result = await pool.query(
    `SELECT user_id, name, username, password, role, created_date
     FROM users
     WHERE username = $1`,
    [username]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAllUsers,
  createUser,
  findUserByUsername
};
