import { useEffect, useState } from "react";
import axios from "../services/api.js";
import UserList from "../components/UserList";
import UserFormModal from "../components/UserFormModal";

export default function     Users() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (err) {
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = filter ? users.filter(u => u.role === filter) : users;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">User List</h1>
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={() => setOpenModal(true)}>+ Create User</button>
      </div>

      <select onChange={(e) => setFilter(e.target.value)} className="mb-4 p-2 border">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="team_member">Team Member</option>
        <option value="read_only">Read Only</option>
      </select>

      <UserList users={filteredUsers} />
      {openModal && <UserFormModal onClose={() => setOpenModal(false)} refresh={fetchUsers} />}
    </div>
  );
}
