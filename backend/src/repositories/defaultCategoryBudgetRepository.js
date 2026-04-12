const pool = require('../config/db');

async function listExpenseCategories() {
  const result = await pool.query(
    `SELECT category_id, category_name
     FROM categories
     WHERE type = 'expense' AND category_name <> 'All Categories'
     ORDER BY category_name`
  );
  return result.rows;
}

async function listExpenseCategoryIds() {
  const rows = await listExpenseCategories();
  return new Set(rows.map((r) => Number(r.category_id)));
}

async function getUserDefaultCategoryBudgetRows(userId) {
  const cats = await listExpenseCategories();

  const budgetMap = new Map();
  try {
    const bud = await pool.query(
      `SELECT category_id, default_amount
       FROM default_category_budgets
       WHERE user_id = $1`,
      [userId]
    );
    for (const row of bud.rows) {
      budgetMap.set(Number(row.category_id), row.default_amount);
    }
  } catch (err) {
    if (err.code !== '42P01') {
      throw err;
    }
  }

  return cats.map((c) => {
    const id = Number(c.category_id);
    return {
      category_id: c.category_id,
      category_name: c.category_name,
      default_amount: budgetMap.has(id) ? budgetMap.get(id) : null
    };
  });
}

async function replaceUserDefaultCategoryBudgets(userId, budgets) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of budgets) {
      const categoryId = Number(row.category_id);
      const raw = row.default_amount;
      const amt =
        raw === null || raw === undefined || raw === ''
          ? null
          : Number(raw);
      if (!Number.isFinite(categoryId) || categoryId <= 0) continue;

      if (amt == null || !Number.isFinite(amt) || amt <= 0) {
        await client.query(
          `DELETE FROM default_category_budgets
           WHERE user_id = $1 AND category_id = $2`,
          [userId, categoryId]
        );
      } else {
        await client.query(
          `INSERT INTO default_category_budgets (user_id, category_id, default_amount)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, category_id)
           DO UPDATE SET default_amount = EXCLUDED.default_amount`,
          [userId, categoryId, amt]
        );
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  listExpenseCategories,
  listExpenseCategoryIds,
  getUserDefaultCategoryBudgetRows,
  replaceUserDefaultCategoryBudgets
};
