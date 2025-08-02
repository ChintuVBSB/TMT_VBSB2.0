import { useState } from "react";
import axios from "../services/api.js";

export default function UserFormModal({ onClose, refresh }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "team_member",
    status: "active"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("/user", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      refresh();
    } catch (err) {
      alert("Failed to create user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-[400px]">
        <h2 className="text-lg font-bold mb-4">Create User</h2>
        <input name="name" className="border p-2 w-full mb-2" placeholder="Name" onChange={handleChange} />
        <input name="email" className="border p-2 w-full mb-2" placeholder="Email" onChange={handleChange} />
        <input name="password" className="border p-2 w-full mb-2" placeholder="Password" type="password" onChange={handleChange} />
        <select name="role" className="border p-2 w-full mb-2" onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="team_member">Team Member</option>
          <option value="read_only">Read Only</option>
        </select>
        <select name="status" className="border p-2 w-full mb-4" onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex justify-end gap-2">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}
