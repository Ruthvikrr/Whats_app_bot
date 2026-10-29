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

// Bike Model Management
router.get('/api/bikes', (req, res) => htrzController.getBikes(req, res));
router.post('/api/bikes', (req, res) => htrzController.addBike(req, res));

// Customers Export
router.get('/customers/export', (req, res) => htrzController.exportCustomersCsv(req, res));
router.get('/api/customers/export', (req, res) => htrzController.exportCustomersCsv(req, res));

// Catalog Template CSV
router.get('/catalog/template.csv', (_req, res) => {
  const template = 'sku,name,category,price,description,imageUrl,paymentUrl,inStock,bikeModel\nHTRZ-01,Axor Apex Venom Helmet,Helmets & Riding Gear,4999,ECE 22.06 DOT certified helmet,,,1,Universal / All Bikes\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="htrz_catalog_template.csv"');
  res.send(template);
});

export default router;
