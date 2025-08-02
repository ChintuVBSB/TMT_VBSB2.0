import { useEffect, useState } from "react";
import axios from "../../../services/api";
import { getToken } from "../../../utils/token";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TaskBucketChart = ({ filters }) => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("/reports/task-buckets", {
        params: filters,
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setData(res.data.report || []);
    } catch (err) {
      console.error("❌ Failed to fetch task bucket report:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <div className="bg-white border p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">🧺 Task Buckets Report (in Minutes)</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {/* ✅ Change count -> minutes */}
            <Bar dataKey="minutes" fill="#14b8a6" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TaskBucketChart;
