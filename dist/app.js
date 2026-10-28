import path from 'path';
import express from 'express';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import htrzRoutes from './businesses/htrz-modz/htrz.routes.js';
import authRoutes from './routes/auth.routes.js';
import { populateUser, requireAuth } from './middleware/auth.middleware.js';
import { logger } from './utils/logger.js';
export const app = express();
// Security headers (allow loading static media and clean UI fonts/styles)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));
// Serve public assets (e.g. services banner image, PDFs)
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use('/pdfs', express.static(path.join(process.cwd(), 'pdfs')));
// Body parsing with safe size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Populate req.user from session cookie if present
app.use(populateUser);
// Request logging (sanitized, no secrets)
app.use((req, _res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
    }, 'Incoming HTTP request');
    next();
});
// Authentication Routes (Public: /login, /logout)
app.use('/', authRoutes);
// Public API and Webhook Routes
app.use('/health', healthRoutes);
app.use('/webhook', webhookRoutes);
// Protected Admin and Client Routes (session cookie required)
app.use('/dashboard', requireAuth, dashboardRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/htrz-modz', requireAuth, htrzRoutes);
app.use('/clients/htrz-modz', requireAuth, htrzRoutes);
// 404 Handler
app.use((req, res) => {
    logger.warn({ path: req.path, method: req.method }, 'Route not found');
    res.status(404).json({ error: 'Not Found' });
});
// Centralized Error Handling Middleware
app.use((err, _req, res, _next) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        logger.warn({ error: err.message }, 'Malformed JSON in request body');
        res.status(400).json({ error: 'Malformed JSON payload' });
        return;
    }
    const status = typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        typeof err.status === 'number'
        ? err.status
        : 500;
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    logger.error({ error: errorMessage, status }, 'Application error');
    res.status(status).json({
        error: status === 500 ? 'Internal server error' : errorMessage,
    });
});
