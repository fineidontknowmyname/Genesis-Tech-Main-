// FILE: app-backend/src/config/db.js
// PURPOSE: To initialize the Firebase Admin SDK and export the Firestore database instance.

// --- Mock Dependencies ---
// This section simulates the firebase-admin library and environment variables for a standalone demo.

// 1. Mock 'firebase-admin' library
const mockAdmin = {
  apps: [],
  credential: {
    cert: (serviceAccount) => ({ /* returns a mock credential object */ }),
  },
  initializeApp: function(config) {
    if (this.apps.length === 0) {
      this.apps.push({ name: '[DEFAULT]' });
      console.log('[Admin Sim] Firebase App Initialized.');
    }
  },
  firestore: () => {
    console.log('[Admin Sim] Firestore instance requested.');
    return { /* This is the mock db instance */ };
  },
};

// 2. Mock 'process.env' for the service account key
const mockProcess = {
  env: {
    FIREBASE_SERVICE_ACCOUNT_KEY: JSON.stringify({
      "type": "service_account",
      "project_id": "your-project-id",
      "private_key_id": "mock_key_id",
      "private_key": "-----BEGIN PRIVATE KEY-----\\n...mock_private_key...\\n-----END PRIVATE KEY-----\\n",
      "client_email": "firebase-adminsdk-mock@your-project-id.iam.gserviceaccount.com",
      // ... other fields
    })
  },
  exit: (code) => {
      console.error(`[Process Sim] Exiting with code ${code}.`);
  }
};


// --- Service Implementation ---
// This is the actual code generated from your pseudocode.

// Import dependencies
const admin = mockAdmin;
const process = mockProcess;

let db;

try {
  // ----------------------------------------------------
  // 1. LOAD FIREBASE CREDENTIALS
  // ----------------------------------------------------
  console.log("[Health] Initializing Firebase Admin SDK.");

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.");
  }
  
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  // ----------------------------------------------------
  // 2. INITIALIZE FIREBASE ADMIN
  // ----------------------------------------------------
  
  // Check if the app is already initialized to prevent errors during hot-reloading
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("[Health] Firebase Admin SDK connected successfully.");
  }

  // ----------------------------------------------------
  // 3. EXPORT THE FIRESTORE INSTANCE
  // ----------------------------------------------------
  db = admin.firestore();

} catch (error) {
  console.error(`Firebase Admin SDK initialization failed: ${error.message}`);
  // Exit the process if the database connection fails, as the app cannot run.
  process.exit(1);
}


// Export the 'db' instance for use in other parts of the application.
export { db };