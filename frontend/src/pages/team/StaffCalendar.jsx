// src/pages/calendar/StaffCalendar.jsx
import { useEffect, useState } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import StaffNavbar from "../../components/navbars/StaffNavbar";

function StaffCalendar() {
  const [events, setEvents] = useState([]);

  const fetchMyCalendarTasks = async () => {
    try {
      const res = await axios.get("/assign/tasks/calendar", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const myTasks = res.data.tasks.map((task) => ({
        id: task._id,
        title: task.title,
        date: task.due_date,
      }));

      setEvents(myTasks);
    } catch (err) {
      console.error("Error fetching calendar tasks", err);
    }
  };

  useEffect(() => {
    fetchMyCalendarTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">📅 My Task Calendar</h1>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
}

export default StaffCalendar;
