// FILE: app-backend/src/api/routes/mindmap.routes.js
// PURPOSE: To define the API endpoints for fetching mind map data.

import { Router } from 'express';
import { getMindmap, getOrCreateFlashcardsByNodeId } from '../controllers/mindmap.controller.js';
import { verifyAuthToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes in this file
router.use(verifyAuthToken);

// Route to get the entire mind map structure for a given source
router.route('/').get(getMindmap);

// Route to get or create flashcards for a specific node in a mind map
router.route('/nodes/:nodeId/flashcards').get(getOrCreateFlashcardsByNodeId);

export default router;
