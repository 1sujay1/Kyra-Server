// import Lead from "../models/Lead.js"; // DB saving commented out per requirement
import { validateIndianPhoneNumber } from "../utils/phone.js";
import { sendLeadEmailNotification } from "../services/email.service.js";

/**
 * Universal Contact Form Submission Controller
 * - Ingests name, phone, email, message, and project_name
 * - Dynamically identifies the project over email
 * - Triggers instant Nodemailer alert
 * - Database persistence is commented out (stateless API)
 */
export async function createLead(req, res) {
  try {
    const body = req.body || {};
    console.log("📥 [Inbound Contact Submission Received]:", body);

    const fullName = (body.name || body.full_name || body.buyer_name || "").trim();
    const rawPhone = (body.phone || body.mobile || body.phone_number || "").trim();
    const secondaryPhone = (body.secondaryPhone || body.secondary_phone || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").trim();
    const pageUrl = body.page_url || req.headers.referer || "";

    // Dynamic project name: Allows this API to be reused across any unrelated website/project
    const projectName = (body.project_name || body.project || "").trim() || "General Project Enquiry";

    // Basic validation: Name and Phone are required
    if (!fullName || !rawPhone) {
      console.warn("⚠️ [Validation Rejected] Missing required name or phone number.");
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Full Name and Phone number are required.",
      });
    }

    // Phone number validation & formatting
    const phoneCheck = validateIndianPhoneNumber(rawPhone);
    const displayPhone = phoneCheck.isValid ? phoneCheck.formatted : rawPhone;

    // =========================================================================
    // 🗄️ DATABASE SAVING (COMMENTED OUT FOR NOW - NO DB DEPENDENCY)
    // =========================================================================
    /*
    let savedLeadDoc = null;
    try {
      savedLeadDoc = await Lead.create({
        name: fullName,
        full_name: fullName,
        email,
        phone: phoneCheck.cleanDigits || rawPhone,
        secondaryPhone,
        project: projectName,
        project_name: projectName,
        source: body.source || "Website Contact Form",
        message,
        page_url: pageUrl,
        status: phoneCheck.isValid ? "new" : "number_not_valid",
      });
      console.log(`✅ [MongoDB Saved] Lead created with ID: ${savedLeadDoc._id}`);
    } catch (saveErr) {
      console.error("❌ [MongoDB Save Error]:", saveErr.message);
    }
    */
    // =========================================================================

    // Trigger instant email notification via Nodemailer with dynamic Project Name
    let emailStatus = "sent";
    try {
      await sendLeadEmailNotification({
        full_name: fullName,
        name: fullName,
        phone: displayPhone,
        secondaryPhone,
        email,
        project_name: projectName,
        source: body.source || "Website Contact Form",
        campaign_name: body.campaign_name || body.campaign || "",
        budget_range: body.budget_range || body.budget || "",
        purpose: body.purpose || "",
        message,
        visit_date: body.visit_date || null,
        page_url: pageUrl,
      });
      console.log(`✅ [Email Alert Sent] Project: "${projectName}" | Lead: "${fullName}" (${displayPhone})`);
    } catch (mailError) {
      console.error("❌ [Email Dispatch Failed]:", mailError.message);
      emailStatus = "failed";
    }

    // Return clean 200 OK response
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Thank you for contacting us. We will get back to you soon.",
      data: {
        name: fullName,
        phone: displayPhone,
        email,
        project_name: projectName,
        email_status: emailStatus,
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

// Backward-compatible alias
export const leadCreate = createLead;
