//frontend component to trigger CSV download for weekly report

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../../../services/api";
import { getToken } from "../../../utils/token";
import { format } from "date-fns";
import { Download } from "lucide-react";

const   WeeklyCSVDownload = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!fromDate || !toDate) return alert("Please select a valid date range");

    try {
      setLoading(true);
      const res = await axios.get("/reports/weekly-summary", {
        params: {
          from: format(fromDate, "yyyy-MM-dd"),
          to: format(toDate, "yyyy-MM-dd"),
        },
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        responseType: "blob", // ⬅️ important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weekly_summary_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("CSV download failed", error);
      alert("Something went wrong while downloading");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 m-4 rounded shadow border flex flex-col gap-4">
      <h2 className="text-lg flex items-center gap-2 font-bold"><Download size={16} /> Download Weekly Report (CSV)</h2>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">From</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            className="border px-4 py-2 rounded"
            placeholderText="Start date"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">To</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            className="border px-4 py-2 rounded"
            placeholderText="End date"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="mt-6 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2"
        >
          <Download size={16} />
          {loading ? "Downloading..." : "Download CSV"}
        </button>
      </div>
    </div>
  );
};

export default WeeklyCSVDownload;
