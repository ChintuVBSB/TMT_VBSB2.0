import { useState } from "react";
import axios from "../services/api";
import toast from "react-hot-toast";

const AddMilestoneModal = ({ isOpen, onClose, projectId, onMilestoneAdded }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || !dueDate) return toast.error("Please fill all fields");

    setLoading(true);
    try {
      const res = await axios.post(
        `/projects/${projectId}/add-milestone`,
        { title, dueDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success("Milestone added");
      onMilestoneAdded(res.data.milestone);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add milestone");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#00000087] backdrop-blur-sm bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add New Milestone</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {loading ? "Adding..." : "Add Milestone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMilestoneModal;
