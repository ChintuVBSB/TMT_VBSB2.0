import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },
    service_type: String,
    due_date: { type: Date },

    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "Rejected",
        "Overdue",
        "Remarked"
      ],
      default: "Pending"
    },

    subtasks: [
      {
        title: String,
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending"
        }
      }
    ],

    scheduled_date: { type: Date, default: Date.now },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client"
    },

    comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
    }],


    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    attachments: [
      {
        filename: String,
        fileUrl: String,
        uploadedAt: Date
      }
    ],

    reason: {
      type: String,
      default: ""
    },
    retryRequested: { type: Boolean, default: false },
    retryRequestedAt: {
      type: Date
    },

    remark: {
      type: String,
      default: ""
    },

    taskId: {
      type: String,
      unique: true,
      index: true
    },

    delayReason: {
      type: String,
      enum: ["Client Delay", "Staff Delay", "Technical Issue", ""],
      default: ""
    },

    recurring: {
      type: Boolean,
      default: false
    },

    reassign_remark: { type: String },
    reassigned_at: { type: Date },
    reassign_history: [
      {
        reassigned_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reassigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remark: String,
        date: Date
      }
    ],

    recurringFrequency: {
      type: String,
      enum: ["weekly", "monthly", "annually", "3months", "6months"],
      default: null
    },
    lastRecurringDate: {
      type: Date
    },

    // ✅ NEW: Action Logs
    logs: [
      {
        action: {
          type: String,
          enum: [
            "Assigned",
            "Accepted",
            "Rejected",
            "Reassigned",
            "Completed",
            "Retry Requested",
            "Delayed",
             "Reassigned by Staff",
          ]
        },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remark: String,
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
