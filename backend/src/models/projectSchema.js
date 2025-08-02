import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    assignedDate: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },

    // Assigned By (Manager/Admin)
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Team Details
    staffs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],   // All team members
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },       // Team leader

    //Milestones
    milestones: [
      {
        title: String,
        dueDate: Date,
        completed: { type: Boolean, default: false },
        completedAt: Date,
        completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remark: String,
      }
    ],

    // File attachments
    attachments: [String], // file URLs or paths

    serial_number: {
      type: String,
      unique: true,
      index: true
    },


    // Final status
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
