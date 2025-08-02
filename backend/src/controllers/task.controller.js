import Task from "../models/taskModel.js";
import User from "../models/user.js";
import Client from "../models/client.js";
import sendTaskAssignedEmail from "../../utils/sendMail.js"; // we'll define this
import moment from "moment";
import { getOnlineUsers, getIO } from "../../utils/socketStore.js";
import { generateTaskSerialNumber } from "../helpers/generateSerial.js";
import Comment from "../models/comment.js";

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      service_type,
      due_date,
      assigned_to,
      scheduled_date,
      tags,
      client,
      recurring,
      recurringFrequency
    } = req.body;

    const foundClient = await Client.findById(client);
    if (!foundClient)
      return res.status(404).json({ message: "Client not found" });

    if (!due_date) {
      return res.status(400).json({ message: "Due date is required" });
    }

    const isRecurring = recurring === "true" || recurring === true;

    const frequency =
      isRecurring && recurringFrequency
        ? recurringFrequency.toLowerCase()
        : null;

    // 🔢 Serial Number Generate
    const serial_number = await generateTaskSerialNumber();

    let attachments = [];

    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        fileUrl: `${process.env.BASE_URL}/uploads/${req.file.filename}`,
        uploadedAt: new Date()
      });
    }

    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.originalname,
        fileUrl: `${process.env.BASE_URL}/uploads/${file.filename}`,
        uploadedAt: new Date()
      }));
    }

    const task = await Task.create({
      title,
      description,
      priority,
      service_type,
      due_date,
      assigned_to,
      scheduled_date,
      assigned_by: req.user.id,
      tags,
      client,
      attachments,
      recurring: isRecurring,
      recurringFrequency: frequency,
      lastRecurringDate: isRecurring ? new Date() : undefined,
      serial_number, // ✅ add this
      logs: [
        {
          action: "Assigned",
          by: req.user.id,
          to: assigned_to,
          message: "Task assigned",
          date: new Date()
        }
      ]
    });

    const assignee = await User.findById(assigned_to);
    if (assignee) {
      await sendTaskAssignedEmail(assignee.email, title, due_date);
    }

    return res.status(201).json({ message: "Task created & email sent", task });
  } catch (err) {
    console.error("Create Task Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const { status, priority, assigned_to, assigned_by, client, search, from } =
      req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigned_to) query.assigned_to = assigned_to;
    if (assigned_by) query.assigned_by = assigned_by;
    if (client) query.client = client;

    // Date filter
    if (from) {
      query.createdAt = { $gte: new Date(from) };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { tags: searchRegex },
        { description: searchRegex },
        { serial_number: searchRegex } // ✅ Now even serial no. is searchable!
      ];
    }

    const tasks = await Task.find(query)
      .populate("assigned_to", "name")
      .populate("assigned_by", "name email role")
      .populate("reassign_history.reassigned_by", "name email")
      .populate("client", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

export const createSubtask = async (req, res) => {
  try {
    const { title, description, parent_task } = req.body;

    if (!title || !parent_task) {
      return res
        .status(400)
        .json({ message: "Title and parent_task are required" });
    }

    const parent = await Task.findById(parent_task);
    if (!parent) {
      return res.status(404).json({ message: "Parent task not found" });
    }

    const subtask = await Task.create({
      title,
      description,
      assigned_to: parent.assigned_to,
      priority: parent.priority,
      due_date: parent.due_date,
      assigned_by: parent.assigned_by,
      status: "Pending",
      client: parent.client,
      parent_task
    });

    res.status(201).json(subtask);
  } catch (err) {
    console.error("Subtask creation error:", err);
    res.status(500).json({ message: "Server error while creating subtask" });
  }
};

export const addSubtaskToTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params; // id = main task id

    if (!title) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Main task not found" });

    task.subtasks.push({
      title,
      description,
      status: "Pending"
    });

    await task.save();
    res.status(200).json({ message: "Subtask added successfully", task });
  } catch (err) {
    console.error("Add subtask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const completeSubtask = async (req, res) => {
  const { taskId, index } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check if subtasks exist
    if (!Array.isArray(task.subtasks) || index >= task.subtasks.length) {
      return res.status(400).json({ message: "Subtask not found" });
    }

    // Mark the subtask as completed
    task.subtasks[index].status = "Completed";
    await task.save();

    res.status(200).json({ message: "Subtask marked as completed" });
  } catch (err) {
    console.error("Error completing subtask:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const { completedAfter } = req.query;

    const query = { assigned_to: userId };

    if (completedAfter) {
      query.status = "Completed";
      query.updatedAt = { $gte: new Date(completedAfter) };
    }

    const tasks = await Task.find(query)
      .populate("client", "name")
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email");

    res.status(200).json({ tasks });

    // Optional: Almost due logic (not used in response)
    // const now = new Date();
    // const next24hrs = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // const almostDueTasks = tasks.filter(
    //   (task) =>
    //     new Date(task.due_date) <= next24hrs && task.status !== "Completed"
    // );
  } catch (err) {
    console.error("Error in getMyTasks:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

//   try {
//     const userId = req.user._id || req.user.id; // 🛡️ middleware ne lagaya hai
//      const tasks = await Task.find({ assigned_to: userId })
//        .populate("client", "name")
//       .populate("assigned_to", "name email")
//       .populate("assigned_by", "name email"); // 👈 Yeh line add kari hai

//     res.status(200).json({ tasks });

//     const now = new Date();
//     const next24hrs = new Date(now.getTime() + 24 * 60 * 60 * 1000);

//     const almostDueTasks = tasks.filter(
//       (task) =>
//         new Date(task.due_date) <= next24hrs && task.status !== "Completed"
//     );
//   } catch (err) {
//     console.error("Error in getMyTasks:", err);
//     res.status(500).json({ message: "Failed to fetch tasks" });
//   }
// };

export const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 📝 Initialize logs if missing
    if (!task.logs) task.logs = [];

    // ➕ Push log entry
    task.logs.push({
      action: "Accepted",
      by: req.user.id,
      date: new Date(),
      message: `${req.user.role} accepted the task.`
    });

    // ✅ Update task status
    task.status = "In Progress";

    // 💾 Save the task
    await task.save();

    res.status(200).json({ message: "Task accepted", task });
  } catch (err) {
    console.error("Accept Task Error:", err);
    res.status(500).json({ message: "Failed to accept task" });
  }
};

export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Add log
    if (!task.logs) task.logs = [];

    task.logs.push({
      action: "Completed",
      by: req.user.id,
      date: new Date(),
      message: `${req.user.role} marked the task as completed.`
    });

    task.status = "Completed";
    await task.save();

    res.status(200).json({ message: "Task marked as completed", task });
  } catch (err) {
    console.error("Complete Task Error:", err);
    res.status(500).json({ message: "Failed to complete task" });
  }
};

