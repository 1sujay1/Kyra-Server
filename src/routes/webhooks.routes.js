import express from "express";
import { verifyWebhook, handleWebhook } from "../controllers/webhooks.controller.js";

const router = express.Router();

// Meta / Lead Ads webhook handshake verification
router.get("/webhooks/leads", verifyWebhook);
router.get("/webhook", verifyWebhook);

// Meta / Lead Ads webhook event delivery
router.post("/webhooks/leads", handleWebhook);
router.post("/webhook", handleWebhook);

export default router;
