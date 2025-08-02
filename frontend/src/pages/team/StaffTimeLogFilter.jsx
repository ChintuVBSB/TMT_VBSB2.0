import { useState } from "react";
import StaffMISExport from "../team/StaffMISExport";

const StaffTimeLogFilter = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isFilterValid = fromDate && toDate;

  return (
    <div className="p-4 border rounded mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Your Time Logs</h2>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <input
            type="date"
            className="border rounded px-3 py-1"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <input
            type="date"
            className="border rounded px-3 py-1"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {isFilterValid ? (
        <StaffMISExport filters={{ fromDate, toDate }} />
      ) : (
        <p className="text-sm text-red-500">Select both dates to enable export.</p>
      )}
    </div>
  );
};

export default StaffTimeLogFilter;