export const getSingleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.status(200).json({ task });
  } catch (err) {
    res.status(500).json({ message: "Failed to get task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.status(200).json({ message: "Task updated", task: updatedTask });
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 📝 Add log entry before deletion
    if (!task.logs) task.logs = [];

    task.logs.push({
      action: "Deleted",
      by: req.user.id,
      date: new Date(),
      message: `${req.user.role} deleted the task.`
    });

    // Optional: You can save the log before deletion for record-keeping elsewhere (like audit collection)
    await task.save();

    // 🗑️ Delete the task
    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete Task Error:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

// controllers/taskController.js

export const rejectTask = async (req, res) => {
  const { taskId } = req.params;
  const { reason } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = "Rejected";
    task.reason = reason || "No reason provided";

    // 📜 Append rejection log
    if (!task.logs) task.logs = [];

    task.logs.push({
      action: "Rejected",
      by: req.user.id,
      date: new Date(),
      message: `${req.user.role} rejected the task. Reason: ${task.reason}`
    });

    await task.save();

    res.status(200).json({ message: "Task rejected successfully", task });
  } catch (err) {
    console.error("Reject Task Error:", err);
    res.status(500).json({ message: "Failed to reject task" });
  }
};

// PATCH /tasks/reassign/:taskId
export const reassignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newAssignee, remark } = req.body;
    const userId = req.user.id;

    // 1. Find the task
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 2. Find the new assignee
    const user = await User.findById(newAssignee);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. Update basic fields
    task.assigned_to = newAssignee;
    task.status = "Pending";
    task.retryRequested = false;

    // 4. Extend due date by 2 days
    const currentDue = new Date(task.due_date);
    currentDue.setDate(currentDue.getDate() + 2);
    task.due_date = currentDue;

    // 5. Save reassignment remark
    if (remark) {
      task.reassign_remark = remark;
      task.reassigned_at = new Date();
    }

    // 6. Push into reassignment history
    task.reassign_history = task.reassign_history || [];
    task.reassign_history.push({
      reassigned_by: userId,
      reassigned_to: newAssignee,
      remark: remark || "",
      date: new Date()
    });

    // 7. Push into logs[]
    task.logs = task.logs || [];
    task.logs.push({
      action: "Reassigned",
      by: userId,
      date: new Date(),
      message: `${req.user.role} reassigned task to ${user.name}${remark ? ` with remark: "${remark}"` : ""}`
    });

    // 8. Save task
    await task.save();

    // 9. Send email to new assignee
    await sendTaskAssignedEmail(user.email, task.title, task.due_date);

    res.status(200).json({ message: "Task reassigned successfully" });
  } catch (err) {
    console.error("Reassign Task Error:", err);
    res.status(500).json({ message: "Failed to reassign task" });
  }
};

