// Centralized Express error-handling middleware.
// Must be registered LAST in server.js with: app.use(errorHandler).
// It MUST have 4 parameters (err, req, res, next) so Express treats it as an error handler.

const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 1) Invalid MongoDB ObjectId (e.g. /api/items/123)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 2) Mongoose validation errors (required, enum, min/max, etc.)
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Combine all field messages into one readable string
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(", ");
  }

  // 3) Duplicate key errors (e.g. unique index violation, if added later)
  if (err.code && err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for field: ${field}`;
  }

  // Log full error for the developer (not sent to the client)
  console.error(`[Error] ${req.method} ${req.originalUrl} ->`, err.message);

  return res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack traces in development, never in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
