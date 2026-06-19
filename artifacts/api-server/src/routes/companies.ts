import { Router } from "express";
import Company from "../models/Company.js";
import Worker from "../models/Worker.js";
import CompanyContact from "../models/CompanyContact.js";
import { CompanyRegisterSchema } from "../lib/validation.js";
import ensureCompanyApproved from "../middleware/companyApproval.js";

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
    console.log("[LOGIN ENDPOINT] Company fetched from MongoDB:", { companyId: company._id, status: company.status, email: company.email });
    console.log("[LOGIN ENDPOINT] Sending response to client:", JSON.stringify(company));
    res.json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/companies/:id", ensureCompanyApproved, async (req, res) => {
  try {
    // Ensure we send the latest company; approval middleware will enforce status
    const company = await Company.findById(req.params["id"]);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    console.log("[GET COMPANY ENDPOINT] Company fetched from MongoDB:", { companyId: company._id, status: company.status });
    console.log("[GET COMPANY ENDPOINT] Sending response to client:", JSON.stringify(company));
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

// Record that a company contacted a worker. Prevent duplicate entries within a short window.
router.post("/companies/:companyId/contact/:workerId", ensureCompanyApproved, async (req, res) => {
  try {
    const { companyId, workerId } = req.params as any;
    const { job = "", location = "" } = req.body || {};

    // Ensure worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }

    // Company object is attached by approval middleware
    const company = (req as any).company as any;
    if (!company) {
      res.status(400).json({ error: "Company information unavailable" });
      return;
    }

    // Reuse existing contact record for the same worker/company pair.
    // If found, update its fields and touch the updatedAt timestamp; otherwise create new.
    const existing = await CompanyContact.findOne({ workerId, companyId });
    if (existing) {
      existing.companyName = company.companyName || existing.companyName;
      existing.job = job || existing.job;
      existing.location = location || existing.location;
      existing.phone = company.phone || existing.phone;
      await existing.save(); // updates updatedAt
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
