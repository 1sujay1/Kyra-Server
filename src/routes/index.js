import express from "express";
import leadsRoutes from "./leads.routes.js";
import webhooksRoutes from "./webhooks.routes.js";

const router = express.Router();

// System health & ping endpoints
router.get("/ping", (req, res) => {
  res.json({ status: 200, message: "pong", timestamp: new Date().toISOString() });
});

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Kyra Group India Server API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routers
router.use("/", leadsRoutes);
router.use("/", webhooksRoutes);

export default router;
