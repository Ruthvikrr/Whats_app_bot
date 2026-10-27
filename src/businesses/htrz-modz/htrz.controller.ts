import type { Request, Response } from 'express';
import { dbService } from '../../db/database.js';
import { renderHtrzDashboardHtml } from './htrz.view.js';
import { logger } from '../../utils/logger.js';

export class HtrzController {
  /**
   * Renders the dedicated HTRZ Modz business dashboard.
   */
  public renderDashboard(_req: Request, res: Response): void {
    try {
      const quota = dbService.getMonthlyQuotaStats();
      const allTickets = dbService.getSupportTicketsByBusiness('htrz');
      const leads = dbService.getAllLeads();
      const recentMessages = dbService.getRecentLiveMessages(20);

      // Meta free messages for HTRZ client: 800 limit cap (as requested by user)
      const clientFreeLimit = 800;
      const outboundCount = quota.outboundCount || 0;
      const remainingFree = Math.max(0, clientFreeLimit - outboundCount);

      // Separate Open / Pending vs Resolved Tickets
      const openTickets = allTickets.filter(
        (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
      );
      const resolvedTickets = allTickets.filter((t) => t.status === 'RESOLVED');

      const html = renderHtrzDashboardHtml({
        outboundCount,
        clientFreeLimit,
        remainingFree,
        openTickets,
        resolvedTickets,
        totalLeadsCount: leads.length,
        recentMessages,
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
      const allTickets = dbService.getAllSupportTickets();
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
