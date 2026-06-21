import { Router } from "express";
import bcrypt from "bcrypt";
import Company from "../models/Company.js";
import Worker from "../models/Worker.js";
import CompanyContact from "../models/CompanyContact.js";
import { CompanyRegisterSchema } from "../lib/validation.js";
import ensureCompanyApproved from "../middleware/companyApproval.js";

const router = Router();

router.post("/companies/register", async (req, res) => {
  try {
    const validated = CompanyRegisterSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const company = new Company({ ...validated, password: hashedPassword });
    await company.save();
    const { password: _, ...companyData } = company.toObject();
    res.status(201).json(companyData);
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

router.post("/companies/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const company = await Company.findOne({ email });
    if (!company) {
      res.status(404).json({ error: "No company found with this email" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, company.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const { password: _, ...companyData } = company.toObject();
    res.json(companyData);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/companies/:id", ensureCompanyApproved, async (req, res) => {
  try {
    const company = await Company.findById(req.params["id"]).select("-password");
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/companies/:id/workers", ensureCompanyApproved, async (req, res) => {
  try {
    const filter: Record<string, string> = { availability: "available" };
    if (req.query["category"]) filter["category"] = req.query["category"] as string;
    if (req.query["state"]) filter["state"] = req.query["state"] as string;
    if (req.query["city"]) filter["city"] = req.query["city"] as string;
    if (req.query["area"]) filter["area"] = req.query["area"] as string;
    const workers = await Worker.find(filter);
    res.json(workers);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/companies/:companyId/contact/:workerId", ensureCompanyApproved, async (req, res) => {
  try {
    const { companyId, workerId } = req.params as any;
    const { job = "", location = "" } = req.body || {};

    const worker = await Worker.findById(workerId);
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }

    const company = (req as any).company as any;
    if (!company) {
      res.status(400).json({ error: "Company information unavailable" });
      return;
    }

    const existing = await CompanyContact.findOne({ workerId, companyId });
    if (existing) {
      existing.companyName = company.companyName || existing.companyName;
      existing.job = job || existing.job;
      existing.location = location || existing.location;
      existing.phone = company.phone || existing.phone;
      await existing.save();
      res.json(existing);
      return;
    }

    const contact = new CompanyContact({
      workerId,
      companyId,
      companyName: company.companyName || "",
      job,
      location,
      phone: company.phone || "",
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;