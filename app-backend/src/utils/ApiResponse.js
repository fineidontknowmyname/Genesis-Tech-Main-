// FILE: app-backend/src/utils/ApiResponse.js
// PURPOSE: To create a standardized class for consistent and successful API responses.

/**
 * A custom class for creating a standardized, successful API response structure.
 * This ensures that all successful responses sent to the client follow a consistent format.
 */
class ApiResponse {
  /**
   * Creates an instance of ApiResponse.
   * @param {number} statusCode - The HTTP status code (e.g., 200 for OK, 201 for Created).
   * @param {any} data - The payload/data to be sent to the client.
   * @param {string} [message="Success"] - A descriptive message about the successful operation.
   */
  constructor(statusCode, data, message = "Success") {
    // The HTTP status code
    this.statusCode = statusCode;

    // The actual data payload
    this.data = data;

    // A descriptive message
    this.message = message;

    // A clean, explicit success flag, determined by the status code range
    this.success = statusCode < 400;
  }
}

// Export the class to be used in other parts of the application
export { ApiResponse };