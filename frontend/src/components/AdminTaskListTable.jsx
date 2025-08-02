import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { getToken } from "../utils/token";
import AdminNavbar from "./navbars/AdminNavbar";
import { Pencil, Trash2 } from "lucide-react";
import PageSkelton from "./skeletons/PageSkeleton";
import downloadCSV from '../utils/downloadCSV'

function AdminTaskListTable() {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 30;
  const [loading, setLoading] = useState(true);
  
  const formatTasksForCSV = (data) =>
  data.map((task) => ({
    "Serial No": task.serial_number || "---",
    Title: task.title || "---",
    Description: task.description || "---",
    Status: task.status || "---",
    Priority: task.priority || "---",
    "Due Date": task.due_date ? new Date(task.due_date).toLocaleDateString() : "---",
    "Assigned To": task.assigned_to?.name || "---",
    "Assigned By": task.assigned_by?.name || "---",
    Client: task.client?.name || "---",
    Mode: task.recurring ? "Recurring" : "One Time",
    Frequency: task.recurringFrequency || "---",
    CreatedAt: task.createdAt ? new Date(task.createdAt).toLocaleString() : "---",
    UpdatedAt: task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "---"
  }));

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/assign/tasks", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const currentTasks = tasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

   useEffect(() => {
        const fetchAll = async () => {
          setLoading(true);
          try {
            await fetchTasks();
          } catch (err) {
            console.error("Error loading dashboard:", err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchAll();
      },[]);
    
      // ✅ Show skeleton while loading
      if (loading) return <PageSkelton count={6} />;
  return (
    <>
      <AdminNavbar />
      <div className="p-4 mt-18 max-w-10xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Task List</h2>
<div className="flex justify-end gap-4 mb-4">
  <button
    onClick={() =>   downloadCSV(formatTasksForCSV(currentTasks), `tasks-page-${currentPage}.csv`)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
  >
    Download This Page
  </button>

  <button
    onClick={() => downloadCSV(formatTasksForCSV(tasks), "all-tasks.csv")}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
  >
    Download All Tasks
  </button>
</div>
        <div className="rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full table-fixed bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left w-[120px]">Serial No</th>
                <th className="px-4 py-3 text-left w-[160px]">Task Name</th>
                <th className="px-4 py-3 w-[150px]">Department</th>
                <th className="px-4 py-3 w-[100px]">Mode</th>
                <th className="px-4 py-3 w-[100px]">Frequency</th>
                <th className="px-4 py-3 w-[100px]">HSN/SAC</th>
                <th className="px-4 py-3 w-[160px]">Reporting Manager</th>
                <th className="px-4 py-3 w-[200px]">Description</th>
                <th className="px-4 py-3 w-[100px]">Status</th>
                <th className="px-4 py-3 w-[140px]">UDIN</th>
                <th className="px-4 py-3 w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currentTasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono">
                    {task.serial_number || "---"}
                  </td>
                  <td className="px-4 py-3 truncate">{task.title}</td>
                  <td className="px-4 py-3 truncate">{task.department || "---"}</td>
                  <td className="px-4 py-3">{task.recurring ? "Recurring" : "One Time"}</td>
                  <td className="px-4 py-3 capitalize">{task.recurringFrequency || "---"}</td>
                  <td className="px-4 py-3">{task.hsn || "---"}</td>
                  <td className="px-4 py-3 truncate">{task.assigned_by?.name || "---"}</td>
                  <td className="px-4 py-3 truncate">{task.description || "No description"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{task.udin || "Not Applicable"}</td>
                  <td className="px-4 py-3 flex items-center gap-3 justify-center text-gray-600">
                    <button title="Edit">
                      <Pencil size={18} className="hover:text-blue-600" />
                    </button>
                    <button title="Delete">
                      <Trash2 size={18} className="hover:text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Showing {currentTasks.length} of {tasks.length} tasks
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded text-sm ${
                  page === currentPage ? "bg-blue-600 text-white" : "border"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminTaskListTable;
