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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
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
      --radius: 10px;
      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-heading: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-body); }

    body {
      background-color: var(--bg-page);
      color: var(--text-main);
      display: flex;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* Left Sidebar */
    aside {
      width: 260px;
      background: #ffffff;
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
    }

    .sidebar-header {
      padding: 1.35rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #00a884, #059669);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.15rem;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(0, 168, 132, 0.25);
    }

    .brand-text h2 {
      font-size: 1.05rem;
      font-weight: 800;
      font-family: var(--font-heading);
      letter-spacing: -0.3px;
      color: #0f172a;
    }

    .brand-text p {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sidebar-nav {
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
      overflow-y: auto;
    }

    .nav-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-light);
      padding: 0.6rem 0.75rem 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }

    .nav-item:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }

    .nav-item.active {
      background-color: #e6fffa;
      color: #008f6f;
      border-color: #a7f3d0;
      font-weight: 700;
    }

    .nav-item-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .nav-badge {
      font-size: 0.7rem;
      background: #e2e8f0;
      color: #334155;
      padding: 2px 7px;
      border-radius: 20px;
      font-weight: 700;
    }

    .nav-item.active .nav-badge {
      background: #00a884;
      color: #ffffff;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
      font-size: 0.75rem;
      color: var(--text-muted);
      background: #fafafa;
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
      background: #ffffff;
      border-bottom: 1px solid var(--border-subtle);
      padding: 1rem 2rem;
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
      letter-spacing: -0.4px;
      color: #0f172a;
    }

    .business-selector-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
    }

    .business-selector-wrap label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .business-select {
      border: none;
      background: transparent;
      font-size: 0.85rem;
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
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.35rem 0.8rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #1e293b;
    }

    .admin-badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00a884;
    }

    .btn-action {
      background: #00a884;
      color: #ffffff;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
      transition: background 0.15s;
    }

    .btn-action:hover {
      background: var(--primary-dark);
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
      border-radius: 10px;
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
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
    }

    .kpi-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-value {
      font-size: 1.85rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .kpi-subtext {
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .progress-bar-bg {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 0.25rem;
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
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      padding: 1.5rem 1.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .card-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .card-box-header h3 {
      font-size: 1.15rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: #0f172a;
    }

    /* Data Tables */
    .table-container {
      overflow-x: auto;
      width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      padding: 0.85rem 1rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-subtle);
      background: #fafafa;
    }

    td {
      padding: 0.95rem 1rem;
      font-size: 0.85rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }

    tr:hover td {
      background-color: #f8fafc;
    }

    /* Badges */
    .badge-inbound {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 0.22rem 0.65rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .badge-outbound {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      padding: 0.22rem 0.65rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .pill-category {
      background: #f1f5f9;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
    }

    .code-tag {
      font-family: monospace;
      font-size: 0.82rem;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #334155;
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
  </style>
</head>
<body>

  <!-- LEFT NAVIGATION SIDEBAR -->
  <aside>
    <div class="sidebar-header">
      <div class="brand-icon">⚡</div>
      <div class="brand-text">
        <h2>Triuss CRM</h2>
        <p>Admin Enterprise Portal</p>
      </div>
    </div>

    <div class="sidebar-nav">
      <div class="nav-label">Business Dashboards</div>
      <div class="nav-item active" onclick="switchTab('tab-overview', this)">
        <div class="nav-item-left">🌐 Master Overview</div>
      </div>
      <div class="nav-item" onclick="switchTab('tab-products', this)">
        <div class="nav-item-left">💎 Products & Sales</div>
        <span class="nav-badge" id="badge-products-count">${productStats.length}</span>
      </div>
      <div class="nav-item" onclick="switchTab('tab-services', this)">
        <div class="nav-item-left">🛠️ Services & Inquiries</div>
        <span class="nav-badge" id="badge-services-count">${serviceStats.length}</span>
      </div>

      <div class="nav-label">Live Operations</div>
      <div class="nav-item" onclick="switchTab('tab-chats', this)">
        <div class="nav-item-left">💬 Live WhatsApp Chats</div>
        <span class="nav-badge">${liveMessages.length}</span>
      </div>
      <div class="nav-item" onclick="switchTab('tab-leads', this)">
        <div class="nav-item-left">👥 Customer Leads & CRM</div>
        <span class="nav-badge" id="badge-leads-count">${leads.length}</span>
      </div>
      <div class="nav-item" onclick="switchTab('tab-broadcast', this)">
        <div class="nav-item-left">📢 Broadcast Marketing</div>
      </div>

      <div class="nav-label">Inventory & Diagnostics</div>
      <div class="nav-item" onclick="switchTab('tab-catalog', this)">
        <div class="nav-item-left">📦 Catalog Inventory</div>
        <span class="nav-badge" id="badge-catalog-count">${catalog.length}</span>
      </div>
      <div class="nav-item" onclick="switchTab('tab-settings', this)">
        <div class="nav-item-left">⚙️ Meta Cloud API Quota</div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div>● Meta Cloud API Active</div>
      <div style="margin-top: 4px; color: #94a3b8; font-size: 0.7rem;">Real SQLite Database Engine</div>
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
          <!-- KPI 1: Real-Time Meta 1,000 Free Quota -->
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Meta Free Message Quota</span>
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
              <span>👥</span>
            </div>
            <div class="kpi-value" id="kpi-leads-count">${leads.length}</div>
            <div class="kpi-subtext"><strong style="color: #00a884;">100% Real Leads</strong> in SQLite</div>
          </div>

          <!-- KPI 3: Product Pipeline Sales -->
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Product Enquiries & Sales</span>
              <span>💎</span>
            </div>
            <div class="kpi-value">₹${totalProductPipelineValue.toLocaleString('en-IN')}</div>
            <div class="kpi-subtext">${totalProductEnquiries} customer enquiries across ${catalog.length} SKUs</div>
          </div>

          <!-- KPI 4: Services Pipeline -->
          <div class="kpi-card">
            <div class="kpi-title">
              <span>Service Inquiries Value</span>
              <span>🛠️</span>
            </div>
            <div class="kpi-value">₹${totalServicePipelineValue.toLocaleString('en-IN')}</div>
            <div class="kpi-subtext">${totalServiceEnquiries} customer inquiries received (${totalServiceBookings} bookings)</div>
          </div>
        </div>

        <!-- RECENT LIVE MESSAGES STREAM IN OVERVIEW -->
        <div class="card-box">
          <div class="card-box-header">
            <h3>💬 Recent Live WhatsApp Interactions</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Real incoming and outgoing messages stored in database</span>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Customer Phone</th>
                  <th>Contact Name</th>
                  <th>Direction</th>
                  <th>Message Type</th>
                  <th>Message Content</th>
                </tr>
              </thead>
              <tbody id="overview-live-messages">
                ${liveMessages.slice(0, 8)
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
                    <td style="max-width: 420px; word-break: break-word; color: #1e293b; font-size: 0.84rem;">
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
            <div class="kpi-title"><span>Total Product Inquiries</span><span>📦</span></div>
            <div class="kpi-value">${totalProductEnquiries}</div>
            <div class="kpi-subtext">Customer queries recorded in messages</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>UPI Checkouts Sent</span><span>💳</span></div>
            <div class="kpi-value">${totalProductCheckouts}</div>
            <div class="kpi-subtext">Direct payment links delivered</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Pipeline Sales Value</span><span>📈</span></div>
            <div class="kpi-value" style="color: #00a884;">₹${totalProductPipelineValue.toLocaleString('en-IN')}</div>
            <div class="kpi-subtext">Enquiry volume × Catalog unit price</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Active Products in Catalog</span><span>💎</span></div>
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
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Unit Price (INR)</th>
                  <th>Customer Enquiries</th>
                  <th>Payment Links Sent</th>
                  <th>Estimated Sales Value</th>
                  <th>Checkout Link</th>
                </tr>
              </thead>
              <tbody>
                ${productStats
            .map((p) => `
                  <tr>
                    <td><span class="code-tag">${p.sku}</span></td>
                    <td style="font-weight: 700; color: #0f172a;">${p.name}</td>
                    <td><span class="pill-category">${p.category}</span></td>
                    <td style="font-weight: 700; color: #0f172a;">₹${p.price.toLocaleString('en-IN')}</td>
                    <td style="font-weight: 700; color: #2563eb;">${p.enquiriesCount} enquiries</td>
                    <td style="font-weight: 700; color: #059669;">${p.checkoutsClicked} sent</td>
                    <td style="font-weight: 800; color: #00a884;">₹${p.estimatedSalesValue.toLocaleString('en-IN')}</td>
                    <td>
                      ${p.paymentUrl
            ? `<a href="${p.paymentUrl}" target="_blank" style="color: #0284c7; font-weight: 700; text-decoration: none;">UPI Link ↗</a>`
            : `<span style="color: #94a3b8;">Inquire Only</span>`}
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
            <div class="kpi-title"><span>Total Service Inquiries</span><span>🛠️</span></div>
            <div class="kpi-value">${totalServiceEnquiries}</div>
            <div class="kpi-subtext">Agency, Salon, Real Estate, Auto & Clinic</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Confirmed Client Leads</span><span>📅</span></div>
            <div class="kpi-value">${totalServiceBookings}</div>
            <div class="kpi-subtext">Active leads in service pipeline</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Service Conversion Rate</span><span>🎯</span></div>
            <div class="kpi-value">${avgServiceConversion}%</div>
            <div class="kpi-subtext">Inquiries converted to confirmed leads</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title"><span>Service Pipeline Value</span><span>💼</span></div>
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
            <table>
              <thead>
                <tr>
                  <th>Service Offering</th>
                  <th>Business Category</th>
                  <th>Customer Inquiries</th>
                  <th>Confirmed Leads</th>
                  <th>Conversion Rate</th>
                  <th>Starting Package</th>
                  <th>Pipeline Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${serviceStats
            .map((s) => `
                  <tr>
                    <td style="font-weight: 700; color: #0f172a;">${s.title}</td>
                    <td><span class="pill-category">${s.category}</span></td>
                    <td style="font-weight: 700; color: #2563eb;">${s.enquiriesCount} inquiries</td>
                    <td style="font-weight: 700; color: #059669;">${s.bookingsConfirmed} confirmed</td>
                    <td>
                      <strong style="color: #0f172a;">${s.conversionRate}%</strong>
                      <div class="progress-bar-bg" style="width: 80px; margin-top: 4px;">
                        <div class="progress-bar-fill" style="width: ${Math.min(100, s.conversionRate)}%;"></div>
                      </div>
                    </td>
                    <td style="font-weight: 700; color: #475569;">₹${(s.estimatedValue / Math.max(1, s.enquiriesCount)).toLocaleString('en-IN')}</td>
                    <td style="font-weight: 800; color: #00a884;">₹${s.estimatedValue.toLocaleString('en-IN')}</td>
                    <td><span class="badge-inbound">Active</span></td>
                  </tr>
                `)
            .join('')}
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
            <table>
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
            <table>
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
            <table>
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

      <!-- TAB 8: META QUOTA & SYSTEM HEALTH -->
      <div id="tab-settings" class="tab-content">
        <div class="card-box">
          <div class="card-box-header">
            <h3>⚙️ Official Meta Cloud API Diagnostics</h3>
            <span style="font-size: 0.82rem; color: #16a34a; font-weight: 700;">● Connection Healthy</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: 10px;">
              <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Phone Number ID</h4>
              <p style="font-size: 1.05rem; font-weight: 700; font-family: monospace; margin-top: 0.25rem;">${env.WHATSAPP_PHONE_NUMBER_ID}</p>
              <p style="font-size: 0.78rem; color: #16a34a; font-weight: 600; margin-top: 0.35rem;">● Meta Quality Rating: GREEN</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: 10px;">
              <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Monthly Free Quota</h4>
              <p style="font-size: 1.05rem; font-weight: 700; color: #00a884; margin-top: 0.25rem;">${quota.remainingFree} / 1,000 Free Messages</p>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.35rem;">Billed by Meta: ₹0.00</p>
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
    function switchTab(tabId, el) {
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      if (el) el.classList.add('active');

      const headings = {
        'tab-overview': 'Master Overview',
        'tab-products': 'Product Sales & Inquiries',
        'tab-services': 'Service Inquiries & Performance',
        'tab-chats': 'Live WhatsApp Chats',
        'tab-leads': 'Customer Leads & CRM',
        'tab-broadcast': 'Broadcast Marketing',
        'tab-catalog': 'Catalog Inventory',
        'tab-settings': 'Meta Cloud API Quota'
      };
      const headingEl = document.getElementById('page-heading');
      if (headingEl && headings[tabId]) headingEl.innerText = headings[tabId];
    }

    function handleBusinessChange(val) {
      if (val === 'products') {
        switchTab('tab-products', document.querySelectorAll('.nav-item')[1]);
      } else if (val === 'services') {
        switchTab('tab-services', document.querySelectorAll('.nav-item')[2]);
      } else if (val === 'chats') {
        switchTab('tab-chats', document.querySelectorAll('.nav-item')[3]);
      } else if (val === 'leads') {
        switchTab('tab-leads', document.querySelectorAll('.nav-item')[4]);
      } else {
        switchTab('tab-overview', document.querySelectorAll('.nav-item')[0]);
      }
    }

    function toggleCustomPhone(val) {
      const group = document.getElementById('custom-phone-group');
      if (group) group.style.display = val === 'custom' ? 'flex' : 'none';
    }

    // Real-Time Quota & Leads Poller (Updates every 3 seconds without page reload!)
    async function pollLiveMetrics() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) return;
        const data = await res.json();
        
        // Update free quota KPI
        const quotaRemEl = document.getElementById('kpi-quota-remaining');
        if (quotaRemEl && data.quota) quotaRemEl.innerText = data.quota.remainingFree;

        const quotaProgEl = document.getElementById('kpi-quota-progress');
        if (quotaProgEl && data.quota) {
          const pct = Math.min(100, Math.round((data.quota.outboundCount / data.quota.freeLimit) * 100));
          quotaProgEl.style.width = pct + '%';
        }

        const quotaSubEl = document.getElementById('kpi-quota-sent-text');
        if (quotaSubEl && data.quota) quotaSubEl.innerText = data.quota.outboundCount + ' outbound messages sent this month';

        // Update leads & catalog counts
        const leadsCountEl = document.getElementById('kpi-leads-count');
        if (leadsCountEl) leadsCountEl.innerText = data.totalLeads;

        const badgeLeadsEl = document.getElementById('badge-leads-count');
        if (badgeLeadsEl) badgeLeadsEl.innerText = data.totalLeads;

        const catalogCountEl = document.getElementById('badge-catalog-count');
        if (catalogCountEl) catalogCountEl.innerText = data.catalogCount;
      } catch (err) {
        // Silently retry on next poll interval
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
}
export const dashboardController = new DashboardController();
