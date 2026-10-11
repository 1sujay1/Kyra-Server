# Kyra Group India - Backend API Server

High-performance, lightweight Node.js/Express backend server for **Kyra Group India** (`kyragroupindia.com`). Built for landing page contact form submissions, Meta/Facebook Lead Ads webhook ingestion, MongoDB persistence, and automated Nodemailer email notifications.

---

## 🚀 Key Features

- **Landing Page Contact Form Ingestion**:
  - Primary endpoint: `POST /api/leads/landing`
  - Backward-compatible alias: `POST /api/v1/contact`
  - Ingests buyer name, phone, email, project, budget, purpose, intent, visit date, notes, and geolocation.
  - Indian 10-digit mobile number validation and normalization.
  - Automatic duplicate lead detection in MongoDB.
- **Meta / Facebook Lead Ads Integration**:
  - Webhook verification endpoint: `GET /api/webhooks/leads`
  - Leadgen webhook ingestion: `POST /api/webhooks/leads`
  - Automated Meta Graph API querying for lead field data if only `leadgen_id` is delivered.
- **Nodemailer Instant Email Alerts**:
  - Dispatches branded, mobile-responsive HTML email notifications to sales leadership via Gmail SMTP.
  - Formatted with instant "📞 Call Buyer Now" and "💬 WhatsApp Lead" click-to-chat action buttons.
  - Supports primary receiver and multi-party CC recipients.
- **MongoDB Persistence**:
  - Stores leads into the `leads` collection with indexes, timestamps, and deduplication records.
- **Security & Reliability**:
  - Permissive CORS pre-configured for `kyragroupindia.com`, `farmland.kyragroupindia.com`, and localhost.
  - HTML input sanitization to eliminate XSS injection risks.

---

## 📁 Repository Structure

```
kyra/server/
├── .env                         # Environment variables (private)
├── .env.example                 # Example environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Project dependencies & scripts
├── README.md                    # Documentation
└── src/
    ├── server.js                # Server entry point & graceful shutdown
    ├── app.js                   # Express application & middleware setup
    ├── config/
    │   ├── db.js                # Mongoose MongoDB connection manager
    │   └── env.js               # Environment variables loader
    ├── controllers/
    │   ├── leads.controller.js  # Contact form validation & submission logic
    │   └── webhooks.controller.js # Meta webhook handshake & lead ingestion
    ├── models/
    │   └── Lead.js              # Mongoose schema for leads collection
    ├── routes/
    │   ├── index.js             # Root router aggregator
    │   ├── leads.routes.js      # /api/leads/landing & /api/v1/contact
    │   └── webhooks.routes.js   # /api/webhooks/leads & /api/v1/webhook
    ├── services/
    │   ├── email.service.js     # Nodemailer email alert dispatcher
    │   └── meta.service.js      # Meta Graph API lead fetcher
    └── utils/
        ├── phone.js             # Indian phone validation & normalizer
        └── sanitize.js          # HTML escaping utility
```

---

## 🛠️ Getting Started

### 1. Installation

```bash
cd D:\Sujay\projects\real-estate-winner\kyra\server
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated or `*`) | `*` |
| `NODE_MAILER_EMAIL` | Sender Gmail address | `sujaygowdag333@gmail.com` |
| `NODE_MAILER_PASSWORD` | Gmail App Password (16 characters) | `keou mqnl ykyl rydk` |
| `NODE_MAILER_RECEIVER_EMAIL` | Sales team notification recipient | `sujaymaster111@gmail.com` |
| `NODE_MAILER_CC_EMAILS` | JSON array of CC email addresses | `["sujaymastern@gmail.com", "visupriya.udt@gmail.com"]` |
| `META_VERIFY_TOKEN` | Secret token configured in Meta App Webhook | `kyra_meta_webhook_secret_2026` |
| `META_PAGE_ACCESS_TOKEN` | Meta Graph API Page Access Token | `your-page-access-token` |

### 3. Run Development Server

```bash
npm run dev
```

### 4. Run Production Server

```bash
npm start
```

---

## 📡 API Reference

### 1. Landing Page Lead Submission

- **Endpoint**: `POST /api/leads/landing` (or `POST /api/v1/contact`)
- **Headers**: `Content-Type: application/json`

**Sample Request Body:**
```json
{
  "name": "Ramesh Kumar",
  "phone": "+91 98765 43210",
  "email": "ramesh@example.com",
  "project_name": "Kyra Farmlands",
  "budget_range": "₹35L - ₹50L",
  "purpose": "farmhouse",
  "intent": "site_visit",
  "visit_date": "2026-10-25",
  "message": "Interested in booking a weekend site visit.",
  "page_url": "https://kyragroupindia.com"
}
```

**Successful Response (`200 OK`):**
```json
{
  "success": true,
  "status": 200,
  "message": "Thank you for contacting us. We will get back to you soon.",
  "lead_id": "6709a12bcde3456789012345",
  "lead": {
    "id": "6709a12bcde3456789012345",
    "full_name": "Ramesh Kumar",
    "phone": "9876543210",
    "email": "ramesh@example.com",
    "project_name": "Kyra Farmlands",
    "status": "new"
  }
}
```

---

### 2. Meta / Facebook Webhook Handshake

- **Endpoint**: `GET /api/webhooks/leads` (or `GET /api/v1/webhook`)
- **Query Parameters**:
  - `hub.mode=subscribe`
  - `hub.verify_token=kyra_meta_webhook_secret_2026`
  - `hub.challenge=<CHALLENGE_CODE>`

**Response:** Returns `<CHALLENGE_CODE>` directly with `200 OK`.

---

### 3. Meta / Facebook Webhook Lead Ingestion

- **Endpoint**: `POST /api/webhooks/leads` (or `POST /api/v1/webhook`)
- **Headers**: `Content-Type: application/json`
- Ingests standard Meta Lead Ads webhook payload containing `leadgen_id` and dispatches email alert asynchronously.

---

### 4. Health Check & Ping

- `GET /api/health` $\rightarrow$ `{ "status": "ok", "uptime": 12.34 }`
- `GET /api/ping` $\rightarrow$ `{ "status": 200, "message": "pong" }`
