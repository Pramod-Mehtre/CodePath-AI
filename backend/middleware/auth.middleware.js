const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return next(new AppError("Unauthorized: Please login", 401));
  }

  req.userId = req.session.userId;
  req.user = { id: req.session.userId }; // Ensure compatibility for existing controllers
  next();
};