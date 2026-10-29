import fs from 'fs';
import path from 'path';
import { dbService } from '../../db/database.js';
import { renderHtrzDashboardHtml } from './htrz.view.js';
import { logger } from '../../utils/logger.js';
export class HtrzController {
    /**
     * Renders the dedicated HTRZ Modz business dashboard.
     */
    renderDashboard(_req, res) {
        try {
            // Demo Mode is restricted to admin role only. Disabled in client portal.
            const isDemo = false;
            const quota = dbService.getMonthlyQuotaStats();
            const clientFreeLimit = 800; // Meta free messages cap for HTRZ client
            const outboundCount = quota.outboundCount || 0;
            const remainingFree = Math.max(0, clientFreeLimit - outboundCount);
            let openTickets;
            let resolvedTickets;
            let totalLeadsCount;
            let recentMessages;
            let categoryInquiries;
            let leads = [];
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
            }
            else {
                // Purely real SQLite data from database
                const allTickets = dbService.getSupportTicketsByBusiness('htrz');
                leads = dbService.getAllLeads('htrz');
                recentMessages = dbService.getRecentLiveMessages(25, 'htrz');
                categoryInquiries = dbService.getCategoryInquiryStats('htrz');
                openTickets = allTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
                resolvedTickets = allTickets.filter((t) => t.status === 'RESOLVED');
                totalLeadsCount = leads.length;
            }
            if (!leads) {
                leads = dbService.getAllLeads('htrz');
            }
            const catalogItems = dbService.getAllCatalogItems('htrz');
            const bikes = dbService.getAllBikes('htrz');
            const html = renderHtrzDashboardHtml({
                outboundCount,
                clientFreeLimit,
                remainingFree,
                openTickets,
                resolvedTickets,
                totalLeadsCount,
                recentMessages,
                categoryInquiries,
                catalogItems,
                leads,
                bikes,
                isDemo,
            });
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(html);
        }
        catch (err) {
            logger.error({ error: err }, 'Failed to render HTRZ Modz dashboard');
            res.status(500).send('<h3>Error loading HTRZ Modz Dashboard</h3>');
        }
    }
    /**
     * Mark a support ticket as RESOLVED in real time.
     */
    resolveTicket(req, res) {
        try {
            const ticketId = Number(req.params.id);
            if (isNaN(ticketId)) {
                res.status(400).json({ error: 'Invalid ticket ID' });
                return;
            }
            dbService.updateTicketStatus(ticketId, 'RESOLVED');
            logger.info({ ticketId }, 'HTRZ Modz ticket marked as resolved by staff');
            res.json({ success: true, message: `Ticket #${ticketId} resolved successfully` });
        }
        catch (err) {
            logger.error({ error: err }, 'Failed to resolve ticket');
            res.status(500).json({ error: 'Internal server error resolving ticket' });
        }
    }
    /**
     * Reopen a support ticket.
     */
    reopenTicket(req, res) {
        try {
            const ticketId = Number(req.params.id);
            if (isNaN(ticketId)) {
                res.status(400).json({ error: 'Invalid ticket ID' });
                return;
            }
            dbService.updateTicketStatus(ticketId, 'OPEN');
            logger.info({ ticketId }, 'HTRZ Modz ticket reopened by staff');
            res.json({ success: true, message: `Ticket #${ticketId} reopened successfully` });
        }
        catch (err) {
            logger.error({ error: err }, 'Failed to reopen ticket');
            res.status(500).json({ error: 'Internal server error reopening ticket' });
        }
    }
    /**
     * Real-time JSON statistics API for client portal.
     */
    getStatsApi(_req, res) {
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
        }
        catch (err) {
            logger.error({ error: err }, 'Failed to fetch HTRZ stats');
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Create a new product with separate name, category, image (jpg/png) and PDF document upload.
     */
    async createProduct(req, res) {
        try {
            const { name, category, price, description, paymentUrl, isActive, } = req.body;
            const imageData = req.body.imageData || req.body.imageBase64;
            const imageFileName = req.body.imageFileName || req.body.imageFilename;
            const pdfData = req.body.pdfData || req.body.pdfBase64;
            const pdfFileName = req.body.pdfFileName || req.body.pdfFilename;
            if (!name || price === undefined || price === null || price === '') {
                res.status(400).json({ error: 'Product name and price are required' });
                return;
            }
            let imageUrl = null;
            let pdfUrl = null;
            // Handle Image upload (JPG / PNG / WebP)
            if (imageData && typeof imageData === 'string') {
                const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                const b64 = matches && matches[2] ? matches[2] : (imageData.startsWith('http') ? null : imageData);
                if (b64) {
                    const buffer = Buffer.from(b64, 'base64');
                    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    const ext = imageFileName ? path.extname(imageFileName) || '.jpg' : '.jpg';
                    const safeName = (imageFileName ? path.basename(imageFileName, ext) : 'product').replace(/[^a-zA-Z0-9_-]/g, '_');
                    const finalFilename = `htrz_${Date.now()}_${safeName}${ext}`;
                    fs.writeFileSync(path.join(uploadsDir, finalFilename), buffer);
                    imageUrl = `/public/uploads/${finalFilename}`;
                }
                else if (imageData.startsWith('http')) {
                    imageUrl = imageData;
                }
            }
            // Handle PDF Document upload
            if (pdfData && typeof pdfData === 'string') {
                const matches = pdfData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                const b64 = matches && matches[2] ? matches[2] : (pdfData.startsWith('http') ? null : pdfData);
                if (b64) {
                    const pdfBuffer = Buffer.from(b64, 'base64');
                    const pdfsDir = path.join(process.cwd(), 'pdfs');
                    if (!fs.existsSync(pdfsDir)) {
                        fs.mkdirSync(pdfsDir, { recursive: true });
                    }
                    const ext = '.pdf';
                    const safeName = (pdfFileName ? path.basename(pdfFileName, ext) : 'guide').replace(/[^a-zA-Z0-9_-]/g, '_');
                    const finalPdfName = `htrz_doc_${Date.now()}_${safeName}${ext}`;
                    fs.writeFileSync(path.join(pdfsDir, finalPdfName), pdfBuffer);
                    pdfUrl = `/pdfs/${finalPdfName}`;
                }
                else if (pdfData.startsWith('http')) {
                    pdfUrl = pdfData;
                }
            }
            const bikeModel = req.body.bikeModel ? String(req.body.bikeModel).trim() : null;
            if (bikeModel) {
                dbService.addBike(bikeModel, undefined, 'htrz');
            }
            const randomSku = `HTRZ-${Math.floor(1000 + Math.random() * 9000)}`;
            const newItem = dbService.addCatalogItem({
                sku: randomSku,
                name: String(name).trim(),
                category: category ? String(category).trim() : 'Accessories',
                price: Number(price) || 0,
                description: description ? String(description).trim() : '',
                imageUrl,
                paymentUrl: paymentUrl ? String(paymentUrl).trim() : null,
                pdfUrl,
                bikeModel,
                business: 'htrz',
                isActive: isActive === 0 || isActive === '0' || isActive === false ? 0 : 1,
            });
            logger.info({ id: newItem.id, sku: newItem.sku, name: newItem.name, bikeModel, hasPdf: !!pdfUrl, hasImg: !!imageUrl }, 'New HTRZ Modz product created successfully');
            if (req.headers['accept']?.includes('text/html') ||
                req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
                res.redirect('/htrz-modz?tab=catalog');
                return;
            }
            res.status(201).json({ success: true, product: newItem });
        }
        catch (err) {
            logger.error({ error: err }, 'Failed to create HTRZ product');
            res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save product' });
        }
    }
    /**
     * API: Return list of motorcycle models
     */
    getBikes(_req, res) {
        try {
            const bikes = dbService.getAllBikes('htrz');
            res.json({ success: true, bikes });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed fetching bikes' });
        }
    }
    /**
     * API: Add a new bike model dynamically
     */
    addBike(req, res) {
        try {
            const { name, brand } = req.body;
            if (!name || !String(name).trim()) {
                res.status(400).json({ error: 'Bike model name is required' });
                return;
            }
            const newBike = dbService.addBike(String(name).trim(), brand ? String(brand).trim() : undefined, 'htrz');
            res.json({ success: true, bike: newBike });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed adding bike model' });
        }
    }
    /**
     * Export HTRZ customers as CSV
     */
    exportCustomersCsv(_req, res) {
        try {
            const leads = dbService.getAllLeads('htrz');
            let csv = 'Customer Name,Phone Number,Interest,Last Active,Created At\n';
            for (const l of leads) {
                csv += `"${(l.name || 'Customer').replace(/"/g, '""')}","${l.phoneNumber}","${(l.interestedService || 'General').replace(/"/g, '""')}","${l.lastInteractionAt}","${l.createdAt}"\n`;
            }
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="htrz_customers.csv"');
            res.send(csv);
        }
        catch (err) {
            res.status(500).send('Error exporting customers CSV');
        }
    }
}
export const htrzController = new HtrzController();
