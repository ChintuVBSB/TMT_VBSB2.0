import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const AdminCalander = ({ allTasks = [] }) => {
  // Ensure every task has a valid date
  const events = allTasks
    .filter((task) => task.dueDate || task.createdAt)
    .map((task) => {
      const date = task.dueDate || task.createdAt;

      return {
        id: task._id,
        title: task.title,
        start: new Date(date), // ✅ must be valid Date object
        end: new Date(date),   // ✅ required even for single-day event
        allDay: true,
      };
    });

  return (
    <div className="h-[80vh] bg-white p-4 rounded shadow">
      <div className="flex w-full h-full items-center gap-5">

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: "80%", width: "70%"}}
      />
      <img className="h-[60%]" src="/undraw_calendar_8r6s.svg" alt="" />

        </div>
    </div>
  );
};

export default AdminCalander;  