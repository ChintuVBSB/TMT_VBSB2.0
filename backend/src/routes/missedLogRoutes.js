import express from "express";
import MissedLog from "../models/missedLogSchema.js";

const router = express.Router();

// Get all missed logs (manager/admin view)
router.get("/", async (req, res) => {
  try {
    const logs = await MissedLog.find().populate("user", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching missed logs" });
  }
});

// Resolve a missed log (jab user update kar deta hai apna time log)
router.delete("/:id", async (req, res) => {
  try {
    await MissedLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Missed log resolved" });
  } catch (err) {
    res.status(500).json({ message: "Error resolving missed log" });
  }
});

export default router;
