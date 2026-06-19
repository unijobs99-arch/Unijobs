import { Request, Response, NextFunction } from "express";
import Company from "../models/Company.js";
import { logger } from "../lib/logger.js";

/**
 * Middleware to enforce that a company (identified in params/body/query)
 * has status "approved". Looks for company id in:
 * - req.params.id
 * - req.params.companyId
 * - req.body.companyId
 * - req.query.companyId
 */
export default async function ensureCompanyApproved(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params && (req.params.id || (req.params as any).companyId)) || req.body?.companyId || req.query?.companyId;
    if (!id) {
      // Cannot enforce without a company id - treat as bad request
      logger.info({ route: req.path }, "company id not provided to approval middleware");
      res.status(400).json({ error: "Company id required", status: "" });
      return;
    }

    const company = await Company.findById(id);
    const status = company ? company.status : "";
    logger.info({ companyId: id, status }, "Company approval check");

    if (!company || company.status !== "approved") {
      res.status(403).json({ error: "Company approval required", status });
      return;
    }

    // attach fresh company object to request for downstream handlers if needed
    (req as any).company = company;
    next();
  } catch (err: any) {
    logger.error({ err }, "Error in company approval middleware");
    res.status(500).json({ error: err.message, status: "" });
  }
}
