import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { whatsAppService } from '../src/services/whatsapp.service.js';
import { idempotencyService } from '../src/utils/idempotency.js';
import { SERVICE_DETAILS, SERVICE_IDS, WELCOME_MESSAGE } from '../src/config/constants.js';
import type { WhatsAppApiResponse } from '../src/types/whatsapp.types.js';

const mockApiResponse: WhatsAppApiResponse = {
  messaging_product: 'whatsapp',
  contacts: [{ input: '1234567890', wa_id: '1234567890' }],
  messages: [{ id: 'wamid.MOCK_ID' }],
};

const createTextPayload = (id: string, text: string, from = '1234567890') => ({
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'ACCOUNT_ID_123',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550001234',
              phone_number_id: 'test_phone_number_id',
            },
            contacts: [{ profile: { name: 'Alice' }, wa_id: from }],
            messages: [
              {
                from,
                id,
                timestamp: '1710000000',
                type: 'text',
                text: { body: text },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
});

const createInteractivePayload = (
  id: string,
  selectedId: string,
  title: string,
  from = '1234567890'
) => ({
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'ACCOUNT_ID_123',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550001234',
              phone_number_id: 'test_phone_number_id',
            },
            contacts: [{ profile: { name: 'Alice' }, wa_id: from }],
            messages: [
              {
                from,
                id,
                timestamp: '1710000000',
                type: 'interactive',
                interactive: {
                  type: 'list_reply',
                  list_reply: {
                    id: selectedId,
                    title,
                  },
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
});

describe('Webhook and Bot Flow Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    idempotencyService.clear();

    vi.spyOn(whatsAppService, 'sendTextMessage').mockResolvedValue(mockApiResponse);
    vi.spyOn(whatsAppService, 'sendImageMessage').mockResolvedValue(mockApiResponse);
    vi.spyOn(whatsAppService, 'sendInteractiveListMessage').mockResolvedValue(mockApiResponse);
  });

  // 1. GET /health
  it('1. should return 200 and { status: "ok" } on GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  // 2. Webhook verification success
  it('2. should verify webhook with 200 and return hub.challenge on matching token', async () => {
    const res = await request(app).get('/webhook').query({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'test_verify_token',
      'hub.challenge': 'CHALLENGE_STRING_123',
    });

    expect(res.status).toBe(200);
    expect(res.text).toBe('CHALLENGE_STRING_123');
  });

  // 3. Webhook verification failure
  it('3. should reject webhook verification with 403 on wrong token or invalid mode', async () => {
    const resWrongToken = await request(app).get('/webhook').query({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'wrong_token',
      'hub.challenge': 'CHALLENGE_STRING_123',
    });

    expect(resWrongToken.status).toBe(403);
    expect(resWrongToken.text).toBe('Forbidden');

    const resWrongMode = await request(app).get('/webhook').query({
      'hub.mode': 'unsubscribe',
      'hub.verify_token': 'test_verify_token',
      'hub.challenge': 'CHALLENGE_STRING_123',
    });

    expect(resWrongMode.status).toBe(403);
  });

  // 4. Receiving a text WhatsApp message
  it('4. should process an incoming text message and send a response', async () => {
    const payload = createTextPayload('msg_test_001', 'Tell me more');
    const res = await request(app).post('/webhook').send(payload);

    expect(res.status).toBe(200);
    expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
      '1234567890',
      expect.stringContaining('I can help you explore our services')
    );
    expect(whatsAppService.sendInteractiveListMessage).toHaveBeenCalled();
  });

  // 5. Detecting menu commands
  it('5. should detect menu commands ("menu", "hi", "hello", "hey", "start") and send welcome + menu', async () => {
    const commands = ['menu', 'Menu', 'hi', 'HI', 'Hello', 'hey', 'start'];

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]!;
      const msgId = `msg_cmd_${i}`;
      const payload = createTextPayload(msgId, cmd);

      const res = await request(app).post('/webhook').send(payload);
      expect(res.status).toBe(200);

      expect(whatsAppService.sendImageMessage).toHaveBeenCalledWith(
        '1234567890',
        expect.stringContaining('/public/triuss_services.jpg'),
        WELCOME_MESSAGE
      );
      expect(whatsAppService.sendInteractiveListMessage).toHaveBeenCalledWith(
        '1234567890',
        'What service are you interested in?',
        'View Services',
        expect.any(Array)
      );
    }
  });

  // 6. Processing whatsapp_agents selection
  it('6. should process "whatsapp_agents" selection and send WhatsApp Agents description', async () => {
    const payload = createInteractivePayload(
      'msg_select_001',
      SERVICE_IDS.WHATSAPP_AGENTS,
      'WhatsApp Agents'
    );

    const res = await request(app).post('/webhook').send(payload);
    expect(res.status).toBe(200);

    expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
      '1234567890',
      SERVICE_DETAILS[SERVICE_IDS.WHATSAPP_AGENTS]
    );
  });

  // 7. Processing websites selection
  it('7. should process "websites" selection and send Websites description', async () => {
    const payload = createInteractivePayload('msg_select_002', SERVICE_IDS.WEBSITES, 'Websites');

    const res = await request(app).post('/webhook').send(payload);
    expect(res.status).toBe(200);

    expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
      '1234567890',
      SERVICE_DETAILS[SERVICE_IDS.WEBSITES]
    );
  });

  // 8. Processing ai_photo_shoots selection
  it('8. should process "ai_photo_shoots" selection and send AI Photo Shoots description', async () => {
    const payload = createInteractivePayload(
      'msg_select_003',
      SERVICE_IDS.AI_PHOTO_SHOOTS,
      'AI Photo Shoots'
    );

    const res = await request(app).post('/webhook').send(payload);
    expect(res.status).toBe(200);

    expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
      '1234567890',
      SERVICE_DETAILS[SERVICE_IDS.AI_PHOTO_SHOOTS]
    );
  });

  // 9. Processing voice_agents selection
  it('9. should process "voice_agents" selection and send Voice Agents description', async () => {
    const payload = createInteractivePayload(
      'msg_select_004',
      SERVICE_IDS.VOICE_AGENTS,
      'Voice Agents'
    );

    const res = await request(app).post('/webhook').send(payload);
    expect(res.status).toBe(200);

    expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
      '1234567890',
      SERVICE_DETAILS[SERVICE_IDS.VOICE_AGENTS]
    );
  });

  // 10. Malformed webhook payload
  it('10. should handle malformed webhook payloads gracefully without crashing', async () => {
    // Non-object body
    const res1 = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send('Invalid string');
    expect(res1.status).toBe(400);

    // Empty object
    const res2 = await request(app).post('/webhook').send({});
    expect(res2.status).toBe(400);

    // Wrong object type
    const res3 = await request(app).post('/webhook').send({ object: 'page', entry: [] });
    expect(res3.status).toBe(400);

    // Valid object with empty entry
    const res4 = await request(app)
      .post('/webhook')
      .send({ object: 'whatsapp_business_account', entry: [] });
    expect(res4.status).toBe(200);

    // Status updates only (no messages array)
    const res5 = await request(app)
      .post('/webhook')
      .send({
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'ACC_123',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '123', phone_number_id: '456' },
                  statuses: [
                    { id: 'wamid.123', status: 'delivered', timestamp: '123', recipient_id: '123' },
                  ],
                },
              },
            ],
          },
        ],
      });
    expect(res5.status).toBe(200);
    expect(whatsAppService.sendTextMessage).not.toHaveBeenCalled();
  });

  // 11. Duplicate message ID
  it('11. should ignore duplicate message IDs through idempotency check', async () => {
    const payload = createTextPayload('duplicate_wamid_999', 'hi');

    // First request
    const res1 = await request(app).post('/webhook').send(payload);
    expect(res1.status).toBe(200);
    expect(whatsAppService.sendImageMessage).toHaveBeenCalledTimes(1);
    expect(whatsAppService.sendInteractiveListMessage).toHaveBeenCalledTimes(1);

    // Duplicate request with the exact same message ID
    const res2 = await request(app).post('/webhook').send(payload);
    expect(res2.status).toBe(200);

    // Calls should NOT increase
    expect(whatsAppService.sendImageMessage).toHaveBeenCalledTimes(1);
    expect(whatsAppService.sendInteractiveListMessage).toHaveBeenCalledTimes(1);
  });

  // 12. Dashboard UI and Stats API
  it('12. should serve the HTML dashboard and return accurate stats API response', async () => {
    const htmlRes = await request(app).get('/dashboard');
    expect(htmlRes.status).toBe(200);
    expect(htmlRes.headers['content-type']).toContain('text/html');
    expect(htmlRes.text).toContain('Triuss CRM');
    expect(htmlRes.text).toContain('Meta Cloud API Active');

    const statsRes = await request(app).get('/api/dashboard/stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body).toHaveProperty('quota');
    expect(statsRes.body.quota).toHaveProperty('freeLimit', 1000);
    expect(statsRes.body).toHaveProperty('totalLeads');
  });

  // 13. Dynamic Catalog POST
  it('13. should allow adding a catalog item through the dashboard API', async () => {
    const postRes = await request(app)
      .post('/api/dashboard/catalog')
      .send({
        sku: 'TEST-SKU-101',
        name: 'Diamond Solitaire Ring',
        category: 'jewelry',
        price: 9999,
        description: 'Luxury diamond ring for testing',
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.success).toBe(true);
  });

  // 14. Broadcast Campaign POST
  it('14. should dispatch broadcast campaign to selected recipients and log outbound messages', async () => {
    const bcastRes = await request(app)
      .post('/dashboard/broadcast')
      .send({
        target: 'custom',
        customPhone: '919876543210',
        message: '🎉 Special Festive Offer: 20% off all WhatsApp bot setups!',
      });

    expect(bcastRes.status).toBe(200);
    expect(bcastRes.body.success).toBe(true);
    expect(bcastRes.body.sentCount).toBe(1);
  });
});
