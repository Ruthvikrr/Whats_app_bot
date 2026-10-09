import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
const router = Router();
// Render dashboard HTML view
router.get('/', (req, res) => dashboardController.renderDashboard(req, res));
// API stats endpoint
router.get('/stats', (req, res) => dashboardController.getStats(req, res));
router.get('/api/stats', (req, res) => dashboardController.getStats(req, res));
// API catalog add endpoint
router.post('/catalog', (req, res) => dashboardController.addCatalogItem(req, res));
router.post('/api/catalog', (req, res) => dashboardController.addCatalogItem(req, res));
// Broadcast endpoint
router.post('/broadcast', (req, res) => dashboardController.sendBroadcast(req, res));
router.post('/api/broadcast', (req, res) => dashboardController.sendBroadcast(req, res));
export default router;
