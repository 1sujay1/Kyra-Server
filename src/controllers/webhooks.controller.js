import Lead from "../models/Lead.js";
import { env } from "../config/env.js";
import { validateIndianPhoneNumber } from "../utils/phone.js";
import { sendLeadEmailNotification } from "../services/email.service.js";
import { fetchMetaLeadDetails } from "../services/meta.service.js";

/**
 * Meta / Facebook Webhook Verification Handshake (GET)
 */
export function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const expectedToken = env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken) {
    console.log("✅ [Meta Webhook] Handshake verified successfully with token.");
    return res.status(200).send(challenge);
  }

  // If queried for status
  return res.status(200).json({
    status: "online",
    service: "Kyra Group India - Lead Webhook Ingestion API",
    endpoint: "/api/webhooks/leads",
    supported_sources: ["meta", "google", "website", "custom"],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Meta / Facebook Webhook Ingestion (POST)
 */
export async function handleWebhook(req, res) {
  try {
    const rawBody = req.body || {};
    console.log("📥 [Webhook Ingested Payload]:", JSON.stringify(rawBody, null, 2));

    // Respond immediately to Meta to acknowledge receipt within 20s timeout window
    res.status(200).send("EVENT_RECEIVED");

    let fullName = "Incoming Meta Lead";
    let phone = "";
    let email = "";
    let city = "Coimbatore";
    let projectName = "Kyra Farmlands";
    let campaignName = "Meta Lead Ads Campaign";
    let source = "FACEBOOK";

    // 1. Check if Meta Leadgen Webhook format
    if (rawBody.entry && Array.isArray(rawBody.entry)) {
      for (const entry of rawBody.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === "leadgen") {
              const leadgenId = change.value?.leadgen_id;
              const formId = change.value?.form_id;
              console.log(`📩 [Meta Webhook Lead] LeadgenID: ${leadgenId} | FormID: ${formId}`);

              let fieldData = change.value?.field_data;

              // If field data not embedded, query Meta Graph API
              if (!fieldData && leadgenId) {
                try {
                  const remoteLead = await fetchMetaLeadDetails(leadgenId);
                  if (remoteLead && remoteLead.field_data) {
                    fieldData = remoteLead.field_data;
                  }
                } catch (metaErr) {
                  console.error("❌ [Meta Lead Fetch Error]:", metaErr.message);
                }
              }

              // Parse field data
              if (fieldData && Array.isArray(fieldData)) {
                fieldData.forEach((field) => {
                  const nameKey = field.name?.toLowerCase();
                  const val = field.values?.[0] || "";
                  if (nameKey === "full_name" || nameKey === "name") fullName = val;
                  if (nameKey === "phone_number" || nameKey === "phone" || nameKey === "mobile") phone = val;
                  if (nameKey === "email") email = val;
                  if (nameKey === "city") city = val;
                });
              }

              if (phone) {
                await processAndSaveWebhookLead({
                  fullName,
                  phone,
                  email,
                  city,
                  projectName,
                  campaignName,
                  source: "FACEBOOK",
                  externalId: leadgenId,
                });
              }
            }
          }
        }
      }
      return;
    }

    // 2. Generic direct webhook payload (e.g. from Zapier, Make, custom scripts)
    const directName = rawBody.full_name || rawBody.name || rawBody.buyer_name;
    const directPhone = rawBody.phone || rawBody.mobile || rawBody.phone_number;

    if (directName || directPhone) {
      await processAndSaveWebhookLead({
        fullName: directName || fullName,
        phone: directPhone || phone,
        email: rawBody.email || email,
        city: rawBody.city || city,
        projectName: rawBody.project_name || rawBody.project || projectName,
        campaignName: rawBody.campaign_name || campaignName,
        source: rawBody.source || "WEBHOOK",
        externalId: rawBody.id || rawBody.lead_id,
      });
    }
  } catch (err) {
    console.error("💥 [Webhook Processing Exception]:", err);
  }
}

/**
 * Helper to validate, save and notify for webhook leads
 */
async function processAndSaveWebhookLead({
  fullName,
  phone,
  email,
  city,
  projectName,
  campaignName,
  source,
  externalId,
}) {
  const phoneCheck = validateIndianPhoneNumber(phone);
  const cleanPhone = phoneCheck.isValid ? phoneCheck.cleanDigits : phone;

  console.log(`📦 [Processing Webhook Lead] Name: ${fullName} | Phone: ${phoneCheck.formatted}`);

  let leadDoc = null;
  try {
    leadDoc = await Lead.create({
      name: fullName,
      full_name: fullName,
      phone: cleanPhone,
      email,
      city,
      project: projectName,
      project_name: projectName,
      campaign_name: campaignName,
      source,
      status: phoneCheck.isValid ? "new" : "number_not_valid",
      notes: `Ingested from ${source} (External ID: ${externalId || "N/A"})`,
    });
    console.log(`✅ [Webhook Lead Saved] ID: ${leadDoc._id}`);
  } catch (err) {
    console.error("❌ [Webhook Lead DB Save Error]:", err.message);
  }

  // Dispatch email notification
  sendLeadEmailNotification({
    lead_id: leadDoc?._id ? String(leadDoc._id) : undefined,
    full_name: fullName,
    name: fullName,
    phone: phoneCheck.isValid ? phoneCheck.formatted : phone,
    email,
    project_name: projectName,
    source,
    campaign_name: campaignName,
    message: `Lead captured via ${source}`,
  })
    .then(async () => {
      if (leadDoc?._id) {
        await Lead.findByIdAndUpdate(leadDoc._id, { mailStatus: "success" }).catch(() => {});
      }
    })
    .catch(async (mailErr) => {
      console.error("❌ [Webhook Email Alert Error]:", mailErr.message);
      if (leadDoc?._id) {
        await Lead.findByIdAndUpdate(leadDoc._id, { mailStatus: "failed" }).catch(() => {});
      }
    });
}

// Backward-compatible aliases
export const webhookVerify = verifyWebhook;
export const webhookHandler = handleWebhook;
