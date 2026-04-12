const express = require('express');
const defaultCategoryBudgetRepository = require('../repositories/defaultCategoryBudgetRepository');

const router = express.Router();

router.get('/expense', async (_req, res, next) => {
  try {
    const categories = await defaultCategoryBudgetRepository.listExpenseCategories();
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
