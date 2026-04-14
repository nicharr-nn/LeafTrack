const express = require("express");
const defaultCategoryBudgetController = require("../controllers/defaultCategoryBudgetController");

const router = express.Router();

router.get("/", defaultCategoryBudgetController.getUserBudgets);
router.put("/", defaultCategoryBudgetController.updateUserBudgets);

module.exports = router;
