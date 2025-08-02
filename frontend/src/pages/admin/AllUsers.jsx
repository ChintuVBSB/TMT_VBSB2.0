// src/pages/admin/AllUsers.jsx
import { useState, useEffect } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import AddUserModal from "./AddUserModal";
import AdminNavbar from "../../components/navbars/AdminNavbar";
import { Tooltip } from "react-tooltip";
import Avatar from "boring-avatars";
import AllTaskLogs from "../../components/AllTaskLogsView";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
 

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/user", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

 
  return (
    <div className="bg-white min-h-screen pt-20">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white p-6 mt-6">
          {/* Header + Search + Button */}
          <div className="flex justify-between items-center mb-6 flex-col md:flex-row gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Members</h1>
              <p className="text-gray-500 text-sm">Manage your team members and their roles.</p>
            </div>
            <button
              onClick={() => {
                setShowModal(true);
                setSelectedUser(null);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              + Add User
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full max-w-md border border-gray-300 rounded-md px-4 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

            <AllTaskLogs/>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="text-left py-3 px-6 font-semibold">Profile</th>
                  <th className="text-left py-3 px-6 font-semibold">Name</th>
                  <th className="text-left py-3 px-6 font-semibold">Email</th>
                  <th className="text-left py-3 px-6 font-semibold">Role</th>
                  <th className="text-left py-3 px-6 font-semibold">Status</th>
                  <th className="text-left py-3 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6 capitalize text-gray-800 flex items-center gap-3">
                      <div className="w-8 h-8   rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold uppercase">
                        {user.name?.slice(0, 2)}
                      </div>
                      {user.name}
                    </td>
                    <td className="py-3 px-6 capitalize text-gray-800">{user.name}</td>
                    <td className="py-3 px-6 text-green-600">{user.email}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-gray-100 capitalize ${
                          user.role === "admin"
                            ? "text-red-600"
                            : user.role === "manager"
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                        user.status === "inactive"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                        {user.status !== "inactive" && <span className="h-2 w-2 bg-green-600 rounded-full"></span>}
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <button
                        data-tooltip-id="editTip"
                        data-tooltip-content="Click to edit"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="text-gray-500 hover:text-black text-xl"
                      >
                        ⋮
                      </button>
                      <Tooltip id="editTip" className="!text-xs !py-1 !px-2" place="top" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageClick(currentPage - 1)}
              className="text-gray-500 hover:text-black px-3 py-1 rounded disabled:opacity-30"
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isActive = currentPage === page;
              if (
                page === 1 ||
                page === totalPages ||
                Math.abs(currentPage - page) <= 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`px-3 py-1 rounded-full ${
                      isActive
                        ? "bg-green-100 text-green-800 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page}>...</span>;
              }
              return null;
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageClick(currentPage + 1)}
              className="text-gray-500 hover:text-black px-3 py-1 rounded disabled:opacity-30"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <AddUserModal
            existingUser={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
            onUserAdded={fetchUsers}
          />
        )}
      </div>
    </div>
  );
}

export default AllUsers;
