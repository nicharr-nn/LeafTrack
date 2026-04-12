const userRepository = require('../repositories/userRepository');

async function listUsers() {
  return userRepository.getAllUsers();
}
async function registerUser(payload) {
  const { name, username, password } = payload;

  if (!name || !username || !password) {
    const error = new Error('name, username, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const sanitizedUser = {
    name: name.trim(),
    username: username.trim(),
    password: password.trim()
  };

  if (!sanitizedUser.name || !sanitizedUser.username || !sanitizedUser.password) {
    const error = new Error('name, username, and password are required');
    error.statusCode = 400;
    throw error;
  }

  try {
    return await userRepository.createUser(sanitizedUser);
  } catch (error) {
    if (error.code === '23505') {
      const conflictError = new Error('Username already exists');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
}

async function loginUser(payload) {
  const { username, password } = payload;

  if (!username || !password) {
    const error = new Error('username and password are required');
    error.statusCode = 400;
    throw error;
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    const error = new Error('username and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findUserByUsername(trimmedUsername);

  if (!user || user.password !== trimmedPassword) {
    const error = new Error('Invalid username or password');
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
    const error = new Error('User not found');
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
      const error = new Error('Name cannot be empty');
      error.statusCode = 400;
      throw error;
    }
  }

  if (username !== undefined) {
    updateData.username = username.trim();
    if (!updateData.username) {
      const error = new Error('Username cannot be empty');
      error.statusCode = 400;
      throw error;
    }
  }

  if (password !== undefined) {
    updateData.password = password.trim();
    if (!updateData.password) {
      const error = new Error('Password cannot be empty');
      error.statusCode = 400;
      throw error;
    }
  }

  try {
    return await userRepository.updateUser(userId, updateData);
  } catch (error) {
    if (error.code === '23505') {
      const conflictError = new Error('Username already exists');
      conflictError.statusCode = 409;
      throw conflictError;
    }
    throw error;
  }
}

module.exports = {
  listUsers,
  registerUser,
  loginUser,
  getUserById,
  updateUser
};
