import { Router } from "express";
import Requirement from "../models/Requirement.js";
import Company from "../models/Company.js";
import { RequirementSchema } from "../lib/validation.js";
import ensureCompanyApproved from "../middleware/companyApproval.js";

const router = Router();

router.post("/requirements", ensureCompanyApproved, async (req, res) => {
  try {
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

router.get("/requirements", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query["limit"] as string, 10) || 20);
    const skip = (page - 1) * limit;

    const [requirements, total] = await Promise.all([
      Requirement.find()
        .populate("companyId", "companyName city")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Requirement.countDocuments(),
    ]);

    res.json({ requirements, page, limit, total });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/requirements/company/:id", ensureCompanyApproved, async (req, res) => {
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
