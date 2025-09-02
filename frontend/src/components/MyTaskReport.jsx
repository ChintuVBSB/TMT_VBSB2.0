// src/components/TaskCSVExport.jsx
import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import axios from "../services/api";
import { getToken } from "../utils/token";

const MyTaskReport = ({ apiEndpoint }) => {
  const [tasks, setTasks] = useState([]);
  const [viewRange, setViewRange] = useState("7");

  // Fetch tasks from given API
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`/reports/staff?range=${viewRange}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      // Assuming API returns tasks array in res.data.tasks
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const handleExportCSV = () => {
    if (!tasks || tasks.length === 0) return;

    const rows = [
      [
        "Task ID",
        "Title",
        "Description",
        "Status",
        "Priority",
        "Assigned By",
        "Assigned To",
        "Client",
        "Due Date",
        "Recurring",
        "Recurring Frequency",
        "Completed At",
      ],
      ...tasks.map((task) => [
        task._id,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.assigned_by?.name || "-",
        task.assigned_to?.name || "-",
        task.client?.name || "-",
        task.due_date ? new Date(task.due_date).toLocaleDateString() : "-",
        task.recurring ? "Yes" : "No",
        task.recurringFrequency || "-",
        task.completedAt
          ? new Date(task.completedAt).toLocaleString()
          : "Pending",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    fetchTasks();
  }, [viewRange, apiEndpoint]);

  return (
    <div className="flex flex-col flex-wrap gap-2 items-center">
      <div>
      <h1 className="font-semibold underline">My Task Report</h1>

      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setViewRange("7")}
          className={`px-4 py-2 rounded ${
            viewRange === "7"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setViewRange("30")}
          className={`px-4 py-2 rounded ${
            viewRange === "30"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Last 30 Days
        </button>
      </div>

      <button
        onClick={handleExportCSV}
        className="bg-blue-900 flex items-center gap-1 hover:bg-blue-800 text-white px-4 py-2 rounded"
      >
        Export CSV <Download size={16} />
      </button>
    </div>
  );
};

export default MyTaskReport;
