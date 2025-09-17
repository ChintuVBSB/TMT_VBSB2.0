import cron from "node-cron";
import TimeLog from "../models/timeLogModel.js";
import MissedLog from "../models/missedLogModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js"; // apna email util

// Roz sham 5:30 baje chalega
cron.schedule("30 17 * * *", async () => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // saare staff users nikal lo
    const users = await User.find({ role: "staff" });

    for (const user of users) {
      // check karo user ka aaj ka time log
      const log = await TimeLog.findOne({
        user: user._id,
        working_date: {
          $gte: new Date(formattedDate + "T00:00:00.000Z"),
          $lte: new Date(formattedDate + "T23:59:59.999Z"),
        },
      });

      if (!log) {
        // agar missed log already entry nahi bani hai to create karo
        const exists = await MissedLog.findOne({ user: user._id, date: formattedDate });
        if (!exists) {
          await MissedLog.create({ user: user._id, date: formattedDate });

          // email bhejo staff ko
          await sendEmail(
            user.email,
            "Missed Log Alert",
            `You missed logging your work hours for ${formattedDate}. Please update your time entry.`
          );

          console.log(`Missed log alert sent to ${user.name} for ${formattedDate}`);
        }
      }
    }
  } catch (err) {
    console.error("Missed Log Cron Error:", err.message);
  }
});
