 import { Parser } from "json2csv";
import timeLogModel from "../models/timeLog.model.js";
import User from "../models/user.js";
import Client from "../models/client.js";
import Task from "../models/taskModel.js";
import TaskBucket from "../models/taskBucket.model.js";

export const getStaffReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({ assigned_to: userId });

    const statusCount = {
      completed: 0,
      pending: 0,
      recurring: 0
    };

    const weeklyMap = {};
    const monthlyMap = {};

    const now = new Date();

    tasks.forEach(task => {
      const status = (task.status || "").toLowerCase();

      // Status Counter
      if (status === "completed") statusCount.completed++;
      else if (status === "pending" || status === "in progress") statusCount.pending++;

      // Recurring = task not yet accepted (still To Do)
      if (status === "to do" || status === "todo") statusCount.recurring++;

      // Weekly (by day name)
      const day = new Date(task.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      weeklyMap[day] = (weeklyMap[day] || 0) + 1;

      // 🗓 Monthly (by Week number)
      const created = new Date(task.createdAt);
      const weekNum = Math.ceil(created.getDate() / 7); // 1–4
      const key = `Week ${weekNum}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });

    // Convert maps to arrays
    const weeklyChart = Object.entries(weeklyMap).map(([day, count]) => ({ day, count }));
    const monthlyChart = Object.entries(monthlyMap).map(([week, count]) => ({ week, count }));

    res.json({
      statusCount,
      weeklyChart,
      monthlyChart,
      total: tasks.length
    });

  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ message: "Failed to fetch staff report" });
  }
};

 
//Admin dashboard controllers
 

export const getTaskStatusReport = async (req, res) => {
  try {
    const { groupBy = "user", from, to } = req.query;

    const fromDate = from ? new Date(from) : new Date("2000-01-01");
    const toDate = to ? new Date(to) : new Date();

    const match = {
      createdAt: { $gte: fromDate, $lte: toDate }
    };

    const groupField = {
      user: "$assigned_to",
      client: "$client",
      task_bucket: "$task_bucket"
    }[groupBy];

    const lookupInfo = {
      user: { from: "users", localField: "_id", foreignField: "_id", as: "info" },
      client: { from: "clients", localField: "_id", foreignField: "_id", as: "info" },
      task_bucket: { from: "taskbuckets", localField: "_id", foreignField: "_id", as: "info" }
    };

    const report = await Task.aggregate([
      { $match: match },

      {
        $group: {
          _id: { [groupBy]: groupField, status: "$status" },
          count: { $sum: 1 }
        }
      },

      {
        $group: {
          _id: `$_id.${groupBy}`,
          data: { $push: { k: "$_id.status", v: "$count" } }
        }
      },

      {
        $project: {
          _id: 1,
          statusData: { $arrayToObject: "$data" }
        }
      },

      { $lookup: lookupInfo[groupBy] },

      {
        $project: {
          _id: 0,
          name: { $arrayElemAt: ["$info.name", 0] },
          ...Object.fromEntries(
            ["Pending", "Completed", "Rejected", "In Progress"].map((status) => [
              status,
              { $ifNull: [`$statusData.${status}`, 0] }
            ])
          )
        }
      }
    ]);

    res.status(200).json({ success: true, report });
  } catch (err) {
    console.error("getTaskStatusReport error:", err);
    res.status(500).json({ message: "Failed to generate task status report" });
  }
};




export const getClientServiceReport = async (req, res) => {
  try {
    const logs = await timeLogModel.find().populate("client", "name");

    const report = {};

    logs.forEach((log) => {
      const clientName = log.client?.name || "Unknown";
      if (!report[clientName]) {
        report[clientName] = 0;
      }
      report[clientName] += log.total_minutes || 0;
    });

    const formatted = Object.entries(report).map(([name, minutes]) => ({
      name,
      minutes,
    }));

    res.json({ report: formatted });
  } catch (err) {
    console.error("Client service report error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// GET /api/reports/timelog-chart
export const getTimeLogChartData = async (req, res) => {
  try {
    const result = await timeLogModel.aggregate([
      {
        $group: {
          _id: "$user",
          totalMinutes: { $sum: "$total_minutes" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          minutes: "$totalMinutes",
          _id: 0
        }
      }
    ]);

    res.status(200).json({ report: result });
  } catch (err) {
    console.error("⛔ Timelog Chart Error:", err);
    res.status(500).json({ message: "Failed to fetch timelog chart data" });
  }
};


// GET /api/reports/task-priority
export const getTaskPriorityReport = async (req, res) => {
  try {
    const report = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, report });
  } catch (err) {
    console.error("Task Priority Report Error:", err);
    res.status(500).json({ message: "Failed to generate priority report" });
  }
};

// GET /api/reports/sla-adherence
export const getSlaAdherenceReport = async (req, res) => {
  try {
    const tasks = await Task.find({ status: "Completed", due_date: { $exists: true } });

    const report = {
      onTime: 0,
      late: 0,
    };

    tasks.forEach(task => {
      const dueDate = new Date(task.due_date);
      const updatedAt = new Date(task.updatedAt); // assuming this is task completion

      if (updatedAt <= dueDate) {
        report.onTime += 1;
      } else {
        report.late += 1;
      }
    });

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("SLA Adherence Report Error:", error);
    res.status(500).json({ message: "Failed to generate SLA adherence report" });
  }
};



// GET /api/reports/task-buckets
export const getTaskBucketReport = async (req, res) => {
  try {
    // Count total minutes per task bucket
    const report = await timeLogModel.aggregate([
      {
        $group: {
          _id: "$task_bucket", // bucket name
          minutes: { $sum: "$total_minutes" },
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          minutes: 1
        }
      },
      { $sort: { minutes: -1 } }
    ]);

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("Task Bucket Report Error:", error);
    res.status(500).json({ message: "Failed to generate task bucket report" });
  }
};

 
//     const { from, to, groupBy = "user", format = "csv" } = req.query;

//     const fromDate = from ? new Date(from) : new Date("2000-01-01");
//     const toDate = to ? new Date(to) : new Date();

//     const match = {
//       createdAt: { $gte: fromDate, $lte: toDate },
//     };

//     const logs = await timeLogModel.find(match)
//       .populate("user", "name")
//       .populate("client", "name")
//       .sort({ createdAt: -1 });

//     const rows = logs.map((log) => ({
//       User: log.user?.name || "-",
//       Client: log.client?.name || "-",
//       Bucket: log.task_bucket || "-",
//       Description: log.task_description,
//       Status: log.status,
//       AllottedDate: log.allotted_date?.toISOString().slice(0, 10) || "",
//       CompletionDate: log.completion_date?.toISOString().slice(0, 10) || "",
//       Minutes: log.total_minutes,
//     }));

//     if (format === "csv") {
//       const parser = new Parser();
//       const csv = parser.parse(rows);
//       res.header("Content-Type", "text/csv");
//       res.attachment(`MIS-Report-${Date.now()}.csv`);
//       return res.send(csv);
//     }

//     res.status(400).json({ message: "Unsupported format" });
//   } catch (err) {
//     console.error("MIS Export Error:", err);
//     res.status(500).json({ message: "Failed to export MIS report" });
//   }
// };

export const exportMISReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from) : new Date("2000-01-01");
    const toDate = to ? new Date(to) : new Date();

    // Fetch all logs in given date range
    const logs = await timeLogModel.find({
      working_date: { $gte: fromDate, $lte: toDate }
    }).lean();

    // Get unique user and client IDs
    const userIds = [...new Set(logs.map(log => log.user))];
    const clientIds = [...new Set(logs.map(log => log.client))];
    const taskIds = [...new Set(logs.map(log => log.task))]; // optional if used

    // Fetch user, client, and task info
    const [users, clients, tasks] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select("name").lean(),
      Client.find({ _id: { $in: clientIds } }).select("name").lean(),
      Task.find({ _id: { $in: taskIds } }).select("title status assigned_to").lean()
    ]);

    // Create lookup maps
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]));
    const clientMap = Object.fromEntries(clients.map(c => [c._id.toString(), c.name]));
    const taskMap = Object.fromEntries(tasks.map(t => [t._id.toString(), t]));

    // Enrich and format logs
    const enriched = logs.map(log => {
      const userName = userMap[log.user?.toString()] || "Unknown";
      const clientName = clientMap[log.client?.toString()] || "Unknown";
      const task = taskMap[log.task?.toString()] || {};

      return {
        "User Name": userName,
        "Client Name": clientName,
        "Task Title": task?.title || log.title || "",
        "Task Description": log.task_description || "",
        "Task Bucket": log.task_bucket || "N/A", // ✅ fixed here
        "Working Date": log.working_date?.toISOString().split("T")[0],
        "Start Time": log.start_time,
        "End Time": log.end_time,
        "Total Minutes": log.total_minutes,
        "Task Status": task?.status || log.status || "N/A",
        "Completion Date": log.completion_date?.toISOString().split("T")[0] || ""
      };
    });

    // Convert to CSV
    const csv = new Parser().parse(enriched);
    res.header("Content-Type", "text/csv");
    res.attachment("MIS_Report.csv");
    return res.send(csv);

  } catch (err) {
    console.error("CSV Export Error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};



export const exportWeeklySummaryCSV = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = new Date(new Date(from).setHours(0, 0, 0, 0));
    const toDate = new Date(new Date(to).setHours(23, 59, 59, 999));

    // Fetch users
    const users = await User.find({ role: "staff" });

    const report = await Promise.all(
      users.map(async (user) => {
        const logs = await timeLogModel.find({
          user: user._id,
          working_date: { $gte: fromDate, $lte: toDate },
        });

        const totalMinutes = logs.reduce((acc, curr) => acc + curr.total_minutes, 0);

        // Group by task and client
        const taskTotals = {};
        const clientTotals = {};

        for (const log of logs) {
         
          const bucket = log.task_bucket || "N/A";
          taskTotals[bucket] = (taskTotals[bucket] || 0) + log.total_minutes;

          const clientName = typeof log.client === "string"
            ? log.client
            : (await Client.findById(log.client))?.name || "N/A";

          clientTotals[clientName] = (clientTotals[clientName] || 0) + log.total_minutes;
        }

        const majorTask = Object.entries(taskTotals).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
        const majorClient = Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

        return {
          name: user.name,
          period: `${from} to ${to}`,
          days: 6,
          expected_worked_hours: 42.5,
          worked_hours: (totalMinutes / 60).toFixed(2),
          major_task: majorTask[0],
          major_task_time: (majorTask[1] / 60).toFixed(2),
          major_client: majorClient[0],
          major_client_time: (majorClient[1] / 60).toFixed(2),
        };
      })
    );

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(report);

    res.header("Content-Type", "text/csv");
    res.attachment(`weekly-summary-${from}-to-${to}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("CSV Export Error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};



 