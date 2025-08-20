import { useEffect, useState, useMemo } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import debounce from "lodash.debounce";
import RejectModal from "../../components/RejectModal";
import StaffNavbar from "../../components/navbars/StaffNavbar";
import StaffReassignTaskModal from "../team/StaffReassignTaskModal";
import { Repeat, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

import {
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
import socket from "../../socket";
import PageSkelton from "../../components/skeletons/PageSkeleton"
import StaffTimeLogFilter from "./StaffTimeLogFilter";
import TaskCommentsModal from "../tasks/TaskCommentsModal";


function StaffDashboard() {
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
  const [viewMode, setViewMode] = useState("table");
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignModalTaskId, setReassignModalTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSubtasks, setOpenSubtasks] = useState({});

     const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === "Completed") {
        const today = new Date();
        let start = new Date();
        start.setDate(today.getDate() - (filterMode === "7days" ? 7 : 30));
        params.completedAfter = start.toISOString();
      }

      const res = await axios.get("http://localhost:8000/api/assign/tasks/my", {
        headers: { Authorization: `Bearer ${getToken()}` },
        params
      });
        console.log("📦 API Response:", res.data);
      setTasks(res.data.tasks);
      setFilteredTasks(res.data.tasks);
    } catch (err) {
      console.error("Error fetching tasks", err);
      toast.error("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchMyTasks();
    fetchUser();
  }, [activeTab, filterMode]);


  useEffect(() => {
    socket.on("task:reminder", ({ message }) => {
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
    return () => socket.off("task:reminder");
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
      console.log("🟢 Joined socket with ID:", user._id);
    }
  }, [user]);

  const handleAccept = async (taskId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/assign/tasks/accept/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      toast.success("Task accepted!");
      fetchMyTasks();
    } catch (err) {
      toast.error("Failed to accept task.");
      console.error("Error accepting task", err);
    }
  };

  const handleReject = async (reason) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/assign/tasks/reject/${selectedTaskId}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      setShowRejectModal(false);
      toast.success("Task rejected.");
      fetchMyTasks();
    } catch (err) {
      toast.error("Failed to reject task.");
      console.error("Error rejecting task", err);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/assign/tasks/complete/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      toast.success("Task marked as complete!");
      fetchMyTasks();
    } catch (err) {
      toast.error("Failed to complete task.");
      console.error("Error completing task", err);
    }
  };

  const handleRemarkSubmit = async () => {
    try {
      const endpoint = isRetryRequest
        ? `http://localhost:8000/api/assign/tasks/retry-request/${remarkTaskId}`
        : `http://localhost:8000/api/assign/tasks/remark/${remarkTaskId}`;
        
      await axios.post(
        endpoint,
        { remark: remarkText, delayReason },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      toast.success(isRetryRequest ? "Retry request sent!" : "Remark submitted!");
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

  // ✅ FIXED: Subtask completion handler
  const handleSubtaskComplete = async (taskId, subtaskIndex) => {
    try {
      // Using the correct backend route: /tasks/:taskId/subtask/:index/complete
      await axios.patch(
        `/assign/tasks/${taskId}/subtask/${subtaskIndex}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      toast.success("Subtask status updated!");
      fetchMyTasks(); // Refresh tasks to show the change
    } catch (err) {
      toast.error("Failed to update subtask.");
      // Log the full error for better debugging
      console.error("Error completing subtask: ", err.response ? err.response.data : err.message);
    }
  };


  const debouncedFilter = useMemo(
  () =>
    debounce((query) => {
      const filtered = tasks.filter((task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.taskId?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTasks(filtered);
    }, 300),
  [tasks]
);
  
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredTasks(tasks);
    } else {
      debouncedFilter(search);
    }
  }, [search, tasks, debouncedFilter]);


  const filteredByTab = useMemo(() => {
    return filteredTasks.filter((task) => {
        if (activeTab === "To Do") return task.status === "Pending";
        if (activeTab === "In Progress") return task.status === "In Progress";
        if (activeTab === "Completed") return task.status === "Completed";
        return true;
    });
}, [filteredTasks, activeTab]);

  if (loading) return <PageSkelton count={6} />;

  return (
    <>

      {/* ✅ NEW: Render the comments modal */}
      {showCommentsModal && (
        <TaskCommentsModal
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedTask(null);
            fetchMyTasks(); // Refresh tasks to show new comment count
          }}
          task={selectedTask}
        />
      )}
      {showReassignModal && (
        <StaffReassignTaskModal
          task={tasks.find((t) => t._id === reassignModalTaskId)}
          onClose={() => {
            setShowReassignModal(false);
            fetchMyTasks();
          }}
        />
      )}

      <RewardCard />

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
        <input
          type="text"
          placeholder="Search tasks by title or ID..."
          className="w-full p-3 pl-4 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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

        {filteredByTab.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No tasks found.</p>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y text-sm divide-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  {["Task ID", "Title & Subtasks", "Due Date", "Client", "Assigned By", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredByTab.map((task) => {
                  const isExpired = new Date(task.due_date) < new Date();

                  return (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap font-mono align-top">
                        {task.taskId || "---"}
                      </td>
                      <td className="px-4 py-4 capitalize align-top">
                         <div className="font-medium text-gray-800">{task.title}</div>
                              {task.description && (
                            <details className="mt-2 text-xs text-gray-500 cursor-pointer group">
                                <summary className="outline-none select-none font-medium group-hover:underline">View Description</summary>
                                <p className="mt-1 whitespace-pre-wrap border-l-2 border-gray-200 pl-2">
                                    {task.description}
                                </p>
                            </details>
                         )}
                        
                         {task.reassign_remark && (
                              <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-xs text-gray-700">
                                <strong>Note:</strong> {task.reassign_remark}
                              </div>
                          )}
                        
                        {task.subtasks && task.subtasks.length > 0 && (
                          <details className="mt-3 group" onToggle={(e) => setOpenSubtasks({...openSubtasks, [task._id]: e.currentTarget.open })}>
                            <summary className="cursor-pointer text-xs font-semibold text-blue-600 flex items-center gap-1">
                             {openSubtasks[task._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              View Subtasks ({task.subtasks.filter(st => st.status === 'Completed').length}/{task.subtasks.length})
                            </summary>
                            <ul className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                              {task.subtasks.map((subtask, index) => ( // ✅ Passing index here
                                <li key={subtask._id} className="flex items-center gap-2">
                                  <input 
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={subtask.status === 'Completed'}
                                    // ✅ FIXED: Calling handleSubtaskComplete with taskId and index
                                    onChange={() => handleSubtaskComplete(task._id, index)}
                                    id={`subtask-${subtask._id}`}
                                    // A subtask can only be marked complete if the main task is "In Progress"
                                    disabled={task.status !== 'In Progress'}
                                  />
                                  <label 
                                      htmlFor={`subtask-${subtask._id}`} 
                                      className={`text-sm ${subtask.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-700'} ${task.status !== 'In Progress' ? 'cursor-not-allowed' : ''}`}
                                   >
                                      {subtask.title}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}

                        {task.attachments && task.attachments.length > 0 && (
                          <div className="mt-3">
                            <h3 className="text-xs font-semibold text-gray-600 mb-1">
                              Attachments:
                            </h3>
                            <ul className="space-y-1">
                              {task.attachments.map((file, index) => (
                                <li key={index}>
                                  <a
                                    href={file.fileUrl}
                                    download={file.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                                  >
                                    <Paperclip size={12} />
                                    {file.filename}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap align-top">
                        {new Date(task.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap align-top">
                        {task.client?.name || "---"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap align-top">
                        {task.assigned_by?.name}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col items-start gap-2">
                            {task.status === "Pending" && !isExpired && (
                                <div className="flex gap-2">
                                <button
                                    onClick={() => handleAccept(task._id)}
                                    className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => {
                                    setSelectedTaskId(task._id);
                                    setShowRejectModal(true);
                                    }}
                                    className="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600"
                                >
                                    Reject
                                </button>
                                </div>
                            )}
                               
                            {task.status === "Pending" && isExpired && (
                                <>
                                {task.retryRequested ? (
                                    <span className="text-blue-600 text-xs font-medium px-3 py-1">
                                    Retry Requested
                                    </span>
                                ) : (
                                    <button
                                    onClick={() => {
                                        setRemarkTaskId(task._id);
                                        setShowRemarkModal(true);
                                        setIsRetryRequest(true);
                                    }}
                                    className="bg-purple-600 text-white px-3 py-1 text-xs rounded hover:bg-purple-700"
                                    >
                                    Request Retry
                                    </button>
                                )}
                                </>
                            )}
                            <div className="flex">
                            {(task.status === "Pending" || task.status === "In Progress") && (
                                 <button
                                    onClick={() => {
                                        setReassignModalTaskId(task._id);
                                        setShowReassignModal(true);
                                    }}
                                    title="Reassign Task"
                                    className="text-yellow-600 hover:text-yellow-800 p-1"
                                >
                                    <Repeat size={18} />
                                </button>
                            )}

                            {task.status === "In Progress" && (
                                <button
                                onClick={() => handleComplete(task._id)}
                                className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700"
                                >
                                Complete
                                </button>
                            )}

                             {/* ✅ NEW: Comments button */}
                            <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowCommentsModal(true);
                                }}
                                title="View Comments"
                                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 p-1"
                            >
                                <MessageSquare size={18} />
                                <span className="text-xs font-bold bg-gray-200 rounded-full px-1.5 py-0.5">
                                    {task.comments?.length || 0}
                                </span>
                            </button>
                            </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <div className="flex gap-4 mt-4 flex-wrap">
            <button
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded flex items-center gap-2 hover:bg-blue-700"
              onClick={() => setViewMode(viewMode === "kanban" ? "table" : "kanban")}
            >
              <Kanban /> {viewMode === 'kanban' ? 'Table View' : 'Kanban View'}
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