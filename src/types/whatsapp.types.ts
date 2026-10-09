// Incoming Webhook Payload Types

export interface WhatsAppProfile {
  name?: string;
}

export interface WhatsAppContact {
  profile?: WhatsAppProfile;
  wa_id: string;
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppTextMessage {
  body: string;
}

export interface WhatsAppListReply {
  id: string;
  title: string;
  description?: string;
}

export interface WhatsAppButtonReply {
  id: string;
  title: string;
}

export interface WhatsAppInteractiveMessage {
  type: 'list_reply' | 'button_reply';
  list_reply?: WhatsAppListReply;
  button_reply?: WhatsAppButtonReply;
}

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type:
    | 'text'
    | 'interactive'
    | 'image'
    | 'audio'
    | 'video'
    | 'document'
    | 'sticker'
    | 'location'
    | 'contacts'
    | string;
  text?: WhatsAppTextMessage;
  interactive?: WhatsAppInteractiveMessage;
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin?: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
}

export interface WhatsAppValue {
  messaging_product: 'whatsapp';
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppIncomingMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry?: WhatsAppEntry[];
}

// Outgoing Meta Cloud API Types

export interface OutboundTextMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

export interface WhatsAppListRow {
  id: string;
  title: string;
  description?: string;
}

export interface WhatsAppListSection {
  title: string;
  rows: WhatsAppListRow[];
}

export interface OutboundInteractiveListPayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'list';
    header?: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      button: string;
      sections: WhatsAppListSection[];
    };
  };
}

export interface OutboundImageMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'image';
  image: {
    link: string;
    caption?: string;
  };
}

export type OutboundWhatsAppPayload =
  | OutboundTextMessagePayload
  | OutboundInteractiveListPayload
  | OutboundImageMessagePayload;

export interface WhatsAppApiResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppApiErrorDetail {
  message: string;
  type: string;
  code: number;
  error_data?: {
    messaging_product: string;
    details: string;
  };
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface WhatsAppApiErrorResponse {
  error: WhatsAppApiErrorDetail;
}
