import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReportFilter = ({ onFilterChange }) => {
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [toDate, setToDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState("user");

  const applyFilters = () => {
    onFilterChange({
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
      groupBy,
    });
  };

  return (
    <div className="flex flex-wrap items-center  gap-4 mb-6 bg-white p-4 rounded shadow-sm">
      <div>
        <label className="block text-sm text-gray-600 mb-1">From Date</label>
        <DatePicker
          selected={fromDate}
          onChange={(date) => setFromDate(date)}
          className="border p-2 rounded"
          dateFormat="yyyy-MM-dd"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">To Date</label>
        <DatePicker
          selected={toDate}
          onChange={(date) => setToDate(date)}
          className="border p-2 rounded"
          dateFormat="yyyy-MM-dd"
        />
      </div>

      <div className="">
        <label className="block text-sm text-gray-600 mb-1">Group By</label>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="user">User</option>
          <option value="client">Client</option>
          <option value="task_bucket">Task Bucket</option>
        </select>

      <button
        onClick={applyFilters}
        className="bg-black ml-5 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Apply Filters
      </button>
      </div>

    </div>
  );
};

export default ReportFilter;
