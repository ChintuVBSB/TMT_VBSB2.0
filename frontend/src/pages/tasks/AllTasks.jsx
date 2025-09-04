import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import ReassignTaskModal from "./ReassignTaskModal";
import AdminNavbar from "../../components/navbars/AdminNavbar";
import SubtaskModal from "./_SubtaskModal";
import { FaRegEdit } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { FiInfo } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import { DiamondPlus, BadgeAlert, CheckCircle } from "lucide-react";
import Select from "react-select"; // If you use react-select, otherwise use a native select
import RemarkModal from "./RemarkModal";
import PageSkelton from "../../components/skeletons/PageSkeleton";
import { MessageSquare, ChevronDown, ChevronUp, BellRing } from "lucide-react"; // Import a nice icon
import TaskCommentsModal from "../tasks/TaskCommentsModal";
import { BiSolidBellRing } from "react-icons/bi";

const AllTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "All" });
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [parentTaskId, setParentTaskId] = useState(null);
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [assignedByFilter, setAssignedByFilter] = useState("");
  const [assignedToSearch, setAssignedToSearch] = useState("");
  const [assignedBySearch, setAssignedBySearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showAssignedToDropdown, setShowAssignedToDropdown] = useState(false);
  const [showAssignedByDropdown, setShowAssignedByDropdown] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState(""); // "7days", "30days", or ""
  const [taskId, setTaskId] = useState(null);
  const [remark, setRemark] = useState("");
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [openSubtasks, setOpenSubtasks] = useState({}); // To track open subtask dropdowns
  const [activeTab, setActiveTab] = useState("All");

  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
    }, 300),
    []
  );

  const handleSearchChange = (e) => debouncedSearch(e.target.value);
  const handleStatusChange = (status) =>
    setFilters((prev) => ({ ...prev, status }));

  // Fetch tasks from backend
  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const params = { ...filters };

      // status "All" ka case handle
      if (filters.status === "All") {
        delete params.status;
      }

      if (assignedToFilter) params.assigned_to = assignedToFilter;
      if (assignedByFilter) params.assigned_by = assignedByFilter;
      if (clientFilter) params.client = clientFilter;

      // Date filters
      if (dateFilter === "7days") {
        params.from = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();
      }
      if (dateFilter === "30days") {
        params.from = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();
      }

      // ✅ Add recurring filter if tab is Recurring
      if (filters.status === "Recurring") {
        params.recurring = true; // string nahi, boolean
        delete params.status; // status filter hata do warna conflict karega
      }

      console.log("Fetching tasks with params:", params);

      const res = await axios.get("/assign/tasks", {
        headers: { Authorization: `Bearer ${getToken()}` },
        params
      });

      setTasks(res.data.tasks);
      console.log(res.data);
    } catch (err) {
      console.error("Error loading tasks", err);
    }
  };

  const statusBadgeColorMap = {
    Pending: "bg-red-100 text-red-700",
    "In Progress": "bg-orange-100 text-orange-700",
    Completed: "bg-green-100 text-green-700",
    Rejected: "bg-gray-300 text-gray-800",
    Expired: "bg-red-200 text-red-800 font-semibold", // Style for Expired status if needed
    default: "bg-gray-100 text-gray-700"
  };
  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/user", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  const sendReminder = async (taskId, staffId) => {
    try {
      await axios.post(
        "/assign/tasks/reminder",
        { taskId, staffId },
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      toast.success("Reminder sent successfully");
    } catch (err) {
      console.error("Reminder Error:", err.response?.data || err.message);
      toast.error("Failed to send reminder");
    }
  };

  // Fetch clients from backend
  const fetchClients = async () => {
    try {
      const res = await axios.get("/clients", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setClients(Array.isArray(res.data.clients) ? res.data.clients : res.data); // Handles both cases
    } catch (err) {
      console.error("Error loading clients", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);
  useEffect(() => {
    fetchTasks();
  }, [filters, assignedToFilter, assignedByFilter, clientFilter, dateFilter]);
  useEffect(() => {
    console.log("Clients:", clients); // Debug
  }, [clients]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this task?")) return;
    await axios.delete(`/assign/tasks/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    toast.success("Task deleted");
    fetchTasks();
  };

  const openRemarkModal = async (taskId) => {
    try {
      const res = await axios.get(`/assign/tasks/${taskId}/remark`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSelectedRemark(res.data.remark || "No remark found.");
      setShowRemarkModal(true);
    } catch (err) {
      console.error("Failed to fetch remark", err);
      toast.error("Failed to fetch remark", err);
    }
  };

  const handleAcceptRetry = async (taskId, userId) => {
    try {
      const res = await axios.patch(
        `/assign/tasks/accept-retry/${taskId}`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      toast.success("Retry request accepted and task reassigned!");
      fetchTasks(); // Or fetch again
    } catch (err) {
      toast.error("Failed to accept retry request");
      console.error(err);
    }
  };

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const currentTasks = tasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr && new Date(dateStr).toISOString().split("T")[0] === today;
  };

  const isExpired = (task) => {
    return new Date(task.due_date) < new Date(0,0,0,0) && task.status !== "Completed";
  };

  // Filter users for dropdowns
  const filteredAssignedTo = users.filter((u) =>
    u.name.toLowerCase().includes(assignedToSearch.toLowerCase())
  );
  const filteredAssignedBy = users
    .filter((u) => u.role === "admin" || u.role === "manager")
    .filter((u) =>
      u.name.toLowerCase().includes(assignedBySearch.toLowerCase())
    );

  // Filter clients for dropdown
  const filteredClients = clients?.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        await fetchTasks();
        await fetchUsers();
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ✅ Show skeleton while loading
  if (loading) return <PageSkelton count={6} />;
  // Move date filter buttons to top right, above the filters row
  return (
    <>
      {showCommentsModal && (
        <TaskCommentsModal
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          task={selectedTask}
        />
      )}
      <div className="bg-white min-h-screen">
        <AdminNavbar />
        <div className="px-6 pt-28 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
            <button
              onClick={() => navigate("/admin/create-task")}
              className="bg-blue-950 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-900"
            >
              + New Task
            </button>
          </div>

          {/* Small Date Filter Buttons - top right */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setDateFilter("7days")}
              className={`px-2 py-1 rounded text-xs border mr-2 ${dateFilter === "7days" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setDateFilter("30days")}
              className={`px-2 py-1 rounded text-xs border mr-2 ${dateFilter === "30days" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setDateFilter("")}
              className={`px-2 py-1 rounded text-xs border ${dateFilter === "" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              All Dates
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-3 mb-6">
            {[
              "All",
              "Pending",
              "In Progress",
              "Completed",
              "Expired",
              "Rejected",
              "Recurring"
            ].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-full border ${filters.status.toLowerCase() === status.toLowerCase()? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div className="flex gap-4 mb-4">
            {/* Assigned To */}
            <div className="w-64 relative">
              <label className="block text-sm font-semibold mb-1">
                Assigned To
              </label>
              <input
                type="text"
                value={assignedToSearch}
                onChange={(e) => {
                  setAssignedToSearch(e.target.value);
                  setShowAssignedToDropdown(true);
                }}
                onFocus={() => setShowAssignedToDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowAssignedToDropdown(false), 200)
                }
                placeholder="Search staff"
                className="w-full px-3 py-2 border rounded"
              />
              {showAssignedToDropdown && (
                <ul className="absolute z-10 bg-white border rounded mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
                  <li
                    className={`px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer ${assignedToFilter === "" ? "bg-gray-100" : ""}`}
                    onMouseDown={() => {
                      setAssignedToFilter("");
                      setAssignedToSearch("");
                    }}
                  >
                    All
                  </li>
                  {filteredAssignedTo.map((u) => (
                    <li
                      key={u._id}
                      className={`px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer ${assignedToFilter === u._id ? "bg-gray-100" : ""}`}
                      onMouseDown={() => {
                        setAssignedToFilter(u._id);
                        setAssignedToSearch(u.name);
                      }}
                    >
                      {u.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Assigned By */}
            <div className="w-64 relative">
              <label className="block text-sm font-semibold mb-1">
                Assigned By
              </label>
              <input
                type="text"
                value={assignedBySearch}
                onChange={(e) => {
                  setAssignedBySearch(e.target.value);
                  setShowAssignedByDropdown(true);
                }}
                onFocus={() => setShowAssignedByDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowAssignedByDropdown(false), 200)
                }
                placeholder="Search admin/manager"
                className="w-full px-3 py-2 border rounded"
              />
              {showAssignedByDropdown && (
                <ul className="absolute z-10 bg-white border rounded mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
                  <li
                    className={`px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer ${assignedByFilter === "" ? "bg-gray-100" : ""}`}
                    onMouseDown={() => {
                      setAssignedByFilter("");
                      setAssignedBySearch("");
                    }}
                  >
                    All
                  </li>
                  {filteredAssignedBy.map((u) => (
                    <li
                      key={u._id}
                      className={`px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer ${assignedByFilter === u._id ? "bg-gray-100" : ""}`}
                      onMouseDown={() => {
                        setAssignedByFilter(u._id);
                        setAssignedBySearch(u.name);
                      }}
                    >
                      {u.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Client Filter */}
            <div className="w-64 relative">
              <label className="block text-sm font-semibold mb-1">Client</label>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowClientDropdown(false), 200)
                }
                placeholder="Search client"
                className="w-full px-3 py-2 border rounded"
              />
              {showClientDropdown && (
                <ul className="absolute z-10 bg-white border rounded mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
                  <li
                    className={`px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer ${clientFilter === "" ? "bg-gray-100" : ""}`}
                    onMouseDown={() => {
                      setClientFilter("");
                      setClientSearch("");
                      setCurrentPage(1); // Reset page
                    }}
                  >
                    All
                  </li>
                  {filteredClients?.map((c) => (
                    <li
                      key={c._id}
                      className={`px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer ${clientFilter === c._id ? "bg-gray-100" : ""}`}
                      onMouseDown={() => {
                        setClientFilter(c._id);
                        setClientSearch(c.name);
                        setCurrentPage(1); // Reset page
                      }}
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search tasks..."
            onChange={handleSearchChange}
            className="w-full max-w-xl mb-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* Task Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-600 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">T.Id</th>
                  <th className="px-6 py-4 text-left">Task</th>
                  <th className="px-6 py-4 text-left">Assignee</th>
                  <th className="px-6 py-4 text-left">Client</th>
                  <th className="px-6 py-4 text-left">Priority</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Assigned</th>
                  <th className="px-6 py-4 text-left">Due</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTasks.map((task) => (
                  <tr
                    key={task._id}
                    className={`border-b hover:bg-gray-50 text-sm ${isExpired(task) ? "bg-red-50" : ""}`} // Optional: Highlight expired rows
                  >
                    {/* Task Title & Description */}
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap font-mono">
                      {task.taskId || "---"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-base capitalize text-gray-800">
                        {task.title}
                      </div>
                      {task.description && (
                        <details className="mt-2 text-xs text-gray-500 cursor-pointer group">
                          <summary className="outline-none select-none font-medium group-hover:underline">
                            View Description
                          </summary>
                          <p className="mt-1 whitespace-pre-wrap border-l-2 border-gray-200 pl-2">
                            {task.description}
                          </p>
                        </details>
                      )}
                      {/* ✅ NEW: Subtasks Section */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <details
                          className="mt-3 group"
                          onToggle={(e) =>
                            setOpenSubtasks({
                              ...openSubtasks,
                              [task._id]: e.currentTarget.open
                            })
                          }
                        >
                          <summary className="cursor-pointer text-xs font-semibold text-blue-600 flex items-center gap-1">
                            {openSubtasks[task._id] ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                            View Subtasks (
                            {
                              task.subtasks.filter(
                                (st) => st.status === "Completed"
                              ).length
                            }
                            /{task.subtasks.length})
                          </summary>
                          <ul className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                            {task.subtasks.map((subtask) => (
                              <li
                                key={subtask._id}
                                className="flex items-center gap-2"
                              >
                                <span
                                  className={`text-sm ${subtask.status === "Completed" ? "text-gray-400 line-through" : "text-gray-700"}`}
                                >
                                  {subtask.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="px-6 py-4">
                      {task.assigned_to?.name || "Unassigned"}
                    </td>

                    {/* Client Name */}
                    <td className="px-6 py-4">{task.client?.name || "—"}</td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.priority}
                      </span>

                      {task.delayReason && (
                        <p className="text-sm text-gray-600">
                          Delay Reason: <strong>{task.delayReason}</strong>
                        </p>
                      )}
                    </td>

                    {/* Status + Reason Tooltip */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
                          isExpired(task)
                            ? statusBadgeColorMap.Expired
                            : statusBadgeColorMap[task.status] ||
                              statusBadgeColorMap.default
                        }`}
                      >
                        {isExpired(task) ? "Expired" : task.status}
                        {task.status === "Rejected" && task.reason && (
                          <FiInfo
                            data-tooltip-id="tooltip"
                            data-tooltip-content={`Reason: ${task.reason}`}
                            className="text-gray-500 cursor-pointer"
                          />
                        )}
                      </span>
                    </td>

                    {/* Assigned At: Date + Time */}
                    <td className="px-6 py-4">
                      <div>{new Date(task.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        (
                        {new Date(task.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                        )
                      </div>
                    </td>

                    {/* Due Date: Date + Time */}
                    <td className="px-6 py-4 relative">
                      {isToday(task.due_date) &&
                        !isExpired(task) && ( // only show ping if not expired
                          <div
                            className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full animate-ping"
                            data-tooltip-id="tooltip"
                            data-tooltip-content="The task is expiring today"
                          />
                        )}
                      <div
                        className={
                          isExpired(task) ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                      <div
                        className={`text-xs ${isExpired(task) ? "text-red-500" : "text-gray-500"}`}
                      >
                        (
                        {new Date(task.due_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                        )
                      </div>
                      {/* Show remarks if task is due today or expired */}
                      {isExpired(task) && task.remarks && (
                        <div className="mt-1 text-xs text-red-600 font-semibold">
                          Remarks: {task.remark}
                        </div>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          console.log(
                            "👉 Sending reminder to",
                            task.assigned_to?.name,
                            "for task",
                            task.id || task._id
                          );
                          sendReminder(task._id, task.assigned_to._id);
                        }}
                      >
                        <BiSolidBellRing size={18} />
                      </button>

                      <button
                        data-tooltip-id="tooltip"
                        data-tooltip-content="View Comments"
                        onClick={() => {
                          setSelectedTask(task); // Set the selected task
                          setShowCommentsModal(true); // Open the new comments modal
                        }}
                        className="relative text-gray-700 hover:text-black"
                      >
                        <MessageSquare size={18} />

                        {/* Badge - Show only if comments exist */}
                        {task.comments?.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-green-400 text-white text-[10px] font-bold rounded-full px-0.5 py-0.1">
                            {task.comments.length}
                          </span>
                        )}
                      </button>
                      <button
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Edit Task"
                        onClick={() => navigate(`/admin/edit-task/${task._id}`)}
                        className="text-gray-700 hover:text-black"
                      >
                        <FaRegEdit size={18} />
                      </button>
                      <button
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Delete Task"
                        onClick={() => handleDelete(task._id)}
                        className="text-gray-700 hover:text-black"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                      <button
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Reassign Task"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsReassignModalOpen(true);
                        }}
                        className="text-gray-700 hover:text-black"
                      >
                        <MdOutlineSwapHoriz size={18} />
                      </button>
                      <button
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Add Subtask"
                        onClick={() => {
                          setParentTaskId(task._id);
                          setShowSubtaskModal(true);
                        }}
                        className="text-gray-700 hover:text-black"
                      >
                        <DiamondPlus size={18} />
                      </button>

                      <button
                        onClick={() => openRemarkModal(task._id)}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="View Remark"
                        className="text-gray-700 hover:text-black"
                      >
                        <BadgeAlert size={18} />
                      </button>

                      {showRemarkModal && (
                        <RemarkModal
                          isOpen={showRemarkModal}
                          onClose={() => setShowRemarkModal(false)}
                          remark={selectedRemark}
                        />
                      )}

                      {task.retryRequested && (
                        <button
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Accept Retry Request"
                          onClick={() =>
                            handleAcceptRetry(task._id, task.assigned_to?._id)
                          }
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {currentTasks.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-400">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 mb-5 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-full text-sm ${currentPage === i + 1 ? "bg-gray-800 text-white" : "hover:bg-gray-200 text-gray-700"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Modals */}
          {isReassignModalOpen && (
            <ReassignTaskModal
              isOpen={isReassignModalOpen}
              onClose={() => setIsReassignModalOpen(false)}
              task={selectedTask}
              users={users}
              onReassigned={fetchTasks}
            />
          )}

          {showSubtaskModal && (
            <SubtaskModal
              isOpen={showSubtaskModal}
              onClose={() => setShowSubtaskModal(false)}
              parentTaskId={parentTaskId}
              onSubtaskCreated={fetchTasks}
            />
          )}

          <Tooltip id="tooltip" />
        </div>
      </div>
    </>
  );
};

export default AllTasks;
