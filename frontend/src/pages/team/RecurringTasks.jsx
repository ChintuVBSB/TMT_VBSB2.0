import { useEffect, useState } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import StaffNavbar from "../../components/navbars/StaffNavbar";
import { Calendar, RefreshCw } from "lucide-react";

const RecurringTasks = () => {
  const [tasks, setTasks] = useState([]);

  const fetchRecurringTasks = async () => {
    try {
      const res = await axios.get("/tasks/recurring", {
          
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        console.log("Calling GET /tasks/recurring");``
      console.log("Recurring Tasks", res.data);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch recurring tasks", err);
    }
  };

  useEffect(() => {
    fetchRecurringTasks();
  }, []);

  return (
    <>
      <StaffNavbar />
      <div className="pt-20 px-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Recurring Tasks</h1>

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <img
              src="/undraw_stars_5pgw.svg"
              alt="No Recurring Tasks"
              className="w-52 mx-auto opacity-80 mb-4"
            />
            <p>No recurring tasks assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {task.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {task.description || "No description"}
                </p>

                <div className="text-sm text-gray-500 space-y-1">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} />
                    Due Date:{" "}
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <RefreshCw size={16} />
                    Frequency: {task.recurringFrequency || "N/A"}
                  </p>
                </div>

                <div className="mt-3 text-xs text-right text-gray-400">
                  Last Generated:{" "}
                  {task.lastRecurringDate
                    ? new Date(task.lastRecurringDate).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RecurringTasks;
