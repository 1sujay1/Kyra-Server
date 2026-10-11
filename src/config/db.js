import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("❌ [MongoDB Connection Error]:", error.message);
    // Don't exit process in dev mode so API server can still respond to health/status endpoints
    if (env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ [MongoDB Disconnected] Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 [MongoDB Reconnected]");
});
