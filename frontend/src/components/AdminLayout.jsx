// src/components/AdminLayout.jsx
import { Link } from "react-router-dom";
import { FiUsers, FiHome, FiPlusCircle, FiList } from "react-icons/fi";
import UserHoverDropdown from "../pages/admin/UserHoverDropdown";
import { FaUserPlus, FaClipboardList } from "react-icons/fa";
import Droid from "./Droid";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 text-[#00A63E] flex flex-col justify-between">
        <div className="p-6">
          <div className="text-2xl font-bold mb-10">Task Flow</div>
          <nav className="space-y-4">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#c6ffdb] hover:text-black"
            >
              <FiHome /> Dashboard
            </Link>

            <Link
              to="/admin/tasks"
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#c6ffdb] hover:text-black"
            >
              <FiList /> All Tasks
            </Link>

            <Link
              to="/admin/create-task"
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#c6ffdb] hover:text-black"
            >
              <FiPlusCircle /> Create Task
            </Link>

             <Link
              to="/admin/create-project"
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#c6ffdb] hover:text-black"
            >
              <FaClipboardList /> Add Project
            </Link>

              <Link
              to="/admin/projects"
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#c6ffdb] hover:text-black"
            >
              <FaClipboardList /> All Projects
            </Link>

            <Link
              to="/admin/add-client"
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#c6ffdb] hover:text-black"
            >
              <FaUserPlus /> Add Client
            </Link>

            <Link
              to="/admin/add-task-bucket"
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#c6ffdb] hover:text-black"
            >
              <FaClipboardList /> Add Task Bucket
            </Link>
          </nav>
        </div>

         {/* <Droid/> */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Topbar */}
        <div className="flex justify-end ">
          <UserHoverDropdown />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
