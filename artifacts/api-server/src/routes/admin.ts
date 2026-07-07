import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { adminAuth } from "../middleware/adminAuth.js";
import Company from "../models/Company.js";
import Worker from "../models/Worker.js";

const jwtSecret = process.env["JWT_SECRET"];
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required but was not provided.");
}

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, please try again later." },
});

const router = Router();

router.post("/admin/login", adminLoginLimiter, (req, res) => {
  const { secret } = req.body;
  if (!secret || secret !== process.env["ADMIN_SECRET"]) {
    res.status(401).json({ error: "Invalid secret" });
    return;
  }
  const token = jwt.sign({ role: "admin" }, jwtSecret, { expiresIn: "8h" });
  res.json({ token });
});

router.get("/admin/companies", adminAuth, async (req, res) => {
  try {
    const filter: Record<string, string> = {};
    if (req.query["status"]) filter["status"] = req.query["status"] as string;

    const page = Math.max(1, parseInt(req.query["page"] as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query["limit"] as string, 10) || 20);
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Company.countDocuments(filter),
    ]);

    res.json({ companies, page, limit, total });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/admin/companies/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const company = await Company.findByIdAndUpdate(
      req.params["id"],
      { status },
      { returnDocument: "after" },
    );
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/admin/workers", adminAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query["limit"] as string, 10) || 20);
    const skip = (page - 1) * limit;

    const [workers, total] = await Promise.all([
      Worker.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Worker.countDocuments(),
    ]);

    res.json({ workers, page, limit, total });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
