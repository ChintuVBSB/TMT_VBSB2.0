// src/components/NotificationBell.jsx
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

const NotificationBell = ({ tasks }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const today = new Date().toDateString();
  const notifications = tasks.filter(task => {
    const due = new Date(task.due_date).toDateString();
    return due === today && task.status !== "Completed";
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell className="w-6 h-6 text-gray-600 hover:text-blue-600 transition" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white animate-ping" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border border-gray-200 rounded-lg z-50 p-4 space-y-2">
          <p className="font-semibold text-blue-700">Today’s Reminders</p>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks due today 🎉</p>
          ) : (
            notifications.map(task => (
              <div
                key={task._id}
                className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100"
              >
                <span className="font-medium">{task.title}</span> is due today!
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
