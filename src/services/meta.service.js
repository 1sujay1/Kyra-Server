import { env } from "../config/env.js";

/**
 * Fetch full lead details from Meta Graph API using leadgen_id
 */
export async function fetchMetaLeadDetails(leadgenId, pageAccessToken = env.META_PAGE_ACCESS_TOKEN) {
  if (!leadgenId) {
    throw new Error("leadgen_id is required");
  }

  const version = env.META_GRAPH_API_VERSION || "v21.0";
  const token = pageAccessToken || env.META_PAGE_ACCESS_TOKEN;

  if (!token || token === "your-page-access-token") {
    console.warn("⚠️ [Meta Graph API] META_PAGE_ACCESS_TOKEN is not configured; skipping remote fetch.");
    return null;
  }

  const url = `https://graph.facebook.com/${version}/${leadgenId}?access_token=${token}`;
  console.log(`🌐 [Meta Graph API] Fetching lead details from: https://graph.facebook.com/${version}/${leadgenId}`);

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta Graph API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// Backward-compatible alias
export const fetchLead = fetchMetaLeadDetails;
