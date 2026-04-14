const defaultCategoryBudgetRepository = require("../repositories/defaultCategoryBudgetRepository");

async function getUserBudgets(userId) {
  if (!userId || Number.isNaN(Number(userId))) {
    const error = new Error("user_id is required");
    error.statusCode = 400;
    throw error;
  }

  return defaultCategoryBudgetRepository.getUserDefaultCategoryBudgetRows(
    userId,
  );
}

async function updateUserBudgets(userId, budgets) {
  if (!userId || Number.isNaN(Number(userId))) {
    const error = new Error("user_id is required");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(budgets)) {
    const error = new Error("budgets must be an array");
    error.statusCode = 400;
    throw error;
  }

  await defaultCategoryBudgetRepository.replaceUserDefaultCategoryBudgets(
    userId,
    budgets,
  );
}

module.exports = {
  getUserBudgets,
  updateUserBudgets,
};
