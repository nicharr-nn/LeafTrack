const { getCurrentUser } = require("../config/api");

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.substring(7);
    const userData = JSON.parse(Buffer.from(token, "base64").toString());

    if (!userData || !userData.user_id) {
      const error = new Error("Invalid token");
      error.statusCode = 401;
      return next(error);
    }

    req.user = userData;
    next();
  } catch (error) {
    const authError = new Error("Invalid token");
    authError.statusCode = 401;
    next(authError);
  }
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    return next(error);
  }

  if (req.user.role !== "admin") {
    const error = new Error("Admin access required");
    error.statusCode = 403;
    return next(error);
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
