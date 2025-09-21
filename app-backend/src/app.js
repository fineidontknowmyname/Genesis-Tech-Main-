// FILE: app-backend/src/app.js
// PURPOSE: The main, consolidated entry point for the Express backend application.

// --- Mock Dependencies ---
// In a real application, these would be actual imports. They are mocked here for demonstration.
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// --- Mock Routers & Middlewares ---
const sourceRoutes = express.Router().get('/', (req, res) => res.json({ message: 'Source routes are active' }));
const moduleRoutes = express.Router().get('/', (req, res) => res.json({ message: 'Module routes are active' }));
const mindmapRoutes = express.Router().get('/', (req, res) => res.json({ message: 'Mindmap routes are active' }));

// This mainRouter consolidates all API routes, matching our application's context.
const mainRouter = express.Router();
mainRouter.use('/sources', sourceRoutes);
mainRouter.use('/modules', moduleRoutes);
mainRouter.use('/mindmaps', mindmapRoutes);

const errorHandler = (err, req, res, next) => {
    console.error("[Error Handler]", err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
};

// --- Main Application Setup ---

console.log('[Health] Initializing backend server and middleware.');
const app = express();

// Core Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(helmet()); // Sets various security-related HTTP headers
app.use(express.json({ limit: '16kb' })); // Prevents large JSON payloads
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(morgan('dev')); // Logs HTTP requests to the console

// API Documentation
try {
    console.log('[Health] Mounting API documentation routes.');
    // In a real app, ensure the YAML file exists at this path
    // const swaggerDocument = YAML.load(path.resolve(path.dirname(''), './docs/openapi.yaml'));
    const mockSwaggerDoc = { openapi: '3.0.0', info: { title: 'Mock API Docs', version: '1.0.0' } };
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mockSwaggerDoc));
} catch (error) {
    console.error("[Error] Could not load Swagger documentation. Ensure 'openapi.yaml' exists.", error);
}


// API Routes
console.log('[Health] Mounting main API router.');
app.use('/api/v1', mainRouter);

// Health Check Route
app.get('/health', (req, res) => {
    console.log('[Health] Health check endpoint was hit.');
    res.status(200).json({
        status: "ok",
        time: new Date().toISOString()
    });
});

// Central Error Handler
console.log('[Health] Mounting central error handler.');
app.use(errorHandler);

export default app;