const userService = require('../services/userService');

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
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const user = await userService.loginUser(req.body);
    res.status(200).json({
      message: 'Login successful',
      user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  registerUser,
  loginUser
};
