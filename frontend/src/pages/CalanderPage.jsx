import { useEffect, useState } from "react";
import axios from "../services/api";
import { getToken } from "../utils/token";
import CalendarView from "../components/CalendarView";
import StaffNavbar from "../components/navbars/StaffNavbar";

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/assign/tasks/my", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("❌ Failed to fetch tasks for calendar", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <>
    <StaffNavbar/>
    <div className="p-12 pt-24 h-screen">
      <h2 className="text-2xl font-bold mb-4">📅 My Calendar</h2>
      <CalendarView allTasks={tasks} />
    </div>
    </>
  );
};

export default CalendarPage;
