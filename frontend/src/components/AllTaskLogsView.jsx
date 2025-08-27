import React, { useEffect, useState } from "react";
import axios from "../services/api";
import AdminNavbar from "../components/navbars/AdminNavbar";
import { getToken } from "../utils/token";
import {
  ScrollText,
  UserPlus,
  CheckCircle2,
  XCircle,
  Repeat,
  AlertTriangle,
  Send,
  UserCheck,
} from "lucide-react";
import LogSkelton from "../components/skeletons/LogSkeleton"

// A simple loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
  </div>
);

// Map log actions to icons for better visual feedback
const logIcons = {
  Assigned: <UserPlus className="text-blue-500" />,
  Accepted: <UserCheck className="text-teal-500" />,
  Completed: <CheckCircle2 className="text-green-500" />,
  Rejected: <XCircle className="text-red-500" />,
  Reassigned: <Repeat className="text-orange-500" />,
  "Retry Requested": <AlertTriangle className="text-yellow-500" />,
  Delayed: <Send className="text-purple-500" />,
  default: <ScrollText className="text-gray-500" />,
};

function AllTaskLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/assign/tasks/logs", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        
        // ✅ FIXED: Sort logs to show the latest on top
        const sortedLogs = (res.data.logs || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        
        setLogs(sortedLogs);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto pt-28 pb-10 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <ScrollText size={28} /> All Activity Logs
        </h1>

        {loading ? (
          <LogSkelton/>
        ) : (
          // ✅ FIXED: Scrollable container for the log list
          <div className="max-h-[75vh] overflow-y-auto bg-white p-4 rounded-lg shadow-md border border-gray-200">
            {logs.length > 0 ? (
              <ul className="space-y-5">
                {logs.map((log) => (
                  <li
                    key={log._id} // Use a unique ID from the data if available
                    className="flex gap-4 items-start border-b pb-4 last:border-b-0"
                  >
                    {/* Icon Column */}
                    <div className="mt-1">
                        {logIcons[log.action] || logIcons.default}
                    </div>

                    {/* Content Column */}
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">
                        {log.action}
                      </p>
                      
                     <p className="text-sm text-gray-600 mt-1">
                      Task:{" "}
                      {/* --- UPDATE 2: Deleted Task ko handle karne ka final logic --- */}
                      <span className="font-medium text-gray-900">
                        {log.task?.title || log.taskTitle || "Task (Deleted)"}
                      </span>
                    </p>

                      <p className="text-sm text-gray-500">
                        by <strong className="text-gray-700">{log.by?.name || "Unknown User"}</strong>
                        {log.to?.name && (
                          <>
                            {' to '}<strong className="text-gray-700">{log.to.name}</strong>
                          </>
                        )}
                      </p>

                      {log.remark && (
                        <p className="text-sm text-gray-500 italic mt-2 p-2 bg-gray-50 rounded-md border">
                          "{log.remark}"
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(log.date).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-10 text-gray-500">No logs found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllTaskLogsView;