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
    const worker = await Worker.findByIdAndUpdate(req.params["id"], req.body, {
      new: true,
      runValidators: true,
    });
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
