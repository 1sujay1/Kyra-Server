import dotenv from "dotenv";
dotenv.config();

let parsedCcEmails = ["sujaymastern@gmail.com", "visupriya.udt@gmail.com"];
if (process.env.NODE_MAILER_CC_EMAILS) {
  try {
    const raw = JSON.parse(process.env.NODE_MAILER_CC_EMAILS);
    if (Array.isArray(raw)) {
      parsedCcEmails = raw;
    }
  } catch {
    // If comma-separated string fallback
    parsedCcEmails = process.env.NODE_MAILER_CC_EMAILS.split(",").map((e) => e.trim()).filter(Boolean);
  }
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "mongodb+srv://admin:admin@cluster0.2sucg.mongodb.net/kyra-group-india-dev",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "*",

  // Nodemailer
  NODE_MAILER_EMAIL: process.env.NODE_MAILER_EMAIL || "sujaygowdag333@gmail.com",
  NODE_MAILER_PASSWORD: process.env.NODE_MAILER_PASSWORD || "keou mqnl ykyl rydk",
  NODE_MAILER_RECEIVER_EMAIL: process.env.NODE_MAILER_RECEIVER_EMAIL || "sujaymaster111@gmail.com",
  NODE_MAILER_CC_EMAILS: parsedCcEmails,

  // Meta Webhook
  META_VERIFY_TOKEN: process.env.META_VERIFY_TOKEN || process.env.FB_VERIFY_TOKEN || "kyra_meta_webhook_secret_2026",
  META_PAGE_ACCESS_TOKEN: process.env.META_PAGE_ACCESS_TOKEN || "",
  META_GRAPH_API_VERSION: process.env.META_GRAPH_API_VERSION || "v21.0",
};
