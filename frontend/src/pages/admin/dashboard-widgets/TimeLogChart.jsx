import { useEffect, useState, useContext } from "react";
import axios from "../../../services/api";
import { getToken } from "../../../utils/token";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// import { ReportFilterContext } from "../../../context/ReportFilterContext";

const TimeLogChart = ({ filters }) => {
  const [data, setData] = useState([]);
//   const { filters } = useContext(ReportFilterContext);

  const fetchData = async () => {
    try {
      const res = await axios.get("/reports/timelog-chart", {
        params: filters,
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setData(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch time log report:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <div className="bg-white border p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">🕒 Time Tracking</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="minutes" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TimeLogChart;
