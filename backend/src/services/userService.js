const userRepository = require("../repositories/userRepository");
const defaultCategoryBudgetRepository = require("../repositories/defaultCategoryBudgetRepository");

async function listUsers() {
  return userRepository.getAllUsers();
}
async function registerUser(payload) {
  const { name, username, password } = payload;

  if (!name || !username || !password) {
    const error = new Error("name, username, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const sanitizedUser = {
    name: name.trim(),
    username: username.trim(),
    password: password.trim(),
  };

  if (
    !sanitizedUser.name ||
    !sanitizedUser.username ||
    !sanitizedUser.password
  ) {
    const error = new Error("name, username, and password are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    return await userRepository.createUser(sanitizedUser);
  } catch (error) {
    if (error.code === "23505") {
      const conflictError = new Error("Username already exists");
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
}

async function createAdminUser(payload) {
  const { name, username, password } = payload;

  if (!name || !username || !password) {
    const error = new Error("name, username, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const sanitizedUser = {
    name: name.trim(),
    username: username.trim(),
    password: password.trim(),
    role: "admin",
  };

  if (
    !sanitizedUser.name ||
    !sanitizedUser.username ||
    !sanitizedUser.password
  ) {
    const error = new Error("name, username, and password are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    return await userRepository.createUser(sanitizedUser);
  } catch (error) {
    if (error.code === "23505") {
      const conflictError = new Error("Username already exists");
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
}

async function loginUser(payload) {
  const { username, password } = payload;

  if (!username || !password) {
    const error = new Error("username and password are required");
    error.statusCode = 400;
    throw error;
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    const error = new Error("username and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findUserByUsername(trimmedUsername);

  if (!user || user.password !== trimmedPassword) {
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
  }

  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

async function getUserById(userId) {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function updateUser(userId, payload) {
  const { name, username, password } = payload;

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name.trim();
    if (!updateData.name) {
      const error = new Error("Name cannot be empty");
      error.statusCode = 400;
      throw error;
    }
  }

  if (username !== undefined) {
    updateData.username = username.trim();
    if (!updateData.username) {
      const error = new Error("Username cannot be empty");
      error.statusCode = 400;
      throw error;
    }
  }

  if (password !== undefined) {
    updateData.password = password.trim();
    if (!updateData.password) {
      const error = new Error("Password cannot be empty");
      error.statusCode = 400;
      throw error;
    }
  }

  try {
    return await userRepository.updateUser(userId, updateData);
  } catch (error) {
    if (error.code === "23505") {
      const conflictError = new Error("Username already exists");
      conflictError.statusCode = 409;
      throw conflictError;
    }
    throw error;
  }
}

async function getUserDefaultCategoryBudgets(userId) {
  await getUserById(userId);
  const rows =
    await defaultCategoryBudgetRepository.getUserDefaultCategoryBudgetRows(
      userId,
    );
  return rows.map((r) => ({
    category_id: r.category_id,
    category_name: r.category_name,
    default_amount:
      r.default_amount === null || r.default_amount === undefined
        ? null
        : Number(r.default_amount),
  }));
}

async function saveUserDefaultCategoryBudgets(userId, payload) {
  await getUserById(userId);
  const allowedIds =
    await defaultCategoryBudgetRepository.listExpenseCategoryIds();
  const rawList = Array.isArray(payload?.budgets) ? payload.budgets : [];
  const byId = new Map();
  for (const b of rawList) {
    const cid = Number(b.category_id);
    if (!Number.isFinite(cid)) {
      const err = new Error("Invalid expense category in budget list");
      err.statusCode = 400;
      throw err;
    }
    if (!allowedIds.has(cid)) {
      const err = new Error("Invalid expense category in budget list");
      err.statusCode = 400;
      throw err;
    }
    let defaultAmount = b.default_amount;
    if (defaultAmount === undefined) {
      defaultAmount = null;
    }
    byId.set(cid, defaultAmount);
  }
  const normalized = [];
  for (const cid of allowedIds) {
    const val = byId.has(cid) ? byId.get(cid) : null;
    normalized.push({ category_id: cid, default_amount: val });
  }
  await defaultCategoryBudgetRepository.replaceUserDefaultCategoryBudgets(
    userId,
    normalized,
  );
  return getUserDefaultCategoryBudgets(userId);
}

async function deleteUser(userId) {
  // Check if user exists first
  const user = await userRepository.findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent deleting admin users
  if (user.role === "admin") {
    const error = new Error("Cannot delete admin users");
    error.statusCode = 403;
    throw error;
  }

  return await userRepository.deleteUser(userId);
}

module.exports = {
  listUsers,
  registerUser,
  createAdminUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserDefaultCategoryBudgets,
  saveUserDefaultCategoryBudgets,
};
