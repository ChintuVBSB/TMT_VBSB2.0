import mongoose from 'mongoose'

const timeLogSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  title: { type: String, required: true },
  working_date: { type: Date, required: true },
  task_bucket: { type: String, required: true },
  task_description: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  total_minutes: { type: Number, required: true },
  assigned_by: { type: String },
  status: { type: String, enum: ["Pending", "Completed","draft"], default: "Pending" },
  completion_date: { type: Date, default: "Pending" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
export default mongoose.model("TimeLog", timeLogSchema);