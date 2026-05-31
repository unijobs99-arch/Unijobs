import { Router } from "express";
import Company from "../models/Company.js";
import Worker from "../models/Worker.js";
import { CompanyRegisterSchema } from "../lib/validation.js";

const router = Router();

router.post("/companies/register", async (req, res) => {
  try {
    const validated = CompanyRegisterSchema.parse(req.body);
    const company = new Company(validated);
    await company.save();
    res.status(201).json(company);
  } catch (err: any) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      if (field === "email") {
        res.status(409).json({ error: "Email already registered" });
      } else if (field === "phone") {
        res.status(409).json({ error: "Phone number already registered" });
      } else {
        res.status(409).json({ error: `${field} already registered` });
      }
      return;
    }
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ") });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

router.get("/companies/login", async (req, res) => {
  try {
    const email = req.query["email"] as string;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const company = await Company.findOne({ email });
    if (!company) {
      res.status(404).json({ error: "No company found with this email" });
      return;
    }
    res.json(company);
  } catch (err: any) {
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
    const filter: Record<string, string> = { availability: "available" };
    if (req.query["category"]) filter["category"] = req.query["category"] as string;
    if (req.query["city"]) filter["city"] = req.query["city"] as string;
    const workers = await Worker.find(filter);
    res.json(workers);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
