
// FILE: app-backend/src/api/routes/auth.routes.js
import { Router } from 'express';
import { registerUser, getCurrentUser } from '../controllers/auth.controllers.js';
import { verifyAuthToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route for registration
router.post('/register', registerUser);

// Protected route to get the current user's profile
router.get('/me', verifyAuthToken, getCurrentUser);

export default router;
