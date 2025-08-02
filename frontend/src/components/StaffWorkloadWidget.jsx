// 📁 src/components/StaffWorkloadWidget.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api"; // 🔁 adjust your API path
import { getToken } from "../utils/token"; 

const StaffWorkloadWidget = () => {
  const [workloads, setWorkloads] = useState([]);
  const [range, setRange] = useState("week");

 const fetchWorkload = async (selectedRange) => {
  try {
    const token = getToken(); // 📥 token from localStorage/cookies

    const res = await axios.get(
      `/assign/staff/workload?range=${selectedRange}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setWorkloads(res.data);
  } catch (err) {
    console.error("Error loading workload", err);
  }
};

  useEffect(() => {
    fetchWorkload(range);
  }, [range]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Staff Workload</h2>
        <div className="space-x-2">
          <button
            className={`px-3 py-1 rounded ${
              range === "week" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setRange("week")}
          >
            This Week
          </button>
          <button
            className={`px-3 py-1 rounded ${
              range === "month" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setRange("month")}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workloads.map((w) => (
          <div key={w.staffId} className="border rounded p-4 shadow-sm">
            <h3 className="font-bold text-lg">{w.name}</h3>
            <p className="text-sm text-gray-500">{w.email}</p>
            <ul className="mt-2 text-sm">
              <li>📝 Total Tasks: {w.totalTasks}</li>
              <li>🚧 Active: {w.activeTasks}</li>
              <li>✅ Completed: {w.completedTasks}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffWorkloadWidget;
