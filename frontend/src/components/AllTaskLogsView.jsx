import React, { useEffect, useState } from "react";
import axios from "../services/api";
import AdminNavbar from "../components/navbars/AdminNavbar";
import { getToken } from "../utils/token";

function AllTaskLogsView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/assign/tasks/logs", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">📜 All Task Logs</h1>

        {logs.length > 0 ? (
          <ul className="space-y-4 text-sm text-gray-700">
            {logs.map((log, index) => (
              <li
                key={index}
                className="border-l-4 border-blue-500 pl-4 bg-white shadow-sm rounded-md py-2"
              >
                <p className="text-sm font-medium">
                  <strong>{log?.by?.name || "Unknown"} ({log?.by?.role || "N/A"})</strong> ➝ <span className="text-blue-700">{log.action}</span>
                </p>

                <p className="text-gray-700 text-sm mt-1">
                  📝 <span className="font-semibold">Task:</span> {log.task?.title || "Untitled Task"}
                </p>

                {log?.to?.name && (
                  <p className="text-gray-600 text-sm">
                    👤 <span className="font-semibold">To:</span> {log.to.name} ({log.to.role})
                  </p>
                )}

                {log.message && (
                  <p className="text-gray-600 italic mt-1">{log.message}</p>
                )}

                <p className="text-gray-400 text-xs mt-2">
                  {new Date(log.date).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No logs found.</p>
        )}
      </div>
    </div>
  );
}

export default AllTaskLogsView;
