// helpers/generateSerial.js
import Task from "../models/taskModel.js";

export const generateTaskSerialNumber = async () => {
  const prefix = "TN";
  const latestTask = await Task.findOne().sort({ createdAt: -1 });

  let nextNumber = 1;

  if (latestTask?.serial_number) {
    const numPart = parseInt(latestTask.serial_number.replace(prefix, ""), 10);
    if (!isNaN(numPart)) {
      nextNumber = numPart + 1;
    }
  }

  const padded = String(nextNumber).padStart(4, "0");
  return `${prefix}${padded}`;
};
