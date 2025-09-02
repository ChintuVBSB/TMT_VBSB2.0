import cron from "node-cron";
import Task from "../models/taskModel.js";
import sendTaskAssignedEmail from "../../utils/sendMail.js";
import User from "../models/user.js";

// ⏱ Utility: Get next recurring date based on frequency
function getNextRecurringDate(lastDate, frequency) {
  const next = new Date(lastDate);
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "3months":
      next.setMonth(next.getMonth() + 3);
      break;
    case "6months":
      next.setMonth(next.getMonth() + 6);
      break;
    case "annually":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return next;
}

// 🔁 Utility: Get updated due date for new task
function getNewDueDate(oldDueDate, frequency) {
  const newDue = new Date(oldDueDate);
  return getNextRecurringDate(newDue, frequency);
}

// 🕐 CRON JOB - Runs every midnight
 const setupRecurringTaskCron = () => {
  cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running cron job...");

  try {
    const recurringTasks = await Task.find({ recurring: true })
      .populate("assigned_to assigned_by client");

    console.log("📦 Found tasks:", recurringTasks.length);

    const today = new Date();

   for (const task of recurringTasks) {
  // agar lastRecurringDate missing hai to initialize karo
  if (!task.lastRecurringDate) {
    await Task.findByIdAndUpdate(task._id, { lastRecurringDate: today });
    continue;
  }

  const nextDate = getNextRecurringDate(task.lastRecurringDate, task.recurringFrequency);
  console.log(`🔍 Checking task ${task.title}: nextDate = ${nextDate}`);

  const isSameDayOrBefore = nextDate.setHours(0,0,0,0) <= today.setHours(0,0,0,0);

  if (isSameDayOrBefore) {
    // ✅ Create new recurring task
    const newTask = await Task.create({
      title: task.title,
      description: task.description,
      priority: task.priority,
      service_type: task.service_type,
      due_date: getNewDueDate(task.due_date, task.recurringFrequency),
      assigned_to: task.assigned_to._id,
      assigned_by: task.assigned_by._id,
      scheduled_date: new Date(),
      tags: task.tags,
      client: task.client?._id || null,
      attachments: task.attachments,
      recurring: true,
      recurringFrequency: task.recurringFrequency,
      lastRecurringDate: today,
    });

    console.log(`✅ Recurring task created: ${newTask.title}`);

    // 📩 Email
    if (task.assigned_to?.email) {
      try {
        await sendTaskAssignedEmail(task.assigned_to.email, task.title, newTask.due_date);
      } catch (mailErr) {
        console.error("❌ Failed to send task email:", mailErr.message);
      }
    }

    // Update lastRecurringDate
    await Task.findByIdAndUpdate(task._id, { lastRecurringDate: today });
  }
}

  } catch (error) {
    console.error("❌ Cron Job Error:", error);
  }
})}


export default setupRecurringTaskCron;