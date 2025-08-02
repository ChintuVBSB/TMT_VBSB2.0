// controllers/rewardController.js
import TimeLog from "../models/timeLog.model.js"; // assuming this tracks task logs
import User from "../models/user.js";

export const getMonthlyTopPerformer = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const logs = await TimeLog.aggregate([
      {
        $match: {
          status: "completed",
          completionDate: {
            $gte: new Date(`${currentYear}-${currentMonth + 1}-01`),
            $lt: new Date(`${currentYear}-${currentMonth + 2}-01`)
          }
        }
      },
      {
        $group: {
          _id: "$user", // or "$staffId"
          totalTasks: { $sum: 1 }
        }
      },
      { $sort: { totalTasks: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalTasks: 1
        }
      }
    ]);

    res.status(200).json(logs[0] || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching reward data", error: err.message });
  }
};
