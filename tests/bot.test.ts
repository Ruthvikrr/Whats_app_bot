import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BotService } from '../src/services/bot.service.js';
import { WhatsAppService } from '../src/services/whatsapp.service.js';
import { IdempotencyService } from '../src/utils/idempotency.js';
import { dbService } from '../src/db/database.js';
import { SERVICE_DETAILS, SERVICE_IDS, WELCOME_MESSAGE, HTRZ_WELCOME_MESSAGE } from '../src/config/constants.js';

describe('BotService Unit Tests', () => {
  let mockWhatsApp: WhatsAppService;
  let botService: BotService;

  beforeEach(() => {
    mockWhatsApp = new WhatsAppService('dummy_id', 'v21.0', 'dummy_token');
    vi.spyOn(mockWhatsApp, 'sendTextMessage').mockResolvedValue({
      messaging_product: 'whatsapp',
      contacts: [{ input: '123', wa_id: '123' }],
      messages: [{ id: 'wamid.123' }],
    });
    vi.spyOn(mockWhatsApp, 'sendImageMessage').mockResolvedValue({
      messaging_product: 'whatsapp',
      contacts: [{ input: '123', wa_id: '123' }],
      messages: [{ id: 'wamid.123' }],
    });
    vi.spyOn(mockWhatsApp, 'sendInteractiveListMessage').mockResolvedValue({
      messaging_product: 'whatsapp',
      contacts: [{ input: '123', wa_id: '123' }],
      messages: [{ id: 'wamid.123' }],
    });
    vi.spyOn(mockWhatsApp, 'sendDocumentMessage').mockResolvedValue({
      messaging_product: 'whatsapp',
      contacts: [{ input: '123', wa_id: '123' }],
      messages: [{ id: 'wamid.123' }],
    });
    vi.spyOn(mockWhatsApp, 'uploadMedia').mockResolvedValue('media_vstrom_test_id');

    botService = new BotService(mockWhatsApp);

    // Resolve any open support tickets from previous tests so bot is active
    const tickets = dbService.getAllSupportTickets();
    for (const t of tickets) {
      if (t.status !== 'RESOLVED') {
        dbService.updateTicketStatus(t.id, 'RESOLVED');
      }
    }
  });

  afterEach(() => {
    botService.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('should send welcome and interactive menu for "start" command', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_1',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'start' },
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      HTRZ_WELCOME_MESSAGE
    );
    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalled();
  });

  it('should send polite fallback message for unsupported attachment types like image', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_2',
      timestamp: '1710000000',
      type: 'image',
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('I can help you explore')
    );
    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalled();
  });

  it('should deliver exact text for each service selection', async () => {
    const services = [
      SERVICE_IDS.WHATSAPP_AGENTS,
      SERVICE_IDS.WEBSITES,
      SERVICE_IDS.AI_PHOTO_SHOOTS,
      SERVICE_IDS.VOICE_AGENTS,
    ];

    for (const serviceId of services) {
      await botService.handleIncomingMessage({
        from: '9876543210',
        id: `unit_msg_${serviceId}`,
        timestamp: '1710000000',
        type: 'interactive',
        interactive: {
          type: 'list_reply',
          list_reply: {
            id: serviceId,
            title: serviceId,
          },
        },
      });

      expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
        '9876543210',
        SERVICE_DETAILS[serviceId]
      );
    }
  });

  it('should trigger Demo Hub when user sends "demo"', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_demo',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'demo' },
    });

    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Custom WhatsApp Bot'),
      'Select Industry',
      expect.any(Array)
    );
  });

  it('should connect to human support when customer replies "yes" and create a ticket', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_yes',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'yes' },
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Our team is on it')
    );
  });

  it('should raise support ticket for Custom WhatsApp Bot when customer explores Demo Hub and replies YES', async () => {
    // 1. User previously explored websites
    dbService.recordLeadInteraction('9876543210', { interestedService: 'websites', status: 'new' });

    // 2. User then explores Custom WhatsApp Bot Demo
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_demo_hub',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'demo_hub', title: 'Custom WhatsApp Bot' },
      },
    });

    // 3. User replies YES to connect with support
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_yes_hub',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'YES' },
    });

    // 4. Must accurately reflect Custom WhatsApp Bot and NOT stale Modern Websites
    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Custom WhatsApp Bot')
    );
  });

  it('should send inactivity reminder if customer leaves after exploring a service', async () => {
    dbService.recordLeadInteraction('9876543210', { interestedService: 'whatsapp_agents', status: 'new' });
    botService.scheduleInactivityReminder('9876543210', '🤖 WhatsApp Agents', 20);

    // Wait for the test timer (50ms)
    await new Promise((r) => setTimeout(r, 60));

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Quick reminder from Triuss Solutions')
    );
  });

  it('should find product and send UPI payment checkout for "silver chain" query', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_product',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'I want to see silver chain' },
    });

    expect(mockWhatsApp.sendImageMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('unsplash.com'),
      expect.stringContaining('Instant WhatsApp Checkout (UPI)')
    );
  });

  it('should handle salon service and slot booking confirmation', async () => {
    // 1. Pick hair spa
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_salon_1',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'salon_hairspa', title: 'Hair Spa' },
      },
    });

    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Luxury Hair Spa'),
      'Pick Time Slot',
      expect.any(Array)
    );

    // 2. Pick slot
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_salon_2',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'slot_11am', title: '11:00 AM' },
      },
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Appointment Confirmed!')
    );
  });

  it('should present accessories main choices when user selects DEMO_IDS.ACCESSORIES', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_acc_hub',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'demo_accessories', title: 'Auto & Bike Store' },
      },
    });

    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('ApexMoto & Auto Gear'),
      'Browse Store',
      expect.any(Array)
    );
  });

  it('should present bike brands when user selects ACC_MENU_BIKES', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_acc_bikes',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'acc_menu_bikes', title: 'Shop by Bike Model' },
      },
    });

    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Select Your Motorcycle Brand'),
      'Select Brand',
      expect.any(Array)
    );
  });

  it('should present bike models when user selects BIKE_BRAND_SUZUKI', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_brand_suzuki',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'bike_brand_suzuki', title: 'Suzuki' },
      },
    });

    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Suzuki Motorcycle Models'),
      'Select Model',
      expect.any(Array)
    );
  });

  it('should dispatch direct PDF accessories document with 2-line caption when user selects V-Strom 250', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_vstrom_select',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'bm_suzuki_vstrom250', title: 'V-Strom SX 250' },
      },
    });

    expect(mockWhatsApp.sendDocumentMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.any(String),
      expect.stringContaining('Suzuki V-Strom SX 250 - Genuine Accessories'),
      'SUZUKI_VSTROM_250_ACCESSORIES_LIST.pdf'
    );
    // Ensure no long text message with links is sent
    expect(mockWhatsApp.sendTextMessage).not.toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Direct PDF Download:')
    );
  });

  it('should send live offers when user selects ACC_MENU_OFFERS or types "offers"', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_offers',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'acc_menu_offers', title: 'Live Offers & Deals' },
      },
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Live Exclusive Offers & Deals')
    );
  });

  it('should present helmets list when user selects ACC_HELMETS', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_acc_cat',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'acc_helmets', title: 'Helmets & Riding' },
      },
    });

    expect(mockWhatsApp.sendInteractiveListMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('ApexMoto - Helmets & Riding Gear'),
      'View Products',
      expect.any(Array)
    );
  });

  it('should dispatch full product card with image and UPI checkout when product is chosen', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_acc_prod',
      timestamp: '1710000000',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'acc_p_axor', title: 'Axor Apex Venom' },
      },
    });

    expect(mockWhatsApp.sendImageMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('unsplash.com'),
      expect.stringContaining('Axor Apex Venom Bluetooth Helmet')
    );
  });

  it('should return vehicle compatible accessories package when user inputs vehicle model', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_vehicle',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'I drive a Hyundai Creta 2024' },
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('Compatible Accessories Found for Your Vehicle')
    );
  });

  it('should respond with client portfolio links when user enquired about websites', async () => {
    await botService.handleIncomingMessage({
      from: '9876543210',
      id: 'unit_msg_websites_text',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'Can you show me websites you built?' },
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('https://ruthvikrr.in')
    );
    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('https://aimmodel.in')
    );
    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('https://ygrfunctionhall.in')
    );
    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('https://thanksearth.in')
    );
    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('https://researchvisions.com')
    );
  });

  it('should stay silent while a ticket is open for customer and resume after mark resolved', async () => {
    const testCustomer = '9998887776';

    // 1. Create open ticket
    const ticket = dbService.createSupportTicket(
      testCustomer,
      'Test Customer',
      'Axor Helmet',
      'Fitting inquiry',
      'htrz'
    );

    expect(dbService.hasOpenTicket(testCustomer)).toBe(true);

    // 2. Incoming message while ticket is open -> Bot MUST STAY SILENT
    await botService.handleIncomingMessage({
      from: testCustomer,
      id: 'silent_test_msg_1',
      timestamp: '1710000000',
      type: 'text',
      text: { body: 'hello is anyone there?' },
    });

    expect(mockWhatsApp.sendTextMessage).not.toHaveBeenCalled();
    expect(mockWhatsApp.sendInteractiveListMessage).not.toHaveBeenCalled();

    // 3. Mark ticket resolved
    dbService.updateTicketStatus(ticket.id, 'RESOLVED');
    expect(dbService.hasOpenTicket(testCustomer)).toBe(false);

    // 4. Customer messages again -> Bot resumes automated assistance
    await botService.handleIncomingMessage({
      from: testCustomer,
      id: 'active_test_msg_2',
      timestamp: '1710000001',
      type: 'text',
      text: { body: 'hello' },
    });

    expect(mockWhatsApp.sendTextMessage).toHaveBeenCalled();
  });
});

