import { Router } from "express";
import Worker from "../models/Worker.js";

const router = Router();

router.post("/workers/register", async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: "Phone or Aadhaar already registered" });
      return;
    }
    res.status(400).json({ error: err.message });
  }
});

router.get("/workers/login", async (req, res) => {
  try {
    const phone = req.query["phone"] as string;
    if (!phone) {
      res.status(400).json({ error: "Phone is required" });
      return;
    }
    const worker = await Worker.findOne({ phone });
    if (!worker) {
      res.status(404).json({ error: "No worker found with this phone number" });
      return;
    }
    res.json(worker);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/workers/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params["id"]);
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }
    res.json(worker);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/workers/:id", async (req, res) => {
  try {
    // Strip MongoDB/Mongoose internals that must not be set via update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, createdAt, updatedAt, ...updateData } = req.body;
    const worker = await Worker.findByIdAndUpdate(
      req.params["id"],
      updateData,
      { returnDocument: "after", runValidators: true },
    );
    if (!worker) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }
    res.json(worker);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
