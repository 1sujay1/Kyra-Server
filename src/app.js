import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import routes from "./routes/index.js";

const app = express();

// 1. Logger
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// 2. CORS configuration
const allowedOrigins =
  env.ALLOWED_ORIGINS === "*"
    ? "*"
    : env.ALLOWED_ORIGINS.split(",")
        .map((o) => o.trim())
        .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (
        !origin ||
        allowedOrigins === "*" ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive CORS for landing pages
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  }),
);

// Explicit OPTIONS preflight handler
app.options("*", cors());

// 3. Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 4. API Routes Mounting
// Supports /api/leads/landing, /api/webhooks/leads
app.use("/api", routes);
// Supports /api/v1/contact, /api/v1/webhook, /api/v1/ping
app.use("/api/v1", routes);

// Root Banner Route
app.get("/", (req, res) => {
  res.json({
    name: "Kyra Group India - Backend API Server",
    version: "1.0.0",
    status: "online",
  });
});

// 5. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error("💥 [Unhandled Server Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

export default app;
