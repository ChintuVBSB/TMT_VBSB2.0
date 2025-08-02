import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
   sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

export default mongoose.model("ChatMessage", chatMessageSchema);