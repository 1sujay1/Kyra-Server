import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const PORT = env.PORT || 5000;

async function startServer() {
  console.log("----------------------------------------------------------------");
  console.log("   🚀 KYRA GROUP INDIA - BACKEND API SERVER STARTING...         ");
  console.log("----------------------------------------------------------------");

  // 1. Connect Database (Commented out per requirement - no DB saving needed for now)
  // await connectDB();

  // 2. Start HTTP Server
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`✅ Server is live on http://localhost:${PORT}`);
    console.log(`   - Universal Contact: POST http://localhost:${PORT}/api/contact`);
    console.log(`   - Landing Inbound:   POST http://localhost:${PORT}/api/leads/landing`);
    console.log(`   - Classic Contact:   POST http://localhost:${PORT}/api/v1/contact`);
    console.log(`   - Health Ping:       GET  http://localhost:${PORT}/api/ping`);
    console.log("----------------------------------------------------------------");
  });

  // 3. Graceful Shutdown Handlers
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      console.log("💤 HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
