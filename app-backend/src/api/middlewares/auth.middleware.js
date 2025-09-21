// FILE: app-backend/src/api/middleware/authMiddleware.js
// PURPOSE: To create a middleware that verifies the user's token on protected routes.

// --- Mock Dependencies ---
// This section simulates external libraries and utilities for a standalone demo.

// 1. Mock Firebase Admin SDK
const mockAdmin = {
  auth: () => ({
    verifyIdToken: (idToken) => {
      console.log(`[Admin Sim] Verifying token: "${idToken}"`);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (idToken === 'valid_jwt_token') {
            resolve({ uid: 'user-123', email: 'alex@example.com', iat: Date.now() });
          } else {
            reject(new Error("Token is invalid or expired."));
          }
        }, 500); // Simulate network call to Google
      });
    }
  })
};

// 2. Mock ApiError Utility
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    console.error(`[ApiError] Created: ${statusCode} - ${message}`);
  }
}

// --- Middleware Implementation ---
// This is the actual code generated from your pseudocode.

// Import dependencies
const admin = mockAdmin; // Using our mock admin SDK

/**
 * Express middleware to verify a Firebase ID token from the Authorization header.
 * If successful, attaches the decoded user object to `req.user`.
 * If it fails, it passes an ApiError to the next error-handling middleware.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
async function verifyAuthToken(req, res, next) {
  console.log("[Health] Auth middleware is verifying token.");

  try {
    // --- Step 1: Extract the token from the header ---
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Use return to stop execution
      return next(new ApiError(401, "Unauthorized: No token provided or malformed header."));
    }

    const idToken = authHeader.split(" ")[1];

    // --- Step 2: Verify the token using Firebase Admin ---
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // --- Step 3: Inject User Context ---
    req.user = decodedToken;
    console.log(`[Health] Token verified successfully for user: ${decodedToken.uid}`);

    // --- Step 4: Pass Control ---
    next();

  } catch (error) {
    // If verifyIdToken fails (e.g., expired, invalid signature)
    console.error("Error in auth middleware:", error.message);
    return next(new ApiError(403, "Forbidden: Invalid or expired token."));
  }
}

// Export the middleware to be used in route files
export { verifyAuthToken };