export const addRemark = async (req, res) => {
  try {
    const { remark, delayReason } = req.body;
    const taskId = req.params.id;

    if (!remark || !remark.trim()) {
      return res.status(400).json({ error: "Remark is required." });
    }

    if (!delayReason || delayReason.trim() === "") {
      return res.status(400).json({ error: "Delay reason is required." });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    task.remark = remark;
    task.delayReason = delayReason;
    task.status = "Remarked";
    await task.save();

    res.json({ message: "Remark with reason added successfully." });
  } catch (err) {
    console.error("💥 addRemark Controller Error:", err);
    res.status(500).json({ error: "Server error." });
  }
};

export const getRemark = async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log("taskId 👉", taskId);

    const task = await Task.findById(taskId).select(
      "title remark status assigned_to due_date"
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json({
      success: true,
      remark: task.remark,
      taskTitle: task.title,
      status: task.status,
      assignedTo: task.assigned_to,
      dueDate: task.due_date
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

export const requestRetry = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID missing." });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.assigned_to) {
      return res
        .status(400)
        .json({ message: "Task is not assigned to anyone yet" });
    }

    const assignedId = task.assigned_to.toString();
    if (assignedId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to retry this task" });
    }

    if (task.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending tasks can be retried" });
    }

    if (task.retryRequested) {
      return res.status(400).json({ message: "Retry already requested" });
    }

    const { remark, delayReason } = req.body;

    task.retryRequested = true;
    task.retryRequestedAt = new Date();
    task.remark = remark;
    task.delayReason = delayReason;

    // Add log entry
    task.logs = task.logs || [];
    task.logs.push({
      action: "Retry Requested",
      by: userId,
      date: new Date(),
      message: `Retry requested with reason: ${delayReason || "N/A"} and remark: ${remark || "N/A"}`
    });

    await task.save();

    return res
      .status(200)
      .json({ message: "Retry request with remark submitted successfully" });
  } catch (err) {
    console.error("Retry request error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptRetryRequest = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { userId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.retryRequested) {
      return res
        .status(400)
        .json({ message: "No retry requested for this task" });
    }

    // Reactivate the task
    task.status = "Pending";
    task.retryRequested = false;
    task.retryRequestedAt = null;
    task.due_date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    task.assigned_to = userId;

    // Log the acceptance
    task.logs = task.logs || [];
    task.logs.push({
      action: "Retry Accepted",
      by: req.user.id,
      date: new Date(),
      message: `Retry accepted and task reassigned to user ${userId}`
    });

    await task.save();

    const user = await User.findById(userId);
    if (user) {
      await sendTaskAssignedEmail(user.email, task.title, task.due_date);
    }

    res
      .status(200)
      .json({ message: "Retry accepted and task reassigned", task });
  } catch (err) {
    console.error("Accept Retry Request Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /tasks/mine?type=recurring
export const getRecurringTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({
      assigned_to: userId,
      recurring: true
    })
      .populate("client", "name")
      .populate("assigned_by", "name")
      .populate("logs.by", "name role") // Populate logs if you want to show who did what
      .sort({ due_date: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error("❌ Failed to fetch recurring tasks:", error);
    res.status(500).json({ message: "Failed to fetch recurring tasks" });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();

    res.json({ message: "Status updated", task });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

// controllers/taskController.js

export const sendTaskReminder = async (req, res) => {
  try {
    const { taskId, staffId } = req.body;

    const onlineUsers = getOnlineUsers(); // 🧠 Map() instance
    const socketId = onlineUsers.get(staffId);

    console.log("📡 Sending reminder to:", staffId);
    console.log("🧾 Online users map:", Array.from(onlineUsers.entries()));

    if (!socketId) {
      return res
        .status(404)
        .json({ success: false, message: "User not online" });
    }

    getIO().to(socketId).emit("task:reminder", {
      message: "🔔 You have a task due today!",
      taskId
    });

    return res.json({ success: true, message: "Reminder sent" });
  } catch (err) {
    console.error("❌ Error sending reminder:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const reassignTaskByStaff = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newAssignee, remark } = req.body;

    if (!newAssignee || !remark) {
      return res
        .status(400)
        .json({ message: "New assignee and remark are required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ Only allow staff to reassign their own task
    if (
      req.user.role !== "staff" ||
      task.assigned_to.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to reassign this task" });
    }

    const newUser = await User.findById(newAssignee);
    if (!newUser)
      return res.status(404).json({ message: "Assignee user not found" });

    // 🛠 Update task
    task.assigned_to = newAssignee;
    task.status = "Pending";
    task.retryRequested = false;

    const due = new Date(task.due_date);
    due.setDate(due.getDate() + 3);
    task.due_date = due;

    task.reassign_remark = remark;
    task.reassigned_at = new Date();

    task.reassign_history = task.reassign_history || [];
    task.reassign_history.push({
      reassigned_by: req.user.id,
      reassigned_to: newAssignee,
      remark,
      date: new Date()
    });

    // 📝 Log entry
    task.logs = task.logs || [];
    task.logs.push({
      action: "Reassigned by Staff",
      by: req.user.id,
      date: new Date(),
      message: `Task reassigned to ${newUser.name} (${newUser.role}) by ${req.user.role}`
    });

    await task.save();

    // 📧 Notify new assignee
    await sendTaskAssignedEmail(newUser.email, task.title, task.due_date);

    res.status(200).json({ message: "Task successfully reassigned by staff" });
  } catch (err) {
    console.error("🔴 Staff Reassign Error:", err);
    res.status(500).json({ message: "Failed to reassign task" });
  }
};

export const getAllTaskLogs = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate("logs.by", "name role") // populate user info
      .populate("logs.to", "name role")
      .sort({ updatedAt: -1 });

    const allLogs = [];

    tasks.forEach((task) => {
      if (task.logs && task.logs.length > 0) {
        task.logs.forEach((log) => {
          allLogs.push({
            ...log._doc,
            taskId: task._id,
            taskTitle: task.title
          });
        });
      }
    });

    // Sort logs by date (latest first)
    allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ logs: allLogs });
  } catch (err) {
    console.error("Failed to fetch task logs:", err);
    res.status(500).json({ message: "Failed to fetch task logs" });
  }
};

export const getCommentsForTask = (async (req, res) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate("user", "name role") // Populate user's name and role
    .sort({ createdAt: "asc" }); // Show oldest comments first

  res.status(200).json(comments);
});

export const addCommentToTask = (async (req, res) => {
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Comment content cannot be empty.");
  }

  // Create the new comment
  const comment = new Comment({
    content,
    task: req.params.taskId,
    user: req.user.id // Assuming your auth middleware adds the user to the request
  });

  const createdComment = await comment.save();

  // Populate the user details before sending back the response
  const populatedComment = await Comment.findById(createdComment._id).populate(
    "user",
    "name role"
  );

  // Here you will emit the WebSocket event! (See Step 3)

  res.status(201).json(populatedComment);
});
 
