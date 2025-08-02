// src/pages/projects/ProjectDashboard.jsx
import { useEffect, useState } from "react";
import axios from "../../../services/api";
import AdminNavbar from "../../../components/navbars/AdminNavbar";
import {
  Calendar,
  Users,
  ListTodo,
  Plus,
  Crown,
  MessageSquare
} from "lucide-react";
import { getToken } from "../../../utils/token";
import AddMilestoneModal from "../../../components/AddMilestoneModal";
import ChatBox from "../../../components/ChatBox";

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [chatProject, setChatProject] = useState(null); // 🟦 For Chat

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/admin/projects/all-projects", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const Stepper = ({ milestones }) => {
    const isCompleted = milestones.every((m) => m.completed);
    const lastMilestone = milestones[milestones.length - 1];

    return (
      <div className="flex flex-col items-center justify-between h-full py-2">
        {milestones.map((m, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full border-2 mb-1 ${
                m.completed
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              } transition-all duration-300`}
            ></div>
            {idx < milestones.length - 1 && (
              <div className="w-px h-4 bg-gray-300"></div>
            )}
          </div>
        ))}
        {isCompleted && lastMilestone?.completedAt && (
          <div className="text-[11px] text-green-600 mt-2 text-center">
            🎉 Completed on{" "}
            {new Date(lastMilestone.completedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  const activeProjects = projects.filter(
    (p) => calculateProgress(p.milestones) < 100
  );
  const completedProjects = projects.filter(
    (p) => calculateProgress(p.milestones) === 100
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="pt-28 max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Projects</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded ${
              activeTab === "active" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Active Projects
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded ${
              activeTab === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Completed Projects
          </button>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "active" ? activeProjects : completedProjects).map(
            (project) => (
              <div
                key={project._id}
                className="bg-white relative rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex gap-4"
              >
                {project.milestones?.length > 0 && (
                  <div className="w-8">
                    <Stepper milestones={project.milestones} />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {project.description || "No description provided."}
                  </p>

                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <p className="flex items-center gap-2">
                      <Calendar size={16} /> Deadline:{" "}
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <ListTodo size={16} /> {project.milestones?.length || 0}{" "}
                      Milestones
                    </p>

                    {/* Assigned Manager */}
                    {project.assignedBy && (
                      <p className="text-sm text-blue-700 mt-1">
                        <strong>Manager:</strong> {project.assignedBy.name}
                      </p>
                    )}

                    {/* Team Leader */}
                    {project.lead && (
                      <p className="text-sm text-indigo-700 mt-1 flex items-center gap-2">
                        <Crown size={16} />
                        <strong>Team Leader:</strong>{" "}
                        {project.staffs?.find((s) => s._id === project.lead)
                          ? project.staffs.find((s) => s._id === project.lead)
                              .name
                          : project.lead}
                      </p>
                    )}

                    {/* Staff */}
                    <p className="flex items-center gap-2 mt-2">
                      <Users size={16} /> Assigned Staff:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {project.staffs?.map((staff) => (
                        <span
                          key={staff._id}
                          className="bg-blue-100 text-gray-800 text-sm px-2 py-1 rounded-full"
                        >
                          {staff.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Add Milestone */}
                  {activeTab === "active" && (
                    <button
                      onClick={() => {
                        setSelectedProjectId(project._id);
                        setShowMilestoneModal(true);
                      }}
                      className="mt-2 flex items-center gap-2 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                    >
                      <Plus size={16} /> Add Milestone
                    </button>
                  )}
                </div>

                {/* Floating Chat Icon */}
                <button
                  onClick={() => setChatProject(project)}
                  className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-md hover:scale-105 transition"
                >
                  <MessageSquare size={20} />

                  {/* Red Dot for Unseen Messages */}
                  {project?.unseenCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                      {project.unseenCount > 9 ? "9+" : project.unseenCount}
                    </div>
                  )}
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {chatProject && (
        <ChatBox
          projectId={chatProject._id}
          user={{
            _id: chatProject.assignedBy?._id,
            name: chatProject.assignedBy?.name,
            role: "manager"
          }}
          onClose={() => setChatProject(null)}
        />
      )}

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        projectId={selectedProjectId}
        isOpen={showMilestoneModal}
        onClose={() => {
          setShowMilestoneModal(false);
          setSelectedProjectId(null);
        }}
        onMilestoneAdded={() => fetchProjects()}
      />
    </div>
  );
};

export default ProjectDashboard;
