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

module.exports = {
  listUsers,
  registerUser,
  loginUser
};
