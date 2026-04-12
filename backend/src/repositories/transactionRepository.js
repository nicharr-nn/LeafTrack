const pool = require('../config/db');

async function findCategoryId(categoryName, type) {
  if (!categoryName) return null;
  const result = await pool.query(
    `SELECT category_id FROM categories
     WHERE category_name = $1 AND type = $2
     LIMIT 1`,
    [categoryName, type]
  );
  return result.rows[0]?.category_id ?? null;
}

async function listTransactions(filters = {}) {
  const conditions = [];
  const values = [];
  let i = 1;

  if (filters.user_id != null) {
    conditions.push(`t.user_id = $${i}`);
    values.push(filters.user_id);
    i += 1;
  }

  if (filters.workspace_type) {
    conditions.push(`t.workspace_type = $${i}`);
    values.push(filters.workspace_type);
    i += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT t.transaction_id, t.type, t.amount, t.description, t.date,
            t.workspace_type, t.created_at,
            COALESCE(c.category_name, 'Other') AS category
     FROM transactions t
     LEFT JOIN categories c ON c.category_id = t.category_id
     ${where}
     ORDER BY t.date DESC, t.transaction_id DESC`,
    values
  );

  return result.rows;
}

async function createTransaction({
  user_id,
  category_id,
  type,
  amount,
  description,
  date,
  workspace_type
}) {
  const result = await pool.query(
    `INSERT INTO transactions
      (user_id, category_id, type, amount, description, date, workspace_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING transaction_id, type, amount, description, date, workspace_type, created_at`,
    [user_id, category_id, type, amount, description, date, workspace_type]
  );

  return result.rows[0];
}

async function deleteTransaction(transactionId, userId) {
  const result = await pool.query(
    `DELETE FROM transactions
     WHERE transaction_id = $1 AND user_id = $2
     RETURNING transaction_id`,
    [transactionId, userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  findCategoryId,
  listTransactions,
  createTransaction,
  deleteTransaction
};
