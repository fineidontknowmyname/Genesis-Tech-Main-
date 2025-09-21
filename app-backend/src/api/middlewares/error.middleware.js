// FILE: app-backend/src/api/middleware/errorMiddleware.js
// PURPOSE: To create a centralized error handler for the entire application.

// --- Mock Dependencies ---
// This section simulates the custom ApiError utility for a standalone demo.

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// --- Middleware Implementation ---
// This is the actual code generated from your pseudocode.

/**
 * A centralized Express error-handling middleware.
 * This should be the LAST middleware added to the app.
 * It catches all errors passed by `next(error)` and sends a standardized JSON response.
 * @param {Error|ApiError} err - The error object.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
function errorHandler(err, req, res, next) {
  console.log("[Health] Central Error Handler caught an error.");

  let statusCode = 500;
  let message = "An unexpected internal server error occurred.";

  // Check if the error is a known, operational error that we created
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    console.log(`Known ApiError: ${statusCode} - ${message}`);
  } else {
    // If it's an unexpected error, log it for debugging
    // In a real production environment, you would use a dedicated logger (e.g., Winston)
    // and log the full error stack for debugging.
    console.error(`Unknown Error: ${err.message}`);
    // console.error(err.stack); // Uncomment for more detailed debugging
  }

  // --- Send Standardized JSON Error Response ---
  const errorResponse = {
    success: false,
    message: message,
    // Conditionally include the stack trace in development for easier debugging
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // The response is sent here, ending the request-response cycle.
  return res.status(statusCode).json(errorResponse);
}

// Export the middleware to be used in the main server file
export { errorHandler, ApiError };