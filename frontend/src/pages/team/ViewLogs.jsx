import { useState } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import StaffNavbar from "../../components/navbars/StaffNavbar";

export default function ViewLogs() {
  const [date, setDate] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!date) return alert("Please select a date");
    try {
      setLoading(true);
      const res = await axios.get(`/timelog/${date}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLogs(res.data);
      console.log(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StaffNavbar />
      <div className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
          View Past Logs
        </h2>

        {/* Date Picker + Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded-md w-full sm:w-auto"
          />
          <button
            onClick={fetchLogs}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            Fetch Logs
          </button>
        </div>

        {/* Loading */}
        {loading && <p className="text-center">Loading logs...</p>}

        {/* Responsive Logs */}
        {logs.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Client</th>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Task</th>
                    <th className="p-2 border">Start</th>
                    <th className="p-2 border">End</th>
                    <th className="p-2 border">Minutes</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="p-2 border">{log.client?.name || "-"}</td>
                      <td className="p-2 border">{log.title}</td>
                      <td className="p-2 border">{log.task_description}</td>
                      <td className="p-2 border">{log.start_time}</td>
                      <td className="p-2 border">{log.end_time}</td>
                      <td className="p-2 border">{log.total_minutes}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            log.status === "draft"
                              ? "bg-yellow-200 text-yellow-800"
                              : log.status === "Completed"
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="border rounded-lg p-4 shadow-sm bg-white"
                >
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Client:</span>{" "}
                    {log.client?.name || "-"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Title:</span> {log.title}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Task:</span>{" "}
                    {log.task_description}
                  </p>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs">
                      ⏱ {log.start_time} - {log.end_time}
                    </p>
                    <p className="text-xs">{log.total_minutes} min</p>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        log.status === "draft"
                          ? "bg-yellow-200 text-yellow-800"
                          : log.status === "Completed"
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          !loading && (
            <p className="text-center text-gray-500">No logs found for this date.</p>
          )
        )}
      </div>
    </>
  );
}
