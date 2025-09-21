// FILE: app-backend/src/utils/ApiError.js
// PURPOSE: To create a standardized error class for consistent API error handling.

/**
 * A custom Error class for handling API-specific, operational errors.
 * This allows us to throw errors with a specific HTTP status code and message,
 * which can then be caught by a central error handler to send a consistent response.
 */
class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   * @param {number} statusCode - The HTTP status code (e.g., 400, 404, 500).
   * @param {string} [message="Something went wrong"] - The error message for the client.
   * @param {string} [stack=""] - Optional stack trace. If not provided, it will be captured.
   */
  constructor(statusCode, message = "Something went wrong", stack = "") {
    // Call the parent 'Error' class constructor with the message
    super(message);

    // --- CUSTOM PROPERTIES ---
    // Add our own custom properties to the error object.

    // The HTTP status code
    this.statusCode = statusCode;

    // A flag to distinguish predictable, operational errors from actual bugs
    this.isOperational = true;

    // A clean success flag for the standardized API response
    this.success = false;

    // Preserve the original error stack if provided, otherwise capture a new one
    if (stack) {
      this.stack = stack;
    } else {
      // This V8-specific function captures the stack trace, excluding the constructor call
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export the class to be used in other parts of the application
export { ApiError };