# WhatsApp Service Bot — Triuss Solutions

A production-ready WhatsApp Business chatbot built with **Node.js 24+**, **TypeScript (Strict Mode)**, **Express.js**, and the official **Meta WhatsApp Cloud API**.

---

## 📌 Overview

This chatbot serves as the primary conversational touchpoint for **Triuss Solutions**. It delivers an automated welcome message and an interactive service menu allowing prospective clients to explore our core offerings:

1. **WhatsApp Agents** (`whatsapp_agents`)
2. **Websites** (`websites`)
3. **AI Photo Shoots** (`ai_photo_shoots`)
4. **Voice Agents** (`voice_agents`)

### Architecture Principles:
- **Official Meta WhatsApp Cloud API**: No unofficial APIs, no WhatsApp Web automation (Baileys/Puppeteer), no n8n.
- **Strict TypeScript & ES Modules**: Full type safety, zero compile warnings, strict null checks.
- **Fast & Resilient Webhook Processing**: Responds to Meta with `200 OK` promptly to avoid retries, validates payloads, and processes messages asynchronously.
- **In-Memory Idempotency**: Prevents processing duplicate webhooks retried by Meta using message IDs (`wamid...`).
- **Security & Privacy**: Credential redaction in structured Pino logs, Helmet headers, request size limits, and Zod environment validation.

---

## 🏗️ Project Structure

```text
├── src/
│   ├── config/
│   │   ├── constants.ts       # Company name, welcome copy, menu options, service details
│   │   └── env.ts             # Zod environment variable validation
│   ├── controllers/
│   │   ├── health.controller.ts   # GET /health
│   │   └── webhook.controller.ts  # GET /webhook (verification) & POST /webhook (event ingestion)
│   ├── routes/
│   │   ├── health.routes.ts   # /health route definitions
│   │   └── webhook.routes.ts  # /webhook route definitions
│   ├── services/
│   │   ├── bot.service.ts         # Conversation state, command detection, service routing
│   │   └── whatsapp.service.ts    # Official Meta Graph API client (outbound text & interactive lists)
│   ├── types/
│   │   └── whatsapp.types.ts  # TypeScript interfaces for Meta payloads
│   ├── utils/
│   │   ├── idempotency.ts     # In-memory deduplication store with TTL
│   │   └── logger.ts          # Pino logger with credential redaction
│   ├── app.ts                 # Express app, middleware, centralized error handling
│   └── server.ts              # Server startup and graceful shutdown
├── tests/
│   ├── bot.test.ts            # Unit tests for bot routing, service payloads, and idempotency
│   └── webhook.test.ts        # Integration tests for all endpoints and webhooks
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules (protects .env and build files)
├── Dockerfile                 # Multi-stage production container build (Node 24 Alpine)
├── docker-compose.yml         # Containerized local execution
├── eslint.config.js           # ESLint 9 configuration
├── package.json               # Dependencies and execution scripts
├── tsconfig.json              # Strict TypeScript configuration
└── vitest.config.ts           # Vitest configuration
```

---

## 🔑 Where Meta Credentials Come From

