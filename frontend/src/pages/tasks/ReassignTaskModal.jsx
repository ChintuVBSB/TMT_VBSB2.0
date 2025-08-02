import { useState, useEffect } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";

function ReassignTaskModal({ task, onClose }) {
  const taskId = task?._id;
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get("/user?role=staff", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setStaffList(res.data.users || []);
      } catch (error) {
        toast.error("Failed to fetch staff");
        console.error(error);
      }
    };
    fetchStaff();
  }, []);

  const handleReassign = async () => {
    if (!selectedStaff) return toast.error("Please select a staff member");

    try {
      await axios.patch(
        `/assign/reassign/${taskId}`,
        { newAssignee: selectedStaff, remark },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      toast.success("Task reassigned!");
      onClose();
    } catch (err) {
      toast.error("Failed to reassign task");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000c6] bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
        <h3 className="text-lg font-bold mb-4">Reassign Task</h3>

        <select
          className="w-full border p-2 rounded mb-4"
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
        >
          <option value="">Select Staff</option>
          {staffList.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Optional remark for reassignment"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="w-full border p-2 rounded mb-4 resize-none"
          rows={3}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleReassign}
            className="bg-purple-600 text-white px-4 py-1 rounded"
          >
            Reassign
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReassignTaskModal;
