import mongoose from 'mongoose'
import { Parser } from "json2csv";
import timeLogModel from "../models/timeLog.model.js";
import User from "../models/user.js";
import Client from "../models/client.js";
import Task from "../models/taskModel.js";
import TaskBucket from "../models/taskBucket.model.js";
import ExcelJS from "exceljs";

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

 

// export const exportMISReport = async (req, res) => {
//   try {
//     const { from, to } = req.query;

//     const fromDate = from ? new Date(from) : new Date("2000-01-01");
//     const toDate = to ? new Date(to) : new Date();

//     // Fetch logs
//     const logs = await timeLogModel.find({
//       working_date: { $gte: fromDate, $lte: toDate }
//     }).lean();

//     const userIds = [...new Set(logs.map(l => l.user?.toString()))];
//     console.log("Logs Users:", logs.map(l => l.user));


//     const clientIds = [...new Set(logs.map(l => l.client))];
//     const taskIds = [...new Set(logs.map(l => l.task))];

//   const [users, clients, tasks] = await Promise.all([
//   User.find({ _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } })
//       .select("name")
//       .lean(),
//   Client.find({ _id: { $in: clientIds.map(id => new mongoose.Types.ObjectId(id)) } })
//       .select("name")
//       .lean(),
//   Task.find({ _id: { $in: taskIds.map(id => new mongoose.Types.ObjectId(id)) } })
//       .select("title status assigned_to")
//       .lean()
// ]);

    

//    console.log("users:", users); // Add this line before userMap
// const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]));
// console.log("userIds:", userIds);
// console.log(userMap);
//     const clientMap = Object.fromEntries(clients.map(c => [c._id.toString(), c.name]));
//     const taskMap = Object.fromEntries(tasks.map(t => [t._id.toString(), t]));

//     // Workbook and sheet
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("MIS Report");

//     // Header row
//     const headers = [
//       "User Name",
//       "Client Name",
//       "Task Title",
//       "Task Description",
//       "Task Bucket",
//       "Working Date",
//       "Start Time",
//       "End Time",
//       "Total Minutes",
//       "Completion Status"
//     ];
//     sheet.addRow(headers);

//     // Style header
//     sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
//     sheet.getRow(1).fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: "4472C4" } // blue background
//     };
//     sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };

//     // Data rows
//     logs.forEach((log, index) => {
//       const task = taskMap[log.task?.toString()] || {};
//       const completionStatus =
//         log.completion_date
//           ? new Date(log.completion_date).toISOString().split("T")[0]
//           : "Pending";

//       const row = [
//         userMap[log.user?.toString()] || "Unknown",
//         clientMap[log.client?.toString()] || "Unknown",
//         task?.title || log.title || "",
//         log.task_description || "",
//         log.task_bucket || "N/A",
//         log.working_date ? new Date(log.working_date).toISOString().split("T")[0] : "",
//         log.start_time || "",
//         log.end_time || "",
//         log.total_minutes || 0,
//         completionStatus
//       ];

//       const addedRow = sheet.addRow(row);

//       // Alternate row shading
//       if (index % 2 === 0) {
//         addedRow.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "F2F2F2" }
//         };
//       }
//     });

//     // Auto column width
//     sheet.columns.forEach(col => {
//       let maxLength = 15;
//       col.eachCell({ includeEmpty: true }, cell => {
//         const columnLength = cell.value ? cell.value.toString().length : 10;
//         if (columnLength > maxLength) maxLength = columnLength;
//       });
//       col.width = maxLength < 30 ? maxLength : 30;
//     });

//     // Send file
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", "attachment; filename=MIS_Report.xlsx");

//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (err) {
//     console.error("Excel Export Error:", err);
//     res.status(500).json({ message: "Failed to export MIS Report" });
//   }
// };

export const exportMISReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from) : new Date("2000-01-01");
    const toDate = to ? new Date(to) : new Date();

    // Fetch logs with populate
    const logs = await timeLogModel.find({
      working_date: { $gte: fromDate, $lte: toDate }
    })
      .populate("user", "name")     
      .populate("client", "name")    
      .lean();

    // Workbook and sheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("MIS Report");

    // Header row
    const headers = [
      "User Name",
      "Client Name",
      "Task Title",
      "Task Description",
      "Task Bucket",
      "Working Date",
      "Start Time",
      "End Time",
      "Total Minutes",
      "Completion Status"
    ];
    sheet.addRow(headers);

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" }
    };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };

    // Data rows
    logs.forEach((log, index) => {
      const completionStatus = log.completion_date
        ? new Date(log.completion_date).toISOString().split("T")[0]
        : "Pending";

      const row = [
        log.user?.name || "Unknown",
        log.client?.name || "Unknown",
        log.task?.title || log.title || "",
        log.task_description || "",
        log.task_bucket || "N/A",
        log.working_date ? new Date(log.working_date).toISOString().split("T")[0] : "",
        log.start_time || "",
        log.end_time || "",
        log.total_minutes || 0,
        completionStatus
      ];

      const addedRow = sheet.addRow(row);

      // Alternate row shading
      if (index % 2 === 0) {
        addedRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F2F2F2" }
        };
      }
    });

    // Auto column width
    sheet.columns.forEach(col => {
      let maxLength = 15;
      col.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      col.width = maxLength < 30 ? maxLength : 30;
    });

    // Send file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=MIS_Report.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).json({ message: "Failed to export MIS Report" });
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

          const clientName =
            typeof log.client === "string"
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

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Weekly Summary");

    // Headers
    const headers = [
      "User Name",
      "Period",
      "Days",
      "Expected Hours",
      "Worked Hours",
      "Major Task",
      "Task Time (hrs)",
      "Major Client",
      "Client Time (hrs)",
    ];
    sheet.addRow(headers);

    // Style headers
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "305496" }, // dark blue
    };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };

    // Data rows
    report.forEach((r, index) => {
      const row = [
        r.name,
        r.period,
        r.days,
        r.expected_worked_hours,
        r.worked_hours,
        r.major_task,
        r.major_task_time,
        r.major_client,
        r.major_client_time,
      ];

      const addedRow = sheet.addRow(row);

      // Alternate shading
      if (index % 2 === 0) {
        addedRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F2F2F2" }, // light gray
        };
      }
    });

    // Auto width
    sheet.columns.forEach((col) => {
      let maxLength = 15;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      col.width = maxLength < 40 ? maxLength : 40;
    });

    // Borders
    sheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=Weekly_Summary_${from}_to_${to}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).json({ message: "Failed to export Weekly Summary" });
  }
};



 