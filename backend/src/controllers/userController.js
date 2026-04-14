const userService = require("../services/userService");

async function getUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}
async function registerUser(req, res, next) {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const user = await userService.loginUser(req.body);
    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserDefaultCategoryBudgets(req, res, next) {
  try {
    const { id } = req.params;
    const budgets = await userService.getUserDefaultCategoryBudgets(id);
    res.status(200).json({ budgets });
  } catch (error) {
    next(error);
  }
}

async function saveUserDefaultCategoryBudgets(req, res, next) {
  try {
    const { id } = req.params;
    const budgets = await userService.saveUserDefaultCategoryBudgets(
      id,
      req.body,
    );
    res.status(200).json({
      message: "Default category budgets saved successfully",
      budgets,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  registerUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  getUserDefaultCategoryBudgets,
  saveUserDefaultCategoryBudgets,
};
