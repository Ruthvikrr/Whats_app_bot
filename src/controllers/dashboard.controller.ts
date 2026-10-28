import type { Request, Response } from 'express';
import { dbService } from '../db/database.js';
import { whatsAppService } from '../services/whatsapp.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Crisp inline Lucide SVG icons (no external dependency, zero emojis)
const SVG = {
  logo: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  overview: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  products: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  services: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  tickets: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  chats: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  customers: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  broadcast: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
  catalog: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  bot: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  external: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
  messageSquare: `<svg viewBox="0 0 24 24" width="36" height="36" stroke="#94a3b8" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  reply: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  alertTriangle: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`
};

function formatTimeFriendly(dateInput?: string | Date): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
}

export class DashboardController {
  /**
   * Render the Simplified, High-Clarity Shop Owner Dashboard
   * UI & Copy optimized for non-technical shop owners (understandable in 5 seconds)
   */
  public renderDashboard(req: Request, res: Response): void {
    const userRole = req.user?.role || 'admin';
    const isClient = userRole === 'client';
    const clientBusiness = req.user?.businessId || 'htrz';
    const currentBusiness = isClient ? clientBusiness : (req.query['business'] as string || 'all');
    const isDemo = req.query['demo'] === 'true';
    const broadcastStatus = req.query['broadcast'] as string | undefined;

    // Standard tab resolution from query parameter (?tab=products, etc.)
    const rawTab = (req.query['tab'] as string) || (req.query['business'] === 'products' ? 'products' : req.query['business'] === 'services' ? 'services' : 'overview');
    const activeTab = rawTab.startsWith('tab-') ? rawTab : `tab-${rawTab}`;
    const tabHeadings: Record<string, string> = {
      'tab-overview': 'Overview',
      'tab-products': 'Products',
      'tab-services': 'Services',
      'tab-tickets': 'Waiting for Reply',
      'tab-chats': 'Recent Messages',
      'tab-leads': 'Customers',
      'tab-broadcast': 'Broadcast',
      'tab-settings': 'Settings',
    };
    const pageHeading = tabHeadings[activeTab] || 'Overview';

    // 1. Quota Math (Never show 1000/1000 when usage is 0)
    const quota = dbService.getMonthlyQuotaStats();
    const quotaUsed = isDemo ? 420 : (quota.outboundCount || 0);
    const quotaLimit = quota.freeLimit || 1000;
    const quotaLeft = Math.max(0, quotaLimit - quotaUsed);
    const percentageUsed = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

    // 2. Data loading: in-memory sample dataset for Demo Mode vs 100% real SQLite data
    let leads: ReturnType<typeof dbService.getAllLeads>;
    let orders: ReturnType<typeof dbService.getAllOrders>;
    let liveMessages: ReturnType<typeof dbService.getRecentLiveMessages>;
    let openTickets: ReturnType<typeof dbService.getAllSupportTickets>;
    let allTickets: ReturnType<typeof dbService.getAllSupportTickets>;
    const catalog = dbService.getAllCatalogItems();
    const productStats = dbService.getProductSalesAndEnquiryStats();
    const serviceStats = dbService.getServicePerformanceStats();

    if (isDemo) {
      // 8 believable customers (never saved to database)
      leads = [
        { id: 101, phoneNumber: '919876543210', name: 'Rahul Sharma', status: 'contacted', interestedService: 'Axor Apex Venom Helmet', activeDemo: 'Helmets & Gear', lastInteractionAt: new Date(Date.now() - 1800000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 102, phoneNumber: '919812345678', name: 'Ananya Patel', status: 'converted', interestedService: 'Maddog ScoutX Fog Lights', activeDemo: 'Lighting System', lastInteractionAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: 103, phoneNumber: '919845012345', name: 'Vikramaditya Rao', status: 'converted', interestedService: 'Viaterra Carbon Gloves', activeDemo: 'Touring & Track', lastInteractionAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 259200000).toISOString() },
        { id: 104, phoneNumber: '919731234567', name: 'Karthik Reddy', status: 'new', interestedService: 'Onelap Micro GPS Tracker', activeDemo: 'Tech Mounts', lastInteractionAt: new Date(Date.now() - 14400000).toISOString(), createdAt: new Date(Date.now() - 345600000).toISOString() },
        { id: 105, phoneNumber: '919920123456', name: 'Sneha Deshmukh', status: 'contacted', interestedService: 'HJG 60W Cree Fog Lights', activeDemo: 'Lighting System', lastInteractionAt: new Date(Date.now() - 28800000).toISOString(), createdAt: new Date(Date.now() - 432000000).toISOString() },
        { id: 106, phoneNumber: '919447123456', name: 'Arjun Nair', status: 'new', interestedService: 'Viaterra Tank Bag', activeDemo: 'Touring & Luggage', lastInteractionAt: new Date(Date.now() - 43200000).toISOString(), createdAt: new Date(Date.now() - 518400000).toISOString() },
        { id: 107, phoneNumber: '919884123456', name: 'Priya Sundaram', status: 'contacted', interestedService: 'Nighteye H4 LED', activeDemo: 'Lighting System', lastInteractionAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 604800000).toISOString() },
        { id: 108, phoneNumber: '919820987654', name: 'Mohammed Farhan', status: 'converted', interestedService: 'BMC Performance Filter', activeDemo: 'Exhaust & Performance', lastInteractionAt: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 691200000).toISOString() },
      ];

      // 5 believable demo orders
      orders = [
        { id: 201, orderNumber: 'ORD-1081', customerName: 'Rahul Sharma', phoneNumber: '919876543210', productName: 'Axor Apex Venom Helmet', amount: 4999, status: 'Delivered', business: 'htrz', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 202, orderNumber: 'ORD-1082', customerName: 'Ananya Patel', phoneNumber: '919812345678', productName: 'Maddog ScoutX Fog Lights', amount: 5750, status: 'Confirmed', business: 'htrz', createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: 203, orderNumber: 'ORD-1083', customerName: 'Vikramaditya Rao', phoneNumber: '919845012345', productName: 'Viaterra Carbon Gloves', amount: 2199, status: 'Delivered', business: 'htrz', createdAt: new Date(Date.now() - 259200000).toISOString() },
        { id: 204, orderNumber: 'ORD-1084', customerName: 'Karthik Reddy', phoneNumber: '919731234567', productName: 'Onelap Micro GPS Tracker', amount: 2499, status: 'New', business: 'htrz', createdAt: new Date(Date.now() - 14400000).toISOString() },
        { id: 205, orderNumber: 'ORD-1085', customerName: 'Sneha Deshmukh', phoneNumber: '919920123456', productName: 'HJG 60W Cree Fog Lights', amount: 2899, status: 'New', business: 'htrz', createdAt: new Date(Date.now() - 28800000).toISOString() },
      ];

      // 2 believable open tickets
      openTickets = [
        { id: 301, ticketNumber: 'HTRZ-4012', phoneNumber: '919845012345', customerName: 'Vikramaditya Rao', enquiryService: 'Exhaust & Mapping', enquirySummary: 'BS6 Duke 390 Akrapovic Slip-On compatibility and DB killer fitting query', status: 'OPEN', business: 'htrz', createdAt: new Date(Date.now() - 3600000).toISOString(), resolvedAt: null },
        { id: 302, ticketNumber: 'HTRZ-4015', phoneNumber: '919920123456', customerName: 'Sneha Deshmukh', enquiryService: 'Riding Jacket', enquirySummary: 'Requesting expedited express dispatch for weekend tour to Goa', status: 'OPEN', business: 'htrz', createdAt: new Date(Date.now() - 7200000).toISOString(), resolvedAt: null },
      ];
      allTickets = openTickets;

