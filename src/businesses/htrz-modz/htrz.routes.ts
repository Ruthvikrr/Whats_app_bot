import { Router } from 'express';
import { htrzController } from './htrz.controller.js';

const router = Router();

// HTML Dashboard View
router.get('/', (req, res) => htrzController.renderDashboard(req, res));
router.get('/dashboard', (req, res) => htrzController.renderDashboard(req, res));

// Real-time Ticket Status Management API
router.post('/api/tickets/:id/resolve', (req, res) => htrzController.resolveTicket(req, res));
router.post('/api/tickets/:id/reopen', (req, res) => htrzController.reopenTicket(req, res));

// Real-time JSON Stats
router.get('/api/stats', (req, res) => htrzController.getStatsApi(req, res));

// Product Management (with image and PDF upload)
router.post('/api/products', (req, res) => htrzController.createProduct(req, res));
router.post('/products', (req, res) => htrzController.createProduct(req, res));

export default router;
