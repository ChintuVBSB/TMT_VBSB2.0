import express from 'express'

import chatModel from "../models/chatModel.js";
import chatMessage from "../models/chatMessage.js"

const router = express.Router();

router.get("/:projectId/chat", async (req, res) => {
  try {
    const chats = await chatModel.find({ project: req.params.projectId }).populate("sender", "name role");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// routes/chatRoutes.js
router.get('/:projectId', async (req, res) => {
  try {
    const messages = await chatMessage.find({ projectId: req.params.projectId })
      .populate({
        path: "sender",
        select: "name role" // ✅ Only return name and role
      })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Chat fetch error:", error);
    res.status(500).json({ message: "Failed to fetch chat messages" });
  }
});


export default router;