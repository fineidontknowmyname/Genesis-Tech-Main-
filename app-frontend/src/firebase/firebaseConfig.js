// FILE: app-frontend/src/firebase/firebaseConfig.js
// PURPOSE: Initializes and exports Firebase services for the application.

// Import only the necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// --- Configuration ---
// Securely loads Firebase credentials from environment variables.
// In a Vite project, these would be in a `.env.local` file (e.g., VITE_FIREBASE_API_KEY="...")
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- Initialization ---

// Initialize the core Firebase app
const app = initializeApp(firebaseConfig);
console.log('[Health] Firebase service initialized: Core App');

// Initialize and export required Firebase services
export const auth = getAuth(app);
console.log('[Health] Firebase service initialized: Authentication');

export const db = getFirestore(app);
console.log('[Health] Firebase service initialized: Firestore');

export const functions = getFunctions(app);
console.log('[Health] Firebase service initialized: Functions');

export default app;