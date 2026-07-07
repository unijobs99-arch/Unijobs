import { Router } from "express";
import jwt from "jsonwebtoken";
import Worker from "../models/Worker.js";
import CompanyContact from "../models/CompanyContact.js";
import { WorkerRegisterSchema, UpdateWorkerSchema, AvailabilitySchema, EmploymentUpdateSchema, WorkerLoginSchema } from "../lib/validation.js";
import ensureCompanyApproved from "../middleware/companyApproval.js";
import { workerAuth } from "../middleware/workerAuth.js";
import { logger } from "../lib/logger.js";

const jwtSecret = process.env["JWT_SECRET"];
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required but was not provided.");
}

const router = Router();

router.post("/workers/register", async (req, res) => {
  try {
    logger.info({ body: req.body }, "Worker registration request body");
    const validated = WorkerRegisterSchema.parse(req.body);
    const worker = new Worker(validated);
    await worker.save();
    const token = jwt.sign({ role: "worker", workerId: worker._id }, jwtSecret, { expiresIn: "30d" });
    res.status(201).json({ ...worker.toObject(), token });
  } catch (err: any) {
    if (err.code === 11000) {
      const response = { error: "Phone or Aadhaar already registered" };
      logger.error({ body: req.body, error: err, response }, "Worker registration conflict");
      res.status(409).json(response);
      return;
    }
    if (err.name === "ZodError") {
      const errorMessage = err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
      const response = { error: errorMessage };
      logger.error({ body: req.body, validationErrors: err.errors, response }, "Worker registration validation failed");
      res.status(400).json(response);
      return;
    }
    const response = { error: err.message };
    logger.error({ body: req.body, error: err, response }, "Worker registration failed");
    res.status(400).json(response);
  }
});

router.post("/workers/login", async (req, res) => {
  try {
    const { phone } = WorkerLoginSchema.parse(req.body);
    const worker = await Worker.findOne({ phone });
    if (!worker) {
      res.status(404).json({ error: "No worker found with this phone number" });
      return;
    }
    const token = jwt.sign({ role: "worker", workerId: worker._id }, jwtSecret, { expiresIn: "30d" });
    res.json({ ...worker.toObject(), token });
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ") });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

router.get("/workers/:id", async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    workerAuth(req, res, next);
    return;
  }
  ensureCompanyApproved(req, res, next);
}, async (req, res) => {
  try {
    const isWorkerOrAdmin = Boolean(req.headers["authorization"]?.startsWith("Bearer "));
    const workerQuery = Worker.findById(req.params["id"]);
    if (!isWorkerOrAdmin) {
      workerQuery.select("-aadhaar");
    }
    const worker = await workerQuery;
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }
    res.json(worker);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/workers/company/:companyId", ensureCompanyApproved, async (req, res) => {
  try {
    const companyId = req.params["companyId"];
    const workers = await Worker.find({
      currentCompanyId: companyId,
      employmentStatus: "working",
    });
    res.json(workers);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/workers/:id/contacts", workerAuth, async (req, res) => {
  try {
    const workerId = req.params["id"];
    const contacts = await CompanyContact.find({ workerId }).sort({ createdAt: -1 }).lean();
    res.json(contacts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/workers/:id", workerAuth, async (req, res) => {
  try {
    const { _id, __v, createdAt, updatedAt, phone, aadhaar, availability, ...updateData } = req.body;
    const validated = UpdateWorkerSchema.parse(updateData);
    const worker = await Worker.findByIdAndUpdate(
      req.params["id"],
      validated,
      { returnDocument: "after", runValidators: true },
    );
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }
    res.json(worker);
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ") });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

router.put("/workers/:id/availability", workerAuth, async (req, res) => {
  try {
    const validated = AvailabilitySchema.parse(req.body);
    const worker = await Worker.findByIdAndUpdate(
      req.params["id"],
      { availability: validated.availability },
      { returnDocument: "after" },
    );
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }
    res.json(worker);
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ") });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

router.patch("/workers/:id/employment", ensureCompanyApproved, async (req, res) => {
  try {
    const validated = EmploymentUpdateSchema.parse(req.body);
    const worker = await Worker.findById(req.params["id"]);
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }

    const requestingCompanyId = validated.companyId;
    const currentCompanyId = worker.currentCompanyId;

    const isWorkerAvailable = worker.employmentStatus !== "working" || !currentCompanyId;
    const isCurrentCompany = currentCompanyId && requestingCompanyId === currentCompanyId.toString();

    if (!isWorkerAvailable && !isCurrentCompany) {
      res.status(403).json({ message: "Only the company currently employing this worker may modify employment status." });
      return;
    }

    const updateData = {
      employmentStatus: validated.employmentStatus,
      currentCompanyId: validated.employmentStatus === "working" ? validated.companyId : null,
      currentCompanyName: validated.employmentStatus === "working" ? validated.companyName : null,
    };
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params["id"],
      updateData,
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedWorker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }
    res.json(updatedWorker);
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ") });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

export default router;
