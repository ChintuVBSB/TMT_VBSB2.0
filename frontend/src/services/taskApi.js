import axios from "../services/api";
import { getToken } from "../utils/token";

const createTask = async (formData) => {
  return await axios.post("/assign/tasks", formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

// Fetch tasks
export const fetchTasks = async () => {
  const res = await axios.get("/assign/tasks", {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data.tasks;
};

export default createTask;
