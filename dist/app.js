import path from 'path';
import express from 'express';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { logger } from './utils/logger.js';
export const app = express();
// Security headers (allow loading static media and clean UI fonts/styles)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));
// Serve public assets (e.g. services banner image)
app.use('/public', express.static(path.join(process.cwd(), 'public')));
// Body parsing with safe size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Request logging (sanitized, no secrets)
app.use((req, _res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
    }, 'Incoming HTTP request');
    next();
});
// Application Routes
app.use('/health', healthRoutes);
app.use('/webhook', webhookRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
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
