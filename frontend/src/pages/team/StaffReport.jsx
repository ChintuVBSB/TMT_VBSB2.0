// src/pages/staff/StaffReport.jsx
import { useEffect, useState } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import { Bar, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Download } from "lucide-react";
import StaffNavbar from "../../components/navbars/StaffNavbar";
import { useNavigate, useLocation } from "react-router-dom";

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function StaffReport() {
  const navigate = useNavigate();


  const [report, setReport] = useState({
    weeklyChart: [],
    monthlyChart: [],
    statusCount: { completed: 0, pending: 0, recurring: 0 },
  });
  const [viewRange, setViewRange] = useState("7");

  const fetchReport = async () => {
    try {
      const res = await axios.get(`/reports/staff?range=${viewRange}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching report", err);
    }
  };

  const handleExportPDF = async () => {
    const input = document.getElementById("report-container");
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("task_report.pdf");
  };

  const handleExportCSV = () => {
    const rows = [
      ["Task Type", "Count"],
      ["Completed", report.statusCount.completed],
      ["Pending", report.statusCount.pending],
      ["Recurring", report.statusCount.recurring],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "task_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    fetchReport();
  }, [viewRange]);

  return (
    <>
      <StaffNavbar />
      <div
        className="p-6 pt-20 max-w-6xl mx-auto text-gray-800 space-y-8"
        id="report-container"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">View your task reports</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow text-center">
            <h3 className="text-sm font-medium text-gray-500">
              Completed Tasks
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {report.statusCount.completed}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow text-center">
            <h3 className="text-sm font-medium text-gray-500">
              Pending Tasks
            </h3>
            <p className="text-2xl font-bold text-yellow-500">
              {report.statusCount.pending}
            </p>
          </div>

          <div
            className="bg-white p-4 rounded shadow text-center cursor-pointer hover:shadow-md transition"
            onClick={() =>
              navigate("/staff/recurring-tasks")
            }
          >
            <h3 className="text-sm font-medium text-gray-500">
              Recurring Tasks
            </h3>
            <p className="text-2xl font-bold text-indigo-600">
              {report.statusCount.recurring}
            </p>
            <p className="text-xs text-gray-400 mt-1">Click to view</p>
          </div>
        </div>

        {/* Chart Filters and Export */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src="/undraw_report_k55w.svg"
            alt="Report"
            className="w-40 md:w-56 h-auto"
          />

          <div className="flex flex-wrap gap-4 justify-center mt-4 items-center">
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
          </div>

          <div className="ml-auto items-center mx-auto flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-blue-900 flex items-center gap-1 hover:bg-blue-800 text-white px-4 py-2 rounded"
            >
              Export CSV <Download size={16} />
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 text-black border px-4 py-2 rounded"
            >
              Export PDF <Download size={16} />
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Monthly Task Chart
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: report.monthlyChart.map(
                    (item) => item.week || "Week"
                  ),
                  datasets: [
                    {
                      label: "Tasks",
                      data: report.monthlyChart.map((item) => item.count),
                      backgroundColor: "#3b82f6",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Weekly Task Chart
            </h3>
            <div className="h-64">
              <Line
                data={{
                  labels: report.weeklyChart.map((item) => item.day || "Day"),
                  datasets: [
                    {
                      label: "Tasks",
                      data: report.weeklyChart.map((item) => item.count),
                      borderColor: "#10b981",
                      backgroundColor: "#d1fae5",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StaffReport;