Before configuring your `.env`, create a **Meta for Developers** app at [developers.facebook.com](https://developers.facebook.com/):

| Credential | Source in Meta App Dashboard | Purpose |
| :--- | :--- | :--- |
| **`META_APP_ID`** | **App Settings > Basic** & top navigation bar | Unique identifier for your Meta Developer App. |
| **`META_APP_SECRET`** | **App Settings > Basic** > Click "Show" next to App Secret | Secret used for app verification and server-to-server operations. |
| **`WHATSAPP_PHONE_NUMBER_ID`** | **WhatsApp > API Setup** > "Phone number ID" | Identifies the WhatsApp sender phone number in Cloud API endpoints. |
| **`WHATSAPP_ACCESS_TOKEN`** | **WhatsApp > API Setup** (temporary 24h token) OR **Business Settings > System Users** (permanent token) | Bearer token authorized with `whatsapp_business_messaging` permissions. |
| **`META_VERIFY_TOKEN`** | A custom secret string that **you define** (e.g. `triuss_bot_secure_token_2026`) | Meta sends this token to your `GET /webhook` during verification to confirm server ownership. |
| **`META_GRAPH_API_VERSION`** | e.g. `v21.0` or `v22.0` | Meta Graph API release version. |

> ⚠️ **Important Distinction**:
> `META_APP_SECRET` and `WHATSAPP_ACCESS_TOKEN` are completely different credentials. Never substitute an app access token or app secret for the `WHATSAPP_ACCESS_TOKEN`. For production, generate a permanent System User token in Meta Business Manager.

---

## 🚀 Step-by-Step Setup Guide

### 1. Install Node.js
Ensure you have **Node.js 24+** and **npm** installed:
```bash
node -v   # Should output v24.x.x
npm -v
```

### 2. Clone or Enter Project Directory
```bash
cd "c:/Users/acer/Downloads/Whats app bot"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create and Configure `.env`
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Open `.env` in your editor and fill in your credentials:
```env
PORT=3000
META_VERIFY_TOKEN=your_custom_secure_verify_token_here
WHATSAPP_ACCESS_TOKEN=EAAB...your_whatsapp_token_here
WHATSAPP_PHONE_NUMBER_ID=109283746592817
META_APP_ID=123456789012345
META_APP_SECRET=abcdef0123456789abcdef0123456789
META_GRAPH_API_VERSION=v21.0
```

### 5. Start the Server Locally
For development with auto-reloading:
```bash
npm run dev
```

You should see:
```text
==================================================
🚀 WhatsApp Business Bot for Triuss Solutions
📡 Server running on http://localhost:3000
🌍 Environment: development
🔗 Webhook Endpoint: http://localhost:3000/webhook
❤️  Health Check: http://localhost:3000/health
==================================================
```

Verify health check:
```bash
curl http://localhost:3000/health
# Response: {"status":"ok"}
```

---

## 🌐 Public Webhook Exposure via ngrok

Meta requires a publicly accessible **HTTPS** URL to deliver webhook events.

In a separate terminal window, start ngrok pointing to port 3000:
```bash
ngrok http 3000
```

ngrok will output a public HTTPS URL, for example:
```text
Forwarding   https://a1b2-c3d4-e5f6.ngrok-free.app -> http://localhost:3000
```

### Note on URLs:
- **Local Application Endpoint**: `http://localhost:3000/webhook`
- **Public Meta Webhook Callback URL**: `https://a1b2-c3d4-e5f6.ngrok-free.app/webhook`

> ⚠️ Do not use `localhost` in Meta Dashboard. Meta cannot connect to your local IP address. Always supply the full `https://YOUR-NGROK-DOMAIN/webhook` URL.

---

## ⚙️ Meta App Dashboard Webhook Configuration

1. Log into [Meta for Developers](https://developers.facebook.com/).
2. Select your App and navigate to **WhatsApp > Configuration** (or **Webhooks** under Products).
3. Under the **Webhooks** section, click **Edit** (or **Configure a Webhook**).
4. Fill in:
   - **Callback URL**: `https://YOUR-NGROK-DOMAIN/webhook` (e.g. `https://a1b2-c3d4-e5f6.ngrok-free.app/webhook`)
   - **Verify Token**: Must match your `META_VERIFY_TOKEN` exactly (from your `.env` file).
5. Click **Verify and Save**.
   - Meta will send a `GET /webhook?hub.mode=subscribe&hub.challenge=...&hub.verify_token=...` to your server.
   - Your server responds with HTTP 200 and the challenge string. Meta will mark the webhook verified with a green checkmark.
6. Under **Webhook fields**, click **Manage** next to `messages` and click **Subscribe** on the **messages** field.
7. Save changes.

---

## 📱 Testing From a Real WhatsApp Account

1. In Meta Dashboard, navigate to **WhatsApp > API Setup**.
2. Under **Step 1: Select phone numbers**, add your personal phone number as a **Recipient phone number** (for sandbox test accounts).
3. Send the verification code received on WhatsApp to authorize your test phone.
4. From your WhatsApp app, send a message to the test WhatsApp number (or your production number):
   ```text
   Hi
   ```
5. **Expected Bot Response**:
   ```text
   👋 Hi! Welcome to Triuss Solutions.

   Thanks for reaching out.

   We help businesses build AI-powered digital solutions.

   Please choose a service below to learn more.
   ```
   Followed immediately by an interactive list message:
   - Button: `[ View Services ]`
   - List Items:
     - `WhatsApp Agents`
     - `Websites`
     - `AI Photo Shoots`
     - `Voice Agents`

6. Select any option (e.g. **Websites**).
7. **Expected Bot Reply**:
   ```text
   🌐 Websites

   We build modern business websites, landing pages, portfolios, e-commerce websites, and custom web applications.

   Reply to this message if you'd like to discuss a website.
   ```

---

## 📄 Example Payloads

### 1. Inbound Webhook Payload (Customer clicks "Websites")
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "100234567890123",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550001234",
              "phone_number_id": "109283746592817"
            },
            "contacts": [
              {
                "profile": { "name": "Jane Doe" },
                "wa_id": "919876543210"
              }
            ],
            "messages": [
              {
                "from": "919876543210",
                "id": "wamid.HBgMOTExOTg3NjU0MzIxMBUCMRIA",
                "timestamp": "1710000000",
                "type": "interactive",
                "interactive": {
                  "type": "list_reply",
                  "list_reply": {
                    "id": "websites",
                    "title": "Websites"
                  }
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### 2. Outbound Meta Graph API Request (Interactive List Menu)
- **POST** `https://graph.facebook.com/v21.0/109283746592817/messages`
- **Headers**:
  - `Authorization: Bearer <WHATSAPP_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "919876543210",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "body": {
      "text": "What service are you interested in?"
    },
    "action": {
      "button": "View Services",
      "sections": [
        {
          "title": "Our Services",
          "rows": [
            {
              "id": "whatsapp_agents",
              "title": "WhatsApp Agents",
              "description": "AI customer support & automation"
            },
            {
              "id": "websites",
              "title": "Websites",
              "description": "Modern business web solutions"
            },
            {
              "id": "ai_photo_shoots",
              "title": "AI Photo Shoots",
              "description": "AI-powered product visuals"
            },
            {
              "id": "voice_agents",
              "title": "Voice Agents",
              "description": "AI voice & call assistance"
            }
          ]
        }
      ]
    }
  }
}
```

---

## 🧪 Testing and Quality Assurance

The project includes unit and integration tests covering all 11 required scenarios:
```bash
# Run test suite
npm test

# Run tests in watch mode
npm run test:watch

# TypeScript strict type checking
npm run typecheck

# Code formatting
npm run format

# ESLint validation
npm run lint

# Production build
npm run build
```

---

## 🐳 Docker Deployment

### Build and Run with Docker Compose:
```bash
docker compose up --build -d
```

### Build Docker Image Directly:
```bash
docker build -t triuss-whatsapp-bot .
docker run -d --name triuss-bot -p 3000:3000 --env-file .env triuss-whatsapp-bot
```

---

## 🛠️ Troubleshooting Common Errors

### 1. Webhook Verification Failed (403 Forbidden)
- **Cause**: The verification token entered in Meta Dashboard does not match `META_VERIFY_TOKEN` in your `.env`.
- **Solution**: Confirm spelling and ensure `.env` is loaded without quotes or extra whitespace. Restart the app if you modified `.env`.

### 2. `(#100) Param recipient_type must be individual` or `(#100) Invalid parameter`
- **Cause**: Meta API payload structure error.
- **Solution**: Ensure the `to` field contains only digits (international country code + subscriber number, e.g. `919876543210`), without `+` signs, hyphens, or spaces.

### 3. `(#190) Invalid OAuth access token`
- **Cause**: The temporary token from Meta Dashboard expired (24-hour limit) or has insufficient permissions.
- **Solution**: Generate a permanent System User Token in Meta Business Settings with `whatsapp_business_messaging` and `whatsapp_business_management` permissions.

### 4. `Message failed to send: (#131030) Recipient phone number not in allowed list`
- **Cause**: In Meta Developer sandbox mode, messages can only be sent to verified phone numbers.
- **Solution**: In Meta Dashboard > **WhatsApp > API Setup**, add your phone number under "To" and complete the SMS/WhatsApp verification code challenge.

### 5. ngrok `502 Bad Gateway`
- **Cause**: ngrok is running, but the local Node.js server on port 3000 is stopped or crashed.
- **Solution**: Run `npm run dev` and ensure the server output shows `Server running on http://localhost:3000`.

### 6. Duplicate Messages Received
- **Cause**: Webhook responses exceeded Meta's response timeout (5 seconds), causing Meta to automatically retry delivery.
- **Solution**: The application incorporates built-in in-memory deduplication (`IdempotencyService`) that detects and ignores duplicate `wamid` message IDs. In production with multiple replicas, use Redis for distributed locking.
