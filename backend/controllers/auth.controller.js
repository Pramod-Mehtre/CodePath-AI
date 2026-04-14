const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Please provide name, email, and password", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already in use", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Automatically log the user in
    req.session.userId = user._id;

    res.status(201).json({ success: true, message: "Signup successful" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Compare with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Create session
    req.session.userId = user._id;

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    res.clearCookie("connect.sid"); // default cookie name for express-session
    res.json({ success: true, message: "Logged out" });
  });
};

exports.getMe = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return next(new AppError("Unauthorized: Please login", 401));
    }
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};