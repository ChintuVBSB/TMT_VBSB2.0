// StaffDashboard.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import debounce from "lodash.debounce";
import RejectModal from "../../components/RejectModal";
import StaffNavbar from "../../components/navbars/StaffNavbar";
import StaffMISExport from "../team/StaffMISExport";
import StaffReassignTaskModal from "../team/StaffReassignTaskModal";
import { Repeat } from "lucide-react";

import {
  Calendar,
  Tag,
  User,
  ListTodo,
  CheckCircle,
  XCircle,
  Building,
  Kanban,
  Paperclip
} from "lucide-react";
import NotificationBell from "../tasks/NotificationBell";
import BlurText from "./BlurText";
import toast from "react-hot-toast";
import { Dialog } from "@headlessui/react";
import RewardCard from "../../components/RewardCard";
import KanbanView from "../KanbanView";
import CalendarView from "../../components/CalendarView";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import MISExport from "../admin/dashboard-widgets/MISExports";
import StaffTimeLogFilter from "./StaffTimeLogFilter";
function StaffDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("To Do");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [user, setUser] = useState({});
  const [filterMode, setFilterMode] = useState("7days");
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [remarkTaskId, setRemarkTaskId] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const [isRetryRequest, setIsRetryRequest] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table | kanban | calenda
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignModalTaskId, setReassignModalTaskId] = useState(null);

  const fetchMyTasks = async () => {
    try {
      const params = {};
      if (activeTab === "Completed") {
        const today = new Date();
        let start = new Date();
        start.setDate(today.getDate() - (filterMode === "7days" ? 7 : 30));
        params.completedAfter = start.toISOString();
      }

      const res = await axios.get("/assign/tasks/my", {
        headers: { Authorization: `Bearer ${getToken()}` },
        params
      });
      setTasks(res.data.tasks);
      setFilteredTasks(res.data.tasks);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  useEffect(() => {
    // Socket listener for reminder
    socket.on("task:reminder", ({ message, taskId }) => {
      toast(message, {
        icon: "⚠️",
        duration: 6000,
        position: "bottom-left",
        style: {
          background: "#fef3c7",
          color: "#92400e",
          fontWeight: "bold"
        }
      });
    });

    // Cleanup
    return () => socket.off("task:reminder");
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/profile", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  const handleAccept = async (taskId) => {
    try {
      await axios.patch(
        `/assign/tasks/accept/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      fetchMyTasks();
    } catch (err) {
      console.error("Error accepting task", err);
    }
  };

  const handleReject = async (reason) => {
    try {
      await axios.patch(
        `/assign/tasks/reject/${selectedTaskId}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      setShowRejectModal(false);
      fetchMyTasks();
    } catch (err) {
      console.error("Error rejecting task", err);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await axios.patch(
        `/assign/tasks/complete/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      fetchMyTasks();
    } catch (err) {
      console.error("Error completing task", err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id); // 🔁 Tell backend: "I'm online"
      console.log("🟢 Joined socket with ID:", user._id);
    }
  }, [user]);

  const handleRemarkSubmit = async () => {
    try {
      if (isRetryRequest) {
        await axios.post(
          `/assign/tasks/retry-request/${remarkTaskId}`,
          {
            remark: remarkText,
            delayReason
          },
          {
            headers: { Authorization: `Bearer ${getToken()}` }
          }
        );
        toast.success("Retry request sent!");
      } else {
        await axios.post(
          `/assign/tasks/remark/${remarkTaskId}`,
          {
            remark: remarkText,
            delayReason
          },
          {
            headers: { Authorization: `Bearer ${getToken()}` }
          }
        );
        toast.success("Remark submitted!");
      }

      setShowRemarkModal(false);
      setRemarkText("");
      setRemarkTaskId(null);
      setDelayReason("");
      setIsRetryRequest(false);
      fetchMyTasks();
    } catch (err) {
      toast.error("Failed to submit.");
      console.error("Error submitting", err);
    }
  };

  const debouncedFilter = useMemo(
  () =>
    debounce((query) => {
      const filtered = tasks.filter((task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.serial_number?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTasks(filtered);
    }, 500),
  [tasks]
);
  useEffect(() => {
    fetchMyTasks();
    fetchUser();
  }, [activeTab, filterMode]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredTasks(tasks);
    } else {
      debouncedFilter(search);
    }
  }, [search, tasks]);

  const handleRetryRequest = async (taskId) => {
    try {
      await axios.post(
        `/assign/tasks/retry-request/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      fetchMyTasks();
      toast.success("Retry request sent!");
    } catch (err) {
      toast.error("Failed to send retry request.");
      console.error("Error requesting retry", err);
    }
  };

  const filteredByTab = filteredTasks.filter((task) => {
    if (activeTab === "To Do") return task.status === "Pending";
    if (activeTab === "In Progress") return task.status === "In Progress";
    if (activeTab === "Completed") return task.status === "Completed";
    return true;
  });

  return (
    <>
      {showReassignModal && (
        <StaffReassignTaskModal
          task={tasks.find((t) => t._id === reassignModalTaskId)} // ✅ full task object
          onClose={() => {
            setShowReassignModal(false);
            fetchMyTasks(); // Refresh after reassignment
          }}
        />
      )}

      <RewardCard />

      {/* Modals */}
      <Dialog
        open={showRemarkModal}
        onClose={() => {
          setShowRemarkModal(false);
          setIsRetryRequest(false);
        }}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:py-12">
          <Dialog.Panel className="bg-white rounded-lg w-full max-w-md p-5 sm:p-6 shadow-xl">
            <Dialog.Title className="text-lg sm:text-xl font-bold mb-3">
              Task Remark
            </Dialog.Title>

            <select
              className="w-full border border-gray-300 rounded p-2 mb-4 text-sm sm:text-base"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              required
            >
              <option value="">Select Delay Reason</option>
              <option value="Client Delay">Delay by Client</option>
              <option value="Staff Delay">Delay by Me</option>
              <option value="Technical Issue">Technical/System Issue</option>
            </select>

            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4 text-sm sm:text-base"
              rows={4}
              placeholder="Enter reason for unable to do this task..."
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
              <button
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded"
                onClick={() => setShowRemarkModal(false)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                onClick={handleRemarkSubmit}
                disabled={!remarkText.trim() || !delayReason}
              >
                Submit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
      />

      <StaffNavbar />

      <div className="max-w-7xl pt-24 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Heading + Notification */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <BlurText
            text={`Welcome, ${user?.name || "User"}`}
            delay={100}
            animateBy="words"
            direction="top"
            className="text-xl sm:text-2xl font-bold"
          />
          <NotificationBell
            tasks={tasks.filter((task) => task.status !== "Remarked")}
          />
        </div>
        <StaffTimeLogFilter />
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-3 pl-4 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 sm:gap-8 mb-6 text-sm sm:text-base font-semibold text-gray-700 border-b border-gray-200">
          {["To Do", "In Progress", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition-all ${
                activeTab === tab
                  ? "border-b-4 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Mode */}
        {activeTab === "Completed" && (
          <div className="flex gap-2 sm:gap-3 mb-4 flex-wrap">
            {["7days", "30days"].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`text-sm px-3 py-1 rounded ${
                  filterMode === mode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Last {mode === "7days" ? "7" : "30"} Days
              </button>
            ))}
          </div>
        )}

        {/* Tasks Table or Empty Message */}
        {filteredByTab.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No tasks found.</p>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y text-sm divide-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  {[
                    "Serial No",
                    "Title",
                    "Due Date",
                    "Description",
                    "Client",
                    "Tags",
                    "Assigned By",
                    "Actions"
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredByTab.map((task) => {
                  const isExpired = (() => {
                    const due = new Date(task.due_date);
                    due.setHours(23, 59, 59, 999);
                    return due < new Date();
                  })();

                  return (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap font-mono">
                        {task.serial_number || "---"}
                      </td>
                      <td className="px-4 py-3 capitalize whitespace-nowrap">
                        {task.title}
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                              Attachments:
                            </h3>
                            <ul className="list-disc list-inside space-y-1">
                              {task.attachments.map((file, index) => (
                                <li key={index}>
                                  <a
                                    href={file.fileUrl}
                                    download={file.filename} // ✅ Force download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-2"
                                  >
                                    <Paperclip
                                      size={16}
                                      className="text-blue-500"
                                    />
                                    {file.filename}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(task.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate">
                        {task.description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.client?.name || "---"}
                      </td>
                      <td className="px-4 py-3">{task.tags}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.assigned_by?.name}
                      </td>

                      <td className="px-4 py-3 space-y-1 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
                        {task.status === "Pending" && !isExpired && (
                          <>
                            <button
                              onClick={() => handleAccept(task._id)}
                              className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTaskId(task._id);
                                setShowRejectModal(true);
                              }}
                              className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {task.status === "Pending" && isExpired && (
                          <>
                            {task.retryRequested ? (
                              <span className="text-blue-600 text-sm font-medium">
                                Retry Requested
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setRemarkTaskId(task._id);
                                  setShowRemarkModal(true);
                                  setIsRetryRequest(true);
                                }}
                                className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700"
                              >
                                Request Retry
                              </button>
                            )}
                          </>
                        )}
                        <td>
                          {task.status === "Pending" &&
                            task.reassign_remark && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-2 text-sm text-gray-700">
                                <strong>
                                  Note from {task.assigned_by?.name}:
                                </strong>{" "}
                                {task.reassign_remark}
                              </div>
                            )}

                          {(task.status === "Pending" ||
                            task.status === "In Progress") && (
                            <button
                              onClick={() => {
                                setReassignModalTaskId(task._id);
                                setShowReassignModal(true);
                              }}
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Reassign Task"
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <Repeat size={20} />
                            </button>
                          )}
                        </td>

                        {task.status === "In Progress" && (
                          <button
                            onClick={() => handleComplete(task._id)}
                            className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View Toggle + Kanban/Calendar View */}
        <div>
          <div className="flex gap-4 mt-4 flex-wrap">
            <button
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded flex items-center gap-2 hover:bg-blue-700"
              onClick={() => setViewMode("kanban")}
            >
              <Kanban /> Kanban
            </button>
          </div>

          {viewMode === "kanban" && <KanbanView allTasks={filteredTasks} />}
          {viewMode === "calendar" && <CalendarView allTasks={filteredTasks} />}
        </div>
      </div>
    </>
  );
}

export default StaffDashboard;
