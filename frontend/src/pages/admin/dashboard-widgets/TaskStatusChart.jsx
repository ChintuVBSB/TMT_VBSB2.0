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
  Legend,
  CartesianGrid,
} from "recharts";

const TaskStatusChart = ({ filters }) => {
  const [data, setData] = useState([]);

  const fetchStatusData = async () => {
    try {
      const res = await axios.get("/reports/task-status", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        params: {
          groupBy: filters?.groupBy || "user",
          from: filters?.fromDate,
          to: filters?.toDate,
        },
      });
      setData(res.data.report || []);
    } catch (err) {
      console.error("❌ Failed to fetch status report:", err);
    }
  };

  useEffect(() => {
    if (filters) fetchStatusData();
  }, [filters]);

  // ✅ Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-gray-700">
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Task Status Overview</h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No data to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Pending" stackId="a" fill="#facc15" radius={[4, 4, 0, 0]} />
            <Bar dataKey="In Progress" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TaskStatusChart;
