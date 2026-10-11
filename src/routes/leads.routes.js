import express from "express";
import { createLead } from "../controllers/leads.controller.js";

const router = express.Router();

// Universal contact form submission endpoints
router.post("/contact", createLead);
router.post("/leads/landing", createLead);
router.post("/kyra/contact", createLead);

export default router;
