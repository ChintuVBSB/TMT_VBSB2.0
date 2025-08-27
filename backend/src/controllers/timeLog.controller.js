  import TimeLog from "../models/timeLog.model.js";
  import Task from "../models/taskModel.js"
  import timeLogModel from "../models/timeLog.model.js";
  import { Parser } from "json2csv";

export const addTimeLog = async (req, res) => {
  try {
    const {
      client,
      title,
      working_date,
      task_bucket,
      task_description,
      start_time,
      end_time,
      assigned_by,
      allotted_date,
      status,
      completion_date,
    } = req.body;

   const userId = mongoose.Types.ObjectId(req.user._id || req.user.id);


    // Convert to actual time objects
    const start = new Date(`1970-01-01T${start_time}:00`);
    const end = new Date(`1970-01-01T${end_time}:00`);
    const total_minutes = (end - start) / (1000 * 60);

    // 💥 Overlap Check
    const existingLogs = await TimeLog.find({
      user: userId,
      working_date, // Only check logs of the same date
      $or: [
        {
          start_time: { $lt: end_time },  // Existing log starts before new end
          end_time: { $gt: start_time },  // and ends after new start => Overlap
        },
        {
          start_time: { $gte: start_time, $lt: end_time }, // exact inside case
        },
        {
          end_time: { $gt: start_time, $lte: end_time },
        },
      ],
    });

    if (existingLogs.length > 0) {
      return res
        .status(400)
        .json({ message: "❌ Time log overlaps with an existing entry." });
    }

    // ✅ Create the new log if no conflict
    const log = await TimeLog.create({
      client,
      title,
      working_date,
      task_bucket,
      task_description,
      start_time,
      end_time,
      total_minutes,
      assigned_by,
      allotted_date,
      status: completion_date ? "Completed" : "Pending",
      completion_date,
      user: userId,
    });

    res.status(201).json({ message: "✅ Log saved successfully", log });
  } catch (err) {
    console.error("Error saving log:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





  export const getTimeLogsByUser = async (req, res) => {
    try {
      console.log("Fetching logs for user:", req.user.id); // ✅ Add this

      
    } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).json({ message: "Server error" });
    }
  };


export const saveDraftTimeLog = async (req, res) => {
  try {
    const {
      working_date,
      start_time,
      end_time,
    } = req.body;

    const userId = req.user.id;

    // Convert time to Date objects (for same-day comparison)
    const start = new Date(`1970-01-01T${start_time}:00`);
    const end = new Date(`1970-01-01T${end_time}:00`);

    // 🔒 Check for overlap with any logs of same user on same day
    const existingLogs = await TimeLog.find({
      user: userId,
      working_date,
      $or: [
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time },
        },
        {
          start_time: { $gte: start_time, $lt: end_time },
        },
        {
          end_time: { $gt: start_time, $lte: end_time },
        },
      ],
    });

    if (existingLogs.length > 0) {
      return res.status(400).json({
        message: "Overlapping time log exists. Draft not saved.",
      });
    }

    // ✅ Save Draft
    const log = await TimeLog.create({
      ...req.body,
      user: userId,
      status: "draft",
    });

    res.status(201).json(log);
  } catch (err) {
    console.error("Error saving draft log:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


  export const getDraftLogs = async (req, res) => {
    const logs = await TimeLog.find({ user: req.user.id, status: "draft" });
    res.json(logs);
  };


  export const submitAllLogs = async (req, res) => {
    await TimeLog.updateMany(
      { user: req.user.id, status: "draft" },
      { $set: { status: "submitted" } }
    );
    res.json({ message: "All logs submitted" });
  };



  // Update Draft
  export const updateDraftLog = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedLog = await timeLogModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatedLog);
    } catch (err) {
      res.status(500).json({ message: "Failed to update draft log" });
    }
  };

  //Delete Draft
  export const deleteDraftLog = async (req, res) => {
    try {
      const { id } = req.params;
      await timeLogModel.findByIdAndDelete(id);
      res.json({ message: "Draft log deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete draft log" });
    }
  };


 

export const exportTimeLogsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const logs = await TimeLog.find({
      user: userId,
      working_date: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
      status: { $ne: "draft" },
      
    }).populate('client', 'name')
    .lean();

    console.log(logs)

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No logs found in given range" });
    }

    // 🧠 Fetch all related task details
    const taskIds = logs.map((log) => log.task).filter(Boolean);
    const tasks = await Task.find({ _id: { $in: taskIds } })
      .select("title description updatedAt status")
      .lean();

    const taskMap = {};
    tasks.forEach((task) => {
      taskMap[task._id.toString()] = task;
    });

    // 🔁 Format logs for CSV
    const formatted = logs.map((log) => {
      const task = taskMap[log.task?.toString()] || {};

      const formatTime = (time) =>
        typeof time === "string"
          ? time
          : new Date(time).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });

      return {
        working_date: new Date(log.working_date).toISOString().split("T")[0],
        title: task.title || log.title || "",
        task_description: task.description || log.task_description || "",
        start_time: formatTime(log.start_time),
        end_time: formatTime(log.end_time),
        total_minutes: log.total_minutes,
       completion_date: log.completion_date ?
      new Date(log.completion_date).toISOString().split("T")[0] :
      "Pending",
      client: log.client.name ? log.client.name : "N/A",
      task_bucket: log.task_bucket || "",
      assigned_by: log.assigned_by || "",
      };
      

    
    });

    // 🧾 Fields to export
    const fields = [
      "working_date",
      "title",
      "task_description",
      "start_time",
      "end_time",
      "total_minutes",
      "completion_date",
      "client",
      "task_bucket",
      "assigned_by"
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment(`TimeLogs-${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("CSV export failed", err);
    res.status(500).json({ message: "Server error" });
  }
};
