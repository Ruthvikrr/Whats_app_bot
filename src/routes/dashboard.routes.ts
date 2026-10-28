import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

// Render dashboard HTML view
router.get('/', (req, res) => dashboardController.renderDashboard(req, res));

// API stats endpoint
router.get('/stats', (req, res) => dashboardController.getStats(req, res));
router.get('/api/stats', (req, res) => dashboardController.getStats(req, res));

// Live Message Thread and WhatsApp Cloud API Reply endpoints
router.get('/messages/thread/:phone', (req, res) => dashboardController.getChatThread(req, res));
router.get('/api/messages/thread/:phone', (req, res) => dashboardController.getChatThread(req, res));
router.post('/messages/reply', (req, res) => dashboardController.sendWhatsAppReply(req, res));
router.post('/api/messages/reply', (req, res) => dashboardController.sendWhatsAppReply(req, res));

// Catalog Management endpoints (Add, Edit, Delete, Toggle Stock, Template, Import)
router.post('/catalog', (req, res) => dashboardController.addCatalogItem(req, res));
router.post('/api/catalog', (req, res) => dashboardController.addCatalogItem(req, res));
router.post('/catalog/:id/edit', (req, res) => dashboardController.editCatalogItem(req, res));
router.post('/api/catalog/:id/edit', (req, res) => dashboardController.editCatalogItem(req, res));
router.post('/catalog/:id/delete', (req, res) => dashboardController.deleteCatalogItem(req, res));
router.post('/api/catalog/:id/delete', (req, res) => dashboardController.deleteCatalogItem(req, res));
router.post('/catalog/:id/toggle-stock', (req, res) => dashboardController.toggleCatalogStock(req, res));
router.post('/api/catalog/:id/toggle-stock', (req, res) => dashboardController.toggleCatalogStock(req, res));
router.get('/catalog/template.csv', (req, res) => dashboardController.downloadCatalogTemplate(req, res));
router.get('/api/catalog/template.csv', (req, res) => dashboardController.downloadCatalogTemplate(req, res));
router.post('/catalog/import', (req, res) => dashboardController.importCatalogCsv(req, res));
router.post('/api/catalog/import', (req, res) => dashboardController.importCatalogCsv(req, res));

// Broadcast endpoint
router.post('/broadcast', (req, res) => dashboardController.sendBroadcast(req, res));
router.post('/api/broadcast', (req, res) => dashboardController.sendBroadcast(req, res));

// Support Tickets endpoints
router.get('/tickets', (req, res) => dashboardController.getTickets(req, res));
router.get('/api/tickets', (req, res) => dashboardController.getTickets(req, res));
router.post('/tickets/:id/status', (req, res) => dashboardController.updateTicketStatus(req, res));
router.post('/api/tickets/:id/status', (req, res) => dashboardController.updateTicketStatus(req, res));

// Orders endpoints
router.post('/orders/:id/status', (req, res) => dashboardController.updateOrderStatus(req, res));
router.post('/api/orders/:id/status', (req, res) => dashboardController.updateOrderStatus(req, res));

export default router;