describe('WhatsAppService Unit Tests (Native fetch mocking)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should call Meta Graph API with correct headers and payload for sendTextMessage', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.OK123' }],
      }),
    });
    globalThis.fetch = mockFetch;

    const service = new WhatsAppService('12345_phone_id', 'v21.0', 'secret_token_abc');
    const result = await service.sendTextMessage('1234567890', 'Hello world');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v21.0/12345_phone_id/messages',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer secret_token_abc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: '1234567890',
          type: 'text',
          text: {
            preview_url: false,
            body: 'Hello world',
          },
        }),
      })
    );

    expect(result.messages[0]?.id).toBe('wamid.OK123');
  });

  it('should throw sanitized error without leaking token when WhatsApp API returns an error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: {
          message: 'Invalid OAuth access token.',
          type: 'OAuthException',
          code: 190,
          fbtrace_id: 'TRACE_9999',
        },
      }),
    });
    globalThis.fetch = mockFetch;

    const service = new WhatsAppService('12345_phone_id', 'v21.0', 'secret_token_abc');

    await expect(service.sendTextMessage('1234567890', 'Hello')).rejects.toThrow(
      'WhatsApp API Error: Invalid OAuth access token. (code: 190, fbtrace_id: TRACE_9999)'
    );
  });
});

describe('IdempotencyService Unit Tests', () => {
  it('should identify duplicates and expire entries past TTL', () => {
    // 1-second TTL for testing
    const idempotency = new IdempotencyService(1);

    expect(idempotency.isDuplicate('id_1')).toBe(false);
    idempotency.markProcessed('id_1');
    expect(idempotency.isDuplicate('id_1')).toBe(true);

    expect(idempotency.size()).toBe(1);
    idempotency.clear();
    expect(idempotency.size()).toBe(0);
  });
});
