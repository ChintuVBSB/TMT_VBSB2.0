import { useEffect, useState } from "react";
import axios from "../../../services/api";
import { getToken } from "../../../utils/token";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#10b981", "#ef4444"]; // green and red

const SlaAdherenceChart = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("/reports/sla-adherence", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const report = res.data.report || {};

      setData([
        { label: "On Time", value: report.onTime || 0 },
        { label: "Late", value: report.late || 0 }
      ]);
    } catch (err) {
      console.error("Failed to fetch SLA adherence report:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white border p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">⏱ SLA Adherence</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SlaAdherenceChart;
