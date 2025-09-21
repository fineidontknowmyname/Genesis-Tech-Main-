
// FILE: app-backend/src/api/routes/index.js
// PURPOSE: To combine all individual resource routers into a single main API router.

import { Router } from 'express';
import sourceRoutes from './source.routes.js';
import mindmapRoutes from './mindmap.routes.js';
import moduleRoutes from './module.routes.js';
import progressRoutes from './progress.routes.js';
import aidRoutes from './aid.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// --- MOUNT INDIVIDUAL ROUTERS ---
router.use('/auth', authRoutes);
router.use('/sources', sourceRoutes);
router.use('/mindmaps', mindmapRoutes);
router.use('/modules', moduleRoutes);
router.use('/progress', progressRoutes);
router.use('/aids', aidRoutes);

export default router;
