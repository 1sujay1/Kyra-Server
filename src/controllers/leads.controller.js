import Lead from "../models/Lead.js";
import { validateIndianPhoneNumber } from "../utils/phone.js";
import { sendLeadEmailNotification } from "../services/email.service.js";

/**
 * Handle Landing Page Contact Form Lead Submission
 * Supports both Next.js landing page schema and classic contact form schema
 */
export async function createLead(req, res) {
  try {
    const body = req.body || {};
    console.log("📥 [Inbound Lead Submission Received]:", body);

    const fullName = (body.name || body.full_name || body.buyer_name || "").trim();
    const rawPhone = (body.phone || body.mobile || body.phone_number || "").trim();
    const secondaryPhone = (body.secondaryPhone || body.secondary_phone || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").trim();
    const pageUrl = body.page_url || req.headers.referer || "";

    let projectName = (body.project_name || body.project || "").trim();
    if (!projectName || projectName === "KYRA GROUP INDIA" || projectName === "KYRA_GROUP_INDIA") {
      if (pageUrl.includes("farmland.kyragroupindia.com") || pageUrl.includes("farmland")) {
        projectName = "Kyra Farmlands";
      } else if (pageUrl.includes("kyragroupindia.com")) {
        projectName = "Kyra Group India";
      } else {
        projectName = "Kyra Farmlands";
      }
    }

    const campaignName = body.campaign_name || body.campaign || "Landing Page Enquiry";
    const budgetRange = body.budget_range || body.budget || "₹35L - ₹50L";
    const purpose = body.purpose || "farmhouse";
    const intent = body.intent || "site_visit";
    const rawSource = (body.source || "").trim();
    const source = (!rawSource || rawSource === "webhook" || rawSource === "website" || rawSource === "landing_page")
      ? "contact_form"
      : rawSource;

    if (!fullName || !rawPhone) {
      console.warn("⚠️ [Lead Validation Rejected] Missing required name or phone number.");
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Full Name and Phone number are required.",
      });
    }

    // 1. Phone number validation
    const phoneCheck = validateIndianPhoneNumber(rawPhone);
    let leadStatus = "new";
    let notes = "Ingested from Website Landing Page Enquiry";

    if (!phoneCheck.isValid) {
      leadStatus = "number_not_valid";
      notes = `Received phone without 10 valid digits (${rawPhone})`;
      console.warn("⚠️ [Phone Validation] Invalid 10-digit Indian phone:", rawPhone);
    } else {
      // 2. Check for duplicate lead in MongoDB
      try {
        const existingLead = await Lead.findOne({
          phone: { $regex: phoneCheck.cleanDigits },
        });

        if (existingLead) {
          leadStatus = "duplicate_number";
          notes = `Duplicate lead received for phone ${phoneCheck.formatted}`;
          console.log(`ℹ️ [Duplicate Check] Lead already exists with phone: ${phoneCheck.formatted} (ID: ${existingLead._id})`);
        }
      } catch (dbFindErr) {
        console.warn("⚠️ [Duplicate Check Error]:", dbFindErr.message);
      }
    }

    const savedPhone = phoneCheck.isValid ? phoneCheck.cleanDigits : rawPhone;
    const headerIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
    const ip = body.ip || headerIp || "";
    const city = body.city || "Coimbatore";
    const region = body.region || "Tamil Nadu";
    const country = body.country || "India";

    // 3. Save lead to MongoDB
    let savedLeadDoc = null;
    try {
      savedLeadDoc = await Lead.create({
        name: fullName,
        full_name: fullName,
        email,
        phone: savedPhone,
        secondaryPhone,
        project: projectName,
        project_name: projectName,
        source,
        campaign_name: campaignName,
        budget_range: budgetRange,
        purpose,
        message,
        intent,
        visit_date: body.visit_date || null,
        page_url: pageUrl,
        ip,
        city,
        region,
        country,
        status: leadStatus,
        mailStatus: "pending",
        notes,
      });
      console.log(`✅ [MongoDB Saved] Lead created with ID: ${savedLeadDoc._id}`);
    } catch (saveErr) {
      console.error("❌ [MongoDB Save Error]:", saveErr.message);
    }

    const leadId = savedLeadDoc?._id ? String(savedLeadDoc._id) : `lead-${Date.now()}`;

    // 4. Dispatch Email Notification via Nodemailer
    sendLeadEmailNotification({
      lead_id: leadId,
      full_name: fullName,
      name: fullName,
      phone: phoneCheck.isValid ? phoneCheck.formatted : rawPhone,
      secondaryPhone,
      email,
      project_name: projectName,
      source: "Website Contact Form",
      campaign_name: campaignName,
      budget_range: budgetRange,
      purpose,
      message,
      visit_date: body.visit_date || null,
      page_url: pageUrl,
    })
      .then(async (mailResult) => {
        console.log(`✅ [Email Dispatched Successfully] MessageId: ${mailResult.messageId}`);
        if (savedLeadDoc?._id) {
          await Lead.findByIdAndUpdate(savedLeadDoc._id, { mailStatus: "success" }).catch(() => {});
        }
      })
      .catch(async (mailError) => {
        console.error("❌ [Email Dispatch Failed]:", mailError.message);
        if (savedLeadDoc?._id) {
          await Lead.findByIdAndUpdate(savedLeadDoc._id, { mailStatus: "failed" }).catch(() => {});
        }
      });

    // 5. Respond 200 OK to frontend
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Thank you for contacting us. We will get back to you soon.",
      lead_id: leadId,
      lead: {
        id: leadId,
        full_name: fullName,
        phone: savedPhone,
        email,
        project_name: projectName,
        status: leadStatus,
      },
    });
  } catch (err) {
    console.error("💥 [Lead Controller Error]:", err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: err.message || "Failed to submit request. Please try again later.",
    });
  }
}

/**
 * Get latest leads (useful for testing & admin verification)
 */
export async function getLeads(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(limit);
    return res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// Backward-compatible alias
export const leadCreate = createLead;
