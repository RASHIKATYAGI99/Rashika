const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Default error
  const error = {
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.message = "Validation Error"
    error.status = 400
  }

  // Cast errors
  if (err.name === "CastError") {
    error.message = "Resource not found"
    error.status = 404
  }

  res.status(error.status).json({
    error: error.message,
    code: error.status,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler