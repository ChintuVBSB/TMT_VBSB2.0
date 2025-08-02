// ✅ 2. ClientServiceChart.jsx with filter
import { useEffect, useState, useContext } from "react";
import axios from "../../../services/api";
import { getToken } from "../../../utils/token";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
// import { ReportFilterContext } from "../../../context/ReportFilterContext";

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#14b8a6"];

const ClientServiceChart = ({ filters }) => {
  const [data, setData] = useState([]);
//   const { filters } = useContext(ReportFilterContext);

  const fetchData = async () => {
    try {
      const res = await axios.get("/reports/service-delivery", {
        params: filters,
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setData(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch client-wise service delivery:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <div className="bg-white border p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">📈 Client Service Delivery (Minutes)</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="minutes"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
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

export default ClientServiceChart;
