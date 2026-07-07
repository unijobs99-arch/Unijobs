import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env["JWT_SECRET"];
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required but was not provided.");
}

type AuthPayload = {
  role?: string;
  workerId?: string;
};

export function workerAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret!) as AuthPayload;
    
    if (decoded.role === "admin") {
      next();
      return;
    }
    
    if (decoded.role === "worker" && decoded.workerId === req.params["id"]) {
      next();
      return;
    }

    res.status(403).json({ error: "Forbidden: Access is denied" });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
}
