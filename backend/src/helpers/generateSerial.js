// helpers/generateSerial.js
import Task from "../models/taskModel.js";

export const generateTaskSerialNumber = async () => {
  const prefix = "TN";
  const latestTask = await Task.findOne().sort({ createdAt: -1 });

  let nextNumber = 1;

  // ⬇️ field name updated here
  if (latestTask?.taskId) {
    const numPart = parseInt(latestTask.taskId.replace(prefix, ""), 10);
    if (!isNaN(numPart)) {
      nextNumber = numPart + 1;
    }
  }

  const padded = String(nextNumber).padStart(4, "0");
  return `${prefix}${padded}`;
};
