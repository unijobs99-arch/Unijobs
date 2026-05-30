import { Router } from "express";
import Company from "../models/Company.js";
import Worker from "../models/Worker.js";

const router = Router();

router.post("/companies/register", async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

router.get("/companies/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params["id"]);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/companies/:id/workers", async (req, res) => {
  try {
    const company = await Company.findById(req.params["id"]);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    if (company.status !== "approved") {
      res.status(403).json({ error: "Company not approved to view workers" });
      return;
    }
    const filter: Record<string, string> = {};
    if (req.query["category"]) filter["category"] = req.query["category"] as string;
    if (req.query["city"]) filter["city"] = req.query["city"] as string;
    const workers = await Worker.find(filter);
    res.json(workers);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
