import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { escapeHtml } from "../utils/sanitize.js";

// Create reusable Nodemailer transporter with connection pooling
function createTransporter() {
  const mailUser = env.NODE_MAILER_EMAIL.trim();
  const mailPass = env.NODE_MAILER_PASSWORD.trim().replace(/\s+/g, "");

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: mailUser,
      pass: mailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Sends a rich, branded email alert for new Kyra Group India leads
 */
export async function sendLeadEmailNotification(params) {
  const {
    full_name,
    name,
    phone,
    secondaryPhone,
    email,
    project_name,
    project,
    source,
    campaign_name,
    budget_range,
    purpose,
    message,
    visit_date,
    page_url,
  } = params;

  const leadName = full_name || name || "Valued Buyer";
  const projectName = project_name || project || "Kyra Farmlands";
  const leadSource = source || "Website Contact Form";

  const sourceTitle =
    leadSource.toLowerCase().includes("meta") || leadSource.toLowerCase().includes("facebook")
      ? "Meta Lead Ads Enquiry"
      : "Website Contact Form Submission";

  const subject = `[New Lead Alert] ${leadName} - ${projectName} (${sourceTitle})`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f2b1a; padding: 22px 24px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; color: #f59e0b;">Kyra Group India</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #d1fae5;">New Inbound Lead Enquiry Notification</p>
      </div>

      <div style="padding: 24px; color: #1e293b;">
        <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px;">
          Source: ${escapeHtml(leadSource)}
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 35%;">Buyer Name:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${escapeHtml(leadName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Mobile Phone:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: bold; font-family: monospace;">+91 ${escapeHtml(phone)}</td>
          </tr>
          ${
            secondaryPhone
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Secondary Phone:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-family: monospace;">+91 ${escapeHtml(secondaryPhone)}</td>
                </tr>`
              : ""
          }
          ${
            email
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${escapeHtml(email)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(email)}</a></td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Project Interested:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: bold; color: #047857;">${escapeHtml(projectName)}</td>
          </tr>
          ${
            budget_range
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Budget Range:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(budget_range)}</td>
                </tr>`
              : ""
          }
          ${
            purpose
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Investment Purpose:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(purpose)}</td>
                </tr>`
              : ""
          }
          ${
            visit_date
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Requested Visit:</td>
                  <td style="padding: 8px 0; color: #d97706; font-weight: bold;">${escapeHtml(visit_date)}</td>
                </tr>`
              : ""
          }
          ${
            campaign_name
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Campaign:</td>
                  <td style="padding: 8px 0; color: #64748b;">${escapeHtml(campaign_name)}</td>
                </tr>`
              : ""
          }
          ${
            message
              ? `<tr>
                  <td style="padding: 12px 0 4px 0; color: #64748b; font-weight: bold; vertical-align: top;">Buyer Note:</td>
                  <td style="padding: 12px 0 4px 0; color: #334155; font-style: italic; background-color: #f8fafc; padding: 10px; border-radius: 6px;">"${escapeHtml(message)}"</td>
                </tr>`
              : ""
          }
        </table>

        ${
          page_url
            ? `<div style="margin-top: 16px; font-size: 12px; color: #94a3b8; word-break: break-all;">
                Captured from URL: ${escapeHtml(page_url)}
              </div>`
            : ""
        }

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
          <a href="tel:${escapeHtml(phone)}" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-right: 8px;">
            📞 Call Buyer Now
          </a>
          <a href="https://wa.me/91${escapeHtml(phone.replace(/\D/g, ""))}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: bold; font-size: 14px;">
            💬 WhatsApp Lead
          </a>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        Automated alert generated by Kyra Group India Lead Engine • ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
      </div>
    </div>
  `;

  const transporter = createTransporter();

  const mailOptions = {
    from: `Kyra Group India <${env.NODE_MAILER_EMAIL}>`,
    to: env.NODE_MAILER_RECEIVER_EMAIL,
    cc: env.NODE_MAILER_CC_EMAILS,
    subject,
    html: htmlContent,
  };

  console.log(`📧 [Nodemailer] Sending alert to: ${mailOptions.to} (CC: ${mailOptions.cc.join(", ")}) for lead: ${leadName}`);
  return transporter.sendMail(mailOptions);
}

// Backward-compatible alias
export const sendContactMail = sendLeadEmailNotification;
