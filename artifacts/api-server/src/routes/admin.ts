import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import Company from "../models/Company.js";
import Worker from "../models/Worker.js";

const router = Router();

router.post("/admin/login", (req, res) => {
  const { secret } = req.body;
  if (!secret || secret !== process.env["ADMIN_SECRET"]) {
    res.status(401).json({ error: "Invalid secret" });
    return;
  }
  res.json({ ok: true });
});

router.get("/admin/companies", adminAuth, async (req, res) => {
  try {
    const filter: Record<string, string> = {};
    if (req.query["status"]) filter["status"] = req.query["status"] as string;
    const companies = await Company.find(filter).sort({ createdAt: -1 });
    res.json(companies);
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
      { new: true },
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

router.get("/admin/workers", adminAuth, async (_req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
