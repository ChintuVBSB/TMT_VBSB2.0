import { useState, useEffect } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import Loader from "../../components/Loader"; // 👈 import your loader

function AddUserModal({ existingUser, onClose, onUserAdded }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false); // 👈 loader state
  const [showAnim, setShowAnim] = useState(false); // 👈 animation state

  useEffect(() => {
    setShowAnim(true); // trigger animation on mount
    if (existingUser) {
      setForm({
        name: existingUser.name || "",
        email: existingUser.email || "",
        password: "",
        role: existingUser.role || "user",
      });
    }
  }, [existingUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setShowAnim(false);
    setTimeout(() => {
      onClose();
    }, 250); // match duration-200 or duration-300
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 👈 start loader
    try {
      if (existingUser) {
        await axios.patch(`/user/${existingUser._id}`, form, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success("User updated successfully!");
      } else {
        await axios.post("/user/register", form, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success("User created successfully!");
      }

      onUserAdded();
      handleClose();
    } catch (err) {
      console.error("User save failed", err);
      toast.error("Failed to save user.");
    } finally {
      setLoading(false); // 👈 stop loader
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000083] bg-opacity-30 flex items-center justify-center z-50">
      <div
        className={`
          bg-white p-6 rounded-lg shadow-md w-[400px]
          transition-all duration-300 transform
          ${showAnim ? "scale-100 opacity-100" : "scale-90 opacity-0"}
        `}
      >
        <h2 className="text-xl font-bold mb-4">
          {existingUser ? "Edit User" : "New User"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          {!existingUser && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          )}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="client">client</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader /> {existingUser ? "Updating..." : ""}
                </>
              ) : (
                existingUser ? "Update" : "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;