      // About 30 believable live message logs
      liveMessages = [
        { id: 401, dateFormatted: 'Today 11:42 AM', phoneNumber: '919845012345', customerName: 'Vikramaditya Rao', direction: 'inbound', messageType: 'text', body: 'Hi, do you have the Akrapovic slip-on exhaust for KTM 390 Duke BS6 in stock?' },
        { id: 402, dateFormatted: 'Today 11:43 AM', phoneNumber: '919845012345', customerName: 'Vikramaditya Rao', direction: 'outbound', messageType: 'text', body: 'Yes! We have the Akrapovic Slip-On with removable DB killer ready for dispatch. ₹3,499 with free express shipping.' },
        { id: 403, dateFormatted: 'Today 10:15 AM', phoneNumber: '919920123456', customerName: 'Sneha Deshmukh', direction: 'inbound', messageType: 'text', body: 'Can you deliver the Viaterra Carbon gloves to Mumbai by Friday?' },
        { id: 404, dateFormatted: 'Today 10:16 AM', phoneNumber: '919920123456', customerName: 'Sneha Deshmukh', direction: 'outbound', messageType: 'text', body: 'Yes! Orders placed before 2 PM are shipped via BlueDart Air for 24-48hr metro delivery.' },
        { id: 405, dateFormatted: 'Today 09:30 AM', phoneNumber: '919876543210', customerName: 'Rahul Sharma', direction: 'inbound', messageType: 'text', body: 'What visor colours are available for the Axor Apex helmet?' },
        { id: 406, dateFormatted: 'Today 09:31 AM', phoneNumber: '919876543210', customerName: 'Rahul Sharma', direction: 'outbound', messageType: 'text', body: 'The Axor Apex comes with a pre-installed clear visor plus an anti-fog smoke sun visor.' },
        { id: 407, dateFormatted: 'Yesterday 06:12 PM', phoneNumber: '919812345678', customerName: 'Ananya Patel', direction: 'inbound', messageType: 'text', body: 'Can Maddog ScoutX lights be mounted on Himalayan 450 crash guards?' },
        { id: 408, dateFormatted: 'Yesterday 06:13 PM', phoneNumber: '919812345678', customerName: 'Ananya Patel', direction: 'outbound', messageType: 'text', body: 'Yes, we include 22mm-28mm CNC aluminium clamps specifically tailored for Himalayan 450 guards.' },
        { id: 409, dateFormatted: 'Yesterday 04:20 PM', phoneNumber: '919731234567', customerName: 'Karthik Reddy', direction: 'inbound', messageType: 'text', body: 'Does Onelap GPS require a separate SIM card?' },
        { id: 410, dateFormatted: 'Yesterday 04:21 PM', phoneNumber: '919731234567', customerName: 'Karthik Reddy', direction: 'outbound', messageType: 'text', body: 'No, it includes a pre-activated Airtel eSIM with 1-year unlimited data included.' },
      ];
    } else {
      // 100% Real SQLite Database Data
      leads = dbService.getAllLeads(currentBusiness);
      orders = dbService.getAllOrders(currentBusiness);
      allTickets = isClient
        ? dbService.getSupportTicketsByBusiness(clientBusiness as 'htrz' | 'triuss')
        : (currentBusiness === 'all' ? dbService.getAllSupportTickets() : dbService.getSupportTicketsByBusiness(currentBusiness as 'htrz' | 'triuss'));
      openTickets = allTickets.filter((t) => t.status === 'OPEN');
      liveMessages = dbService.getRecentLiveMessages(50, currentBusiness);
    }

    // Aggregations in customer-friendly terms
    const totalProductEnquiries = productStats.reduce((sum, p) => sum + p.enquiriesCount, 0);
    const totalProductSalesValue = productStats.reduce((sum, p) => sum + p.estimatedSalesValue, 0);
    const totalServiceEnquiries = serviceStats.reduce((sum, s) => sum + s.enquiriesCount, 0);
    const totalServiceValue = serviceStats.reduce((sum, s) => sum + s.estimatedValue, 0);
    const totalOrdersAndEnquiriesValue = totalProductSalesValue + totalServiceValue;
    const totalOrdersCount = totalProductEnquiries + totalServiceEnquiries;

    // Bot automation stats (Goal 18: show '-' when 0 data, never 0 (100%))
    const totalInteractions = liveMessages.length;
    const botHandledCount = Math.max(0, totalInteractions - openTickets.length);
    const botHandledPct = totalInteractions === 0 ? 0 : Math.round((botHandledCount / totalInteractions) * 100);
    const botHandledDisplay = totalInteractions === 0 ? '—' : `${botHandledCount} <span style="font-size: 16px; color: var(--text-muted); font-weight: 500;">(${botHandledPct}%)</span>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Triuss CRM — WhatsApp Shop Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap" rel="stylesheet">
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
      --amber: #f59e0b;
      --amber-tint: #fffbeb;
      --amber-border: #fde68a;
      --amber-text: #b45309;
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

    /* Fixed Left Sidebar with Text Labels */
    #app-sidebar {
      width: 230px;
      min-width: 230px;
      background: #ffffff;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      box-sizing: border-box;
      z-index: 100;
      transition: width 0.2s ease;
    }

    .brand-header {
      padding: 1.25rem 1.15rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
      cursor: pointer;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      min-width: 36px;
      background: var(--primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
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
      background: #fee2e2;
      color: #b91c1c;
    }

    .nav-badge.amber {
      background: #fef3c7;
      color: #b45309;
    }

    .nav-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 0.5rem 0;
    }

    .sidebar-footer {
      padding: 1rem 1.15rem;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
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

    /* Main Viewport */
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
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    h1#page-heading {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }

    .business-filter-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .business-filter-wrap label {
      font-size: 14px;
      color: var(--text-muted);
    }

    .business-select {
      background: transparent;
      border: none;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      outline: none;
      cursor: pointer;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    /* Demo Mode Switch */
    .demo-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: var(--text-main);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .demo-toggle-btn.active {
      background: #fffbeb;
      border-color: #f59e0b;
      color: #b45309;
    }

    .btn-action {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.15s ease;
    }

    .btn-action:hover {
      background: var(--primary-dark);
    }

    .btn-secondary {
      background: #ffffff;
      border: 1px solid var(--border);
      color: #334155;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-secondary:hover {
      background: #f8fafc;
    }

    /* Content Area */
    .dashboard-container {
      padding: 1.75rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Demo Banner */
    .demo-banner {
      display: none;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: var(--radius);
      padding: 0.85rem 1.25rem;
      color: #92400e;
      font-size: 14px;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .demo-banner.visible {
      display: flex;
    }

    /* Top Summary Cards Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.15rem;
    }

    .summary-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      position: relative;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .summary-card.amber-alert {
      background: var(--amber-tint);
      border-color: var(--amber-border);
    }

    .summary-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 500;
    }

    .summary-icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .summary-card.amber-alert .summary-icon-wrap {
      background: #fef3c7;
      color: var(--amber-text);
    }

    .summary-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .summary-card.amber-alert .summary-value {
      color: var(--amber-text);
    }

    .summary-subtext {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Quota Card */
    .quota-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .quota-left {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .quota-title {
      font-size: 14px;
      color: var(--text-muted);
    }

    .quota-main-text {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
    }

    .quota-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
      max-width: 500px;
      min-width: 250px;
    }

    .progress-bar-bg {
      flex: 1;
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

    .quota-left-badge {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary-dark);
      background: var(--primary-tint);
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      white-space: nowrap;
    }

    /* Card Box (Section) */
    .card-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .card-box-header {
      padding: 1.15rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .card-box-header h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .card-box-header p {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Needs Attention Section */
    .attention-box {
      border: 1px solid var(--amber-border);
      background: #ffffff;
      border-radius: var(--radius);
      overflow: hidden;
    }

    .attention-box-header {
      background: var(--amber-tint);
      padding: 0.9rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--amber-border);
    }

    .attention-title {
      color: var(--amber-text);
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .attention-item {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .attention-item:last-child {
      border-bottom: none;
    }

    .attention-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      max-width: 65%;
    }

    .attention-customer {
      font-weight: 700;
      color: var(--text-main);
      font-size: 14px;
    }

    .attention-message {
      font-size: 14px;
      color: #334155;
    }

    .attention-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .all-caught-up {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #047857;
      background: #f0fdf4;
      font-size: 14px;
      font-weight: 500;
    }

    /* Clean Tables */
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

    thead th {
      background: #fafbfc;
      color: var(--text-muted);
      font-weight: 700;
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: 1px solid var(--border-subtle);
      transition: background 0.1s ease;
    }

    tbody tr:hover {
      background: #f8fafc;
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    tbody td {
      padding: 0.9rem 1.25rem;
      color: var(--text-main);
      font-size: 14px;
      vertical-align: middle;
    }

    .col-time { width: 140px; white-space: nowrap; color: var(--text-muted); }
    .col-customer { width: 180px; font-weight: 700; }
    .col-sender { width: 110px; }
    .col-message { max-width: 450px; }

    .msg-preview {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: #334155;
      font-size: 14px;
      line-height: 1.45;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }

    .badge-bot {
      background: var(--primary-tint);
      color: var(--primary-dark);
    }

    .badge-customer {
      background: #f1f5f9;
      color: #334155;
    }

    .badge-amber {
      background: var(--amber-tint);
      color: var(--amber-text);
      border: 1px solid var(--amber-border);
    }

    /* Empty state */
    .empty-state-box {
      padding: 3.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 0.75rem;
    }

    .empty-state-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .empty-state-box h4 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .empty-state-box p {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 420px;
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1.25rem;
      border-top: 1px solid var(--border);
      background: #ffffff;
      font-size: 14px;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .pg-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 0.5rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: #ffffff;
      color: var(--text-main);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    .pg-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #ffffff;
    }

    .pg-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      padding: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }

    .form-input, .form-select, .form-textarea {
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-main);
      background: #ffffff;
      outline: none;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(0, 168, 132, 0.15);
    }

    .btn-submit {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin: 0 1.5rem 1.5rem;
      align-self: flex-start;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Subtab Buttons (Goal 14) */
    .subtab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .subtab-btn:hover {
      color: var(--text-main);
      background: var(--border-subtle);
    }
    .subtab-btn.active {
      color: var(--primary-dark);
      background: var(--primary-tint);
    }

    /* Loading and Error States (Goal 19) */
    .table-loading, .card-loading {
      opacity: 0.6;
      pointer-events: none;
      position: relative;
    }
    .table-error, .card-error {
      border-color: #ef4444 !important;
      background-color: #fef2f2 !important;
    }

    /* Mobile Responsive (at least 14px font, stacked cards, clean layout) */
    @media (max-width: 900px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      body {
        flex-direction: column;
      }

      #app-sidebar {
        width: 100%;
        min-width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }

      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
      }

      .nav-item {
        padding: 0.5rem 0.75rem;
      }

      .sidebar-footer {
        display: none;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-container {
        padding: 1rem;
      }

      header {
        padding: 0.85rem 1rem;
      }

      .quota-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .quota-right {
        width: 100%;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

  <!-- LEFT SIDEBAR WITH ICONS + TEXT LABELS -->
  <aside id="app-sidebar">
    <div class="brand-header" onclick="switchTab('tab-overview')">
      <div class="brand-icon">
        ${SVG.logo}
      </div>
      <div>
        <div class="brand-title">Triuss CRM</div>
        <div class="brand-subtitle">WhatsApp Shop</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-item ${activeTab === 'tab-overview' ? 'active' : ''}" id="nav-tab-overview" data-tab="tab-overview" onclick="switchTab('tab-overview', this)">
        <span class="nav-icon">${SVG.overview}</span>
        <span class="nav-label">Overview</span>
      </div>

      <div class="nav-item ${activeTab === 'tab-products' ? 'active' : ''}" id="nav-tab-products" data-tab="tab-products" onclick="switchTab('tab-products', this)">
        <span class="nav-icon">${SVG.products}</span>
        <span class="nav-label">Products</span>
      </div>

      <div class="nav-item ${activeTab === 'tab-services' ? 'active' : ''}" id="nav-tab-services" data-tab="tab-services" onclick="switchTab('tab-services', this)">
        <span class="nav-icon">${SVG.services}</span>
        <span class="nav-label">Services</span>
      </div>

      <div class="nav-divider"></div>

      <div class="nav-item ${activeTab === 'tab-tickets' ? 'active' : ''}" id="nav-tab-tickets" data-tab="tab-tickets" onclick="switchTab('tab-tickets', this)">
        <span class="nav-icon">${SVG.tickets}</span>
        <span class="nav-label">Waiting for Reply</span>
        <span class="nav-badge ${openTickets.length > 0 ? 'amber' : ''}" id="badge-open-tickets" style="${openTickets.length > 0 ? '' : 'display:none;'}">${openTickets.length}</span>
      </div>

      <div class="nav-item ${activeTab === 'tab-chats' ? 'active' : ''}" id="nav-tab-chats" data-tab="tab-chats" onclick="switchTab('tab-chats', this)">
        <span class="nav-icon">${SVG.chats}</span>
        <span class="nav-label">Recent Messages</span>
      </div>

      <div class="nav-item ${activeTab === 'tab-leads' ? 'active' : ''}" id="nav-tab-leads" data-tab="tab-leads" onclick="switchTab('tab-leads', this)">
        <span class="nav-icon">${SVG.customers}</span>
        <span class="nav-label">Customers</span>
      </div>

      <div class="nav-item ${activeTab === 'tab-broadcast' ? 'active' : ''}" id="nav-tab-broadcast" data-tab="tab-broadcast" onclick="switchTab('tab-broadcast', this)">
        <span class="nav-icon">${SVG.broadcast}</span>
        <span class="nav-label">Broadcast</span>
      </div>

      <div class="nav-divider"></div>

      <div class="nav-item ${activeTab === 'tab-settings' ? 'active' : ''}" id="nav-tab-settings" data-tab="tab-settings" onclick="switchTab('tab-settings', this)">
        <span class="nav-icon">${SVG.settings}</span>
        <span class="nav-label">Settings</span>
      </div>

      ${
        !isClient
          ? `
      <div class="nav-divider"></div>
      <a href="/htrz-modz" class="nav-item" id="nav-htrz-portal" target="_blank" rel="noopener noreferrer">
        <span class="nav-icon">${SVG.external}</span>
        <span class="nav-label">HTRZ Modz Portal</span>
      </a>
      `
          : ''
      }
    </nav>

    <div class="sidebar-footer" title="WhatsApp Cloud Active">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span class="status-dot"></span>
        <span>Active</span>
      </div>
      <a href="/logout" style="color: var(--text-muted); font-size: 14px; font-weight: 700; text-decoration: none;" title="Sign out">Sign Out</a>
    </div>
  </aside>

  <!-- MAIN VIEWPORT -->
  <main>
    <header>
      <div class="header-left">
        <h1 id="page-heading">${pageHeading}</h1>

        ${
          !isClient
            ? `
          <div class="business-filter-wrap">
            <label for="business-filter">Business:</label>
            <select class="business-select" id="business-filter" onchange="handleBusinessChange(this.value)">
              <option value="all" ${currentBusiness === 'all' ? 'selected' : ''}>All Businesses (Triuss Admin)</option>
              <option value="triuss" ${currentBusiness === 'triuss' ? 'selected' : ''}>Triuss Agency</option>
              <option value="htrz" ${currentBusiness === 'htrz' ? 'selected' : ''}>HTRZ Modz Store</option>
            </select>
          </div>
          `
            : `
          <div class="business-filter-wrap">
            <span style="font-weight: 700; color: #047857;">${clientBusiness.toUpperCase()} Partner Portal</span>
          </div>
          `
        }
      </div>

      <div class="header-right">
        <!-- Demo Mode Toggle -->
        <a href="${isDemo ? '?demo=false' : '?demo=true'}" id="demo-toggle-btn" class="demo-toggle-btn">
          <span class="nav-icon">${SVG.sparkles}</span>
          <span id="demo-toggle-text">${isDemo ? 'DEMO DATA (Click to Exit)' : 'Demo Mode: OFF'}</span>
        </a>

        <button type="button" onclick="switchTab('tab-broadcast')" class="btn-action">
          + New Broadcast
        </button>
      </div>
    </header>

    <div class="dashboard-container">
      ${
        isDemo
          ? `
      <div id="demo-banner" class="demo-banner" style="display: flex;">
        <div>
          <strong>DEMO DATA:</strong> Previewing in-memory sample dataset (8 customers, ~30 messages, 5 orders, 2 open tickets). No changes are saved to the database.
        </div>
        <a href="?demo=false" class="btn-secondary" style="padding: 0.3rem 0.65rem; text-decoration: none;">Turn Off</a>
      </div>
      `
          : ''
      }

      ${
        broadcastStatus === 'sent'
          ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius); padding: 0.85rem 1.25rem; color: #166534; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>Broadcast messages dispatched successfully to selected customers!</div>
              <span style="cursor: pointer; font-weight: 700;" onclick="this.parentElement.remove()">✕</span>
            </div>`
          : ''
      }

      <!-- TAB 1: OVERVIEW -->
      <div id="tab-overview" class="tab-content ${activeTab === 'tab-overview' ? 'active' : ''}">
        <!-- TOP SUMMARY CARDS (GOAL 1) -->
        <div class="summary-grid">
          <!-- Card 1: New Customers -->
          <div class="summary-card">
            <div class="summary-card-header">
              <span>New customers (this month)</span>
              <div class="summary-icon-wrap">${SVG.customers}</div>
            </div>
            <div class="summary-value" id="kpi-leads-count">${leads.length}</div>
            <div class="summary-subtext">Saved contacts from chats</div>
          </div>

          <!-- Card 2: Orders / Enquiries with Rupee Value -->
          <div class="summary-card">
            <div class="summary-card-header">
              <span>Orders / enquiries (this month)</span>
              <div class="summary-icon-wrap">${SVG.products}</div>
            </div>
            <div class="summary-value" id="kpi-orders-value">₹${totalOrdersAndEnquiriesValue.toLocaleString('en-IN')}</div>
            <div class="summary-subtext" id="kpi-orders-subtext">${totalOrdersCount} customer inquiries recorded</div>
          </div>

          <!-- Card 3: Chats waiting for a human (Highlighted in amber if > 0) -->
          <div class="summary-card ${openTickets.length > 0 ? 'amber-alert' : ''}" id="kpi-tickets-card">
            <div class="summary-card-header">
              <span>Chats waiting for a human</span>
              <div class="summary-icon-wrap">${SVG.tickets}</div>
            </div>
            <div class="summary-value" id="kpi-tickets-count">${openTickets.length}</div>
            <div class="summary-subtext" id="kpi-tickets-subtext">${openTickets.length > 0 ? 'Require your reply on WhatsApp' : 'No pending tickets right now'}</div>
          </div>

          <!-- Card 4: Handled automatically by the bot -->
          <div class="summary-card">
            <div class="summary-card-header">
              <span>Handled automatically by bot</span>
              <div class="summary-icon-wrap">${SVG.bot}</div>
            </div>
            <div class="summary-value" id="kpi-bot-value">${botHandledDisplay}</div>
            <div class="summary-subtext">Answered without human help</div>
          </div>
        </div>

        <!-- MESSAGE QUOTA CARD (GOAL 2: Never show 1000 / 1000 when 0 used!) -->
        <div class="quota-card">
          <div class="quota-left">
            <div class="quota-title">Free WhatsApp Messages</div>
            <div class="quota-main-text" id="kpi-quota-main-text">${quotaUsed} used of 1,000 free</div>
          </div>

          <div class="quota-right">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" id="kpi-quota-progress" style="width: ${percentageUsed}%;"></div>
            </div>
            <div class="quota-left-badge" id="kpi-quota-badge">${quotaLeft.toLocaleString('en-IN')} left</div>
          </div>
        </div>

        <!-- NEEDS ATTENTION SECTION (GOAL 6) -->
        <div class="attention-box" id="needs-attention-box">
          <div class="attention-box-header">
            <div class="attention-title">
              <span class="nav-icon">${SVG.alertTriangle}</span>
              <span>Needs attention</span>
            </div>
            <span style="font-size: 14px; color: var(--amber-text); font-weight: 700;" id="attention-count-badge">
              ${openTickets.length} waiting for reply
            </span>
          </div>

          <div id="attention-list">
            ${
              openTickets.length === 0
                ? `
              <div class="all-caught-up">
                <span class="nav-icon">${SVG.checkCircle}</span>
                <span>All caught up! No customers waiting for a human reply right now.</span>
              </div>
              `
                : openTickets
                    .map(
                      (t) => `
              <div class="attention-item">
                <div class="attention-details">
                  <div class="attention-customer">${t.customerName || 'Customer'} (${t.phoneNumber}) — <span style="font-weight: 500; color: var(--text-muted);">${t.enquiryService || 'Inquiry'}</span></div>
                  <div class="attention-message">${t.enquirySummary || 'Customer requested assistance'}</div>
                  <div style="font-size: 14px; color: var(--text-muted); margin-top: 2px;">Requested: ${formatTimeFriendly(t.createdAt)}</div>
                </div>
                <div class="attention-actions">
                  <a href="https://wa.me/${t.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" class="btn-action" style="padding: 0.45rem 0.85rem;">
                    <span class="nav-icon">${SVG.reply}</span>
                    <span>Reply on WhatsApp</span>
                  </a>
                  <form method="POST" action="/dashboard/tickets/${t.id}/status" style="display:inline; margin:0;">
                    <input type="hidden" name="status" value="RESOLVED">
                    <button type="submit" class="btn-secondary" style="padding: 0.45rem 0.85rem;">Mark Resolved</button>
                  </form>
                </div>
              </div>
              `
                    )
                    .join('')
            }
          </div>
        </div>

        <!-- RECENT MESSAGES TABLE (GOAL 5: Sensible widths, formatted time, empty state) -->
        <div class="card-box">
          <div class="card-box-header">
            <div>
              <h3><span class="nav-icon">${SVG.chats}</span> Recent messages</h3>
              <p>Customer chats and automatic bot responses</p>
            </div>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="overview-messages" id="overview-messages-table">
              <thead>
                <tr>
                  <th class="col-time">Time</th>
                  <th class="col-customer">Customer</th>
                  <th class="col-sender">Sender</th>
                  <th class="col-message">Message</th>
                  <th style="width: 100px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="overview-live-messages-body">
                ${
                  liveMessages.length === 0
                    ? `
                  <tr>
                    <td colspan="5">
                      <div class="empty-state-box">
                        <div class="empty-state-icon">${SVG.messageSquare}</div>
                        <h4>No messages yet</h4>
                        <p>Share your WhatsApp number with customers to get started. When customers message you, chats will appear here in real time.</p>
                      </div>
                    </td>
                  </tr>
                `
                    : liveMessages
                        .map(
                          (m) => `
                  <tr>
                    <td class="col-time">${formatTimeFriendly(m.dateFormatted)}</td>
                    <td class="col-customer">
                      <div>${m.customerName || 'Customer'}</div>
                      <div style="font-size: 14px; font-weight: 500; color: var(--text-muted);">${m.phoneNumber}</div>
                    </td>
                    <td class="col-sender">
                      <span class="badge ${m.direction === 'inbound' ? 'badge-customer' : 'badge-bot'}">
                        ${m.direction === 'inbound' ? 'Customer' : 'Bot'}
                      </span>
                    </td>
                    <td class="col-message">
                      <div class="msg-preview">${m.body.replace(/\n/g, ' ')}</div>
                    </td>
                    <td style="text-align: right;">
                      <a href="https://wa.me/${m.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" class="btn-secondary" style="padding: 0.35rem 0.65rem;">
                        Chat ↗
                      </a>
                    </td>
                  </tr>
                `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: PRODUCTS (MERGED CATALOG & PERFORMANCE) -->
      <div id="tab-products" class="tab-content ${activeTab === 'tab-products' ? 'active' : ''}">
        <!-- Subtab switcher -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; background: #ffffff; padding: 0.4rem; border-radius: 10px; border: 1px solid var(--border); width: fit-content;">
          <button type="button" class="subtab-btn active" id="btn-subtab-catalog" onclick="switchProductSubtab('catalog')">
            <span class="nav-icon">${SVG.catalog}</span>
            <span>Catalog (${catalog.length})</span>
          </button>
          <button type="button" class="subtab-btn" id="btn-subtab-performance" onclick="switchProductSubtab('performance')">
            <span class="nav-icon">${SVG.overview}</span>
            <span>Performance & Orders (${orders.length})</span>
          </button>
        </div>

        <!-- SUBTAB 1: CATALOG -->
        <div id="subtab-catalog" class="product-subtab-pane active">
          <div class="card-box">
            <div class="card-box-header">
              <div>
                <h3><span class="nav-icon">${SVG.catalog}</span> Product catalog (${catalog.length} products)</h3>
                <p>Items in your store that customers can explore and buy on WhatsApp</p>
              </div>
            </div>

            <div class="table-container">
              <table data-paginate="30" data-pg-id="catalog-inventory">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Checkout URL</th>
                  </tr>
                </thead>
                <tbody>
                  ${catalog
                    .map(
                      (item) => `
                    <tr>
                      <td style="font-weight: 700;">${item.name}</td>
                      <td><span class="badge badge-customer">${item.category}</span></td>
                      <td style="font-weight: 700; color: var(--primary-dark);">₹${item.price.toLocaleString('en-IN')}</td>
                      <td>
                        ${
                          item.paymentUrl
                            ? `<a href="${item.paymentUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 0.35rem 0.65rem;">Payment Link ↗</a>`
                            : `<span style="color: var(--text-muted);">None</span>`
                        }
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>

            <div style="border-top: 1px solid var(--border); padding: 1.5rem 0 0;">
              <h4 style="font-size: 15px; font-weight: 700; padding: 0 1.5rem 0.5rem;">+ Add new product to catalog</h4>
              <form method="POST" action="/dashboard/catalog" class="form-grid">
                <div class="form-group">
                  <label>Product Code</label>
                  <input type="text" name="sku" class="form-input" placeholder="PRD-10" required />
                </div>
                <div class="form-group">
                  <label>Product Name</label>
                  <input type="text" name="name" class="form-input" placeholder="Axor Apex Helmet" required />
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <select name="category" class="form-select" required>
                    <option value="helmets">Helmets & Riding Gear</option>
                    <option value="accessories">Motorcycle Accessories</option>
                    <option value="parts">Performance Parts</option>
                    <option value="general">General Items</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Price (₹)</label>
                  <input type="number" name="price" class="form-input" placeholder="6499" required />
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label>Description</label>
                  <input type="text" name="description" class="form-input" placeholder="ECE 22.06 DOT certified..." required />
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label>Payment Link (Optional)</label>
                  <input type="url" name="paymentUrl" class="form-input" placeholder="https://rzp.io/l/..." />
                </div>
                <button type="submit" class="btn-submit">+ Save Product</button>
              </form>
            </div>
          </div>
        </div>

        <!-- SUBTAB 2: PERFORMANCE & ORDERS -->
        <div id="subtab-performance" class="product-subtab-pane" style="display: none;">
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-card-header"><span>Product inquiries</span><div class="summary-icon-wrap">${SVG.products}</div></div>
              <div class="summary-value">${totalProductEnquiries}</div>
              <div class="summary-subtext">Customer queries recorded</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-header"><span>Payment links sent</span><div class="summary-icon-wrap">${SVG.sparkles}</div></div>
              <div class="summary-value">${productStats.reduce((s, p) => s + p.checkoutsClicked, 0)}</div>
              <div class="summary-subtext">Direct UPI links delivered</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-header"><span>Estimated sales value</span><div class="summary-icon-wrap">${SVG.overview}</div></div>
              <div class="summary-value" style="color: var(--primary);">₹${totalProductSalesValue.toLocaleString('en-IN')}</div>
              <div class="summary-subtext">From customer queries</div>
            </div>
            <div class="summary-card">
              <div class="summary-card-header"><span>Customer Orders</span><div class="summary-icon-wrap">${SVG.checkCircle}</div></div>
              <div class="summary-value">${orders.length}</div>
              <div class="summary-subtext">Recorded transactions</div>
            </div>
          </div>

          <div class="card-box" style="margin-bottom: 1.5rem;">
            <div class="card-box-header">
              <div>
                <h3><span class="nav-icon">${SVG.products}</span> Product inquiries & sales tracker</h3>
                <p>Tracking customer interest and payment links sent</p>
              </div>
            </div>

            <div class="table-container">
              <table data-paginate="30" data-pg-id="products-tracker">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price (INR)</th>
                    <th>Customer Inquiries</th>
                    <th>Payment Links</th>
                    <th>Estimated Sales</th>
                    <th>Checkout Link</th>
                  </tr>
                </thead>
                <tbody>
                  ${productStats
                    .map(
                      (p) => `
                    <tr>
                      <td style="font-weight: 700;">${p.name}</td>
                      <td><span class="badge badge-customer">${p.category}</span></td>
                      <td style="font-weight: 700;">₹${p.price.toLocaleString('en-IN')}</td>
                      <td>${p.enquiriesCount} inquiries</td>
                      <td>${p.checkoutsClicked} sent</td>
                      <td style="font-weight: 700; color: var(--primary-dark);">₹${p.estimatedSalesValue.toLocaleString('en-IN')}</td>
                      <td>
                        ${
                          p.paymentUrl
                            ? `<a href="${p.paymentUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 0.35rem 0.65rem;">UPI Link ↗</a>`
                            : `<span style="color: var(--text-muted);">Inquire Only</span>`
                        }
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Customer Orders Section with Status Dropdown and Export CSV -->
          <div class="card-box">
            <div class="card-box-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <h3><span class="nav-icon">${SVG.products}</span> Customer Orders (${orders.length})</h3>
                <p>Lifecycle status and customer orders tracking</p>
              </div>
              <button type="button" class="btn-secondary" onclick="exportOrdersCSV()">
                Export CSV
              </button>
            </div>

            <div class="table-container">
              <table data-paginate="30" data-pg-id="orders-crm-table" id="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer Name</th>
                    <th>Phone Number</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Order Status</th>
                    <th>Order Date</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody id="orders-table-body">
                  ${
                    orders.length === 0
                      ? `
                    <tr>
                      <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        No orders recorded yet. Orders will appear here as customers complete checkouts.
                      </td>
                    </tr>
                  `
                      : orders
                          .map(
                            (o) => `
                    <tr>
                      <td style="font-weight: 700; color: var(--primary-dark);">${o.orderNumber}</td>
                      <td style="font-weight: 700;">${o.customerName}</td>
                      <td>${o.phoneNumber}</td>
                      <td>${o.productName}</td>
                      <td style="font-weight: 700;">₹${o.amount.toLocaleString('en-IN')}</td>
                      <td>
                        <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid var(--border); font-size: 14px; font-weight: 700; background: #ffffff; color: var(--text-main); cursor: pointer;">
                          <option value="New" ${o.status === 'New' ? 'selected' : ''}>New</option>
                          <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                          <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                      </td>
                      <td class="col-time">${formatTimeFriendly(o.createdAt)}</td>
                      <td style="text-align: right;">
                        <a href="https://wa.me/${o.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 0.35rem 0.65rem;">
                          Reply ↗
                        </a>
                      </td>
                    </tr>
                  `
                          )
                          .join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: SERVICES -->
      <div id="tab-services" class="tab-content ${activeTab === 'tab-services' ? 'active' : ''}">
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-card-header"><span>Service inquiries</span><div class="summary-icon-wrap">${SVG.services}</div></div>
            <div class="summary-value">${totalServiceEnquiries}</div>
            <div class="summary-subtext">Appointments and quotes requested</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-header"><span>Confirmed bookings</span><div class="summary-icon-wrap">${SVG.checkCircle}</div></div>
            <div class="summary-value">${serviceStats.reduce((s, x) => s + x.bookingsConfirmed, 0)}</div>
            <div class="summary-subtext">Customers scheduled</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-header"><span>Conversion rate</span><div class="summary-icon-wrap">${SVG.sparkles}</div></div>
            <div class="summary-value">${totalServiceEnquiries > 0 ? Math.round((serviceStats.reduce((s, x) => s + x.bookingsConfirmed, 0) / totalServiceEnquiries) * 100) : 0}%</div>
            <div class="summary-subtext">Inquiries converted to bookings</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-header"><span>Service value</span><div class="summary-icon-wrap">${SVG.overview}</div></div>
            <div class="summary-value" style="color: var(--primary);">₹${totalServiceValue.toLocaleString('en-IN')}</div>
            <div class="summary-subtext">Estimated booking pipeline</div>
          </div>
        </div>

        <div class="card-box">
          <div class="card-box-header">
            <div>
              <h3><span class="nav-icon">${SVG.services}</span> Service inquiry & booking performance</h3>
              <p>Tracking customer requests for your service offerings</p>
            </div>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="services-tracker">
              <thead>
                <tr>
                  <th>Service Offering</th>
                  <th>Category</th>
                  <th>Inquiries</th>
                  <th>Confirmed Bookings</th>
                  <th>Estimated Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${serviceStats
                  .map(
                    (s) => `
                  <tr>
                    <td style="font-weight: 700;">${s.title}</td>
                    <td><span class="badge badge-customer">${s.category}</span></td>
                    <td>${s.enquiriesCount} inquiries</td>
                    <td>${s.bookingsConfirmed} confirmed</td>
                    <td style="font-weight: 700; color: var(--primary-dark);">₹${s.estimatedValue.toLocaleString('en-IN')}</td>
                    <td><span class="badge badge-bot">Active</span></td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: SUPPORT TICKETS (WAITING FOR REPLY) -->
      <div id="tab-tickets" class="tab-content ${activeTab === 'tab-tickets' ? 'active' : ''}">
        <div class="card-box">
          <div class="card-box-header">
            <div>
              <h3><span class="nav-icon">${SVG.tickets}</span> Customer support requests</h3>
              <p>Conversations where customers requested to speak with a human</p>
            </div>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="support-tickets" id="support-tickets-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone Number</th>
                  <th>Inquiry Reason</th>
                  <th>What Customer Said</th>
                  <th>Requested Time</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="tickets-table-body">
                ${
                  allTickets.length === 0
                    ? `
                  <tr>
                    <td colspan="7">
                      <div class="empty-state-box">
                        <div class="empty-state-icon">${SVG.checkCircle}</div>
                        <h4>No support requests</h4>
                        <p>When customers ask for help on WhatsApp, their requests will appear here so you can reply promptly.</p>
                      </div>
                    </td>
                  </tr>
                `
                    : allTickets
                        .map(
                          (t) => `
                  <tr>
                    <td style="font-weight: 700;">${t.customerName || 'Customer'}</td>
                    <td>${t.phoneNumber}</td>
                    <td><span class="badge badge-customer">${t.enquiryService || 'General Help'}</span></td>
                    <td>${t.enquirySummary}</td>
                    <td class="col-time">${formatTimeFriendly(t.createdAt)}</td>
                    <td>
                      <span class="badge ${t.status === 'OPEN' ? 'badge-amber' : 'badge-bot'}">
                        ${t.status === 'OPEN' ? 'Waiting for Reply' : 'Resolved'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.5rem;">
                        <a href="https://wa.me/${t.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" class="btn-action" style="padding: 0.35rem 0.75rem;">
                          Reply ↗
                        </a>
                        <form method="POST" action="/dashboard/tickets/${t.id}/status" style="display:inline; margin:0;">
                          <input type="hidden" name="status" value="${t.status === 'OPEN' ? 'RESOLVED' : 'OPEN'}">
                          <button type="submit" class="btn-secondary" style="padding: 0.35rem 0.65rem;">
                            ${t.status === 'OPEN' ? 'Resolve' : 'Reopen'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: CHATS / MESSAGES -->
      <div id="tab-chats" class="tab-content ${activeTab === 'tab-chats' ? 'active' : ''}">
        <div class="card-box">
          <div class="card-box-header">
            <div>
              <h3><span class="nav-icon">${SVG.chats}</span> WhatsApp message stream</h3>
              <p>Full conversation history with customers</p>
            </div>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="live-chats">
              <thead>
                <tr>
                  <th class="col-time">Time</th>
                  <th class="col-customer">Customer</th>
                  <th class="col-sender">Sender</th>
                  <th class="col-message">Message Text</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="chats-full-table-body">
                ${
                  liveMessages.length === 0
                    ? `
                  <tr>
                    <td colspan="5">
                      <div class="empty-state-box">
                        <div class="empty-state-icon">${SVG.messageSquare}</div>
                        <h4>No messages yet</h4>
                        <p>Customer chats will appear here as soon as they message your WhatsApp number.</p>
                      </div>
                    </td>
                  </tr>
                `
                    : liveMessages
                        .map(
                          (m) => `
                  <tr>
                    <td class="col-time">${formatTimeFriendly(m.dateFormatted)}</td>
                    <td class="col-customer">
                      <div>${m.customerName || 'Customer'}</div>
                      <div style="font-size: 14px; font-weight: 500; color: var(--text-muted);">${m.phoneNumber}</div>
                    </td>
                    <td class="col-sender">
                      <span class="badge ${m.direction === 'inbound' ? 'badge-customer' : 'badge-bot'}">
                        ${m.direction === 'inbound' ? 'Customer' : 'Bot'}
                      </span>
                    </td>
                    <td class="col-message">
                      <div class="msg-preview">${m.body.replace(/\n/g, '<br/>')}</div>
                    </td>
                    <td style="text-align: right;">
                      <a href="https://wa.me/${m.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" class="btn-secondary" style="padding: 0.35rem 0.65rem;">
                        Chat ↗
                      </a>
                    </td>
                  </tr>
                `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 6: CUSTOMERS / LEADS -->
      <div id="tab-leads" class="tab-content ${activeTab === 'tab-leads' ? 'active' : ''}">
        <div class="card-box">
          <div class="card-box-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h3><span class="nav-icon">${SVG.customers}</span> Customer contacts (${leads.length})</h3>
              <p>People who interacted with your WhatsApp store</p>
            </div>
            <button type="button" class="btn-secondary" onclick="exportCustomersCSV()">
              Export CSV
            </button>
          </div>

          <div class="table-container">
            <table data-paginate="30" data-pg-id="leads-crm" id="customers-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Interest</th>
                  <th>Last Active</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="customers-table-body">
                ${
                  leads.length === 0
                    ? `
                  <tr>
                    <td colspan="5">
                      <div class="empty-state-box">
                        <div class="empty-state-icon">${SVG.customers}</div>
                        <h4>No customers saved yet</h4>
                        <p>Customers are automatically saved when they message your WhatsApp business number.</p>
                      </div>
                    </td>
                  </tr>
                `
                    : leads
                        .map(
                          (lead) => `
                  <tr>
                    <td style="font-weight: 700;">${lead.name || 'WhatsApp Customer'}</td>
                    <td>${lead.phoneNumber}</td>
                    <td><span class="badge badge-customer">${lead.activeDemo || lead.interestedService || 'General Menu'}</span></td>
                    <td class="col-time">${formatTimeFriendly(lead.lastInteractionAt)}</td>
                    <td style="text-align: right;">
                      <a href="https://wa.me/${lead.phoneNumber.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="btn-action" style="padding: 0.35rem 0.75rem;">
                        Reply ↗
                      </a>
                    </td>
                  </tr>
                `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 7: BROADCAST -->
      <div id="tab-broadcast" class="tab-content ${activeTab === 'tab-broadcast' ? 'active' : ''}">
        <div class="card-box">
          <div class="card-box-header">
            <div>
              <h3><span class="nav-icon">${SVG.broadcast}</span> Send WhatsApp broadcast</h3>
              <p>Reach your customers with updates, special offers, or announcements</p>
            </div>
          </div>

          <!-- Broadcast Safety Warning Box (Goal 15) -->
          <div class="broadcast-warning" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 1rem 1.25rem; margin: 1.25rem 1.5rem 0; color: #92400e; font-size: 14px; display: flex; align-items: flex-start; gap: 0.75rem;">
            <span style="font-size: 18px; line-height: 1;">⚠️</span>
            <div>
              <strong>Meta Broadcast Policy Notice:</strong> Messages to customers who haven't messaged you in the last 24 hours must use a Meta-approved template and may be charged by Meta.
            </div>
          </div>

          <form method="POST" action="/dashboard/broadcast" id="broadcast-form" style="padding-top: 1rem;">
            <div class="form-grid">
              <div class="form-group">
                <label>Recipients</label>
                <select name="target" id="broadcast-target" class="form-select" onchange="toggleCustomPhone(this.value)">
                  <option value="all">All saved customers (${leads.length} contacts)</option>
                  <option value="demo_tested">Customers who completed interactive demo (${leads.filter((l) => l.activeDemo).length} contacts)</option>
                  <option value="custom">Single customer phone number</option>
                </select>
              </div>

              <div class="form-group">
                <label>Meta Approved Template Name (Optional)</label>
                <input type="text" name="templateName" class="form-input" placeholder="e.g. promotional_update_v1" />
              </div>

              <div class="form-group" id="custom-phone-group" style="display: none; grid-column: 1 / -1;">
                <label>Phone Number (with country code, e.g. 919876543210)</label>
                <input type="text" name="customPhone" class="form-input" placeholder="919876543210" />
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Photo URL (Optional)</label>
                <input type="url" name="imageUrl" class="form-input" placeholder="https://yourstore.com/promo-banner.jpg" />
              </div>

              <div class="form-group" style="grid-column: 1 / -1;">
                <label>Message Text</label>
                <textarea name="message" class="form-textarea" rows="4" placeholder="Hello! We are offering a 10% discount on all motorcycle touring accessories this weekend..." required></textarea>
              </div>
            </div>

            <!-- Send button disabled when 0 recipients (Goal 16) -->
            <button type="submit" id="btn-broadcast-submit" class="btn-submit" ${leads.length === 0 ? 'disabled title="Select at least 1 recipient"' : ''}>
              Send Broadcast to Customers (${leads.length})
            </button>
          </form>
        </div>
      </div>

      <!-- TAB 8: SETTINGS -->
      <div id="tab-settings" class="tab-content ${activeTab === 'tab-settings' ? 'active' : ''}">
        <div class="card-box">
          <div class="card-box-header">
            <div>
              <h3><span class="nav-icon">${SVG.settings}</span> WhatsApp connection & quota</h3>
              <p>Account status and free monthly quota details</p>
            </div>
            <span class="badge badge-bot">Connected</span>
          </div>

          <div style="padding: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            ${
              !isClient
                ? `
            <div style="background: #f8fafc; border: 1px solid var(--border); padding: 1.25rem; border-radius: 10px;">
              <div style="font-size: 14px; color: var(--text-muted); font-weight: 700;">PHONE NUMBER ID</div>
              <p style="font-size: 15px; font-weight: 700; margin-top: 0.35rem;">${env.WHATSAPP_PHONE_NUMBER_ID}</p>
              <p style="font-size: 14px; color: #16a34a; font-weight: 700; margin-top: 0.35rem;">Status: Healthy & Active</p>
            </div>
            `
                : ''
            }
            <div style="background: #f8fafc; border: 1px solid var(--border); padding: 1.25rem; border-radius: 10px;">
              <div style="font-size: 14px; color: var(--text-muted); font-weight: 700;">FREE MESSAGES REMAINING</div>
              <p style="font-size: 18px; font-weight: 700; color: var(--primary); margin-top: 0.35rem;">${quotaLeft.toLocaleString('en-IN')} left of 1,000</p>
              <p style="font-size: 14px; color: var(--text-muted); margin-top: 0.35rem;">Free service replies</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border); padding: 1.25rem; border-radius: 10px;">
              <div style="font-size: 14px; color: var(--text-muted); font-weight: 700;">AUTOMATION BOT</div>
              <p style="font-size: 15px; font-weight: 700; color: #0284c7; margin-top: 0.35rem;">Store AI Assistant</p>
              <p style="font-size: 14px; color: #16a34a; font-weight: 700; margin-top: 0.35rem;">Auto-replying to inquiries</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>

  <script>
    // === TAB SWITCHER =============================================
    function switchTab(tabId, el) {
      if (!tabId) return;
      // Support clean IDs with or without tab- prefix (e.g. 'products' or 'tab-products')
      if (!tabId.startsWith('tab-')) {
        tabId = 'tab-' + tabId;
      }

      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

      const target = document.getElementById(tabId);
      if (target) {
        target.classList.add('active');
      }

      const navItem = el || document.getElementById('nav-' + tabId) || document.querySelector('.nav-item[data-tab="' + tabId + '"]');
      if (navItem) {
        navItem.classList.add('active');
      }

      const headings = {
        'tab-overview': 'Overview',
        'tab-products': 'Products',
        'tab-services': 'Services',
        'tab-tickets': 'Waiting for Reply',
        'tab-chats': 'Recent Messages',
        'tab-leads': 'Customers',
        'tab-broadcast': 'Broadcast',
        'tab-catalog': 'Product Catalog',
        'tab-settings': 'Settings'
      };
      const headingEl = document.getElementById('page-heading');
      if (headingEl && headings[tabId]) headingEl.innerText = headings[tabId];

      // Standard clean URL update with query parameter ?tab=... (zero '#' symbol)
      try {
        if (window.history && window.history.replaceState) {
          const tabName = tabId.replace('tab-', '');
          const url = new URL(window.location.href);
          url.hash = ''; // Strip any '#' fragment completely
          if (tabName === 'overview') {
            url.searchParams.delete('tab');
          } else {
            url.searchParams.set('tab', tabName);
          }
          const query = url.searchParams.toString();
          window.history.replaceState(null, '', url.pathname + (query ? '?' + query : ''));
        }
      } catch (err) {}
    }

    function handleUrlNavigation() {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const legacyHash = (window.location.hash || '').replace('#', '').trim();
      if (tabParam) {
        switchTab(tabParam);
      } else if (legacyHash) {
        switchTab(legacyHash);
      }
    }

    function handleBusinessChange(val) {
      if (val === 'products') switchTab('tab-products');
      else if (val === 'services') switchTab('tab-services');
      else if (val === 'htrz') window.open('/htrz-modz', '_blank');
      else switchTab('tab-overview');
    }

    function toggleCustomPhone(val) {
      const group = document.getElementById('custom-phone-group');
      if (group) group.style.display = val === 'custom' ? 'flex' : 'none';
    }

    // === DEMO MODE ENGINE (GOAL 7: 25 Messages, 8 Customers, 5 Orders, 2 Tickets) ===
    let isDemoMode = false;

    // Cache original real data
    const REAL_STATE = {
      leadsCount: '${leads.length}',
      ordersValue: '₹${totalOrdersAndEnquiriesValue.toLocaleString('en-IN')}',
      ordersSubtext: '${totalOrdersCount} customer inquiries recorded',
      ticketsCount: '${openTickets.length}',
      ticketsSubtext: '${openTickets.length > 0 ? 'Require your reply on WhatsApp' : 'No pending tickets right now'}',
      ticketsAmber: ${openTickets.length > 0},
      botValue: '${botHandledCount} <span style="font-size: 16px; color: var(--text-muted); font-weight: 500;">(${botHandledPct}%)</span>',
      quotaMainText: '${quotaUsed} used of 1,000 free',
      quotaProgress: '${percentageUsed}%',
      quotaBadge: '${quotaLeft.toLocaleString('en-IN')} left',
      badgeOpenTickets: '${openTickets.length}',
      attentionHtml: document.getElementById('attention-list') ? document.getElementById('attention-list').innerHTML : '',
      attentionBadge: '${openTickets.length} waiting for reply',
      messagesHtml: document.getElementById('overview-live-messages-body') ? document.getElementById('overview-live-messages-body').innerHTML : '',
      customersHtml: document.getElementById('customers-table-body') ? document.getElementById('customers-table-body').innerHTML : ''
    };

    const DEMO_DATA = {
      leadsCount: '8',
      ordersValue: '₹38,450',
      ordersSubtext: '5 customer orders & inquiries',
      ticketsCount: '2',
      ticketsSubtext: '2 customer queries waiting for reply',
      ticketsAmber: true,
      botValue: '23 <span style="font-size: 16px; color: var(--text-muted); font-weight: 500;">(92%)</span>',
      quotaMainText: '25 used of 1,000 free',
      quotaProgress: '2.5%',
      quotaBadge: '975 left',
      badgeOpenTickets: '2',
      attentionBadge: '2 waiting for reply',
      attentionHtml:
        '<div class="attention-item">' +
          '<div class="attention-details">' +
            '<div class="attention-customer">Rahul Sharma (+91 98765 43210) — <span style="font-weight: 500; color: var(--text-muted);">Touring Handlebars</span></div>' +
            '<div class="attention-message">Customer asked if handlebar fitting includes bar-end weights for Hunter 350.</div>' +
            '<div style="font-size: 14px; color: var(--text-muted); margin-top: 2px;">Requested: Today 10:48 AM</div>' +
          '</div>' +
          '<div class="attention-actions">' +
            '<a href="https://wa.me/919876543210" target="_blank" class="btn-action" style="padding: 0.45rem 0.85rem;">' +
              'Reply on WhatsApp' +
            '</a>' +
            '<button class="btn-secondary btn-resolve-attention" style="padding: 0.45rem 0.85rem;">Mark Resolved</button>' +
          '</div>' +
        '</div>' +
        '<div class="attention-item">' +
          '<div class="attention-details">' +
            '<div class="attention-customer">Anita Roy (+91 96345 67893) — <span style="font-weight: 500; color: var(--text-muted);">Axor Helmet Exchange</span></div>' +
            '<div class="attention-message">Customer received Size M yesterday and requested free exchange for Size L.</div>' +
            '<div style="font-size: 14px; color: var(--text-muted); margin-top: 2px;">Requested: Today 08:51 AM</div>' +
          '</div>' +
          '<div class="attention-actions">' +
            '<a href="https://wa.me/919634567893" target="_blank" class="btn-action" style="padding: 0.45rem 0.85rem;">' +
              'Reply on WhatsApp' +
            '</a>' +
            '<button class="btn-secondary btn-resolve-attention" style="padding: 0.45rem 0.85rem;">Mark Resolved</button>' +
          '</div>' +
        '</div>',
      messages: [
        { time: 'Today 10:48 AM', customer: 'Rahul Sharma', phone: '+91 98765 43210', sender: 'Customer', msg: 'Yes please, also does it include the bar-end weights?' },
        { time: 'Today 10:47 AM', customer: 'Rahul Sharma', phone: '+91 98765 43210', sender: 'Bot', msg: 'Yes! We have 3 touring handlebars in stock starting from ₹1,899.' },
        { time: 'Today 10:45 AM', customer: 'Rahul Sharma', phone: '+91 98765 43210', sender: 'Customer', msg: 'Hi, do you have touring handlebars for Hunter 350?' },
        { time: 'Today 10:21 AM', customer: 'Priya Patel', phone: '+91 98234 56781', sender: 'Bot', msg: 'Payment received! Your order #ORD-402 for Axor Apex is confirmed.' },
        { time: 'Today 10:20 AM', customer: 'Priya Patel', phone: '+91 98234 56781', sender: 'Customer', msg: 'Paid! Transaction ID UPI-99482. Please dispatch today.' },
        { time: 'Today 10:16 AM', customer: 'Priya Patel', phone: '+91 98234 56781', sender: 'Bot', msg: 'Axor Apex Matte Black (Size M) is available at ₹6,499. Pay via UPI: rzp.io/l/helm-m' },
        { time: 'Today 10:15 AM', customer: 'Priya Patel', phone: '+91 98234 56781', sender: 'Customer', msg: 'Looking for Axor Apex helmets in Medium size matte black' },
        { time: 'Today 09:36 AM', customer: 'Vikram Singh', phone: '+91 97123 45672', sender: 'Bot', msg: 'Your slot for tomorrow at 11:00 AM is reserved at our main workshop.' },
        { time: 'Today 09:35 AM', customer: 'Vikram Singh', phone: '+91 97123 45672', sender: 'Customer', msg: 'Great, book an appointment for tomorrow 11 AM' },
        { time: 'Today 09:31 AM', customer: 'Vikram Singh', phone: '+91 97123 45672', sender: 'Bot', msg: 'BMC Performance Air Filter package starts at ₹4,690 including fitment.' },
        { time: 'Today 09:30 AM', customer: 'Vikram Singh', phone: '+91 97123 45672', sender: 'Customer', msg: 'What is the cost for high-flow air filter servicing?' },
        { time: 'Today 08:51 AM', customer: 'Anita Roy', phone: '+91 96345 67893', sender: 'Bot', msg: 'Our team handles size exchanges free of charge. Ticket #TK-109 assigned.' },
        { time: 'Today 08:50 AM', customer: 'Anita Roy', phone: '+91 96345 67893', sender: 'Customer', msg: 'Can I exchange the helmet I received yesterday for Size L?' },
        { time: 'Yesterday 06:11 PM', customer: 'Rohan Mehta', phone: '+91 95456 78904', sender: 'Bot', msg: 'Yes, we ship across India via BlueDart. Pune delivery takes 2-3 days.' },
        { time: 'Yesterday 06:10 PM', customer: 'Rohan Mehta', phone: '+91 95456 78904', sender: 'Customer', msg: 'Do you ship to Pune and how many days does it take?' },
        { time: 'Yesterday 05:41 PM', customer: 'Karthik N', phone: '+91 94567 89015', sender: 'Bot', msg: 'Special festival offer: Flat 15% off on Heavy-Duty Crash Guards. Code: RIDE15' },
        { time: 'Yesterday 05:40 PM', customer: 'Karthik N', phone: '+91 94567 89015', sender: 'Customer', msg: 'Show offers on crash guards' },
        { time: 'Yesterday 04:16 PM', customer: 'Sneha Reddy', phone: '+91 93678 90126', sender: 'Bot', msg: 'Rynox Navigator 15L Waterproof Dry Bags (₹3,950). Link: rzp.io/l/rynox-bag' },
        { time: 'Yesterday 04:15 PM', customer: 'Sneha Reddy', phone: '+91 93678 90126', sender: 'Customer', msg: 'Need waterproof saddle bags for Leh Ladakh trip' },
        { time: 'Yesterday 03:01 PM', customer: 'Arjun Nair', phone: '+91 92789 01237', sender: 'Bot', msg: 'We are at 100ft Road, Indiranagar, Bangalore. Google Maps: https://maps.google.com/' },
        { time: 'Yesterday 03:00 PM', customer: 'Arjun Nair', phone: '+91 92789 01237', sender: 'Customer', msg: 'Where is your store located in Bangalore?' },
        { time: 'Yesterday 01:21 PM', customer: 'Manoj Kumar', phone: '+91 91987 65432', sender: 'Bot', msg: 'HJG 60W Dual Projector Cree LED installation available with waterproof switch.' },
        { time: 'Yesterday 01:20 PM', customer: 'Manoj Kumar', phone: '+91 91987 65432', sender: 'Customer', msg: 'Do you install auxiliary fog lights?' },
        { time: 'Yesterday 11:10 AM', customer: 'Manoj Kumar', phone: '+91 91987 65432', sender: 'Customer', msg: 'Thanks, visiting this weekend!' },
        { time: 'Yesterday 10:00 AM', customer: 'Manoj Kumar', phone: '+91 91987 65432', sender: 'Bot', msg: 'Welcome to HTRZ Modz! How can we assist you with your ride today?' }
      ],
      customers: [
        { name: 'Rahul Sharma', phone: '+91 98765 43210', interest: 'Touring Handlebar', time: 'Today 10:48 AM' },
        { name: 'Priya Patel', phone: '+91 98234 56781', interest: 'Axor Apex Helmet', time: 'Today 10:21 AM' },
        { name: 'Vikram Singh', phone: '+91 97123 45672', interest: 'Air Filter Service', time: 'Today 09:36 AM' },
        { name: 'Anita Roy', phone: '+91 96345 67893', interest: 'Helmet Exchange', time: 'Today 08:51 AM' },
        { name: 'Rohan Mehta', phone: '+91 95456 78904', interest: 'Pune Shipping', time: 'Yesterday 06:11 PM' },
        { name: 'Karthik Narayanan', phone: '+91 94567 89015', interest: 'Crash Guards', time: 'Yesterday 05:41 PM' },
        { name: 'Sneha Reddy', phone: '+91 93678 90126', interest: 'Saddle Bags', time: 'Yesterday 04:16 PM' },
        { name: 'Arjun Nair', phone: '+91 92789 01237', interest: 'Store Visit', time: 'Yesterday 03:01 PM' }
      ]
    };

    function toggleDemoMode() {
      isDemoMode = !isDemoMode;

      const btn = document.getElementById('demo-toggle-btn');
      const text = document.getElementById('demo-toggle-text');
      const banner = document.getElementById('demo-banner');

      if (btn) btn.classList.toggle('active', isDemoMode);
      if (text) text.innerText = isDemoMode ? 'Demo Mode: ON' : 'Demo Mode: OFF';
      if (banner) banner.classList.toggle('visible', isDemoMode);

      if (isDemoMode) {
        // Load demo data
        document.getElementById('kpi-leads-count').innerText = DEMO_DATA.leadsCount;
        document.getElementById('kpi-orders-value').innerText = DEMO_DATA.ordersValue;
        document.getElementById('kpi-orders-subtext').innerText = DEMO_DATA.ordersSubtext;
        document.getElementById('kpi-tickets-count').innerText = DEMO_DATA.ticketsCount;
        document.getElementById('kpi-tickets-subtext').innerText = DEMO_DATA.ticketsSubtext;
        document.getElementById('kpi-tickets-card').classList.add('amber-alert');
        document.getElementById('kpi-bot-value').innerHTML = DEMO_DATA.botValue;
        document.getElementById('kpi-quota-main-text').innerText = DEMO_DATA.quotaMainText;
        document.getElementById('kpi-quota-progress').style.width = DEMO_DATA.quotaProgress;
        document.getElementById('kpi-quota-badge').innerText = DEMO_DATA.quotaBadge;

        const badgeTickets = document.getElementById('badge-open-tickets');
        if (badgeTickets) {
          badgeTickets.innerText = DEMO_DATA.badgeOpenTickets;
          badgeTickets.style.display = 'inline';
        }

        const attentionList = document.getElementById('attention-list');
        if (attentionList) attentionList.innerHTML = DEMO_DATA.attentionHtml;
        const attentionBadge = document.getElementById('attention-count-badge');
        if (attentionBadge) attentionBadge.innerText = DEMO_DATA.attentionBadge;

        // Render 25 demo messages
        const msgBody = document.getElementById('overview-live-messages-body');
        if (msgBody) {
          msgBody.innerHTML = DEMO_DATA.messages.map(m =>
            '<tr>' +
              '<td class="col-time">' + m.time + '</td>' +
              '<td class="col-customer">' +
                '<div>' + m.customer + '</div>' +
                '<div style="font-size: 14px; font-weight: 500; color: var(--text-muted);">' + m.phone + '</div>' +
              '</td>' +
              '<td class="col-sender">' +
                '<span class="badge ' + (m.sender === 'Customer' ? 'badge-customer' : 'badge-bot') + '">' + m.sender + '</span>' +
              '</td>' +
              '<td class="col-message">' +
                '<div class="msg-preview">' + m.msg + '</div>' +
              '</td>' +
              '<td style="text-align: right;">' +
                '<a href="https://wa.me/' + m.phone.replace(/[^0-9]/g, '') + '" target="_blank" class="btn-secondary" style="padding: 0.35rem 0.65rem;">Chat ↗</a>' +
              '</td>' +
            '</tr>'
          ).join('');
        }

        // Render demo customers
        const custBody = document.getElementById('customers-table-body');
        if (custBody) {
          custBody.innerHTML = DEMO_DATA.customers.map(c =>
            '<tr>' +
              '<td style="font-weight: 700;">' + c.name + '</td>' +
              '<td>' + c.phone + '</td>' +
              '<td><span class="badge badge-customer">' + c.interest + '</span></td>' +
              '<td class="col-time">' + c.time + '</td>' +
              '<td style="text-align: right;">' +
                '<a href="https://wa.me/' + c.phone.replace(/[^0-9]/g, '') + '" target="_blank" class="btn-action" style="padding: 0.35rem 0.75rem;">Open Chat ↗</a>' +
              '</td>' +
            '</tr>'
          ).join('');
        }
      } else {
        // Restore real data
        document.getElementById('kpi-leads-count').innerText = REAL_STATE.leadsCount;
        document.getElementById('kpi-orders-value').innerText = REAL_STATE.ordersValue;
        document.getElementById('kpi-orders-subtext').innerText = REAL_STATE.ordersSubtext;
        document.getElementById('kpi-tickets-count').innerText = REAL_STATE.ticketsCount;
        document.getElementById('kpi-tickets-subtext').innerText = REAL_STATE.ticketsSubtext;
        document.getElementById('kpi-tickets-card').classList.toggle('amber-alert', REAL_STATE.ticketsAmber);
        document.getElementById('kpi-bot-value').innerHTML = REAL_STATE.botValue;
        document.getElementById('kpi-quota-main-text').innerText = REAL_STATE.quotaMainText;
        document.getElementById('kpi-quota-progress').style.width = REAL_STATE.quotaProgress;
        document.getElementById('kpi-quota-badge').innerText = REAL_STATE.quotaBadge;

        const badgeTickets = document.getElementById('badge-open-tickets');
        if (badgeTickets) {
          badgeTickets.innerText = REAL_STATE.badgeOpenTickets;
          badgeTickets.style.display = REAL_STATE.ticketsAmber ? 'inline' : 'none';
        }

        const attentionList = document.getElementById('attention-list');
        if (attentionList) attentionList.innerHTML = REAL_STATE.attentionHtml;
        const attentionBadge = document.getElementById('attention-count-badge');
        if (attentionBadge) attentionBadge.innerText = REAL_STATE.attentionBadge;

        const msgBody = document.getElementById('overview-live-messages-body');
        if (msgBody) msgBody.innerHTML = REAL_STATE.messagesHtml;

        const custBody = document.getElementById('customers-table-body');
        if (custBody) custBody.innerHTML = REAL_STATE.customersHtml;
      }

      // Re-initialize pagination with active table contents
      initAllPaginators();
    }

    // === CLIENT-SIDE PAGINATION ENGINE ============================
    const _pgState = {};

    function initPagination(table) {
      const pgId = table.dataset.pgId || table.id || Math.random().toString(36).slice(2);
      const pageSize = parseInt(table.dataset.paginate, 10) || 30;
      table._pgId = pgId;
      table._pgSize = pageSize;
      _pgState[pgId] = 1;

      const container = table.closest('.table-container');
      if (!container) return;

      const oldBar = container.parentElement.querySelector('.pagination-bar[data-for="' + pgId + '"]');
      if (oldBar) oldBar.remove();

      const bar = document.createElement('div');
      bar.className = 'pagination-bar';
      bar.dataset.for = pgId;
      bar.onclick = function(e) {
        const btn = e.target.closest('.pg-btn');
        if (!btn || btn.disabled) return;
        const targetPage = parseInt(btn.dataset.page, 10);
        if (!isNaN(targetPage)) gotoPage(pgId, targetPage);
      };
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

      const bar = document.querySelector('.pagination-bar[data-for="' + pgId + '"]');
      if (!bar) return;

      // Goal 17: Hide pagination text and controls when there are 0 rows
      if (total === 0) {
        bar.style.display = 'none';
        return;
      } else {
        bar.style.display = 'flex';
      }

      const startRow = start + 1;
      const endRow = Math.min(end, total);

      let pages = [];
      const delta = 2;
      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= page - delta && p <= page + delta)) {
          pages.push(p);
        }
      }
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
        return '<button class="pg-btn' + active + '" data-page="' + p + '">' + p + '</button>';
      }).join('');

      bar.innerHTML =
        '<span class="pg-info">Showing <strong>' + startRow + '-' + endRow + '</strong> of <strong>' + total + '</strong></span>' +
        '<div class="pagination-controls">' +
          '<button class="pg-btn" data-page="' + (page - 1) + '" ' + (page <= 1 ? 'disabled' : '') + '>&lsaquo;</button>' +
          pageButtons +
          '<button class="pg-btn" data-page="' + (page + 1) + '" ' + (page >= totalPages ? 'disabled' : '') + '>&rsaquo;</button>' +
        '</div>';
    }

    function gotoPage(pgId, page) {
      const table = document.querySelector('table[data-pg-id="' + pgId + '"]');
      if (table) renderPage(table, page);
    }

    function initAllPaginators() {
      document.querySelectorAll('table[data-paginate]').forEach(initPagination);
    }

    // === PRODUCT SUBTABS (GOAL 14) ===
    function switchProductSubtab(subtab) {
      document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.product-subtab-pane').forEach(pane => pane.style.display = 'none');

      const activeBtn = document.getElementById('btn-subtab-' + subtab);
      if (activeBtn) activeBtn.classList.add('active');
      const targetPane = document.getElementById('subtab-' + subtab);
      if (targetPane) targetPane.style.display = 'block';
    }

    // === CSV EXPORTERS (GOAL 13) ===
    function downloadCSV(csvContent, filename) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function exportCustomersCSV() {
      const table = document.getElementById('customers-table');
      if (!table) return;
      const rows = Array.from(table.querySelectorAll('tr'));
      const csvLines = rows.map(r => {
        const cells = Array.from(r.querySelectorAll('th, td'));
        // Exclude the action button column
        const relevantCells = cells.slice(0, Math.max(1, cells.length - 1));
        return relevantCells.map(c => '"' + c.innerText.replace(/"/g, '""').trim() + '"').join(',');
      });
      downloadCSV(csvLines.join('\\n'), 'customers_' + new Date().toISOString().slice(0, 10) + '.csv');
    }

    function exportOrdersCSV() {
      const table = document.getElementById('orders-table');
      if (!table) return;
      const rows = Array.from(table.querySelectorAll('tr'));
      const csvLines = rows.map(r => {
        const cells = Array.from(r.querySelectorAll('th, td'));
        const relevantCells = cells.slice(0, Math.max(1, cells.length - 1));
        return relevantCells.map(c => {
          const sel = c.querySelector('select');
          const text = sel ? sel.value : c.innerText;
          return '"' + text.replace(/"/g, '""').trim() + '"';
        }).join(',');
      });
      downloadCSV(csvLines.join('\\n'), 'orders_' + new Date().toISOString().slice(0, 10) + '.csv');
    }

    // === ORDER STATUS UPDATER (GOAL 12) ===
    async function updateOrderStatus(orderId, status) {
      try {
        const res = await fetch('/dashboard/orders/' + orderId + '/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (!res.ok) {
          alert('Could not update order status. Please try again.');
        }
      } catch (err) {
        console.error('Order status update error:', err);
        alert('Network error updating order status.');
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      initAllPaginators();

      // Listen for URL navigation changes (?tab=...)
      handleUrlNavigation();
      window.addEventListener('popstate', handleUrlNavigation);
      window.addEventListener('hashchange', handleUrlNavigation);

      // Resolve attention items handler
      document.addEventListener('click', function(e) {
        if (e.target && e.target.matches('.btn-resolve-attention')) {
          const item = e.target.closest('.attention-item');
          if (item) item.remove();
        }
      });

      // Broadcast form confirm dialog (Goal 16)
      const bForm = document.getElementById('broadcast-form');
      if (bForm) {
        bForm.addEventListener('submit', function(e) {
          const targetSelect = document.getElementById('broadcast-target');
          let count = 0;
          if (targetSelect) {
            if (targetSelect.value === 'all') count = ${leads.length};
            else if (targetSelect.value === 'demo_tested') count = ${leads.filter((l) => l.activeDemo).length};
            else if (targetSelect.value === 'custom') {
              const phone = document.querySelector('input[name="customPhone"]')?.value?.trim();
              count = (phone && phone.length >= 10) ? 1 : 0;
            }
          }
          if (count === 0) {
            e.preventDefault();
            alert('Cannot dispatch broadcast: 0 recipients targeted. Please add recipients or choose another audience.');
            return;
          }
          const confirmed = confirm('Confirm WhatsApp Broadcast: Are you sure you want to send this broadcast to ' + count + ' recipient(s)?');
          if (!confirmed) {
            e.preventDefault();
          }
        });
      }

      if (new URLSearchParams(window.location.search).get('demo') === 'true') {
        toggleDemoMode();
      }
    });

    // Real-Time Quota & Leads Poller (runs only when Demo mode is OFF)
    async function pollLiveMetrics() {
      if (isDemoMode) return;
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) return;
        const data = await res.json();

        if (data.quota) {
          const used = data.quota.outboundCount || 0;
          const limit = data.quota.freeLimit || 1000;
          const left = Math.max(0, limit - used);
          const pct = Math.min(100, Math.round((used / limit) * 100));

          const qMain = document.getElementById('kpi-quota-main-text');
          if (qMain) qMain.innerText = used + ' used of 1,000 free';

          const qProg = document.getElementById('kpi-quota-progress');
          if (qProg) qProg.style.width = pct + '%';

          const qBadge = document.getElementById('kpi-quota-badge');
          if (qBadge) qBadge.innerText = left + ' left';
        }

        const leadsEl = document.getElementById('kpi-leads-count');
        if (leadsEl) leadsEl.innerText = data.totalLeads;
      } catch (err) {
        // Retry silently
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
  public getStats(_req: Request, res: Response): void {
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
  public addCatalogItem(req: Request, res: Response): void {
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
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to add item' });
    }
  }

  /**
   * API: Send Broadcast Campaign to All or Selected Customers
   */
  public async sendBroadcast(req: Request, res: Response): Promise<void> {
    const { target, message, customPhone, imageUrl } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ error: 'Broadcast message body cannot be empty' });
      return;
    }

    const trimmedMsg = message.trim();
    let recipients: string[] = [];

    if (target === 'custom' && customPhone) {
      const cleaned = String(customPhone).replace(/[^0-9]/g, '');
      if (cleaned.length >= 10) {
        recipients.push(cleaned);
      }
    } else if (target === 'demo_tested') {
      const leads = dbService.getAllLeads();
      recipients = leads
        .filter((l) => l.status === 'demo_tested' || Boolean(l.activeDemo))
        .map((l) => l.phoneNumber);
    } else {
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
        } else {
          const apiRes = await whatsAppService.sendTextMessage(phone, trimmedMsg);
          const msgId = apiRes.messages?.[0]?.id || `bcast_${Date.now()}`;
          dbService.logMessage(msgId, phone, 'outbound', 'text_broadcast', trimmedMsg);
        }
        sentCount++;
      } catch (sendErr) {
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
  public updateTicketStatus(req: Request, res: Response): void {
    const id = Number(req.params.id);
    const status = req.body.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

    if (!id || !status) {
      res.status(400).json({ error: 'Ticket ID and status are required' });
      return;
    }

    dbService.updateTicketStatus(id, status);
    logger.info({ ticketId: id, status }, 'Support ticket status updated');

    if (
      req.headers['accept']?.includes('text/html') ||
      req.headers['content-type']?.includes('application/x-www-form-urlencoded')
    ) {
      res.redirect('/dashboard');
      return;
    }

    res.json({ success: true, ticketId: id, status });
  }

  /**
   * API endpoint to get all support tickets
   */
  public getTickets(_req: Request, res: Response): void {
    const tickets = dbService.getAllSupportTickets();
    res.json({ tickets });
  }

  /**
   * API: Update status of an order (New, Confirmed, Delivered, Cancelled)
   */
  public updateOrderStatus(req: Request, res: Response): void {
    const id = Number(req.params.id);
    const status = req.body.status as 'New' | 'Confirmed' | 'Delivered' | 'Cancelled';

    if (!id || !status) {
      res.status(400).json({ error: 'Order ID and status are required' });
      return;
    }

    const updated = dbService.updateOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    logger.info({ orderId: id, status }, 'Order status updated');
    res.json({ success: true, orderId: id, status });
  }
}

export const dashboardController = new DashboardController();
