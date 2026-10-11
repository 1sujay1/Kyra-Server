# Universal Contact Form Email Server Automated

Lightweight, high-performance Node.js/Express backend API server for handling **contact form submissions** across multiple websites and projects. Built with **Nodemailer (Gmail SMTP)** to dispatch instant, branded email notifications containing the buyer's contact details and dynamic **Project Name**.

> **Note:** Database saving is deliberately decoupled and commented out so the server runs completely stateless without any MongoDB connection requirement.

---

## 🚀 Key Highlights

- **Universal Multi-Project Support**: Pass any `project_name` (e.g. `Kyra Farmlands`, `Clevix Tech`, `Godrej Homes`, `My Portfolio`) and the email subject, header, and sender display name dynamically adapt to that project.
- **Instant Nodemailer Email Alerts**: Emails are sent with formatted contact details and quick-action buttons:
  - 📞 **"Call Buyer Now"** (`tel:+91...`)
  - 💬 **"WhatsApp Lead"** (`https://wa.me/...`)
- **Zero Database Dependency**: No MongoDB or SQL setup required to run or deploy.
- **Permissive CORS Enabled**: Accepts cross-origin form submissions from any frontend website, landing page, or localhost.
- **Indian Mobile Validation**: Normalizes 10-digit Indian phone numbers cleanly (`+91 98765 43210`).

---

## 📁 Repository Structure

```
kyra/server/
├── .env                         # Private SMTP & server configuration
├── .env.example                 # Example environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Project dependencies & scripts
├── README.md                    # Documentation
└── src/
    ├── server.js                # Server entry point & graceful shutdown
    ├── app.js                   # Express application & CORS middleware
    ├── config/
    │   ├── db.js                # (Optional) MongoDB connector (commented out)
    │   └── env.js               # Environment variables loader
    ├── controllers/
    │   ├── leads.controller.js  # Universal contact form submission & email trigger
    │   └── webhooks.controller.js # Meta webhook handshake & lead ingestion
    ├── models/
    │   └── Lead.js              # (Optional) Mongoose schema (commented out)
    ├── routes/
    │   ├── index.js             # Root router aggregator
    │   ├── leads.routes.js      # /api/contact, /api/leads/landing, /api/v1/contact
    │   └── webhooks.routes.js   # /api/webhooks/leads, /api/v1/webhook
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

Copy `.env.example` to `.env` and configure your Gmail SMTP App Password:

```env
PORT=5000
NODE_MAILER_EMAIL=your-gmail@gmail.com
NODE_MAILER_PASSWORD=your-16-char-app-password
NODE_MAILER_RECEIVER_EMAIL=your-receiver@gmail.com
NODE_MAILER_CC_EMAILS=["cc1@gmail.com", "cc2@gmail.com"]
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 📡 API Reference

### 1. Universal Contact Form Submission

- **Method**: `POST`
- **Endpoints** (all accept the exact same payload):
  - `http://localhost:5000/api/contact`
  - `http://localhost:5000/api/leads/landing`
  - `http://localhost:5000/api/v1/contact`
- **Headers**: `Content-Type: application/json`

#### Request Payload Sample

```json
{
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "email": "ramesh@gmail.com",
  "project_name": "Kyra Farmlands",
  "message": "Interested in booking a weekend site visit."
}
```

> **Tip:** Change `"project_name"` to any project (e.g. `"Clevix Tech"`, `"Godrej Homes"`, `"Home Aura"`). The email subject line will automatically arrive as `[Your Project Name] New Lead: Ramesh Kumar (+91 9876543210)`.

#### Response (`200 OK`)

```json
{
  "success": true,
  "status": 200,
  "message": "Thank you for contacting us. We will get back to you soon.",
  "data": {
    "name": "Ramesh Kumar",
    "phone": "+91 9876543210",
    "email": "ramesh@gmail.com",
    "project_name": "Kyra Farmlands",
    "email_status": "sent"
  }
}
```

---

### 2. cURL Example for Testing

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sujay Gowda",
    "phone": "9876543210",
    "email": "sujay@example.com",
    "project_name": "Kyra Farmlands",
    "message": "Hello from contact form"
  }'
```
