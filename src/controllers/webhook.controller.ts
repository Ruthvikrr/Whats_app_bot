import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { botService } from '../services/bot.service.js';
import { logger } from '../utils/logger.js';
import type { WhatsAppIncomingMessage, WhatsAppWebhookPayload } from '../types/whatsapp.types.js';

/**
 * Handles Meta Webhook Verification challenge (GET /webhook).
 */
export const verifyWebhook = (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'] as string | undefined;
  const token = req.query['hub.verify_token'] as string | undefined;
  const challenge = req.query['hub.challenge'] as string | undefined;

  logger.info(
    { mode, hasToken: Boolean(token), hasChallenge: Boolean(challenge) },
    'Received webhook verification request'
  );

  const isTokenMatch =
    Boolean(token) &&
    (token === env.META_VERIFY_TOKEN ||
      token === env.META_VERIFY_TOKEN.replace(/#.*$/, '') ||
      env.META_VERIFY_TOKEN.replace(/#.*$/, '') === token);

  if (mode === 'subscribe' && isTokenMatch) {
    logger.info('Webhook verified successfully');
    res.status(200).send(challenge);
    return;
  }

  logger.warn(
    { mode, tokenMismatch: token !== env.META_VERIFY_TOKEN },
    'Webhook verification failed: token mismatch or invalid mode'
  );
  res.status(403).send('Forbidden');
};

/**
 * Handles incoming WhatsApp webhook events (POST /webhook).
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as WhatsAppWebhookPayload;

  // 1. Validate that the payload is from Meta WhatsApp Cloud API
  if (!body || typeof body !== 'object' || body.object !== 'whatsapp_business_account') {
    logger.warn(
      { bodySnippet: JSON.stringify(body).slice(0, 100) },
      'Invalid or unrecognized webhook payload structure'
    );
    // Return 200 or 400 gracefully so Meta or clients don't trigger cascading errors
    res
      .status(400)
      .json({ error: 'Invalid webhook payload: not a WhatsApp business account event' });
    return;
  }

  // 2. Extract and process incoming messages safely
  try {
    const entries = Array.isArray(body.entry) ? body.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];

      for (const change of changes) {
        if (change.field !== 'messages' || !change.value) {
          logger.debug({ field: change.field }, 'Skipping non-messages webhook field');
          continue;
        }

        const value = change.value;

        // If it's a message status update (sent, delivered, read), ignore without crashing
        if (value.statuses && !value.messages) {
          logger.debug({ statusesCount: value.statuses.length }, 'Received message status update');
          continue;
        }

        const messages: WhatsAppIncomingMessage[] = Array.isArray(value.messages)
          ? value.messages
          : [];

        for (const message of messages) {
          try {
            await botService.handleIncomingMessage(message);
          } catch (msgError) {
            logger.error(
              {
                messageId: message.id,
                error: msgError instanceof Error ? msgError.message : String(msgError),
              },
              'Error processing individual WhatsApp message'
            );
          }
        }
      }
    }
  } catch (err) {
    logger.error(
      { error: err instanceof Error ? err.message : String(err) },
      'Unexpected error processing webhook payload'
    );
  }

  // 3. Return HTTP 200 to Meta
  res.status(200).json({ status: 'EVENT_RECEIVED' });
};
