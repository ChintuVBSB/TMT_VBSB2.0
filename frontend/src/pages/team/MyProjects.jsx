import { useEffect, useState } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import { Calendar, ListTodo, MessageSquare, Crown } from "lucide-react";
import StaffNavbar from "../../components/navbars/StaffNavbar";
import { toast } from "react-hot-toast";
import Checkbox from "../UI/Checkbox";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import ChatBox from "../../components/ChatBox";
import { decodeToken } from "../../utils/decodeToken";

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();
  const [recentlyCompletedId, setRecentlyCompletedId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [openChatProjectId, setOpenChatProjectId] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setCurrentUser({
          _id: decoded.id,
          name: decoded.name,
          role: decoded.role
        });
      }
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects/my", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const calculateMilestoneProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const handleCompleteMilestone = async (projectId, milestoneId) => {
    try {
      await axios.patch(
        `/projects/${projectId}/milestone/${milestoneId}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      toast.success("Milestone marked as completed!");
      const updatedRes = await axios.get("/projects/my", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const updatedProjects = updatedRes.data.projects;
      setProjects(updatedProjects);

      const updatedProject = updatedProjects.find((p) => p._id === projectId);
      const progress = calculateMilestoneProgress(
        updatedProject?.milestones || []
      );
      if (progress === 100) {
        setRecentlyCompletedId(projectId);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setRecentlyCompletedId(null);
        }, 5000);
      }
    } catch (err) {
      console.error("Milestone update failed", err);
    }
  };

  const activeProjects = projects.filter(
    (p) => calculateMilestoneProgress(p.milestones) < 100
  );
  const completedProjects = projects.filter(
    (p) => calculateMilestoneProgress(p.milestones) === 100
  );

  // Prevent background scroll when chat is open
  useEffect(() => {
    if (openChatProjectId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openChatProjectId]);

  const ProjectCard = ({ project }) => {
    return (
      <div className="bg-white relative rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {project.title}
        </h2>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {project.description || "No description provided."}
        </p>

        <div className="text-sm text-gray-500 space-y-1 mb-4">
          <p className="flex items-center gap-2">
            <Calendar size={16} /> Deadline:{" "}
            {new Date(project.deadline).toLocaleDateString()}
          </p>
          <p className="flex items-center gap-2">
            <ListTodo size={16} /> {project.milestones?.length || 0} Milestones
          </p>
          <p className="mt-2 font-medium text-gray-600">Progress</p>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${calculateMilestoneProgress(project.milestones)}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-right text-gray-500">
            {calculateMilestoneProgress(project.milestones)}% completed
          </p>
        </div>

        {/* Milestones */}
        {project.milestones?.length > 0 && (
          <div className="text-sm text-gray-700 mt-4">
            <p className="font-semibold mb-1">Milestones:</p>
            <ul className="space-y-2">
              {project.milestones.map((m, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded border transition-all ${
                    m.completed
                      ? "bg-green-50 border-green-300 opacity-70"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Checkbox
                    checked={m.completed}
                    onChange={() => {
                      if (!m.completed)
                        handleCompleteMilestone(project._id, m._id);
                    }}
                  />
                  <div className="flex flex-col">
                    <p
                      className={`font-medium text-sm ${
                        m.completed
                          ? "text-green-800 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {m.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.completed
                        ? `✅ Completed on ${new Date(m.completedAt).toLocaleDateString()}`
                        : `🗓️ Due by ${new Date(m.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ UPDATED Team Leader Block */}
        {Array.isArray(project.staffs) && (
          <div className="text-sm text-indigo-700 mb-3 flex items-center gap-2">
            <Crown size={16} /> <strong>Team Leader:</strong>{" "}
            {project.lead?.name || "Not Assigned"}
          </div>
        )}

        {/* Team Members */}
        {project.staffs && project.staffs.length > 0 && (
          <div className="mt-2 text-sm text-gray-700">
            <span className="font-semibold">Team Members:</span>
            <ul className="ml-2 list-disc">
              {project.staffs.map((staff) => (
                <li key={staff._id}>{staff.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Floating Chat Button */}
        <button
          onClick={() => {
            if (!openChatProjectId) setOpenChatProjectId(project._id);
          }}
          className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-md hover:scale-105 transition-all"
        >
          <MessageSquare size={20} />
        </button>
      </div>
    );
  };

  return (
    <>
      <StaffNavbar />
      {showConfetti && recentlyCompletedId && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={400}
          recycle={false}
        />
      )}

      <div className="max-w-6xl mt-12 mx-auto px-4 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Projects</h1>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "active" ? activeProjects : completedProjects)
            .length > 0 ? (
            (activeTab === "active" ? activeProjects : completedProjects).map(
              (p) => <ProjectCard key={p._id} project={p} />
            )
          ) : (
            <div className="col-span-full flex flex-col items-center text-center py-10">
              <img
                src={
                  activeTab === "active"
                    ? "/undraw_stars_5pgw.svg"
                    : "/no-projects.png"
                }
                alt="No Projects"
                className="w-52 mb-4 opacity-80"
              />
              <p className="text-gray-500 text-lg">
                {activeTab === "active"
                  ? "No Active Projects"
                  : "No Completed Projects"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Only one ChatBox rendered outside cards */}
      {openChatProjectId && currentUser && (
        <ChatBox
          projectId={openChatProjectId}
          user={currentUser}
          onClose={() => setOpenChatProjectId(null)}
        />
      )}
    </>
  );
};

export default MyProjects;
