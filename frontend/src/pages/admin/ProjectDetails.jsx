import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${projectId}`);
      setProject(res.data);
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  const handleMilestoneComplete = async (milestoneId) => {
    try {
      await axios.post(`/api/projects/milestone/${projectId}/${milestoneId}/complete`, {
        completedAt: new Date(),
      });

      alert("Milestone marked as complete and email sent to manager.");
      fetchProject(); // Refresh UI
    } catch (err) {
      console.error("Failed to complete milestone:", err);
      alert("Error completing milestone.");
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
      <p className="mb-2 text-gray-600">{project.description}</p>
      <p className="text-sm text-gray-500 mb-6">Due: {new Date(project.deadline).toLocaleDateString()}</p>

      <h3 className="text-xl font-semibold mb-3">Milestones</h3>
      <ul className="space-y-4">
        {project.milestones.map((m) => (
          <li key={m._id} className="bg-gray-100 p-4 rounded shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{m.title}</p>
                <p className="text-sm text-gray-600">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                {m.completed && (
                  <p className="text-green-600 text-sm">Completed on: {new Date(m.completedAt).toLocaleDateString()}</p>
                )}
              </div>
              {!m.completed && (
                <button
                  onClick={() => handleMilestoneComplete(m._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDetails;
