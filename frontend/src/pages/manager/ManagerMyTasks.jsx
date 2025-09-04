import React, { useState, useEffect } from 'react';
import axios from '../../services/api';
import { Repeat, MessageSquare, Kanban, List } from 'lucide-react';

import TaskCommentsModal from '../tasks/TaskCommentsModal';
import StaffReassignTaskModal from '../team/StaffReassignTaskModal';
import RejectModal from '../../components/RejectModal';
import AdminNavbar from '../../components/navbars/AdminNavbar';
import { getToken } from '../../utils/token';

const ManagerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [viewMode, setViewMode] = useState('cards');

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    setLoading(true);
    const token = getToken();

    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/assign/tasks/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data.tasks);
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (taskId) => {
    try {
      await axios.patch(`/assign/tasks/accept/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchManagerData();
    } catch (error) {
      console.error("Failed to accept task", error);
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
		fetchUser();
	  }, []);

  const handleComplete = async (taskId) => {
    try {
      await axios.patch(`/assign/tasks/complete/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchManagerData();
    } catch (error) {
      console.error("Failed to complete task", error);
    }
  };

  const handleReject = async (rejectionReason) => {
    try {
      await axios.patch(`/assign/tasks/reject/${selectedTaskId}`, { reason: rejectionReason }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setShowRejectModal(false);
      fetchManagerData();
    } catch (error) {
      console.error("Failed to reject task", error);
    }
  };

  const filteredTasks = tasks?.filter(task => {
    if (activeTab === 'Pending') return task.status === 'Pending';
    if (activeTab === 'In Progress') return task.status === 'In Progress';
    if (activeTab === 'Completed') return task.status === 'Completed';
    return true;
  });

  if (loading) return <div className="text-center mt-40">Loading tasks...</div>;
  if (error) return <div className="text-center mt-40 text-red-600">{error}</div>;

  return (
    <>
      {showCommentsModal && (
        <TaskCommentsModal
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            fetchManagerData();
          }}
          task={selectedTask}
        />
      )}

      {showReassignModal && (
        <StaffReassignTaskModal
          task={tasks.find(t => t._id === selectedTask?._id)}
          onClose={() => {
            setShowReassignModal(false);
            fetchManagerData();
          }}
        />
      )}

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
      />

      <AdminNavbar />

      <div className="max-w-7xl pt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
         

        {/* Tabs */}
        <div className="flex justify-between items-center border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            {['Pending', 'In Progress', 'Completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 text-md font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('cards')} className={`p-2 rounded ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><List size={20}/></button>
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Kanban size={20}/></button>
          </div>
        </div>

        {/* Tasks */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks?.length > 0 ? (
              filteredTasks.map(task => {
                const isExpired = new Date(task.due_date) < new Date() && task.status !== 'Completed';
                return (
                  <div key={task._id} className={`bg-white rounded-lg shadow-md border-l-4 ${isExpired ? 'border-red-500' : 'border-blue-500'} p-5 flex flex-col justify-between`}>
                    <div>
                      {isExpired && <p className="text-red-500 font-bold text-sm">High Priority</p>}
                      <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                      <p className="text-sm text-gray-500">Client: {task.client?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Due: <span className={isExpired ? 'font-semibold text-red-500' : ''}>{new Date(task.due_date).toLocaleDateString()}</span></p>
                      <p className="text-sm text-gray-500">Assigned By: {task.assigned_by?.name || 'N/A'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        {task.status === 'Pending' && (
                          <>
                            <button onClick={() => handleAccept(task._id)} className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600">Accept</button>
                            <button onClick={() => { setSelectedTaskId(task._id); setShowRejectModal(true); }} className="bg-gray-400 text-white px-3 py-1 text-xs rounded hover:bg-gray-500">Reject</button>
                          </>
                        )}
                        {task.status === 'In Progress' && (
                          <button onClick={() => handleComplete(task._id)} className="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600">Complete</button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setSelectedTask(task); setShowReassignModal(true); }} title="Reassign"><Repeat size={18} className="text-gray-500 hover:text-yellow-600"/></button>
                        <button onClick={() => { setSelectedTask(task); setShowCommentsModal(true); }} title="Comments" className="flex items-center gap-1">
                          <MessageSquare size={18} className="text-gray-500 hover:text-blue-600"/>
                          <span className="text-xs font-bold">{task.comments?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500 mt-10">No tasks in this category.</p>
            )}
          </div>
        )}

        {/* Kanban View Placeholder */}
        {viewMode === 'kanban' && (
          <div className="text-center mt-10">
            <p>Kanban View will be displayed here.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ManagerDashboard;
