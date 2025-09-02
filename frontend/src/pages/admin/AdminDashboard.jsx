import React, { useState } from 'react';
import TaskStatusChart from './dashboard-widgets/TaskStatusChart';
import TaskPriorityChart from './dashboard-widgets/TaskPriorityChart';
import ClientServiceChart from './dashboard-widgets/ClientServiceChart';
import TimeLogChart from './dashboard-widgets/TimeLogChart';
import SlaAdherenceChart from './dashboard-widgets/SlaAdherenceChart';
import TaskBucketChart from './dashboard-widgets/TaskBucketChart';
import ReportFilter from '../../components/ReportFilter';
import MISExport from './dashboard-widgets/MISExports';
import WeeklySummaryDownload from './dashboard-widgets/WeeklySummaryDownload';
import AdminNavbar from '../../components/navbars/AdminNavbar';
import StaffTasksReport from '../../components/MyTaskReport';
import MyTaskReport from '../../components/MyTaskReport';
// import StaffWorkloadWidget from '../../components/StaffWorkloadWidget';

const AdminDashboard = () => {
  const [filters, setFilters] = useState({
    fromDate: "2025-06-01",
    toDate: "2025-06-07",
    groupBy: "user",
  });

  return (
    <div className="bg-white mb-10 min-h-screen">
      <AdminNavbar />

      {/* Add top padding to push content below fixed navbar */}
      <div className="pt-24 px-4 md:px-8">
        <ReportFilter onFilterChange={setFilters} />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-4">
          <MISExport filters={filters} />
          <MyTaskReport/>
          <WeeklySummaryDownload />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaskStatusChart filters={filters} />
          <TaskPriorityChart filters={filters} />
          <ClientServiceChart filters={filters} />
          <TimeLogChart filters={filters} />
          <SlaAdherenceChart filters={filters} />
          <TaskBucketChart filters={filters} />
          
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
