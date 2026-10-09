import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BotService } from '../src/services/bot.service.js';
import { WhatsAppService } from '../src/services/whatsapp.service.js';
import { IdempotencyService } from '../src/utils/idempotency.js';
import { SERVICE_DETAILS, SERVICE_IDS, WELCOME_MESSAGE } from '../src/config/constants.js';

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

    botService = new BotService(mockWhatsApp);
  });

  afterEach(() => {
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

    expect(mockWhatsApp.sendImageMessage).toHaveBeenCalledWith(
      '9876543210',
      expect.stringContaining('/public/triuss_services.jpg'),
      WELCOME_MESSAGE
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
      expect.stringContaining('I can help you explore our services')
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

  it('should throw sanitized error without leaking token when Meta API returns an error', async () => {
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
      'Meta API Error: Invalid OAuth access token. (code: 190, fbtrace_id: TRACE_9999)'
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
