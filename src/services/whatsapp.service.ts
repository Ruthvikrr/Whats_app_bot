import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type {
  OutboundDocumentMessagePayload,
  OutboundImageMessagePayload,
  OutboundInteractiveListPayload,
  OutboundTextMessagePayload,
  OutboundWhatsAppPayload,
  WhatsAppApiResponse,
  WhatsAppApiErrorResponse,
  WhatsAppListSection,
} from '../types/whatsapp.types.js';

export class WhatsAppService {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly requestTimeoutMs: number;
  private readonly phoneNumberId: string;
  private readonly graphApiVersion: string;

  constructor(
    phoneNumberId: string = env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: string = env.META_GRAPH_API_VERSION,
    accessToken: string = env.WHATSAPP_ACCESS_TOKEN,
    requestTimeoutMs = 10000
  ) {
    this.phoneNumberId = phoneNumberId;
    this.graphApiVersion = graphApiVersion;
    this.baseUrl = `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;
    this.accessToken = accessToken;
    this.requestTimeoutMs = requestTimeoutMs;
  }

  /**
   * Sends a plain text message to a WhatsApp user.
   */
  public async sendTextMessage(to: string, text: string): Promise<WhatsAppApiResponse> {
    const payload: OutboundTextMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    return this.sendApiRequest(payload);
  }

  /**
   * Sends an interactive list message to a WhatsApp user.
   */
  public async sendInteractiveListMessage(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: WhatsAppListSection[]
  ): Promise<WhatsAppApiResponse> {
    const payload: OutboundInteractiveListPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: bodyText,
        },
        action: {
          button: buttonText,
          sections,
        },
      },
    };

    return this.sendApiRequest(payload);
  }

  /**
   * Sends an image message with optional caption to a WhatsApp user.
   */
  public async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<WhatsAppApiResponse> {
    const payload: OutboundImageMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
    };

    return this.sendApiRequest(payload);
  }

  /**
   * Uploads a local file to WhatsApp Cloud API media storage and returns the uploaded media ID.
   */
  public async uploadMedia(
    filePath: string,
    mimeType = 'application/pdf',
    filename?: string
  ): Promise<string> {
    const fileBuffer = await fs.promises.readFile(filePath);
    const blob = new Blob([fileBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', blob, filename || path.basename(filePath));
    formData.append('type', mimeType);

    const uploadUrl = `https://graph.facebook.com/${this.graphApiVersion}/${this.phoneNumberId}/media`;
    logger.info({ uploadUrl, filename }, 'Uploading media file to WhatsApp API');

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: formData,
      signal: AbortSignal.timeout(60000),
    });

    const responseBody = await response.json();
    if (!response.ok) {
      const err = responseBody as WhatsAppApiErrorResponse;
      throw new Error(`Media upload failed: ${err.error?.message || response.statusText}`);
    }

    const mediaId = (responseBody as { id: string }).id;
    logger.info({ mediaId, filename }, 'Media uploaded successfully to WhatsApp API');
    return mediaId;
  }

  /**
   * Sends a document (e.g. PDF) with optional caption and filename to a WhatsApp user.
   * Accepts either a direct WhatsApp media ID or a public HTTPS URL.
   */
  public async sendDocumentMessage(
    to: string,
    documentIdOrUrl: string,
    caption?: string,
    filename?: string
  ): Promise<WhatsAppApiResponse> {
    const isUrl = documentIdOrUrl.startsWith('http://') || documentIdOrUrl.startsWith('https://');
    const docPayload = isUrl
      ? { link: documentIdOrUrl, caption, filename }
      : { id: documentIdOrUrl, caption, filename };

    const payload: OutboundDocumentMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'document',
      document: docPayload,
    };

    return this.sendApiRequest(payload);
  }

  /**
   * Helper to execute outbound HTTPS POST to WhatsApp Graph API.
   */
  private async sendApiRequest(payload: OutboundWhatsAppPayload): Promise<WhatsAppApiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        const errorData = responseBody as WhatsAppApiErrorResponse;
        const errorMessage = errorData.error?.message || response.statusText;
        const errorCode = errorData.error?.code;
        const fbtraceId = errorData.error?.fbtrace_id;

        logger.error(
          {
            status: response.status,
            errorCode,
            errorMessage,
            fbtraceId,
            recipient: payload.to,
            type: payload.type,
          },
          'WhatsApp Cloud API error response'
        );

        throw new Error(
          `WhatsApp API Error: ${errorMessage} (code: ${errorCode || 'unknown'}, fbtrace_id: ${fbtraceId || 'unknown'})`
        );
      }

      logger.info(
        {
          recipient: payload.to,
          type: payload.type,
          messageId: (responseBody as WhatsAppApiResponse).messages?.[0]?.id,
        },
        'WhatsApp message sent successfully'
      );

      return responseBody as WhatsAppApiResponse;
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'TimeoutError') {
          logger.error({ recipient: payload.to }, 'WhatsApp API request timed out');
          throw new Error('WhatsApp API request timed out');
        }
        logger.error(
          { recipient: payload.to, error: err.message },
          'Failed to send WhatsApp API request'
        );
        throw err;
      }
      logger.error({ recipient: payload.to }, 'Unknown error sending WhatsApp API request');
      throw new Error('Unknown error sending WhatsApp message');
    }
  }
}

export const whatsAppService = new WhatsAppService();
