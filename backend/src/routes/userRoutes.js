const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getUsers);
router.get(
  '/:id/default-category-budgets',
  userController.getUserDefaultCategoryBudgets
);
router.put(
  '/:id/default-category-budgets',
  userController.saveUserDefaultCategoryBudgets
);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

module.exports = router;
