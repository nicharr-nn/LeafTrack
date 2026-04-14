const defaultCategoryBudgetService = require("../services/defaultCategoryBudgetService");

async function getUserBudgets(req, res, next) {
  try {
    const userId = req.query.user_id;
    const budgets = await defaultCategoryBudgetService.getUserBudgets(userId);
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
}

async function updateUserBudgets(req, res, next) {
  try {
    const userId = req.body.user_id;
    const budgets = req.body.budgets;
    await defaultCategoryBudgetService.updateUserBudgets(userId, budgets);
    res.status(200).json({ message: "Budgets updated successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserBudgets,
  updateUserBudgets,
};
