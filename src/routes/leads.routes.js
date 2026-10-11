import express from "express";
import { createLead, getLeads } from "../controllers/leads.controller.js";

const router = express.Router();

// Landing page lead submission (primary endpoint)
router.post("/leads/landing", createLead);

// Backward-compatible contact form endpoints
router.post("/contact", createLead);
router.post("/kyra/contact", createLead);

// Lead retrieval
router.get("/leads", getLeads);

export default router;
