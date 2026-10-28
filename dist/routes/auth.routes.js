import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
const router = Router();
router.get('/login', (req, res) => authController.renderLogin(req, res));
router.post('/login', (req, res) => authController.handleLogin(req, res));
router.get('/logout', (req, res) => authController.handleLogout(req, res));
export default router;
