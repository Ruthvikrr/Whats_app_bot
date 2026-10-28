import type { Request, Response } from 'express';
import { dbService, type SupportTicket, type LiveMessageLog } from '../../db/database.js';
import { renderHtrzDashboardHtml } from './htrz.view.js';
import { logger } from '../../utils/logger.js';

export class HtrzController {
  /**
   * Renders the dedicated HTRZ Modz business dashboard.
   */
  public renderDashboard(_req: Request, res: Response): void {
    try {
      // Demo Mode is restricted to admin role only. Disabled in client portal.
      const isDemo = false;
      const quota = dbService.getMonthlyQuotaStats();
      const clientFreeLimit = 800; // Meta free messages cap for HTRZ client
      const outboundCount = quota.outboundCount || 0;
      const remainingFree = Math.max(0, clientFreeLimit - outboundCount);

      let openTickets: SupportTicket[];
      let resolvedTickets: SupportTicket[];
      let totalLeadsCount: number;
      let recentMessages: LiveMessageLog[];
      let categoryInquiries: Array<{ category: string; count: number }>;

      if (isDemo) {
        // Believable in-memory sample dataset for Demo Mode (never written to DB)
        totalLeadsCount = 8;

        openTickets = [
          {
            id: 901,
            ticketNumber: 'HTRZ-1042',
            customerName: 'Vikramaditya Rao',
            phoneNumber: '919845012345',
            enquiryService: 'Exhaust & Mapping',
            enquirySummary: 'BS6 Duke 390 Akrapovic Slip-On compatibility and DB killer fitting query',
            status: 'OPEN',
            business: 'htrz',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            resolvedAt: null,
          },
          {
            id: 902,
            ticketNumber: 'HTRZ-1045',
            customerName: 'Sneha Deshmukh',
            phoneNumber: '919920123456',
            enquiryService: 'Riding Jacket',
            enquirySummary: 'Requesting expedited express dispatch for weekend tour to Goa',
            status: 'OPEN',
            business: 'htrz',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            resolvedAt: null,
          },
        ];

        resolvedTickets = [
          {
            id: 903,
            ticketNumber: 'HTRZ-1031',
            customerName: 'Rahul Sharma',
            phoneNumber: '919876543210',
            enquiryService: 'Axor Apex Helmet',
            enquirySummary: 'Size XL visor replacement inquiry',
            status: 'RESOLVED',
            business: 'htrz',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            resolvedAt: new Date(Date.now() - 40000000).toISOString(),
          },
          {
            id: 904,
            ticketNumber: 'HTRZ-1035',
            customerName: 'Ananya Patel',
            phoneNumber: '919812345678',
            enquiryService: 'Fog Lights',
            enquirySummary: 'Maddog ScoutX wiring harness installation clamp query',
            status: 'RESOLVED',
            business: 'htrz',
            createdAt: new Date(Date.now() - 90000000).toISOString(),
            resolvedAt: new Date(Date.now() - 50000000).toISOString(),
          },
        ];

        categoryInquiries = [
          { category: 'Helmets', count: 24 },
          { category: 'Fog Lights', count: 38 },
          { category: 'Intercoms', count: 14 },
          { category: 'Touring', count: 31 },
          { category: 'Protection', count: 28 },
          { category: 'Tech Mounts', count: 14 },
          { category: 'Maintenance', count: 9 },
        ];

        recentMessages = [
          {
            id: 501,
            dateFormatted: 'Today 11:42 AM',
            phoneNumber: '919845012345',
            customerName: 'Vikramaditya Rao',
            direction: 'inbound',
            messageType: 'text',
            body: 'Hi, do you have the Akrapovic slip-on exhaust for KTM 390 Duke BS6 in stock?',
          },
          {
            id: 502,
            dateFormatted: 'Today 11:43 AM',
            phoneNumber: '919845012345',
            customerName: 'Vikramaditya Rao',
            direction: 'outbound',
            messageType: 'text',
            body: 'Yes! We have the Akrapovic Slip-On with removable DB killer ready for dispatch. ₹3,499 with free express shipping.',
          },
          {
            id: 503,
            dateFormatted: 'Today 10:15 AM',
            phoneNumber: '919920123456',
            customerName: 'Sneha Deshmukh',
            direction: 'inbound',
            messageType: 'text',
            body: 'Can you deliver the Viaterra Carbon gloves to Mumbai by Friday?',
          },
          {
            id: 504,
            dateFormatted: 'Today 10:16 AM',
            phoneNumber: '919920123456',
            customerName: 'Sneha Deshmukh',
            direction: 'outbound',
            messageType: 'text',
            body: 'Yes! Orders placed before 2 PM are shipped via BlueDart Air for 24-48hr metro delivery.',
          },
        ];
      } else {
        // Purely real SQLite data from database
        const allTickets = dbService.getSupportTicketsByBusiness('htrz');
        const leads = dbService.getAllLeads('htrz');
        recentMessages = dbService.getRecentLiveMessages(25, 'htrz');
        categoryInquiries = dbService.getCategoryInquiryStats('htrz');

        openTickets = allTickets.filter(
          (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
        );
        resolvedTickets = allTickets.filter((t) => t.status === 'RESOLVED');
        totalLeadsCount = leads.length;
      }

      const html = renderHtrzDashboardHtml({
        outboundCount,
        clientFreeLimit,
        remainingFree,
        openTickets,
        resolvedTickets,
        totalLeadsCount,
        recentMessages,
        categoryInquiries,
        isDemo,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      logger.error({ error: err }, 'Failed to render HTRZ Modz dashboard');
      res.status(500).send('<h3>Error loading HTRZ Modz Dashboard</h3>');
    }
  }

  /**
   * Mark a support ticket as RESOLVED in real time.
   */
  public resolveTicket(req: Request, res: Response): void {
    try {
      const ticketId = Number(req.params.id);
      if (isNaN(ticketId)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
      }

      dbService.updateTicketStatus(ticketId, 'RESOLVED');
      logger.info({ ticketId }, 'HTRZ Modz ticket marked as resolved by staff');
      res.json({ success: true, message: `Ticket #${ticketId} resolved successfully` });
    } catch (err) {
      logger.error({ error: err }, 'Failed to resolve ticket');
      res.status(500).json({ error: 'Internal server error resolving ticket' });
    }
  }

  /**
   * Reopen a support ticket.
   */
  public reopenTicket(req: Request, res: Response): void {
    try {
      const ticketId = Number(req.params.id);
      if (isNaN(ticketId)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
      }

      dbService.updateTicketStatus(ticketId, 'OPEN');
      logger.info({ ticketId }, 'HTRZ Modz ticket reopened by staff');
      res.json({ success: true, message: `Ticket #${ticketId} reopened successfully` });
    } catch (err) {
      logger.error({ error: err }, 'Failed to reopen ticket');
      res.status(500).json({ error: 'Internal server error reopening ticket' });
    }
  }

  /**
   * Real-time JSON statistics API for client portal.
   */
  public getStatsApi(_req: Request, res: Response): void {
    try {
      const quota = dbService.getMonthlyQuotaStats();
      const allTickets = dbService.getSupportTicketsByBusiness('htrz');
      const clientFreeLimit = 800;
      const outboundCount = quota.outboundCount || 0;

      res.json({
        client: 'HTRZ Modz',
        quota: {
          used: outboundCount,
          total: clientFreeLimit,
          remaining: Math.max(0, clientFreeLimit - outboundCount),
        },
        tickets: {
          pending: allTickets.filter((t) => t.status !== 'RESOLVED').length,
          resolved: allTickets.filter((t) => t.status === 'RESOLVED').length,
          total: allTickets.length,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve stats' });
    }
  }
}

export const htrzController = new HtrzController();
