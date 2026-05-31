import { Router } from "express";
import Requirement from "../models/Requirement.js";
import Company from "../models/Company.js";
import { RequirementSchema } from "../lib/validation.js";

const router = Router();

router.post("/requirements", async (req, res) => {
  try {
    const company = await Company.findById(req.body.companyId);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    if (company.status !== "approved") {
      res.status(403).json({ error: "Only approved companies can post requirements" });
      return;
    }
    const validated = RequirementSchema.parse(req.body);
    const requirement = new Requirement(validated);
    await requirement.save();
    res.status(201).json(requirement);
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ") });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

router.get("/requirements", async (_req, res) => {
  try {
    const requirements = await Requirement.find()
      .populate("companyId", "companyName city")
      .sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/requirements/company/:id", async (req, res) => {
  try {
    const requirements = await Requirement.find({
      companyId: req.params["id"],
    }).sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
