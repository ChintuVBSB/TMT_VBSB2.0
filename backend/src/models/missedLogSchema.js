import mongoose from "mongoose";

const missedLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  notified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("MissedLog", missedLogSchema);
