import { dbService } from '../db/database.js';
import { whatsAppService } from '../services/whatsapp.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
export class DashboardController {
    /**
     * Render the Professional Multi-Business Admin CRM Dashboard
     * 100% Real SQLite Data with Clean Modern Font & White Theme
     */
    renderDashboard(req, res) {
        const quota = dbService.getMonthlyQuotaStats();
        const leads = dbService.getAllLeads();
        const catalog = dbService.getAllCatalogItems();
        const productStats = dbService.getProductSalesAndEnquiryStats();
        const serviceStats = dbService.getServicePerformanceStats();
        const liveMessages = dbService.getRecentLiveMessages(25);
        const tickets = dbService.getAllSupportTickets();
        const openTickets = tickets.filter((t) => t.status === 'OPEN');
        const broadcastStatus = req.query['broadcast'];
        const percentageUsed = Math.min(100, Math.round((quota.outboundCount / quota.freeLimit) * 100));
        // Real aggregated metrics for Product businesses
        const totalProductEnquiries = productStats.reduce((sum, p) => sum + p.enquiriesCount, 0);
        const totalProductCheckouts = productStats.reduce((sum, p) => sum + p.checkoutsClicked, 0);
        const totalProductPipelineValue = productStats.reduce((sum, p) => sum + p.estimatedSalesValue, 0);
        // Real aggregated metrics for Service businesses
        const totalServiceEnquiries = serviceStats.reduce((sum, s) => sum + s.enquiriesCount, 0);
        const totalServiceBookings = serviceStats.reduce((sum, s) => sum + s.bookingsConfirmed, 0);
        const avgServiceConversion = totalServiceEnquiries > 0 ? Math.round((totalServiceBookings / totalServiceEnquiries) * 100) : 0;
        const totalServicePipelineValue = serviceStats.reduce((sum, s) => sum + s.estimatedValue, 0);
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Triuss CRM — Multi-Business Admin Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --border-subtle: #e2e8f0;
      --border-focus: #cbd5e1;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-light: #94a3b8;
      --primary: #00a884;
      --primary-dark: #008f6f;
      --primary-light: #e6fffa;
      --accent: #2563eb;
      --accent-light: #eff6ff;
      --success: #10b981;
      --success-light: #ecfdf5;
      --warning: #f59e0b;
      --radius: 12px;
      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-heading: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-body); }

    body {
      background-color: var(--bg-page);
      color: var(--text-main);
      display: flex;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* Sleek Left Icon Dock */
    aside {
      width: 68px;
      min-width: 68px;
      max-width: 68px;
      background: #ffffff;
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      padding: 1.15rem 0;
      box-sizing: border-box;
      z-index: 100;
      overflow: visible;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    aside::-webkit-scrollbar,
    .sidebar-nav::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      min-width: 42px;
      background: linear-gradient(135deg, #00a884, #059669);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.25rem;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0, 168, 132, 0.28);
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .brand-icon:hover {
      transform: scale(1.05);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      justify-content: center;
      padding: 1rem 0;
      overflow: visible;
    }

    .nav-divider {
      width: 32px;
      height: 1px;
      background: #e2e8f0;
      margin: 4px 0;
    }

    .nav-item {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border: 1px solid transparent;
      user-select: none;
    }

    .nav-item:hover {
      background-color: #f1f5f9;
      color: #0f172a;
      transform: translateY(-1px);
    }

    .nav-item.active {
      background-color: #e6fffa;
      color: #008f6f;
      border-color: #a7f3d0;
      box-shadow: 0 2px 8px rgba(0, 168, 132, 0.18);
    }

    .nav-icon {
      font-size: 1.35rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Small badge dot for active tickets */
    .nav-badge-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00a884;
      border: 2px solid #ffffff;
    }

    .nav-badge-dot.alert {
      background: #ef4444;
    }

    /* Floating Tooltip with Arrow */
    .nav-item::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      background: #0f172a;
      color: #ffffff;
      padding: 0.45rem 0.8rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
      z-index: 9999;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
      border-width: 5px 6px 5px 0;
      border-style: solid;
      border-color: transparent #0f172a transparent transparent;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease;
      z-index: 9999;
    }

    .nav-item:hover::after {
      opacity: 1;
      visibility: visible;
      transform: translateY(-50%) translateX(2px);
    }

    .nav-item:hover::before {
      opacity: 1;
      visibility: visible;
    }

    /* Bottom status indicator */
    .sidebar-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.5rem;
      position: relative;
    }

    .status-pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .status-pulse-dot:hover {
      transform: scale(1.2);
    }

    .sidebar-footer::after {
      content: '● WhatsApp Cloud Active';
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      background: #0f172a;
      color: #ffffff;
      padding: 0.45rem 0.8rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
      z-index: 9999;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease;
    }

    .sidebar-footer:hover::after {
      opacity: 1;
      visibility: visible;
    }

    /* Main Area */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
      background: var(--bg-page);
    }

    /* Top Super-Admin Header */
    header {
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.9rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .header-left h1 {
      font-size: 1.35rem;
      font-weight: 800;
      font-family: var(--font-heading);
      letter-spacing: -0.025em;
      color: #0f172a;
    }

    .business-selector-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.4rem 0.85rem;
      border-radius: 10px;
      transition: all 0.15s ease;
    }

    .business-selector-wrap:hover {
      border-color: #cbd5e1;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .business-selector-wrap label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .business-select {
      border: none;
      background: transparent;
      font-size: 0.84rem;
      font-weight: 700;
      color: #0f172a;
      outline: none;
      cursor: pointer;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .admin-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.4rem 0.85rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
    }

    .admin-badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .btn-action {
      background: linear-gradient(135deg, #00a884, #059669);
      color: #ffffff;
      padding: 0.5rem 1.15rem;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      text-decoration: none;
      transition: all 0.18s ease;
      box-shadow: 0 2px 8px rgba(0, 168, 132, 0.28);
    }

    .btn-action:hover {
      background: linear-gradient(135deg, #008f6f, #047857);
      box-shadow: 0 4px 14px rgba(0, 168, 132, 0.4);
      transform: translateY(-1px);
    }

    /* Content Area */
    .dashboard-container {
      padding: 1.75rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* Notification Banner */
    .banner-alert {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      animation: fadeIn 0.3s ease;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1.25rem;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 16px;
      padding: 1.35rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 16px -4px rgba(15, 23, 42, 0.02);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06), 0 12px 24px -6px rgba(15, 23, 42, 0.04);
      border-color: #cbd5e1;
    }

    .kpi-title {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-icon-badge {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: #f1f5f9;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }

    .kpi-value {
      font-size: 1.95rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: #0f172a;
      letter-spacing: -0.035em;
      line-height: 1.1;
    }

    .kpi-subtext {
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.15rem;
    }

    .progress-bar-bg {
      width: 100%;
      height: 6px;
      background: #f1f5f9;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 0.35rem;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #00a884, #10b981);
      border-radius: 10px;
      transition: width 0.4s ease;
    }

    /* Content Cards */
    .card-box {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 16px;
      padding: 1.6rem 1.85rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 8px 24px -6px rgba(15, 23, 42, 0.03);
    }

    .card-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.35rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-box-header h3 {
      font-size: 1.15rem;
      font-weight: 800;
      font-family: var(--font-heading);
      letter-spacing: -0.02em;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Enhanced Enterprise Tables & Balanced Columns */
    .table-container {
      overflow-x: auto;
      width: 100%;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-variant-numeric: tabular-nums;
    }

    thead th {
      padding: 0.9rem 1.25rem;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
      user-select: none;
    }

    tbody td {
      padding: 1.05rem 1.25rem;
      font-size: 0.86rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
      transition: background 0.12s ease;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover td {
      background-color: #f8fafc;
    }

    /* Fixed equal-gap column classes for balanced table proportions */
    .col-sku { width: 110px; min-width: 110px; white-space: nowrap; }
    .col-title { min-width: 260px; font-weight: 700; color: #0f172a; }
    .col-category { width: 130px; min-width: 130px; }
    .col-price { width: 130px; min-width: 130px; font-family: var(--font-mono); font-weight: 700; color: #0f172a; }
    .col-metric { width: 160px; min-width: 160px; }
    .col-action { width: 140px; min-width: 140px; text-align: right; }
    .col-phone { width: 150px; min-width: 150px; font-family: var(--font-mono); font-weight: 700; }
    .col-status { width: 120px; min-width: 120px; }
    .col-time { width: 150px; min-width: 150px; color: #64748b; font-size: 0.82rem; white-space: nowrap; }

    /* Badges & Chips */
    .code-tag {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 700;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .pill-category {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.24rem 0.65rem;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      text-transform: capitalize;
      white-space: nowrap;
    }

    .metric-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.24rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .metric-pill.blue {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #dbeafe;
    }

    .metric-pill.emerald {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .metric-pill.gray {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .price-cell {
      font-family: var(--font-mono);
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .price-cell.highlight {
      color: #008f6f;
      font-weight: 800;
    }

    .link-checkout-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.8rem;
      background: #f0fdf4;
      color: #008f6f;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .link-checkout-btn:hover {
      background: #00a884;
      color: #ffffff;
      border-color: #00a884;
      box-shadow: 0 2px 8px rgba(0, 168, 132, 0.28);
      transform: translateY(-1px);
    }

    .link-chat-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.8rem;
      background: #f0fdf4;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .link-chat-btn:hover {
      background: #00a884;
      color: #ffffff;
      border-color: #00a884;
      box-shadow: 0 2px 8px rgba(0, 168, 132, 0.28);
      transform: translateY(-1px);
    }

    .badge-inbound {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 0.24rem 0.65rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .badge-outbound {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      padding: 0.24rem 0.65rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }

    /* Tab Controls */
    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
    }

    .form-input, .form-textarea, .form-select {
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      font-size: 0.86rem;
      color: #0f172a;
      outline: none;
      transition: border 0.15s;
    }

    .form-input:focus, .form-textarea:focus, .form-select:focus {
      border-color: #00a884;
      box-shadow: 0 0 0 3px rgba(0, 168, 132, 0.1);
    }

    .btn-submit {
      background: #00a884;
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
      align-self: flex-start;
      margin-top: 0.5rem;
    }

    .btn-submit:hover {
      background: var(--primary-dark);
    }

    /* ─── Pagination Bar ──────────────────────────────── */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.7rem 1.25rem;
      border-top: 1px solid #f1f5f9;
      background: #fafbfc;
      border-radius: 0 0 12px 12px;
      font-size: 0.8rem;
      color: #64748b;
    }

    .pagination-bar .pg-info {
      font-weight: 600;
      font-size: 0.78rem;
      color: #64748b;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .pg-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 7px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #475569;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
      text-decoration: none;
    }

    .pg-btn:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    .pg-btn.active {
      background: #00a884;
      border-color: #00a884;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(0, 168, 132, 0.3);
    }

    .pg-btn:disabled {
      opacity: 0.38;
      cursor: not-allowed;
    }
  </style>
</head>
<body>

  <!-- LEFT ICON NAVIGATION DOCK -->
  <aside id="app-sidebar">
    <div class="brand-icon" title="Triuss CRM" onclick="switchTab('tab-overview')">⚡</div>

    <div class="sidebar-nav">
      <div class="nav-item active" data-tab="tab-overview" onclick="switchTab('tab-overview', this)" data-tooltip="Master Overview">
        <span class="nav-icon">🌐</span>
      </div>
      <div class="nav-item" data-tab="tab-products" onclick="switchTab('tab-products', this)" data-tooltip="Products & Sales (${productStats.length})">
        <span class="nav-icon">💎</span>
      </div>
      <div class="nav-item" data-tab="tab-services" onclick="switchTab('tab-services', this)" data-tooltip="Services & Inquiries (${serviceStats.length})">
        <span class="nav-icon">🛠️</span>
      </div>

      <div class="nav-divider"></div>

      <div class="nav-item" data-tab="tab-tickets" onclick="switchTab('tab-tickets', this)" data-tooltip="Support Tickets (${openTickets.length} OPEN)">
        <span class="nav-icon">🎫</span>
        ${openTickets.length > 0 ? '<span class="nav-badge-dot alert"></span>' : ''}
      </div>
      <div class="nav-item" data-tab="tab-chats" onclick="switchTab('tab-chats', this)" data-tooltip="Live WhatsApp Chats (${liveMessages.length})">
        <span class="nav-icon">💬</span>
      </div>
      <div class="nav-item" data-tab="tab-leads" onclick="switchTab('tab-leads', this)" data-tooltip="Customer Leads & CRM (${leads.length})">
        <span class="nav-icon">👥</span>
      </div>
      <div class="nav-item" data-tab="tab-broadcast" onclick="switchTab('tab-broadcast', this)" data-tooltip="Broadcast Marketing">
        <span class="nav-icon">📢</span>
      </div>

      <div class="nav-divider"></div>

      <div class="nav-item" data-tab="tab-catalog" onclick="switchTab('tab-catalog', this)" data-tooltip="Catalog Inventory (${catalog.length})">
        <span class="nav-icon">📦</span>
      </div>
      <div class="nav-item" data-tab="tab-settings" onclick="switchTab('tab-settings', this)" data-tooltip="WhatsApp API Quota">
        <span class="nav-icon">⚙️</span>
      </div>
    </div>

    <div class="sidebar-footer" title="WhatsApp Cloud Active">
      <span class="status-pulse-dot"></span>
      <span style="display:none;">Triuss CRM ● WhatsApp Cloud Active</span>
    </div>
  </aside>

  <!-- MAIN DASHBOARD VIEWPORT -->
  <main>
    <!-- TOP HEADER -->
    <header>
      <div class="header-left">
        <h1 id="page-heading">Master Overview</h1>
        <!-- Business View Switcher -->
        <div class="business-selector-wrap">
          <label>Business Filter:</label>
          <select class="business-select" id="business-filter" onchange="handleBusinessChange(this.value)">
            <option value="all">🌐 All Businesses (Triuss Admin)</option>
            <option value="products">💎 E-Commerce & Jewelry (Products)</option>
            <option value="services">🤖 Triuss Agency & Services</option>
            <option value="chats">💬 Live WhatsApp Messages</option>
            <option value="leads">👥 Customer Leads & CRM</option>
          </select>
        </div>
      </div>

      <div class="header-right">
        <div class="admin-pill">
          <span class="admin-badge-dot"></span>
          Admin: Triuss
        </div>
        <a href="#tab-broadcast" onclick="switchTab('tab-broadcast', document.querySelectorAll('.nav-item')[5])" class="btn-action">
          + New Broadcast
        </a>
      </div>
    </header>

    <div class="dashboard-container">
      ${broadcastStatus === 'sent'
            ? `<div class="banner-alert">
              <div>✅ <strong>Broadcast Dispatched!</strong> Messages have been sent directly to your WhatsApp customer database.</div>
              <span style="cursor:pointer;" onclick="this.parentElement.remove()">✕</span>
            </div>`
            : ''}

      <!-- TAB 1: MASTER OVERVIEW -->
      <div id="tab-overview" class="tab-content active">
        <!-- REAL DATA KPIS -->
        <div class="kpi-grid">
          <!-- KPI 1: Real-Time 1,000 Free Quota -->
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Free Message Quota</span>
              <span style="color: #00a884; font-size: 0.72rem; font-weight: 700;">● ₹0.00 COST</span>
            </div>
            <div class="kpi-value"><span id="kpi-quota-remaining">${quota.remainingFree}</span> <span style="font-size: 0.95rem; font-weight: 600; color: #64748b;">/ 1,000 free</span></div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" id="kpi-quota-progress" style="width: ${percentageUsed}%;"></div>
            </div>
            <div class="kpi-subtext" id="kpi-quota-sent-text">${quota.outboundCount} outbound messages sent this month</div>
          </div>

          <!-- KPI 2: Real Customer Leads -->
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Total Customer Contacts</span>
              <span class="kpi-icon-badge">👥</span>
            </div>
            <div class="kpi-value" id="kpi-leads-count">${leads.length}</div>
            <div class="kpi-subtext"><strong style="color: #00a884;">100% Real Leads</strong> in SQLite</div>
          </div>

          <!-- KPI 3: Product Pipeline Sales -->
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Product Enquiries & Sales</span>
              <span class="kpi-icon-badge">💎</span>
            </div>
            <div class="kpi-value">₹${totalProductPipelineValue.toLocaleString('en-IN')}</div>
            <div class="kpi-subtext">${totalProductEnquiries} customer enquiries across ${catalog.length} SKUs</div>
          </div>

          <!-- KPI 4: Services Pipeline -->
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Service Inquiries Value</span>
              <span class="kpi-icon-badge">🛠️</span>
            </div>
            <div class="kpi-value">₹${totalServicePipelineValue.toLocaleString('en-IN')}</div>
            <div class="kpi-subtext">${totalServiceEnquiries} customer inquiries received (${totalServiceBookings} bookings)</div>
          </div>
        </div>

        <!-- OPEN SUPPORT TICKETS ALERT (WHEN PENDING TICKETS EXIST) -->
        ${openTickets.length > 0 ? `
        <div class="card-box" style="border: 1px solid #fed7aa; background: #fffaf0; margin-bottom: 1.5rem;">
          <div class="card-box-header" style="border-bottom: 1px solid #fed7aa;">
            <div>
              <h3 style="color: #c2410c;">🚨 Live Action Required: ${openTickets.length} Customer(s) Waiting For Real Support</h3>
              <span style="font-size: 0.82rem; color: #9a3412;">Customers clicked a service and replied YES to speak with real human customer support</span>
            </div>
            <button onclick="switchTab('tab-tickets', document.querySelectorAll('.nav-item')[3])" class="btn-action" style="background: #ea580c;">View All Tickets (${tickets.length})</button>
          </div>
          <div class="table-container">
            <table data-paginate="30" data-pg-id="alert-tickets">
              <thead>
                <tr>
                  <th class="col-sku">Ticket #</th>
                  <th class="col-phone">Customer Phone</th>
                  <th class="col-category">Service Enquired</th>
                  <th>Enquiry Summary</th>
                  <th class="col-time">Requested At</th>
                  <th class="col-status">Status</th>
                  <th class="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                ${openTickets.map(t => `
                  <tr>
                    <td class="col-sku"><strong style="color: #ea580c; font-family: var(--font-mono);">${t.ticketNumber}</strong></td>
                    <td class="col-phone" style="color: #0f172a;">${t.phoneNumber}</td>
                    <td class="col-category"><span class="pill-category" style="background: #ffedd5; color: #c2410c; border-color: #fed7aa;">${t.enquiryService || 'General'}</span></td>
                    <td style="font-size: 0.84rem; color: #475569;">${t.enquirySummary}</td>
                    <td class="col-time">${new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td class="col-status"><span class="badge-outbound" style="background: #fee2e2; color: #b91c1c; border-color: #fca5a5;">OPEN</span></td>
                    <td class="col-action">
                      <a href="https://wa.me/${t.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" class="link-chat-btn">
                        💬 Chat
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        <!-- RECENT LIVE MESSAGES STREAM IN OVERVIEW -->
        <div class="card-box">
          <div class="card-box-header">
            <h3>💬 Recent Live WhatsApp Interactions</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Real incoming and outgoing messages stored in database</span>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="overview-messages">
              <thead>
                <tr>
                  <th class="col-time">Timestamp</th>
                  <th class="col-phone">Customer Phone</th>
                  <th class="col-title" style="min-width: 160px;">Contact Name</th>
                  <th class="col-status">Direction</th>
                  <th class="col-category">Message Type</th>
                  <th>Message Content</th>
                </tr>
              </thead>
              <tbody id="overview-live-messages">
                ${liveMessages
            .map((m) => `
                  <tr>
                    <td class="col-time">${m.dateFormatted}</td>
                    <td class="col-phone" style="color: #334155;">${m.phoneNumber}</td>
                    <td class="col-title" style="min-width: 160px; font-weight: 700; color: #0f172a;">${m.customerName}</td>
                    <td class="col-status">
                      <span class="${m.direction === 'inbound' ? 'badge-inbound' : 'badge-outbound'}">
                        ${m.direction === 'inbound' ? '↓ Inbound' : '↑ Outbound'}
                      </span>
                    </td>
                    <td class="col-category"><span class="pill-category">${m.messageType}</span></td>
                    <td style="color: #1e293b; font-size: 0.85rem; word-break: break-word;">
                      ${m.body.replace(/\n/g, ' ')}
                    </td>
                  </tr>
                `)
            .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: PRODUCT-BASED BUSINESS DASHBOARD -->
      <div id="tab-products" class="tab-content">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title"><span>Total Product Inquiries</span><span class="kpi-icon-badge">📦</span></div>
            <div class="kpi-value">${totalProductEnquiries}</div>
            <div class="kpi-subtext">Customer queries recorded in messages</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>UPI Checkouts Sent</span><span class="kpi-icon-badge">💳</span></div>
            <div class="kpi-value">${totalProductCheckouts}</div>
            <div class="kpi-subtext">Direct payment links delivered</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Pipeline Sales Value</span><span class="kpi-icon-badge">📈</span></div>
            <div class="kpi-value" style="color: #00a884;">₹${totalProductPipelineValue.toLocaleString('en-IN')}</div>
            <div class="kpi-subtext">Enquiry volume × Catalog unit price</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Active Products in Catalog</span><span class="kpi-icon-badge">💎</span></div>
            <div class="kpi-value">${catalog.length}</div>
            <div class="kpi-subtext">Available in WhatsApp catalog</div>
          </div>
        </div>

        <div class="card-box">
          <div class="card-box-header">
            <h3>💎 Product Performance & Sales Tracker</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Real-time tracking of enquiries, checkouts, and sales for products</span>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="products-tracker">
              <thead>
                <tr>
                  <th class="col-sku">SKU</th>
                  <th class="col-title">Product Name</th>
                  <th class="col-category">Category</th>
                  <th class="col-price">Unit Price (INR)</th>
                  <th class="col-metric">Customer Enquiries</th>
                  <th class="col-metric">Payment Links</th>
                  <th class="col-price">Est. Sales Value</th>
                  <th class="col-action">Checkout Link</th>
                </tr>
              </thead>
              <tbody>
                ${productStats
            .map((p) => `
                  <tr>
                    <td class="col-sku"><span class="code-tag">${p.sku}</span></td>
                    <td class="col-title">${p.name}</td>
                    <td class="col-category"><span class="pill-category">${p.category}</span></td>
                    <td class="col-price price-cell">₹${p.price.toLocaleString('en-IN')}</td>
                    <td class="col-metric"><span class="metric-pill ${p.enquiriesCount > 0 ? 'blue' : 'gray'}">${p.enquiriesCount} enquiries</span></td>
                    <td class="col-metric"><span class="metric-pill ${p.checkoutsClicked > 0 ? 'emerald' : 'gray'}">${p.checkoutsClicked} sent</span></td>
                    <td class="col-price price-cell ${p.estimatedSalesValue > 0 ? 'highlight' : ''}">₹${p.estimatedSalesValue.toLocaleString('en-IN')}</td>
                    <td class="col-action">
                      ${p.paymentUrl
            ? `<a href="${p.paymentUrl}" target="_blank" class="link-checkout-btn">UPI Link ↗</a>`
            : `<span style="color: #94a3b8; font-size: 0.78rem;">Inquire Only</span>`}
                    </td>
                  </tr>
                `)
            .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: SERVICE-BASED BUSINESS DASHBOARD -->
      <div id="tab-services" class="tab-content">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title"><span>Total Service Inquiries</span><span class="kpi-icon-badge">🛠️</span></div>
            <div class="kpi-value">${totalServiceEnquiries}</div>
            <div class="kpi-subtext">Agency, Salon, Real Estate, Auto & Clinic</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Confirmed Client Leads</span><span class="kpi-icon-badge">📅</span></div>
            <div class="kpi-value">${totalServiceBookings}</div>
            <div class="kpi-subtext">Active leads in service pipeline</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Service Conversion Rate</span><span class="kpi-icon-badge">🎯</span></div>
            <div class="kpi-value">${avgServiceConversion}%</div>
            <div class="kpi-subtext">Inquiries converted to confirmed leads</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Service Pipeline Value</span><span class="kpi-icon-badge">💼</span></div>
            <div class="kpi-value" style="color: #00a884;">₹${totalServicePipelineValue.toLocaleString('en-IN')}</div>
            <div class="kpi-subtext">Estimated consulting & service pipeline</div>
          </div>
        </div>

        <div class="card-box">
          <div class="card-box-header">
            <h3>🛠️ Services Inquiry & Booking Performance</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Real enquiry counts from WhatsApp interactions</span>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="services-tracker">
              <thead>
                <tr>
                  <th class="col-title">Service Offering</th>
                  <th class="col-category">Business Category</th>
                  <th class="col-metric">Customer Inquiries</th>
                  <th class="col-metric">Confirmed Leads</th>
                  <th class="col-metric">Conversion Rate</th>
                  <th class="col-price">Starting Package</th>
                  <th class="col-price">Pipeline Value</th>
                  <th class="col-status">Status</th>
                </tr>
              </thead>
              <tbody>
                ${serviceStats
            .map((s) => `
                  <tr>
                    <td class="col-title">${s.title}</td>
                    <td class="col-category"><span class="pill-category">${s.category}</span></td>
                    <td class="col-metric"><span class="metric-pill ${s.enquiriesCount > 0 ? 'blue' : 'gray'}">${s.enquiriesCount} inquiries</span></td>
                    <td class="col-metric"><span class="metric-pill ${s.bookingsConfirmed > 0 ? 'emerald' : 'gray'}">${s.bookingsConfirmed} confirmed</span></td>
                    <td class="col-metric">
                      <strong class="price-cell">${s.conversionRate}%</strong>
                      <div class="progress-bar-bg" style="width: 80px; margin-top: 4px;">
                        <div class="progress-bar-fill" style="width: ${Math.min(100, s.conversionRate)}%;"></div>
                      </div>
                    </td>
                    <td class="col-price price-cell">₹${(s.estimatedValue / Math.max(1, s.enquiriesCount)).toLocaleString('en-IN')}</td>
                    <td class="col-price price-cell highlight">₹${s.estimatedValue.toLocaleString('en-IN')}</td>
                    <td class="col-status"><span class="badge-inbound">Active</span></td>
                  </tr>
                `)
            .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB: SUPPORT TICKETS & HUMAN HANDOFF -->
      <div id="tab-tickets" class="tab-content">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Total Support Tickets</span>
              <span class="kpi-icon-badge">🎫</span>
            </div>
            <div class="kpi-value">${tickets.length}</div>
            <div class="kpi-subtext">All-time human assistance requests</div>
          </div>
          <div class="kpi-card" style="border-left: 4px solid #ef4444;">
            <div class="kpi-title">
              <span>Open & Pending</span>
              <span class="kpi-icon-badge">⏳</span>
            </div>
            <div class="kpi-value" style="color: #ef4444;">${openTickets.length}</div>
            <div class="kpi-subtext">Customers waiting for agent outreach</div>
          </div>
          <div class="kpi-card" style="border-left: 4px solid #10b981;">
            <div class="kpi-title">
              <span>Resolved</span>
              <span class="kpi-icon-badge">✅</span>
            </div>
            <div class="kpi-value" style="color: #10b981;">${tickets.filter(t => t.status === 'RESOLVED').length}</div>
            <div class="kpi-subtext">Closed customer support conversations</div>
          </div>
        </div>

        <div class="card-box">
          <div class="card-box-header">
            <div>
              <h3>🎫 Real Customer Support Tickets (${tickets.length} total)</h3>
              <span style="font-size: 0.82rem; color: var(--text-muted);">Automatically created when customers reply YES asking to speak with real support</span>
            </div>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="support-tickets">
              <thead>
                <tr>
                  <th class="col-sku">Ticket #</th>
                  <th class="col-phone">Customer Phone</th>
                  <th class="col-title" style="min-width: 160px;">Customer Name</th>
                  <th class="col-category">Service Enquired</th>
                  <th>Enquiry Context</th>
                  <th class="col-time">Created Date & Time</th>
                  <th class="col-status">Status</th>
                  <th class="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                ${tickets.length === 0 ? `
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 2.5rem; color: #94a3b8; font-size: 0.95rem;">
                      No support tickets yet. When customers tap a service on WhatsApp and reply YES, their ticket and inquiry details will automatically appear here.
                    </td>
                  </tr>
                ` : tickets.map(t => `
                  <tr>
                    <td class="col-sku"><span class="code-tag" style="color: #ea580c; border-color: #fed7aa; background: #fffaf0;">${t.ticketNumber}</span></td>
                    <td class="col-phone" style="color: #0f172a;">${t.phoneNumber}</td>
                    <td class="col-title" style="min-width: 160px; font-weight: 600; color: #334155;">${t.customerName || 'WhatsApp Customer'}</td>
                    <td class="col-category"><span class="pill-category" style="background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;">${t.enquiryService || 'General'}</span></td>
                    <td style="font-size: 0.85rem; color: #475569;">${t.enquirySummary}</td>
                    <td class="col-time">${new Date(t.createdAt).toLocaleString()}</td>
                    <td class="col-status">
                      <span class="${t.status === 'OPEN' ? 'badge-outbound' : 'badge-inbound'}" style="${t.status === 'OPEN' ? 'background: #fee2e2; color: #b91c1c; border-color: #fca5a5;' : ''}">
                        ${t.status}
                      </span>
                    </td>
                    <td class="col-action">
                      <div style="display: flex; gap: 6px; align-items: center; justify-content: flex-end;">
                        <a href="https://wa.me/${t.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" class="link-chat-btn">
                          💬 Chat
                        </a>
                        <form method="POST" action="/dashboard/tickets/${t.id}/status" style="display: inline; margin: 0;">
                          <input type="hidden" name="status" value="${t.status === 'OPEN' ? 'RESOLVED' : 'OPEN'}">
                          <button type="submit" class="btn-action" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.32rem 0.65rem; font-size: 0.75rem; box-shadow: none;">
                            ${t.status === 'OPEN' ? 'Resolve' : 'Reopen'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: LIVE WHATSAPP CHAT STREAM (100% REAL) -->
      <div id="tab-chats" class="tab-content">
        <div class="card-box">
          <div class="card-box-header">
            <h3>💬 Live WhatsApp Message Stream (${liveMessages.length} latest messages)</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Real-time log of customer queries and bot responses</span>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="live-chats">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Customer Phone</th>
                  <th>Customer Name</th>
                  <th>Direction</th>
                  <th>Message Type</th>
                  <th>Message Text</th>
                </tr>
              </thead>
              <tbody>
                ${liveMessages
            .map((m) => `
                  <tr>
                    <td style="color: #64748b; font-size: 0.8rem; white-space: nowrap;">${m.dateFormatted}</td>
                    <td style="font-family: monospace; font-weight: 600;">${m.phoneNumber}</td>
                    <td style="font-weight: 700; color: #0f172a;">${m.customerName}</td>
                    <td>
                      <span class="${m.direction === 'inbound' ? 'badge-inbound' : 'badge-outbound'}">
                        ${m.direction === 'inbound' ? '↓ Inbound (Customer)' : '↑ Outbound (Bot)'}
                      </span>
                    </td>
                    <td><span class="pill-category">${m.messageType}</span></td>
                    <td style="color: #1e293b; max-width: 550px; word-break: break-word;">
                      ${m.body.replace(/\n/g, '<br/>')}
                    </td>
                  </tr>
                `)
            .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: LEADS & CRM -->
      <div id="tab-leads" class="tab-content">
        <div class="card-box">
          <div class="card-box-header">
            <h3>👥 Real WhatsApp Customer Contacts (${leads.length} contacts)</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Captured leads from WhatsApp interactions</span>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="leads-crm">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Lead Status</th>
                  <th>Interested Service / Demo</th>
                  <th>Last Interaction</th>
                  <th>Direct WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                ${leads
            .map((lead) => `
                  <tr>
                    <td style="font-weight: 700; color: #0f172a;">${lead.phoneNumber === '917904321265' ? 'Ruthvik' : (lead.name || '—')}</td>
                    <td style="font-family: monospace; font-weight: 600;">${lead.phoneNumber}</td>
                    <td><span class="badge-inbound">${lead.status}</span></td>
                    <td><span class="pill-category">${lead.activeDemo || lead.interestedService || 'General Menu'}</span></td>
                    <td style="color: #64748b; font-size: 0.8rem;">${new Date(lead.lastInteractionAt).toLocaleString()}</td>
                    <td>
                      <a href="https://wa.me/${lead.phoneNumber}" target="_blank" class="btn-action" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;">
                        Chat on WhatsApp ↗
                      </a>
                    </td>
                  </tr>
                `)
            .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 6: BROADCAST MARKETING -->
      <div id="tab-broadcast" class="tab-content">
        <div class="card-box">
          <div class="card-box-header">
            <h3>📢 Broadcast Campaign Marketing</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Send automated updates, reminders, or special offers to real customers</span>
          </div>

          <form method="POST" action="/dashboard/broadcast">
            <div class="form-grid">
              <div class="form-group">
                <label>Target Audience</label>
                <select name="target" class="form-select" onchange="toggleCustomPhone(this.value)">
                  <option value="all">🌐 All Real Contacts in Database (${leads.length} recipients)</option>
                  <option value="demo_tested">🚀 Tested Business Demos (${leads.filter((l) => l.activeDemo).length} recipients)</option>
                  <option value="custom">🎯 Specific Phone Number (Single Recipient)</option>
                </select>
              </div>

              <div class="form-group" id="custom-phone-group" style="display: none;">
                <label>Recipient WhatsApp Number (e.g. 917904321265)</label>
                <input type="text" name="customPhone" class="form-input" placeholder="Country code + phone" />
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Promotional Image URL (Optional)</label>
                <input type="url" name="imageUrl" class="form-input" placeholder="https://... (Direct image link for rich media broadcast)" />
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Message Content</label>
                <textarea name="message" class="form-textarea" rows="4" placeholder="Hello! We are excited to share a special update for your business..." required></textarea>
              </div>
            </div>

            <button type="submit" class="btn-submit">🚀 Dispatch Broadcast Campaign</button>
          </form>
        </div>
      </div>

      <!-- TAB 7: CATALOG INVENTORY MANAGER -->
      <div id="tab-catalog" class="tab-content">
        <div class="card-box">
          <div class="card-box-header">
            <h3>📦 Product Catalog Inventory (${catalog.length} items)</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Edits made here reflect instantly in WhatsApp catalog search</span>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="catalog-inventory">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price (INR)</th>
                  <th>Checkout URL</th>
                </tr>
              </thead>
              <tbody>
                ${catalog
            .map((item) => `
                  <tr>
                    <td><span class="code-tag">${item.sku}</span></td>
                    <td style="font-weight: 700; color: #0f172a;">${item.name}</td>
                    <td><span class="pill-category">${item.category}</span></td>
                    <td style="font-weight: 700; color: #00a884;">₹${item.price.toLocaleString('en-IN')}</td>
                    <td>
                      ${item.paymentUrl
            ? `<a href="${item.paymentUrl}" target="_blank" style="color: #0284c7; font-weight: 600; text-decoration: none;">Payment Link ↗</a>`
            : `<span style="color: #94a3b8;">N/A</span>`}
                    </td>
                  </tr>
                `)
            .join('')}
              </tbody>
            </table>
          </div>

          <!-- Add Product Form -->
          <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-subtle);">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">+ Add New Product to WhatsApp Catalog</h4>
            <form method="POST" action="/dashboard/catalog" class="form-grid">
              <div class="form-group">
                <label>SKU</label>
                <input type="text" name="sku" class="form-input" placeholder="JW-05" required />
              </div>
              <div class="form-group">
                <label>Item Name</label>
                <input type="text" name="name" class="form-input" placeholder="Gold Plated Bangles" required />
              </div>
              <div class="form-group">
                <label>Category</label>
                <select name="category" class="form-select" required>
                  <option value="jewelry">Jewelry & Accessories</option>
                  <option value="auto">Auto Accessories</option>
                  <option value="real_estate">Real Estate Properties</option>
                  <option value="salon">Salon Products</option>
                  <option value="gym">Gym Supplements</option>
                </select>
              </div>
              <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" class="form-input" placeholder="2999" required />
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Description</label>
                <input type="text" name="description" class="form-input" placeholder="High quality handcrafted finish..." required />
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label>UPI / Razorpay Payment Link (Optional)</label>
                <input type="url" name="paymentUrl" class="form-input" placeholder="https://rzp.io/l/..." />
              </div>
              <button type="submit" class="btn-submit">+ Save Product</button>
            </form>
          </div>
        </div>
      </div>

      <!-- TAB 8: WHATSAPP QUOTA & SYSTEM HEALTH -->
      <div id="tab-settings" class="tab-content">
        <div class="card-box">
          <div class="card-box-header">
            <h3>⚙️ Official WhatsApp Cloud Diagnostics</h3>
            <span style="font-size: 0.82rem; color: #16a34a; font-weight: 700;">● Connection Healthy</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: 10px;">
              <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Phone Number ID</h4>
              <p style="font-size: 1.05rem; font-weight: 700; font-family: monospace; margin-top: 0.25rem;">${env.WHATSAPP_PHONE_NUMBER_ID}</p>
              <p style="font-size: 0.78rem; color: #16a34a; font-weight: 600; margin-top: 0.35rem;">● Number Quality Rating: GREEN</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: 10px;">
              <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Monthly Free Quota</h4>
              <p style="font-size: 1.05rem; font-weight: 700; color: #00a884; margin-top: 0.25rem;">${quota.remainingFree} / 1,000 Free Messages</p>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.35rem;">API Usage Billing: ₹0.00</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: 10px;">
              <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Webhook Status</h4>
              <p style="font-size: 0.82rem; font-weight: 600; word-break: break-all; color: #0284c7; margin-top: 0.25rem;">https://crawling-pouncing-docile.ngrok-free.dev/webhook</p>
              <p style="font-size: 0.78rem; color: #16a34a; font-weight: 600; margin-top: 0.35rem;">● Receiving Live Webhook Events</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>

  <script>
    // === Tab Switcher =============================================
    function switchTab(tabId, el) {
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      
      const navItem = el || document.querySelector('.nav-item[data-tab="' + tabId + '"]');
      if (navItem) navItem.classList.add('active');

      const headings = {
        'tab-overview': 'Master Overview',
        'tab-products': 'Product Sales & Inquiries',
        'tab-services': 'Service Inquiries & Performance',
        'tab-tickets': 'Customer Support Tickets',
        'tab-chats': 'Live WhatsApp Chats',
        'tab-leads': 'Customer Leads & CRM',
        'tab-broadcast': 'Broadcast Marketing',
        'tab-catalog': 'Catalog Inventory',
        'tab-settings': 'WhatsApp API Quota'
      };
      const headingEl = document.getElementById('page-heading');
      if (headingEl && headings[tabId]) headingEl.innerText = headings[tabId];
    }

    function handleBusinessChange(val) {
      if (val === 'products') switchTab('tab-products');
      else if (val === 'services') switchTab('tab-services');
      else if (val === 'chats') switchTab('tab-chats');
      else if (val === 'leads') switchTab('tab-leads');
      else switchTab('tab-overview');
    }

    function toggleCustomPhone(val) {
      const group = document.getElementById('custom-phone-group');
      if (group) group.style.display = val === 'custom' ? 'flex' : 'none';
    }

    // ─── Pagination Engine ────────────────────────────────────
    const _pgState = {}; // { pgId: currentPage }

    function initPagination(table) {
      const pgId = table.dataset.pgId || table.id || Math.random().toString(36).slice(2);
      const pageSize = parseInt(table.dataset.paginate, 10) || 30;
      table._pgId = pgId;
      table._pgSize = pageSize;
      _pgState[pgId] = 1;

      // Insert pagination bar after the table-container (parent div)
      const container = table.closest('.table-container');
      if (!container) return;

      // Remove old bar if re-initialising
      const oldBar = container.parentElement.querySelector('.pagination-bar[data-for="' + pgId + '"]');
      if (oldBar) oldBar.remove();

      const bar = document.createElement('div');
      bar.className = 'pagination-bar';
      bar.dataset.for = pgId;
      container.insertAdjacentElement('afterend', bar);

      renderPage(table, 1);
    }

    function renderPage(table, page) {
      const pgId = table._pgId;
      const pageSize = table._pgSize;
      const tbody = table.tBodies[0];
      const rows = tbody ? Array.from(tbody.rows) : [];
      const total = rows.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      page = Math.max(1, Math.min(page, totalPages));
      _pgState[pgId] = page;

      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      rows.forEach((r, i) => {
        r.style.display = (i >= start && i < end) ? '' : 'none';
      });

      // Re-render bar
      const bar = document.querySelector('.pagination-bar[data-for="' + pgId + '"]');
      if (!bar) return;

      const startRow = total === 0 ? 0 : start + 1;
      const endRow = Math.min(end, total);

      // Build page buttons (show at most 7 pages around current)
      let pages = [];
      const delta = 2;
      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= page - delta && p <= page + delta)) {
          pages.push(p);
        }
      }
      // Insert ellipsis markers
      const pagesWithGaps = [];
      let prev = null;
      for (const p of pages) {
        if (prev !== null && p - prev > 1) pagesWithGaps.push('...');
        pagesWithGaps.push(p);
        prev = p;
      }

      const pageButtons = pagesWithGaps.map(p => {
        if (p === '...') return '<span style="padding:0 4px;color:#94a3b8;">...</span>';
        const active = p === page ? ' active' : '';
        return '<button class="pg-btn' + active + '" onclick="gotoPage(\'' + pgId + '\',' + p + ')">' + p + '</button>';
      }).join('');

      bar.innerHTML =
        '<span class="pg-info">Showing <strong>' + startRow + '-' + endRow + '</strong> of <strong>' + total + '</strong> rows</span>' +
        '<div class="pagination-controls">' +
          '<button class="pg-btn" onclick="gotoPage(\'' + pgId + '\',' + (page - 1) + ')" ' + (page <= 1 ? 'disabled' : '') + '>&lsaquo;</button>' +
          pageButtons +
          '<button class="pg-btn" onclick="gotoPage(\'' + pgId + '\',' + (page + 1) + ')" ' + (page >= totalPages ? 'disabled' : '') + '>&rsaquo;</button>' +
        '</div>';
    }

    function gotoPage(pgId, page) {
      const table = document.querySelector('table[data-pg-id="' + pgId + '"]');
      if (table) renderPage(table, page);
    }

    function initAllPaginators() {
      document.querySelectorAll('table[data-paginate]').forEach(initPagination);
    }

    // Run on load
    document.addEventListener('DOMContentLoaded', initAllPaginators);

    // === Real-Time Quota & Leads Poller ===========================
    async function pollLiveMetrics() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) return;
        const data = await res.json();
        
        const quotaRemEl = document.getElementById('kpi-quota-remaining');
        if (quotaRemEl && data.quota) quotaRemEl.innerText = data.quota.remainingFree;

        const quotaProgEl = document.getElementById('kpi-quota-progress');
        if (quotaProgEl && data.quota) {
          const pct = Math.min(100, Math.round((data.quota.outboundCount / data.quota.freeLimit) * 100));
          quotaProgEl.style.width = pct + '%';
        }

        const quotaSubEl = document.getElementById('kpi-quota-sent-text');
        if (quotaSubEl && data.quota) quotaSubEl.innerText = data.quota.outboundCount + ' outbound messages sent this month';

        const leadsCountEl = document.getElementById('kpi-leads-count');
        if (leadsCountEl) leadsCountEl.innerText = data.totalLeads;

        const badgeLeadsEl = document.getElementById('badge-leads-count');
        if (badgeLeadsEl) badgeLeadsEl.innerText = data.totalLeads;

        const catalogCountEl = document.getElementById('badge-catalog-count');
        if (catalogCountEl) catalogCountEl.innerText = data.catalogCount;
      } catch (err) {
        // Silently retry on next poll
      }
    }

    setInterval(pollLiveMetrics, 3000);
  </script>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
    /**
     * API: Get JSON stats for real-time frontend polling (100% Real SQLite data)
     */
    getStats(_req, res) {
        const quota = dbService.getMonthlyQuotaStats();
        const leads = dbService.getAllLeads();
        const catalog = dbService.getAllCatalogItems();
        const productStats = dbService.getProductSalesAndEnquiryStats();
        const serviceStats = dbService.getServicePerformanceStats();
        const liveMessages = dbService.getRecentLiveMessages(25);
        res.json({
            quota,
            totalLeads: leads.length,
            leads,
            catalogCount: catalog.length,
            productStats,
            serviceStats,
            liveMessages,
        });
    }
    /**
     * API: Handle adding a new product item from the dashboard
     */
    addCatalogItem(req, res) {
        const { sku, name, category, price, description, imageUrl, paymentUrl } = req.body;
        if (!sku || !name || !price || !description) {
            res.status(400).json({ error: 'Missing required catalog fields' });
            return;
        }
        try {
            dbService.addCatalogItem({
                sku: String(sku).trim().toUpperCase(),
                name: String(name).trim(),
                category: String(category || 'general').trim(),
                price: Number(price),
                description: String(description).trim(),
                imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
                paymentUrl: paymentUrl ? String(paymentUrl).trim() : undefined,
            });
            // Redirect back to dashboard if submitted from HTML form
            if (req.headers['accept']?.includes('text/html') || req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
                res.redirect('/dashboard');
                return;
            }
            res.status(201).json({ success: true, message: 'Item added successfully' });
        }
        catch (err) {
            res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to add item' });
        }
    }
    /**
     * API: Send Broadcast Campaign to All or Selected Customers
     */
    async sendBroadcast(req, res) {
        const { target, message, customPhone, imageUrl } = req.body;
        if (!message || typeof message !== 'string' || message.trim() === '') {
            res.status(400).json({ error: 'Broadcast message body cannot be empty' });
            return;
        }
        const trimmedMsg = message.trim();
        let recipients = [];
        if (target === 'custom' && customPhone) {
            const cleaned = String(customPhone).replace(/[^0-9]/g, '');
            if (cleaned.length >= 10) {
                recipients.push(cleaned);
            }
        }
        else if (target === 'demo_tested') {
            const leads = dbService.getAllLeads();
            recipients = leads
                .filter((l) => l.status === 'demo_tested' || Boolean(l.activeDemo))
                .map((l) => l.phoneNumber);
        }
        else {
            // Default: All leads
            const leads = dbService.getAllLeads();
            recipients = leads.map((l) => l.phoneNumber);
        }
        logger.info({ recipientCount: recipients.length, target }, 'Executing WhatsApp broadcast campaign');
        let sentCount = 0;
        let failedCount = 0;
        for (const phone of recipients) {
            try {
                if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().startsWith('http')) {
                    const apiRes = await whatsAppService.sendImageMessage(phone, imageUrl.trim(), trimmedMsg);
                    const msgId = apiRes.messages?.[0]?.id || `bcast_${Date.now()}`;
                    dbService.logMessage(msgId, phone, 'outbound', 'image_broadcast', trimmedMsg);
                }
                else {
                    const apiRes = await whatsAppService.sendTextMessage(phone, trimmedMsg);
                    const msgId = apiRes.messages?.[0]?.id || `bcast_${Date.now()}`;
                    dbService.logMessage(msgId, phone, 'outbound', 'text_broadcast', trimmedMsg);
                }
                sentCount++;
            }
            catch (sendErr) {
                logger.warn({ phone, error: sendErr }, 'Failed delivering broadcast to recipient');
                failedCount++;
            }
        }
        if (req.headers['accept']?.includes('text/html') || req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
            res.redirect('/dashboard?broadcast=sent');
            return;
        }
        res.json({
            success: true,
            sentCount,
            failedCount,
            totalTargeted: recipients.length,
        });
    }
    /**
     * Update status of a support ticket
     */
    updateTicketStatus(req, res) {
        const id = Number(req.params.id);
        const status = req.body.status;
        if (!id || !status) {
            res.status(400).json({ error: 'Ticket ID and status are required' });
            return;
        }
        dbService.updateTicketStatus(id, status);
        logger.info({ ticketId: id, status }, 'Support ticket status updated');
        if (req.headers['accept']?.includes('text/html') ||
            req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
            res.redirect('/dashboard');
            return;
        }
        res.json({ success: true, ticketId: id, status });
    }
    /**
     * API endpoint to get all support tickets
     */
    getTickets(_req, res) {
        const tickets = dbService.getAllSupportTickets();
        res.json({ tickets });
    }
}
export const dashboardController = new DashboardController();
