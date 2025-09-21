// FILE: app-backend/src/api/controllers/authControllers.js
// PURPOSE: To handle the business logic for user registration and profile management.

// --- Mock Dependencies ---
// This section simulates the necessary imports for a standalone demonstration.
const mockDb = {
  collection: (name) => ({
    doc: (id) => ({
      set: (data) => {
        console.log(`[DB Sim] Firestore SET on ${name}/${id}:`, data);
        return Promise.resolve();
      },
      get: () => {
        console.log(`[DB Sim] Firestore GET on ${name}/${id}`);
        // Simulate a user found vs. not found scenario
        if (id === 'existing-user-uid') {
          return Promise.resolve({
            exists: true,
            data: () => ({ uid: id, email: 'exists@example.com', displayName: 'Existing User' }),
          });
        }
        return Promise.resolve({ exists: false });
      },
    }),
  }),
};

const mockAdmin = {
  auth: () => ({
    createUser: ({ email, password, displayName }) => {
      console.log(`[Auth Sim] Attempting to create user: ${email}`);
      if (email === 'exists@example.com') {
        const error = new Error("Email already exists.");
        error.code = 'auth/email-already-exists';
        return Promise.reject(error);
      }
      return Promise.resolve({
        uid: `firebase-uid-${Date.now()}`,
        email,
        displayName,
      });
    },
  }),
};

// Custom error and response classes for consistent API structure
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ApiResponse {
  constructor(statusCode, data, message) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}


// --- Controller Implementations ---

/**
 * @description Handles new user registration.
 * @route POST /api/v1/auth/register
 */
export const registerUser = async (req, res, next) => {
  console.log("[Health] Backend Route executed: registerUser");

  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return next(new ApiError(400, "Email, password, and display name are required."));
  }

  try {
    console.log("[Health] Creating user in Firebase Auth.");
    const userRecord = await mockAdmin.auth().createUser({ email, password, displayName });

    console.log("[Health] Saving user profile to Firestore.");
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: new Date().toISOString(),
      subscription: 'free', // Default field on creation
    };
    await mockDb.collection('users').doc(userRecord.uid).set(userProfile);

    // Important: Do not send password or full auth record back to the client.
    const safeUserProfile = { ...userProfile };

    return res.status(201).json(new ApiResponse(201, safeUserProfile, "User registered successfully."));

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return next(new ApiError(409, "A user with this email already exists."));
    }
    console.error("Error in registerUser:", error);
    return next(new ApiError(500, "An unexpected error occurred while registering the user."));
  }
};

/**
 * @description Retrieves the profile of the currently authenticated user.
 * @route GET /api/v1/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  console.log("[Health] Backend Route executed: getCurrentUser");

  // In a real app, `req.user.uid` is populated by an authentication middleware.
  const userId = req.user?.uid;
  if (!userId) {
      return next(new ApiError(401, "Unauthorized. No user ID found in request."))
  }

  try {
    const userDoc = await mockDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return next(new ApiError(404, "User profile not found in database."));
    }

    return res.status(200).json(new ApiResponse(200, userDoc.data(), "User profile retrieved successfully."));

  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return next(new ApiError(500, "Failed to retrieve user profile."));
  }
};