import { dbService } from '../db/database.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';
export class AuthController {
    /**
     * Render Login Page
     */
    renderLogin(req, res) {
        // If already logged in, redirect to dashboard or client portal
        if (req.user) {
            if (req.user.role === 'admin') {
                res.redirect('/dashboard');
                return;
            }
            res.redirect(req.user.businessId ? `/${req.user.businessId}-modz` : '/dashboard');
            return;
        }
        const error = req.query['error'];
        const redirectUrl = req.query['redirect'] || '/dashboard';
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — Triuss CRM & Client Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --border: #e2e8f0;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #00a884;
      --primary-dark: #008f6f;
      --primary-tint: #ecfdf5;
      --font: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: var(--font);
    }

    body {
      background-color: var(--bg-page);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-size: 14px;
      font-weight: 500;
      padding: 1.5rem;
    }

    .login-container {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      padding: 2.25rem;
    }

    .brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      background: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      margin-bottom: 0.85rem;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .error-alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      background: #ffffff;
      color: var(--text-main);
    }

    .form-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(0, 168, 132, 0.15);
    }

    .submit-btn {
      width: 100%;
      padding: 0.85rem;
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 0.15s ease;
      margin-top: 0.5rem;
    }

    .submit-btn:hover {
      background: var(--primary-dark);
    }

    .quick-roles {
      margin-top: 1.75rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
    }

    .quick-roles-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      text-align: center;
    }

    .role-chips {
      display: flex;
      gap: 0.5rem;
    }

    .role-chip {
      flex: 1;
      padding: 0.6rem 0.5rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s ease;
    }

    .role-chip:hover {
      background: var(--primary-tint);
      border-color: #a7f3d0;
      color: var(--primary-dark);
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="brand-header">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      <h1 class="brand-title">Triuss Sign In</h1>
      <p class="brand-subtitle">Enter your credentials to access your portal</p>
    </div>

    ${error
            ? `<div class="error-alert">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>${error === 'invalid' ? 'Invalid email or password.' : 'Session expired. Please sign in again.'}</span>
          </div>`
            : ''}

    <form method="POST" action="/login">
      <input type="hidden" name="redirect" value="${redirectUrl}">
      <div class="form-group">
        <label class="form-label" for="email">Email Address</label>
        <input class="form-input" type="email" id="email" name="email" required placeholder="admin@triuss.com" autocomplete="email">
      </div>
      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input class="form-input" type="password" id="password" name="password" required placeholder="••••••••" autocomplete="current-password">
      </div>
      <button class="submit-btn" type="submit">Sign In</button>
    </form>

    <div class="quick-roles">
      <div class="quick-roles-title">Quick Demo Login</div>
      <div class="role-chips">
        <button type="button" class="role-chip" id="btn-admin-fill">
          Admin Portal
        </button>
        <button type="button" class="role-chip" id="btn-client-fill">
          HTRZ Client
        </button>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('btn-admin-fill').addEventListener('click', () => {
      document.getElementById('email').value = 'admin@triuss.com';
      document.getElementById('password').value = 'admin123456';
    });
    document.getElementById('btn-client-fill').addEventListener('click', () => {
      document.getElementById('email').value = 'htrz@client.com';
      document.getElementById('password').value = 'htrz123456';
    });
  </script>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    /**
     * Handle Login Submission
     */
    handleLogin(req, res) {
        const email = String(req.body.email || '').trim();
        const password = String(req.body.password || '');
        const redirectUrl = String(req.body.redirect || '/dashboard');
        if (!email || !password) {
            res.redirect(`/login?error=invalid&redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }
        const user = dbService.getUserByEmail(email);
        if (!user || !AuthService.verifyPassword(password, user.passwordHash)) {
            logger.warn({ email }, 'Failed login attempt');
            res.redirect(`/login?error=invalid&redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }
        // Create session token
        const token = AuthService.createSessionToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            businessId: user.businessId,
            name: user.name,
        });
        // Set HTTP-only session cookie
        res.setHeader('Set-Cookie', `triuss_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
        logger.info({ userId: user.id, role: user.role, businessId: user.businessId }, 'User logged in successfully');
        // Role-based routing: if client, redirect to client portal if pointing to root /dashboard
        if (user.role === 'client') {
            if (user.businessId && (redirectUrl === '/dashboard' || redirectUrl === '/')) {
                res.redirect(`/${user.businessId}-modz`);
                return;
            }
        }
        res.redirect(redirectUrl.startsWith('/') ? redirectUrl : '/dashboard');
    }
    /**
     * Handle Logout
     */
    handleLogout(_req, res) {
        res.setHeader('Set-Cookie', 'triuss_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
        res.redirect('/login');
    }
}
export const authController = new AuthController();
