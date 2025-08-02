// src/pages/projects/CreateProject.jsx
import { useState, useEffect } from "react";
import axios from "../../../services/api";
import { getToken } from "../../../utils/token";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";
import AdminNavbar from "../../../components/navbars/AdminNavbar";
import Loader from "../../../components/Loader";

const CreateProject = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [teamLead, setTeamLead] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get("/user?role=staff", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setStaffList(res.data.users);
      } catch (err) {
        toast.error("Failed to fetch staff list");
      }
    };
    fetchStaff();
  }, []);

  const handleAddMilestone = () => {
    if (!milestoneInput || !milestoneDueDate) return;
    setMilestones((prev) => [
      ...prev,
      { title: milestoneInput, dueDate: milestoneDueDate },
    ]);
    setMilestoneInput("");
    setMilestoneDueDate("");
  };

  const handleStaffToggle = (id) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await axios.post(
        "/projects",
        {
          title,
          description,
          deadline,
          milestones,
          staffs: selectedStaff,
          lead: teamLead || undefined,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Project created successfully");
      setTitle("");
      setDescription("");
      setDeadline("");
      setMilestones([]);
      setSelectedStaff([]);
      setTeamLead("");
    } catch (err) {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="pt-12">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-medium">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded mt-1"
              />
            </div>

            <div>
              <label className="font-medium">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border px-4 py-2 rounded mt-1"
              />
            </div>

            <div>
              <label className="font-medium">Deadline</label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border px-4 py-2 rounded mt-1"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="font-medium">Milestones</label>
              <div className="flex gap-3 mt-2">
                <input
                  type="text"
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  placeholder="Milestone title"
                  className="border px-3 py-2 rounded w-1/2"
                />
                <input
                  type="date"
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
              {milestones.length > 0 && (
                <ul className="mt-2 list-disc ml-5 text-sm text-gray-700">
                  {milestones.map((m, i) => (
                    <li key={i}>
                      {m.title} (Due: {m.dueDate})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="font-medium">Assign Staffs</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {staffList.map((staff) => (
                  <label
                    key={staff._id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(staff._id)}
                      onChange={() => handleStaffToggle(staff._id)}
                    />
                    <span>{staff.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Leader (Optional)
              </label>
              <select
                value={teamLead}
                onChange={(e) => setTeamLead(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              >
                <option value="">-- Select Team Leader --</option>
                {selectedStaff.map((staffId) => {
                  const staffObj = staffList.find((s) => s._id === staffId);
                  return (
                    <option key={staffObj._id} value={staffObj._id}>
                      {staffObj.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded shadow ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProject;
