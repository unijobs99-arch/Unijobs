import "./loadEnv.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { connectDB } from "./lib/db.js";

const rawPort = process.env["PORT"];
const mongoUri = process.env["MONGODB_URI"];
const adminSecret = process.env["ADMIN_SECRET"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

if (!mongoUri) {
  throw new Error(
    "MONGODB_URI environment variable is required but was not provided.",
  );
}

if (!adminSecret) {
  throw new Error(
    "ADMIN_SECRET environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0 || port > 65535) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

connectDB()
  .then(() => {
    const server = app.listen(port, (err?: Error) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });

    const gracefulShutdown = (signal: string) => {
      logger.info({ signal }, "Received shutdown signal, closing server gracefully...");
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  });
