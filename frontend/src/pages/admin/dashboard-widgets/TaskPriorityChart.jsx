// 📂 src/pages/admin/dashboard-widgets/TaskPriorityChart.jsx
import { useEffect, useState } from "react";
import axios from "../../../services/api";
import { getToken } from "../../../utils/token";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const TaskPriorityChart = () => {
  const [data, setData] = useState([]);

  const fetchPriorityData = async () => {
    try {
      const res = await axios.get("/reports/task-priority", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setData(res.data.report || []);
    } catch (err) {
      console.error("❌ Failed to fetch task priority report:", err);
    }
  };

  useEffect(() => {
    fetchPriorityData();
  }, []);

  // ✅ Stylish Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-md p-3 text-sm">
          <p className="font-medium mb-1">Priority: {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-gray-700">
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 Task Priority Overview</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              animationDuration={600}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TaskPriorityChart;
