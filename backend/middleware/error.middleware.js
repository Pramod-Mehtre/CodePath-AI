module.exports = (err, req, res, next) => {
  console.error(err); // log error

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Problem already added";
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode
  });
};