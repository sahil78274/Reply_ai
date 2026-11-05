# ReplyAI — Premium AI WhatsApp Business Automation SaaS

ReplyAI automatically responds to incoming WhatsApp Business messages using AI, notifies the business owner instantly, and lets the owner take over any conversation manually at any time.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS (dark/light theme) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini API |
| Messaging | Meta WhatsApp Cloud API (official) |
| Real-time | Socket.IO |
| Automation | n8n webhook integration |
| State | Zustand |

## Project Structure

```
reply-ai/
├── client/                 # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx
│       ├── lib/utils.js
│       ├── store.js         # Zustand store (notifications, sound, UI)
│       ├── services/
│       │   ├── api.js       # HTTP client (fetch-based)
│       │   └── audio.js     # Web Audio notification beep
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx
│       │   └── SocketContext.jsx
│       ├── components/
│       │   ├── ui/          # Button, Input, Card, Badge
│       │   ├── layout/      # Sidebar, Header
│       │   └── chat/        # ConversationList, ChatWindow, MessageBubble, AiStatusBanner, CustomerDetail
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Inbox.jsx
│           ├── Customers.jsx
│           ├── Knowledge.jsx
│           └── Settings.jsx
├── server/                 # Express + MongoDB backend
│   ├── index.js            # Entry point, HTTP + Socket.IO server
│   ├── .env                # Local env (copy from ../.env.example)
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── KnowledgeBase.js
│   │   └── Settings.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── conversations.js
│   │   ├── messages.js
│   │   ├── customers.js
│   │   ├── knowledge.js
│   │   ├── settings.js
│   │   ├── webhooks.js     # Meta webhook verification + inbound processing
│   │   └── n8n.js          # n8n webhook trigger
│   ├── services/
│   │   ├── socket.js       # Socket.IO init + emit helpers
│   │   ├── whatsapp.js     # Meta WhatsApp Cloud API client
│   │   └── gemini.js       # Google Gemini reply generation
│   ├── utils/
│   │   ├── memoryStore.js  # In-memory fallback when MongoDB is unavailable
│   │   └── seedDemo.js     # Demo data seed
│   └── package.json
├── .env.example            # Backend environment template
├── .env                    # Local backend env (gitignored)
└── package.json            # Root workspace (concurrently)
```

## Features

- **Premium dashboard** with dark/light themes, responsive sidebar, stats cards, charts-ready layout
- **Live WhatsApp-style inbox** — conversation list, chat view, customer detail panel, real-time incoming messages via Socket.IO
- **AI automation** — incoming messages routed through Gemini with knowledge base + conversation history; replies in Hindi, English, Hinglish
- **Human takeover** — AI ON/OFF per conversation, Take Over / Resume AI buttons; AI stops immediately on takeover
- **Notifications** — instant dashboard notifications, browser notifications, sound toggle
- **Customer management** — name, phone, tags, lead status (New/Interested/Converted/Not Interested), notes, CSV export
- **AI Knowledge Base** — business name, description, products/services, pricing, timings, FAQs, contact info
- **Settings** — Gemini API key, Meta WhatsApp token, Phone Number ID, WABA ID, webhook verify token, AI language/personality, notification preferences
- **Demo mode** — realistic sample conversations (clearly labeled "Demo") so you can test without a real WhatsApp account
- **n8n integration** — trigger automation webhooks from any conversation

## Quick Start

### 1. Clone & install

```bash
cd reply-ai
npm install          # installs root + server + client dependencies
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key (https://aistudio.google.com) |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Your phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account ID |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Webhook verification token (set in Meta developer dashboard) |
| `JWT_SECRET` | Random secret for session tokens |
| `DEMO_MODE` | `true` to run with sample data without WhatsApp/Gemini |

> **Security:** `GEMINI_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, and other credentials live only on the backend in environment variables. They are never exposed to the frontend.

### 3. Run locally

**Option A — run everything together (recommended):**

```bash
npm run dev
```

This starts the Express API on `http://localhost:5000` and the Vite dev server on `http://localhost:5173`.

**Option B — run separately:**

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### 4. Demo account

The server auto-seeds a demo account on first run:

- Email: `demo@replyai.com`
- Password: `demo1234`

Demo conversations are clearly marked with a **"Demo"** badge and are completely separate from real WhatsApp messages. You can explore the full dashboard (stats, inbox, takeover, settings, CSV export) without connecting any real account.

### 5. Connect real WhatsApp (production)

1. Create a Meta app and add the **WhatsApp** product (https://developers.facebook.com).
2. Get your **Access Token**, **Phone Number ID**, and **WhatsApp Business Account ID**.
3. Set a **Webhook Verify Token** and add the webhook URL:
   ```
   https://your-domain.com/api/webhooks/whatsapp
   ```
4. Subscribe to the `messages` field.
5. Fill in `.env`, restart the server, and save settings in the dashboard.

## API Reference

### Auth
- `POST /api/auth/register` — register
- `POST /api/auth/login` — login (returns JWT + sets cookie)
- `GET /api/auth/me` — current user
- `POST /api/auth/logout` — logout

### Conversations
- `GET /api/conversations` — list (query: `?status=`)
- `GET /api/conversations/stats` — dashboard stats
- `GET /api/conversations/:id` — conversation + messages
- `PUT /api/conversations/:id/takeover` — owner takes over (AI stops)
- `PUT /api/conversations/:id/resume-ai` — resume AI
- `PUT /api/conversations/:id` — update tags/leadStatus/notes/status
- `DELETE /api/conversations/:id` — delete

### Messages
- `GET /api/messages?conversationId=...` — messages for a conversation
- `POST /api/messages/send` — owner sends manual message via WhatsApp Cloud API

### Customers
- `GET /api/customers` — list all customers
- `GET /api/customers/export-csv` — download leads CSV
- `PUT /api/customers/:id` — update tags/lead status/notes

### Knowledge Base
- `GET /api/knowledge` — get knowledge base
- `PUT /api/knowledge` — upsert knowledge base

### Settings
- `GET /api/settings` — settings (sensitive values masked)
- `PUT /api/settings` — upsert settings

### Webhooks (Meta WhatsApp Cloud API)
- `GET /api/webhooks/whatsapp` — webhook verification (hub.verify_token)
- `POST /api/webhooks/whatsapp` — incoming message processing

### n8n
- `POST /api/n8n/trigger/:conversationId` — push conversation to n8n webhook

### Health
- `GET /api/health` — service health + demo mode status

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `notification` | server → client | New message / AI status alert |
| `new_message` | server → client | New message in a conversation |
| `ai_status_changed` | server → client | AI ON/OFF or takeover change |
| `join:user` / `join:conversation` | client → server | Join rooms for targeted updates |

## Demo vs Live Data

All seed/demo records carry `source: "demo"` and render with a **Demo** badge. Real WhatsApp messages carry `source: "whatsapp"`. The two are stored separately and can never be confused.

## AI Safety Rules

The Gemini prompt enforces:
1. Short, natural WhatsApp-style replies (no markdown/headings)
2. Never invent prices, policies, or timings — use only the knowledge base
3. Complicated questions, complaints, and refunds are escalated to the owner
4. Supports Hindi, English, and Hinglish; matches the customer's language

## Requirements

- Node.js >= 18
- MongoDB (local or Atlas) — the app falls back to an in-memory store if MongoDB is unavailable, so it runs for demo/testing without a database

## License

MIT
