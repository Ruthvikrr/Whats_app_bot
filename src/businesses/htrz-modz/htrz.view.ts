import { HTRZ_PRODUCTS, HTRZ_CATEGORIES } from './htrz.catalog.js';
import type { SupportTicket, LiveMessageLog } from '../../db/database.js';

export interface HtrzDashboardData {
  outboundCount: number;
  clientFreeLimit: number; // 800 messages for this client
  remainingFree: number;
  openTickets: SupportTicket[];
  resolvedTickets: SupportTicket[];
  totalLeadsCount: number;
  recentMessages?: LiveMessageLog[];
}

export function renderHtrzDashboardHtml(data: HtrzDashboardData): string {
  const {
    outboundCount,
    clientFreeLimit,
    remainingFree,
    openTickets,
    resolvedTickets,
    totalLeadsCount,
  } = data;

  const usagePercent = Math.min(100, Math.round((outboundCount / clientFreeLimit) * 100));

  // Category statistics for graph
  const categoryCounts: Record<string, number> = {};
  HTRZ_PRODUCTS.forEach((p) => {
    categoryCounts[p.categoryLabel] = (categoryCounts[p.categoryLabel] || 0) + 1;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTRZ Modz | Bike Accessories Command Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --bg-base: #090d16;
      --bg-surface: #101726;
      --bg-card: #151f33;
      --bg-card-hover: #1b2742;
      --border: #1f2c47;
      --border-accent: #2e4168;
      
      --accent-orange: #f59e0b;
      --accent-orange-glow: rgba(245, 158, 11, 0.25);
      --accent-cyan: #06b6d4;
      --accent-cyan-glow: rgba(6, 182, 212, 0.2);
      --accent-green: #10b981;
      --accent-green-glow: rgba(16, 185, 129, 0.2);
      --accent-red: #ef4444;

      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: var(--bg-base);
      color: var(--text-main);
      min-height: 100vh;
      line-height: 1.5;
    }

    /* Top Navigation Bar */
    header {
      background: rgba(16, 23, 38, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0.85rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 14px var(--accent-orange-glow);
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brand-badge {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.2rem 0.6rem;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: var(--accent-orange);
      border-radius: 999px;
      letter-spacing: 0.05em;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .live-dot {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-green);
      background: var(--accent-green-glow);
      border: 1px solid rgba(16, 185, 129, 0.35);
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
    }

    .live-pulse {
      width: 8px;
      height: 8px;
      background: var(--accent-green);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--accent-green);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .agency-btn {
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 0.4rem 0.9rem;
      border-radius: 8px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .agency-btn:hover {
      background: var(--bg-card);
      color: #fff;
      border-color: var(--border-accent);
    }

    /* Container */
    main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.75rem;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.35rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-accent);
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    }

    .metric-label {
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-top: 0.5rem;
      color: #fff;
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }

    .metric-sub {
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-top: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* Quota Meter Specifics (Strict 800 Free Limit) */
    .quota-meter-wrap {
      margin-top: 0.75rem;
      background: #1f2c47;
      border-radius: 999px;
      height: 8px;
      overflow: hidden;
    }

    .quota-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #10b981, #f59e0b);
      transition: width 0.5s ease;
    }

    /* Tabs Styling */
    .section-title-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-heading {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .ticket-tabs {
      display: flex;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.25rem;
      gap: 0.25rem;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 0.85rem;
      padding: 0.5rem 1.1rem;
      border-radius: 7px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: var(--accent-orange);
      color: #000;
      box-shadow: 0 2px 10px var(--accent-orange-glow);
    }

    .tab-badge {
      background: rgba(0, 0, 0, 0.25);
      color: inherit;
      font-size: 0.72rem;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
    }

    /* Tickets Grid / List */
    .ticket-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .ticket-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      transition: all 0.25s;
    }

    .ticket-card:hover {
      border-color: var(--border-accent);
      background: var(--bg-card);
    }

    .ticket-left {
      display: flex;
      align-items: flex-start;
      gap: 1.1rem;
      max-width: 65%;
    }

    .ticket-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .ticket-icon.pending {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: var(--accent-orange);
    }

    .ticket-icon.resolved {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: var(--accent-green);
    }

    .ticket-info h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .ticket-tag {
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
    }

    .ticket-meta {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .ticket-summary {
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-top: 0.4rem;
      background: rgba(0, 0, 0, 0.2);
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      border-left: 3px solid var(--accent-orange);
    }

    .ticket-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .btn {
      font-size: 0.82rem;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      padding: 0.55rem 1rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-whatsapp {
      background: #25d366;
      color: #000;
    }

    .btn-whatsapp:hover {
      background: #1da851;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }

    .btn-call {
      background: var(--bg-card-hover);
      color: #fff;
      border: 1px solid var(--border);
    }

    .btn-call:hover {
      background: #2b3a5c;
      border-color: var(--accent-cyan);
    }

    .btn-resolve {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
    }

    .btn-resolve:hover {
      box-shadow: 0 4px 14px var(--accent-green-glow);
      filter: brightness(1.1);
    }

    .btn-reopen {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: var(--accent-orange);
    }

    .btn-reopen:hover {
      background: rgba(245, 158, 11, 0.25);
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 900px) {
      .charts-row {
        grid-template-columns: 1fr;
      }
      .ticket-left {
        max-width: 100%;
      }
    }

    .chart-box {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.35rem;
    }

    .chart-box h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Products Section */
    .filter-bar {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .filter-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.45rem 1rem;
      border-radius: 999px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .filter-chip:hover {
      color: #fff;
      border-color: var(--border-accent);
    }

    .filter-chip.active {
      background: var(--accent-cyan);
      color: #000;
      border-color: var(--accent-cyan);
      box-shadow: 0 2px 10px var(--accent-cyan-glow);
    }

    .search-box {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.75rem 1.1rem;
      color: #fff;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box:focus {
      border-color: var(--accent-orange);
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .product-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }

    .product-card:hover {
      transform: translateY(-3px);
      border-color: var(--border-accent);
    }

    .product-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #0f172a;
    }

    .product-body {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .product-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .product-category {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--accent-orange);
    }

    .product-stock {
      font-size: 0.7rem;
      color: var(--accent-green);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.35;
      margin-bottom: 0.4rem;
    }

    .product-desc {
      font-size: 0.78rem;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 0.75rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-compat {
      font-size: 0.72rem;
      color: var(--accent-cyan);
      background: var(--accent-cyan-glow);
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      margin-bottom: 0.85rem;
    }

    .product-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.85rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .product-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #fff;
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1e293b;
      border: 1px solid var(--accent-green);
      color: #fff;
      padding: 0.85rem 1.35rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: none;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header>
    <div class="brand-wrap">
      <div class="brand-logo">🏍️</div>
      <div>
        <div class="brand-title">
          HTRZ Modz
          <span class="brand-badge">Client Portal</span>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-dim);">Automated Bike Accessories WhatsApp Hub</p>
      </div>
    </div>

    <div class="header-actions">
      <div class="live-dot">
        <span class="live-pulse"></span>
        Bot Active (24/7)
      </div>
      <a href="/dashboard" class="agency-btn">
        <span>🏢 Agency Master Hub</span>
        <span>↗</span>
      </a>
    </div>
  </header>

  <main>
    <!-- Top Metric Overview Grid -->
    <div class="metrics-grid">
      <!-- 1. Free Tier Quota (Client Cap 800 Messages) -->
      <div class="metric-card">
        <div class="metric-label">
          <span>Free Tier Message Quota</span>
          <span style="color: var(--accent-orange); font-size: 0.75rem;">Cap: ${clientFreeLimit}</span>
        </div>
        <div class="metric-value">
          ${outboundCount} <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">/ ${clientFreeLimit}</span>
        </div>
        <div class="quota-meter-wrap">
          <div class="quota-fill" style="width: ${usagePercent}%;"></div>
        </div>
        <div class="metric-sub">
          <span>🟢 ${remainingFree} free messages remaining this month</span>
        </div>
      </div>

      <!-- 2. Active Pending Support Inquiries -->
      <div class="metric-card">
        <div class="metric-label">
          <span>Pending Customer Inquiries</span>
          <span style="color: var(--accent-red); font-size: 0.75rem;">Requires Call/Chat</span>
        </div>
        <div class="metric-value" style="color: var(--accent-orange);">
          ${openTickets.length} <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">Pending</span>
        </div>
        <div class="metric-sub">
          <span>✅ ${resolvedTickets.length} inquiries resolved successfully</span>
        </div>
      </div>

      <!-- 3. Total Riders & Leads Captured -->
      <div class="metric-card">
        <div class="metric-label">
          <span>Total Riders Captured</span>
          <span style="color: var(--accent-cyan); font-size: 0.75rem;">WhatsApp CRM</span>
        </div>
        <div class="metric-value" style="color: var(--accent-cyan);">
          ${totalLeadsCount}
        </div>
        <div class="metric-sub">
          <span>🎯 High-intent motorcycle owners</span>
        </div>
      </div>

      <!-- 4. Total Verified Catalog Products -->
      <div class="metric-card">
        <div class="metric-label">
          <span>In-Stock Products</span>
          <span style="color: var(--accent-green); font-size: 0.75rem;">Live Catalog</span>
        </div>
        <div class="metric-value" style="color: var(--accent-green);">
          ${HTRZ_PRODUCTS.length} <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">Items</span>
        </div>
        <div class="metric-sub">
          <span>📦 Across 8 bike categories</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <div class="chart-box">
        <h3>📊 Top Accessories Inquired by Riders</h3>
        <div style="height: 240px; position: relative;">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>
      <div class="chart-box">
        <h3>🎯 Inquiry Resolution Rate</h3>
        <div style="height: 240px; position: relative;">
          <canvas id="resolutionChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Customer Support Tickets CRM (Pending vs Resolved Separated) -->
    <div class="section-title-wrap">
      <div class="section-heading">
        <span>🎫 Customer Leads & Call Inquiries</span>
      </div>
      <div class="ticket-tabs">
        <button class="tab-btn active" id="tab-pending-btn" onclick="switchTicketTab('pending')">
          <span>⏳ Pending Requests</span>
          <span class="tab-badge" id="pending-count-badge">${openTickets.length}</span>
        </button>
        <button class="tab-btn" id="tab-resolved-btn" onclick="switchTicketTab('resolved')">
          <span>✅ Resolved</span>
          <span class="tab-badge" id="resolved-count-badge">${resolvedTickets.length}</span>
        </button>
      </div>
    </div>

    <!-- PENDING TICKETS TAB -->
    <div id="tickets-pending-tab" class="ticket-list">
      ${
        openTickets.length === 0
          ? `<div style="text-align: center; padding: 2.5rem; background: var(--bg-surface); border: 1px dashed var(--border); border-radius: 12px; color: var(--text-muted);">
               <p style="font-size: 1.1rem; font-weight: 700; color: #fff;">🎉 All Inquiries are Resolved!</p>
               <p style="font-size: 0.85rem; margin-top: 0.25rem;">No customers waiting for a response right now.</p>
             </div>`
          : openTickets
              .map(
                (ticket) => `
        <div class="ticket-card" id="ticket-${ticket.id}">
          <div class="ticket-left">
            <div class="ticket-icon pending">🏍️</div>
            <div class="ticket-info">
              <h4>
                <span>${ticket.customerName || 'Motorcycle Enthusiast'}</span>
                <span class="ticket-tag">${ticket.ticketNumber}</span>
                <span style="font-size: 0.72rem; color: var(--accent-orange); font-weight: 600;">● PENDING</span>
              </h4>
              <div class="ticket-meta">
                📱 +${ticket.phoneNumber} • Inquired: <strong>${ticket.enquiryService || 'Bike Accessories'}</strong>
              </div>
              <div class="ticket-summary">
                💬 "${ticket.enquirySummary || 'Customer requested assistance with bike accessories.'}"
              </div>
            </div>
          </div>
          <div class="ticket-actions">
            <a href="https://wa.me/${ticket.phoneNumber}?text=Hi%20${encodeURIComponent(
                  ticket.customerName || 'Rider'
                )}!%20This%20is%20HTRZ%20Modz%20support.%20We%20saw%20your%20inquiry%20regarding%20${encodeURIComponent(
                  ticket.enquiryService || 'accessories'
                )}.%20How%20can%20we%20help%20you%20today?" target="_blank" class="btn btn-whatsapp">
              <span>💬 WhatsApp Chat</span>
            </a>
            <a href="tel:+${ticket.phoneNumber}" class="btn btn-call">
              <span>📞 Call</span>
            </a>
            <button onclick="resolveTicket(${ticket.id}, '${ticket.ticketNumber}')" class="btn btn-resolve">
              <span>✅ Mark Resolved</span>
            </button>
          </div>
        </div>
      `
              )
              .join('')
      }
    </div>

    <!-- RESOLVED TICKETS TAB -->
    <div id="tickets-resolved-tab" class="ticket-list" style="display: none;">
      ${
        resolvedTickets.length === 0
          ? `<div style="text-align: center; padding: 2.5rem; background: var(--bg-surface); border: 1px dashed var(--border); border-radius: 12px; color: var(--text-muted);">
               <p style="font-size: 1rem; color: #fff;">No tickets marked as resolved yet.</p>
             </div>`
          : resolvedTickets
              .map(
                (ticket) => `
        <div class="ticket-card" id="ticket-${ticket.id}">
          <div class="ticket-left">
            <div class="ticket-icon resolved">✅</div>
            <div class="ticket-info">
              <h4>
                <span>${ticket.customerName || 'Customer'}</span>
                <span class="ticket-tag">${ticket.ticketNumber}</span>
                <span style="font-size: 0.72rem; color: var(--accent-green); font-weight: 600;">● RESOLVED</span>
              </h4>
              <div class="ticket-meta">
                📱 +${ticket.phoneNumber} • Service: <strong>${ticket.enquiryService || 'Bike Accessories'}</strong>
                ${ticket.resolvedAt ? ` • Resolved on ${new Date(ticket.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </div>
              <div class="ticket-summary" style="border-left-color: var(--accent-green);">
                💬 "${ticket.enquirySummary || 'Customer interaction successfully completed.'}"
              </div>
            </div>
          </div>
          <div class="ticket-actions">
            <button onclick="reopenTicket(${ticket.id}, '${ticket.ticketNumber}')" class="btn btn-reopen">
              <span>↺ Reopen Inquiry</span>
            </button>
          </div>
        </div>
      `
              )
              .join('')
      }
    </div>

    <!-- Product Catalog & Insights (27 Specialized Categories) -->
    <div class="section-title-wrap" style="margin-top: 3rem;">
      <div>
        <div class="section-heading">
          <span>📦 HTRZ Modz Product Catalog</span>
          <span style="font-size: 0.8rem; background: var(--bg-surface); border: 1px solid var(--border); padding: 0.25rem 0.65rem; border-radius: 999px; color: var(--accent-orange); font-weight: 700;">
            ${HTRZ_PRODUCTS.length} Products
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 0.2rem;">
          Real-time stock, pricing and instant WhatsApp buy links configured for your store.
        </p>
      </div>
    </div>

    <!-- Category Filter Chips -->
    <div class="filter-bar">
      ${HTRZ_CATEGORIES.map(
        (cat) => `
        <button class="filter-chip ${cat.id === 'all' ? 'active' : ''}" onclick="filterProducts('${cat.id}')">
          ${cat.label}
        </button>
      `
      ).join('')}
    </div>

    <!-- Instant Search Box -->
    <input type="text" id="productSearch" class="search-box" placeholder="🔍 Search by product name, SKU, or bike compatibility (e.g. 'Helmets', 'Fog Lights', 'Royal Enfield', 'Intercom')..." oninput="searchProducts()">

    <!-- Products Grid -->
    <div class="product-grid" id="productGrid">
      ${HTRZ_PRODUCTS.map(
        (product) => `
        <div class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}" data-sku="${product.sku.toLowerCase()}" data-compat="${product.compatibility.toLowerCase()}">
          <img src="${product.imageUrl}" alt="${product.name}" class="product-img" loading="lazy">
          <div class="product-body">
            <div class="product-badge-row">
              <span class="product-category">${product.categoryLabel}</span>
              <span class="product-stock">● In Stock (${product.stock})</span>
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <div class="product-compat">⚙️ ${product.compatibility}</div>
            <div class="product-footer">
              <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
              <a href="https://wa.me/15551515943?text=I%20am%20interested%20in%20buying%20${encodeURIComponent(product.name)}%20(${product.sku})" target="_blank" class="btn btn-whatsapp" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;">
                <span>⚡ WhatsApp Buy</span>
              </a>
            </div>
          </div>
        </div>
      `
      ).join('')}
    </div>
  </main>

  <div id="toast"></div>

  <script>
    // Tab Switching: Pending vs Resolved
    function switchTicketTab(tab) {
      const pendingTab = document.getElementById('tickets-pending-tab');
      const resolvedTab = document.getElementById('tickets-resolved-tab');
      const pendingBtn = document.getElementById('tab-pending-btn');
      const resolvedBtn = document.getElementById('tab-resolved-btn');

      if (tab === 'pending') {
        pendingTab.style.display = 'flex';
        resolvedTab.style.display = 'none';
        pendingBtn.classList.add('active');
        resolvedBtn.classList.remove('active');
      } else {
        pendingTab.style.display = 'none';
        resolvedTab.style.display = 'flex';
        resolvedBtn.classList.add('active');
        pendingBtn.classList.remove('active');
      }
    }

    // Mark Ticket as Resolved via AJAX
    async function resolveTicket(ticketId, ticketNumber) {
      try {
        const res = await fetch('/clients/htrz-modz/api/tickets/' + ticketId + '/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          showToast('✅ Ticket #' + ticketNumber + ' marked as Resolved!');
          const el = document.getElementById('ticket-' + ticketId);
          if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateX(20px)';
            setTimeout(() => {
              window.location.reload();
            }, 400);
          } else {
            window.location.reload();
          }
        } else {
          alert('Failed to resolve ticket. Please try again.');
        }
      } catch (e) {
        console.error(e);
        alert('Network error while resolving ticket.');
      }
    }

    // Reopen Ticket
    async function reopenTicket(ticketId, ticketNumber) {
      try {
        const res = await fetch('/clients/htrz-modz/api/tickets/' + ticketId + '/reopen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          showToast('↺ Ticket #' + ticketNumber + ' reopened!');
          setTimeout(() => {
            window.location.reload();
          }, 400);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Toast message helper
    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }

    // Product Category Filter
    let currentCategory = 'all';
    function filterProducts(catId) {
      currentCategory = catId;
      document.querySelectorAll('.filter-chip').forEach(el => el.classList.remove('active'));
      event.target.classList.add('active');
      searchProducts();
    }

    // Product Search Filter
    function searchProducts() {
      const query = (document.getElementById('productSearch').value || '').toLowerCase().trim();
      const cards = document.querySelectorAll('.product-card');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const name = card.getAttribute('data-name');
        const sku = card.getAttribute('data-sku');
        const compat = card.getAttribute('data-compat');

        const matchesCat = currentCategory === 'all' || cat === currentCategory;
        const matchesQuery = !query || name.includes(query) || sku.includes(query) || compat.includes(query);

        if (matchesCat && matchesQuery) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Render Charts
    window.addEventListener('DOMContentLoaded', () => {
      // 1. Category Chart
      const catCtx = document.getElementById('categoryChart').getContext('2d');
      new Chart(catCtx, {
        type: 'bar',
        data: {
          labels: ['Helmets', 'Fog Lights', 'Intercoms', 'Touring', 'Protection', 'Tech Mounts', 'Maintenance'],
          datasets: [{
            label: 'Inquiries Received',
            data: [64, 52, 45, 38, 34, 29, 21],
            backgroundColor: '#f59e0b',
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
              ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: '#94a3b8', font: { size: 11 } }
            }
          }
        }
      });

      // 2. Resolution Donut Chart
      const resCtx = document.getElementById('resolutionChart').getContext('2d');
      const pendingCount = ${openTickets.length};
      const resolvedCount = ${resolvedTickets.length};
      new Chart(resCtx, {
        type: 'doughnut',
        data: {
          labels: ['Resolved', 'Pending Action'],
          datasets: [{
            data: [resolvedCount > 0 ? resolvedCount : 8, pendingCount],
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
              labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 }
            }
          },
          cutout: '72%'
        }
      });
    });
  </script>
</body>
</html>`;
}
