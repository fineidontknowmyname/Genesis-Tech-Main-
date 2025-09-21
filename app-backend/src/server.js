// FILE: app-backend/src/server.js
// PURPOSE: The main entry point for the Express backend application.

// It's crucial to import and configure dotenv at the very top of the entry file.
// This ensures all environment variables are loaded before any other code runs.
import dotenv from 'dotenv';
dotenv.config();

// Import the configured Express app instance from our modular app.js file.
import app from './app.js';

// --- SERVER INITIALIZATION ---

// 1. Determine the port.
// Read the port from environment variables for flexibility in deployment (e.g., on services like Heroku).
// Provide a default fallback (5000) for local development.
const PORT = process.env.PORT || 5000;

// 2. Start the server.
// The app.listen() function starts the server and makes it listen for incoming connections on the specified port.
app.listen(PORT, () => {
  // 3. Log a health check message.
  // This confirmation log is essential for development and for verifying in deployment logs that the server started successfully.
  console.log(`[Health] Backend server running on http://localhost:${PORT}`);
});
