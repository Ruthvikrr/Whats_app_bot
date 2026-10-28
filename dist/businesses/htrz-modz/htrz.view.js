import { HTRZ_PRODUCTS } from './htrz.catalog.js';
// Crisp inline Lucide SVG icons (no external dependency, zero emojis)
const SVG = {
    logo: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`,
    overview: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    tickets: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
    messages: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    catalog: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    checkCircle: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    reply: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
    alertTriangle: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`
};
function formatTime(dateInput) {
    if (!dateInput)
        return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime()))
        return String(dateInput);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isToday)
        return `Today ${time}`;
    return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
}
export function renderHtrzDashboardHtml(data) {
    const { outboundCount, clientFreeLimit, remainingFree, openTickets, resolvedTickets, totalLeadsCount, recentMessages = [], categoryInquiries = [], isDemo = false, } = data;
    const usagePercent = Math.min(100, Math.round((outboundCount / clientFreeLimit) * 100));
    const totalInquiriesCount = categoryInquiries.reduce((sum, c) => sum + c.count, 0);
    const totalTickets = openTickets.length + resolvedTickets.length;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTRZ Modz — Client Partner Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --border: #e2e8f0;
      --border-subtle: #f1f5f9;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #00a884;
      --primary-dark: #008f6f;
      --primary-tint: #ecfdf5;
      --client-accent: #f59e0b; /* Customizable per-client accent color */
      --client-accent-tint: #fffbeb;
      --client-accent-border: #fde68a;
      --client-accent-text: #b45309;
      --radius: 12px;
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
      min-height: 100vh;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Left Sidebar */
    #app-sidebar {
      width: 240px;
      min-width: 240px;
      background: #ffffff;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      box-sizing: border-box;
      z-index: 100;
      transition: transform 0.25s ease;
    }

    .brand-header {
      padding: 1.25rem 1.15rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    /* Client Logo Slot */
    .client-logo-slot {
      width: 38px;
      height: 38px;
      min-width: 38px;
      background: var(--client-accent);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
    }

    .brand-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .brand-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.85rem 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      color: #475569;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      user-select: none;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: var(--text-main);
    }

    .nav-item.active {
      background: var(--primary-tint);
      color: var(--primary-dark);
      font-weight: 700;
      border-color: #a7f3d0;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      font-size: 14px;
      font-weight: 700;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      background: var(--client-accent-tint);
      color: var(--client-accent-text);
      border: 1px solid var(--client-accent-border);
    }

    .sidebar-footer {
      padding: 1rem 1.15rem;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      font-size: 14px;
      color: var(--text-muted);
    }

    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    /* Main Area */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--bg-page);
    }

    header {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.4rem;
      cursor: pointer;
      color: var(--text-main);
    }

    h1#page-heading {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .demo-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      background: ${isDemo ? 'var(--client-accent-tint)' : '#f8fafc'};
      color: ${isDemo ? 'var(--client-accent-text)' : 'var(--text-muted)'};
      border: 1px solid ${isDemo ? 'var(--client-accent-border)' : 'var(--border)'};
    }

    .demo-toggle-btn:hover {
      background: #f1f5f9;
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.75rem;
      border: 1px solid var(--border);
      background: #ffffff;
      color: var(--text-muted);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
    }

    .btn-logout:hover {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #fca5a5;
    }

    .dashboard-container {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Demo Banner */
    .demo-banner {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: var(--radius);
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      color: #92400e;
      font-size: 14px;
      font-weight: 700;
    }

    /* Top KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }

    .card-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }

    .kpi-card {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .kpi-card.amber-alert {
      border-left: 4px solid var(--client-accent);
      background: #fffdfa;
    }

    .kpi-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .kpi-subtext {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Quota Card */
    .quota-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .progress-bar-bg {
      width: 220px;
      max-width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .card-header {
      padding: 1.15rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .chart-container {
      padding: 1.5rem;
      position: relative;
      height: 300px;
    }

    .empty-chart-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
      padding: 1rem;
    }

    /* Tables */
    .table-container {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }

    th {
      background: #f8fafc;
      padding: 0.85rem 1.25rem;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-main);
      vertical-align: middle;
      font-size: 14px;
    }

    tr:hover td {
      background: #fbfcfe;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
    }

    .badge-open {
      background: var(--client-accent-tint);
      color: var(--client-accent-text);
      border: 1px solid var(--client-accent-border);
    }

    .badge-resolved {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge-customer {
      background: #f1f5f9;
      color: #334155;
    }

    .badge-bot {
      background: #eff6ff;
      color: #1d4ed8;
    }

    /* Buttons */
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      background: var(--primary);
      color: #ffffff;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .btn-action:hover {
      background: var(--primary-dark);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.75rem;
      background: #ffffff;
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .btn-secondary:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    /* Tab navigation */
    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Mobile Responsive (down to 360px wide) */
    @media (max-width: 900px) {
      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      body {
        flex-direction: column;
      }

      #app-sidebar {
        position: fixed;
        left: -260px;
        top: 0;
        bottom: 0;
        width: 260px;
        box-shadow: 4px 0 20px rgba(0,0,0,0.1);
      }

      #app-sidebar.open {
        transform: translateX(260px);
      }

      .mobile-menu-btn {
        display: block;
      }

      .dashboard-container {
        padding: 1rem;
        gap: 1rem;
      }

      header {
        padding: 0.75rem 1rem;
      }
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <aside id="app-sidebar">
    <div class="brand-header">
      <!-- Client Logo Slot -->
      <div class="client-logo-slot">
        ${SVG.logo}
      </div>
      <div>
        <div class="brand-title">HTRZ MODZ</div>
        <div class="brand-subtitle">Motorcycle Store Portal</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-item active" data-tab="tab-overview" onclick="switchHtrzTab('tab-overview', this)">
        <span class="nav-icon">${SVG.overview}</span>
        <span class="nav-label">Overview</span>
      </div>

      <div class="nav-item" data-tab="tab-tickets" onclick="switchHtrzTab('tab-tickets', this)">
        <span class="nav-icon">${SVG.tickets}</span>
        <span class="nav-label">Rider Enquiries</span>
        <span class="nav-badge" id="sidebar-tickets-badge" style="${openTickets.length > 0 ? '' : 'display:none;'}">
          ${openTickets.length}
        </span>
      </div>

      <div class="nav-item" data-tab="tab-messages" onclick="switchHtrzTab('tab-messages', this)">
        <span class="nav-icon">${SVG.messages}</span>
        <span class="nav-label">Live Chats</span>
      </div>

      <div class="nav-item" data-tab="tab-catalog" onclick="switchHtrzTab('tab-catalog', this)">
        <span class="nav-icon">${SVG.catalog}</span>
        <span class="nav-label">Gear & Accessories</span>
      </div>

      <div class="nav-item" data-tab="tab-settings" onclick="switchHtrzTab('tab-settings', this)">
        <span class="nav-icon">${SVG.settings}</span>
        <span class="nav-label">Settings & Quota</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span class="status-dot"></span>
        <span>Connected</span>
      </div>
      <a href="/logout" class="btn-logout" title="Sign out of portal">
        ${SVG.logout}
      </a>
    </div>
  </aside>

  <!-- Main Viewport -->
  <main>
    <header>
      <div class="header-left">
        <button class="mobile-menu-btn" onclick="toggleMobileSidebar()" aria-label="Open navigation menu">
          ${SVG.menu}
        </button>
        <h1 id="page-heading">Store Overview</h1>
      </div>

      <div class="header-right">
        <!-- Demo Mode Toggle -->
        <a href="${isDemo ? '?demo=false' : '?demo=true'}" class="demo-toggle-btn">
          <span class="nav-icon">${SVG.sparkles}</span>
          <span>${isDemo ? 'DEMO DATA (Click to Exit)' : 'Demo Mode: OFF'}</span>
        </a>

        <a href="/logout" class="btn-logout">
          <span>Sign Out</span>
        </a>
      </div>
    </header>

    <div class="dashboard-container">
      ${isDemo
        ? `<div class="demo-banner">
              <div>DEMO DATA — Viewing in-memory sample dataset. No real database records are changed.</div>
              <a href="?demo=false" class="btn-secondary" style="padding: 0.35rem 0.65rem;">Turn Off</a>
            </div>`
        : ''}

      <!-- TAB 1: OVERVIEW -->
      <div id="tab-overview" class="tab-content active">
        <!-- Top 4 KPI Summary Cards -->
        <div class="kpi-grid">
          <div class="card-box kpi-card">
            <div class="kpi-title">
              <span>Saved Rider Contacts</span>
              <span class="nav-icon">${SVG.overview}</span>
            </div>
            <div class="kpi-value">${totalLeadsCount}</div>
            <div class="kpi-subtext">Riders connected on WhatsApp</div>
          </div>

          <div class="card-box kpi-card">
            <div class="kpi-title">
              <span>Catalog Inquiries</span>
              <span class="nav-icon">${SVG.catalog}</span>
            </div>
            <div class="kpi-value">${totalInquiriesCount}</div>
            <div class="kpi-subtext">Part & accessory queries</div>
          </div>

          <div class="card-box kpi-card ${openTickets.length > 0 ? 'amber-alert' : ''}">
            <div class="kpi-title">
              <span>Chats Waiting for Human</span>
              <span class="nav-icon">${SVG.tickets}</span>
            </div>
            <div class="kpi-value" style="color: ${openTickets.length > 0 ? 'var(--client-accent-text)' : 'inherit'};">
              ${openTickets.length}
            </div>
            <div class="kpi-subtext">${openTickets.length > 0 ? 'Require your staff reply' : 'All caught up'}</div>
          </div>

          <div class="card-box kpi-card">
            <div class="kpi-title">
              <span>Resolved Enquiries</span>
              <span class="nav-icon">${SVG.checkCircle}</span>
            </div>
            <div class="kpi-value">${resolvedTickets.length}</div>
            <div class="kpi-subtext">Successfully answered</div>
          </div>
        </div>

        <!-- Quota Usage Card -->
        <div class="quota-card">
          <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">Free Tier Message Quota (Cap: ${clientFreeLimit})</div>
            <div style="font-size: 14px; color: var(--text-muted); margin-top: 0.2rem;">
              <strong>${outboundCount}</strong> used of <strong>${clientFreeLimit}</strong> free tier
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${usagePercent}%;"></div>
            </div>
            <div style="font-weight: 700; color: var(--primary); font-size: 14px;">
              ${remainingFree.toLocaleString('en-IN')} left
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- Real Category Inquiries Bar Chart -->
          <div class="card-box">
            <div class="card-header">
              <span class="card-title">Category Inquiries Received</span>
              <span style="font-size: 14px; color: var(--text-muted);">Real-time</span>
            </div>
            <div class="chart-container">
              ${totalInquiriesCount === 0 && !isDemo
        ? `<div class="empty-chart-state">
                      <p style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">No enquiries yet</p>
                      <p>Charts appear once riders message your bot.</p>
                    </div>`
        : `<canvas id="categoryChart"></canvas>`}
            </div>
          </div>

          <!-- Resolution Rate Donut Chart -->
          <div class="card-box">
            <div class="card-header">
              <span class="card-title">Inquiry Resolution Rate</span>
            </div>
            <div class="chart-container" style="display: flex; align-items: center; justify-content: center;">
              <canvas id="resolutionChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Needs Attention: Waiting Tickets -->
        <div class="card-box">
          <div class="card-header">
            <div>
              <span class="card-title">Enquiries Requiring Human Attention</span>
              <p style="font-size: 14px; color: var(--text-muted); margin-top: 0.2rem;">Riders seeking custom advice, stock availability, or booking confirmation</p>
            </div>
            <span class="badge ${openTickets.length > 0 ? 'badge-open' : 'badge-resolved'}">
              ${openTickets.length} Pending
            </span>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Rider Name</th>
                  <th>Phone Number</th>
                  <th>Interest</th>
                  <th>Summary</th>
                  <th>Created</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${openTickets.length === 0
        ? `<tr>
                        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                          All caught up! No open enquiries waiting for a reply.
                        </td>
                      </tr>`
        : openTickets
            .map((t) => `
                    <tr>
                      <td style="font-weight: 700; color: var(--client-accent-text);">${t.ticketNumber}</td>
                      <td style="font-weight: 700;">${t.customerName || 'Rider'}</td>
                      <td>${t.phoneNumber}</td>
                      <td><span class="badge badge-open">${t.enquiryService || 'Inquiry'}</span></td>
                      <td style="max-width: 280px; word-break: break-word;">${t.enquirySummary}</td>
                      <td>${formatTime(t.createdAt)}</td>
                      <td style="text-align: right; white-space: nowrap;">
                        <a href="https://wa.me/${t.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="btn-action" style="padding: 0.35rem 0.65rem;">
                          <span class="nav-icon">${SVG.reply}</span>
                          <span>Reply</span>
                        </a>
                        <button onclick="resolveTicket(${t.id})" class="btn-secondary" style="padding: 0.35rem 0.65rem; margin-left: 0.35rem;">
                          Mark resolved
                        </button>
                      </td>
                    </tr>
                  `)
            .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: TICKETS -->
      <div id="tab-tickets" class="tab-content">
        <div class="card-box">
          <div class="card-header">
            <div>
              <span class="card-title">All Rider Enquiries (${totalTickets})</span>
              <p style="font-size: 14px; color: var(--text-muted); margin-top: 0.2rem;">Complete support history for HTRZ Modz</p>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Status</th>
                  <th>Rider Name</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Created</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${[...openTickets, ...resolvedTickets].length === 0
        ? `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No enquiries recorded yet.</td></tr>`
        : [...openTickets, ...resolvedTickets]
            .map((t) => `
                    <tr>
                      <td style="font-weight: 700;">${t.ticketNumber}</td>
                      <td>
                        <span class="badge ${t.status === 'RESOLVED' ? 'badge-resolved' : 'badge-open'}">
                          ${t.status === 'RESOLVED' ? 'Resolved' : 'Pending'}
                        </span>
                      </td>
                      <td style="font-weight: 700;">${t.customerName || 'Rider'}</td>
                      <td>${t.phoneNumber}</td>
                      <td>${t.enquirySummary}</td>
                      <td>${formatTime(t.createdAt)}</td>
                      <td style="text-align: right; white-space: nowrap;">
                        <a href="https://wa.me/${t.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 0.35rem 0.65rem;">
                          Reply ↗
                        </a>
                        ${t.status !== 'RESOLVED'
            ? `<button onclick="resolveTicket(${t.id})" class="btn-action" style="padding: 0.35rem 0.65rem; margin-left: 0.35rem;">Resolve</button>`
            : `<button onclick="reopenTicket(${t.id})" class="btn-secondary" style="padding: 0.35rem 0.65rem; margin-left: 0.35rem;">Reopen</button>`}
                      </td>
                    </tr>
                  `)
            .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: LIVE MESSAGES -->
      <div id="tab-messages" class="tab-content">
        <div class="card-box">
          <div class="card-header">
            <div>
              <span class="card-title">Live WhatsApp Conversations</span>
              <p style="font-size: 14px; color: var(--text-muted); margin-top: 0.2rem;">Real-time incoming and outgoing transcripts</p>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Rider</th>
                  <th>Sender</th>
                  <th>Message Body</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentMessages.length === 0
        ? `<tr><td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No messages logged yet.</td></tr>`
        : recentMessages
            .map((m) => `
                    <tr>
                      <td style="white-space: nowrap; color: var(--text-muted);">${formatTime(m.dateFormatted)}</td>
                      <td style="font-weight: 700;">
                        <div>${m.customerName || 'Rider'}</div>
                        <div style="font-size: 14px; font-weight: 500; color: var(--text-muted);">${m.phoneNumber}</div>
                      </td>
                      <td>
                        <span class="badge ${m.direction === 'inbound' ? 'badge-customer' : 'badge-bot'}">
                          ${m.direction === 'inbound' ? 'Rider' : 'Bot'}
                        </span>
                      </td>
                      <td style="max-width: 360px; word-break: break-word;">${m.body.replace(/\n/g, '<br/>')}</td>
                      <td style="text-align: right;">
                        <a href="https://wa.me/${m.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 0.35rem 0.65rem;">
                          Reply ↗
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

      <!-- TAB 4: CATALOG -->
      <div id="tab-catalog" class="tab-content">
        <div class="card-box">
          <div class="card-header">
            <div>
              <span class="card-title">HTRZ Modz Products (${HTRZ_PRODUCTS.length} Items)</span>
              <p style="font-size: 14px; color: var(--text-muted); margin-top: 0.2rem;">Live motorcycle accessories and gear catalog</p>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Compatibility</th>
                </tr>
              </thead>
              <tbody>
                ${HTRZ_PRODUCTS.map((p) => `
                  <tr>
                    <td style="font-weight: 700;">${p.name}</td>
                    <td><span class="badge badge-customer">${p.categoryLabel}</span></td>
                    <td style="font-weight: 700; color: var(--primary-dark);">₹${p.price.toLocaleString('en-IN')}</td>
                    <td style="color: var(--text-muted);">${p.compatibility}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: SETTINGS -->
      <div id="tab-settings" class="tab-content">
        <div class="card-box">
          <div class="card-header">
            <div>
              <span class="card-title">Portal Settings & Integration</span>
              <p style="font-size: 14px; color: var(--text-muted); margin-top: 0.2rem;">Client connection parameters</p>
            </div>
          </div>

          <div style="padding: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            <div style="background: #f8fafc; border: 1px solid var(--border); padding: 1.25rem; border-radius: 10px;">
              <div style="font-size: 14px; color: var(--text-muted); font-weight: 700;">BUSINESS NAME</div>
              <p style="font-size: 16px; font-weight: 700; margin-top: 0.35rem;">HTRZ Modz</p>
              <p style="font-size: 14px; color: #16a34a; font-weight: 700; margin-top: 0.35rem;">WhatsApp Shop Active</p>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border); padding: 1.25rem; border-radius: 10px;">
              <div style="font-size: 14px; color: var(--text-muted); font-weight: 700;">FREE MESSAGES CAP</div>
              <p style="font-size: 18px; font-weight: 700; color: var(--primary); margin-top: 0.35rem;">${remainingFree.toLocaleString('en-IN')} left of ${clientFreeLimit}</p>
              <p style="font-size: 14px; color: var(--text-muted); margin-top: 0.35rem;">Free service replies</p>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border); padding: 1.25rem; border-radius: 10px;">
              <div style="font-size: 14px; color: var(--text-muted); font-weight: 700;">AI AUTOMATION BOT</div>
              <p style="font-size: 16px; font-weight: 700; color: #0284c7; margin-top: 0.35rem;">HTRZ Motorcycle Bot</p>
              <p style="font-size: 14px; color: #16a34a; font-weight: 700; margin-top: 0.35rem;">Catalog & Fitting Guidance Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    // Tab Switching
    function switchHtrzTab(tabId, el) {
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      if (el) el.classList.add('active');

      const titleMap = {
        'tab-overview': 'Store Overview',
        'tab-tickets': 'Rider Enquiries',
        'tab-messages': 'Live Chats',
        'tab-catalog': 'Gear & Accessories',
        'tab-settings': 'Settings & Quota'
      };
      document.getElementById('page-heading').innerText = titleMap[tabId] || 'Portal';

      // Close mobile sidebar if open
      document.getElementById('app-sidebar').classList.remove('open');
    }

    function toggleMobileSidebar() {
      document.getElementById('app-sidebar').classList.toggle('open');
    }

    // Ticket resolution handlers
    async function resolveTicket(ticketId) {
      try {
        const res = await fetch('/htrz-modz/api/tickets/' + ticketId + '/resolve', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          window.location.reload();
        } else {
          alert(json.error || 'Failed to resolve ticket');
        }
      } catch (err) {
        alert('Error connecting to server: ' + err.message);
      }
    }

    async function reopenTicket(ticketId) {
      try {
        const res = await fetch('/htrz-modz/api/tickets/' + ticketId + '/reopen', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          window.location.reload();
        } else {
          alert(json.error || 'Failed to reopen ticket');
        }
      } catch (err) {
        alert('Error connecting to server: ' + err.message);
      }
    }

    // Chart.js rendering
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Real Category Inquiries Bar Chart
      const catCanvas = document.getElementById('categoryChart');
      if (catCanvas) {
        const catLabels = ${JSON.stringify(categoryInquiries.map((c) => c.category))};
        const catData = ${JSON.stringify(categoryInquiries.map((c) => c.count))};

        new Chart(catCanvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: catLabels,
            datasets: [{
              label: 'Inquiries Received',
              data: catData,
              backgroundColor: '#00a884',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 12, family: 'Inter' } }
              },
              y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: { color: '#64748b', font: { size: 12, family: 'Inter' }, precision: 0 }
              }
            }
          }
        });
      }

      // 2. Resolution Rate Donut Chart
      const resCanvas = document.getElementById('resolutionChart');
      if (resCanvas) {
        const pendingCount = ${openTickets.length};
        const resolvedCount = ${resolvedTickets.length};
        const total = pendingCount + resolvedCount;

        if (total === 0) {
          // Requirement 2: Neutral grey ring and "No data yet" when resolved + pending = 0
          new Chart(resCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: ['No data yet'],
              datasets: [{
                data: [1],
                backgroundColor: ['#e2e8f0'],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: '#64748b', font: { size: 13, family: 'Inter' }, padding: 12 }
                },
                tooltip: {
                  callbacks: {
                    label: () => ' No data yet'
                  }
                }
              },
              cutout: '72%'
            }
          });
        } else {
          new Chart(resCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: ['Resolved', 'Pending Action'],
              datasets: [{
                data: [resolvedCount, pendingCount],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: '#0f172a', font: { size: 13, family: 'Inter', weight: 500 }, padding: 12 }
                }
              },
              cutout: '72%'
            }
          });
        }
      }
    });
  </script>
</body>
</html>`;
}
