import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import BackButton from "../../components/BackButton";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Low",
    due_date: "",
    service_type: "",
    tags: "",
  });

  useEffect(() => {
    const fetchTask = async () => {
      const res = await axios.get(`/assign/tasks/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const task = res.data.task;
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date?.split("T")[0],
        service_type: task.service_type,
        tags: task.tags.join(", "),
      });
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, tags: formData.tags.split(",").map(t => t.trim()) };

    await axios.patch(`/assign/tasks/${id}`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    toast.success("Task updated successfully");
    navigate("/admin/tasks");
  };

  return (
    <>
   <BackButton/>
    <form onSubmit={handleSubmit} className="p-8 space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Edit Task</h2>
      <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border px-3 py-2" />
      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border px-3 py-2" />
      <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full border px-3 py-2">
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full border px-3 py-2" />
      <input value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} className="w-full border px-3 py-2" />
      <input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full border px-3 py-2" placeholder="tags" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update Task</button>
    </form>
    </>
  );
};

export default EditTask;
