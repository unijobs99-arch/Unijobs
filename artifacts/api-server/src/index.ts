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

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

connectDB()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  });
